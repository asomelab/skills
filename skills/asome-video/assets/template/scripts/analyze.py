#!/usr/bin/env python3
"""Footage analysis for choosing talking-head cuts. python3 + Pillow, no numpy.
Reads $SRC (default public/clip.mp4); times are seconds of that file.

  npm run analyze -- envelope 3.0 5.5        RMS per 10 ms as bars: where speech and silence are
  npm run analyze -- zcr 1.6 2.4             RMS + zero-crossing rate per 10 ms: compare take onsets
  npm run analyze -- bounds 3.40 9.80        is each proposed cut point in a pause (silence or breath)?
  npm run analyze -- faces 3.4 9.8 [fps] [crop]   face-crop contact sheet -> out/faces/
  npm run analyze -- probe 1.8-2.75 3.4-5.2  transcribe only these ranges, in one Whisper pass
  npm run analyze -- sheet out/x.jpg a.jpg b.jpg ...   labelled tiles of any images
  npm run analyze -- same a.jpg b.jpg        mean pixel difference (under 2: same frame)
  npm run analyze -- selftest

SILENCE (dBFS, default -45) sets what counts as silence: read the envelope of a known
pause and set it a few dB above that floor. A breath (`~`) is quiet noise, between SILENCE
and BREATH (default -40) dB with zcr 0.25 or more, lasting 0.1 s or more; shorter quiet noise
is the soft edge of an /s/ and counts as voice. WHISPER_LANG (default es) is for probe.
"""
import json
import math
import os
import subprocess
import sys
import tempfile
import wave
from array import array

SRC = os.environ.get("SRC", "public/clip.mp4")
SILENCE = float(os.environ.get("SILENCE", "-45"))
BREATH = float(os.environ.get("BREATH", "-40"))
# Cells: a quiet stretch shorter than 40 ms is a dip inside a sound, not a pause.
MIN_PAUSE = 4
SR = 16000
WIN = SR // 100  # 10 ms


def ffmpeg(*args):
    subprocess.run(["npx", "remotion", "ffmpeg", "-v", "error", "-y", *args], check=True)


def samples(a, b):
    """Mono 16 kHz signed 16-bit samples of [a, b)."""
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "a.wav")
        ffmpeg("-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", SRC, "-vn", "-ac", "1",
               "-ar", str(SR), "-map_metadata", "-1", "-fflags", "+bitexact",
               "-c:a", "pcm_s16le", path)
        with wave.open(path) as w:
            pcm = array("h", w.readframes(w.getnframes()))
    if sys.byteorder == "big":
        pcm.byteswap()
    return pcm


def measure(pcm):
    """(dBFS, zero-crossing rate) of one window."""
    rms = math.sqrt(sum(x * x for x in pcm) / len(pcm)) / 32768
    zc = sum((pcm[i - 1] < 0) != (pcm[i] < 0) for i in range(1, len(pcm)))
    return 20 * math.log10(max(rms, 1e-6)), zc / (len(pcm) - 1)


def windows(a, b):
    """(time, dBFS, zcr) every 10 ms over [a, b)."""
    pcm = samples(a, b)
    for k in range(len(pcm) // WIN):
        yield (a + k / 100, *measure(pcm[k * WIN:(k + 1) * WIN]))


def kinds(rows):
    """One mark per 10 ms row (t, dBFS, zcr): '·' silence, '~' breath, 'S' fricative (/s/, /f/:
    noise, many crossings), 'V' vowel (voiced: few crossings, loud), ' ' other voice.
    ponytail: a breath with a low zcr (a voiced "hah") or a soft /s/ held 0.1 s reads wrong;
    the strip and the face sheet still decide."""
    out = ["·" if db < SILENCE else "S" if z >= 0.3 else "V" if z < 0.12 else " "
           for _, db, z in rows]
    noise = [k for k, (_, db, z) in enumerate(rows) if SILENCE <= db < BREATH and z >= 0.25]
    groups = []  # noisy quiet cells no more than 40 ms apart: one breath
    for k in noise:
        if groups and k - groups[-1][-1] <= 4:
            groups[-1].append(k)
        else:
            groups.append([k])
    for g in groups:
        if g[-1] + 1 - g[0] >= 10:
            for k in range(g[0], g[-1] + 1):
                if rows[k][1] < BREATH:
                    out[k] = "~"
    return out


def bar(db, width=30):
    return "█" * max(0, round((db + 60) / 60 * width))


def envelope(a, b):
    rows = list(windows(float(a), float(b)))
    for (t, db, _), k in zip(rows, kinds(rows)):
        print(f"{t:8.2f} {db:6.1f} {k if k in '·~' else ' '} {bar(db)}")


def zcr(a, b):
    # A restart shows up as the same onset pattern twice (e.g. ~0.1 s of S then a loud V).
    # A breath is a run of `~` (and `·`) with no loud S or V, right before a voiced onset.
    rows = list(windows(float(a), float(b)))
    for (t, db, z), k in zip(rows, kinds(rows)):
        print(f"{t:8.2f} {db:6.1f} dB  zcr {z:.2f}  {k} {bar(db, 20)}")


LEVELS = " ▁▂▃▄▅▆▇█"


def cut_report(rows, a, b, c):
    """Strip and verdict for a cut at c, from 10 ms rows (t, dBFS, zcr) covering [a, b)."""
    kc = int((c - a) * 100 + 1e-6)  # the cell that holds c
    marks = kinds(rows)
    # One character per 10 ms over +-0.4 s ('·' silence, '~' breath, blocks = level),
    # '|' just before c's cell.
    strip = "".join(
        ("|" if k == kc else "")
        + (marks[k] if marks[k] in "·~" else LEVELS[min(8, max(1, round((db + 60) / 60 * 8)))])
        for k, (_, db, _) in enumerate(rows) if kc - 40 <= k < kc + 40)
    runs, start = [], None  # pauses (silence and breath) as [first cell, first cell after)
    for k, q in enumerate(marks + ["V"]):
        if q in "·~" and start is None:
            start = k
        elif q not in "·~" and start is not None:
            if k - start >= MIN_PAUSE:
                runs.append((start, k))
            start = None

    def span(r):
        # A run touching the measured window may go on beyond it: shown as a minimum.
        clipped = (r[0] == 0 and a > 0) or (r[1] == len(rows) and a + len(rows) / 100 >= b - 0.02)
        s0, s1 = a + r[0] / 100, a + r[1] / 100
        return s0, s1, f"{s0:.2f}-{s1:.2f} ({'≥' if clipped else ''}{(s1 - s0) * 1000:.0f} ms)"

    inside = next((r for r in runs if r[0] <= kc < r[1]), None)
    if inside:
        breath = [k for k in range(*inside) if marks[k] == "~"]
        if not breath:
            return strip, "en silencio " + span(inside)[2]
        b0, b1 = a + breath[0] / 100, a + (breath[-1] + 1) / 100
        return strip, (f"en pausa {span(inside)[2]} con respiración {b0:.2f}-{b1:.2f}: está bien "
                       f"si va a BREATHS; si no, salida antes de {b0:.2f}, entrada "
                       f"{max(b1, span(inside)[1] - 0.08):.2f}")
    if not runs:
        return strip, "EL CORTE CAE EN LA VOZ y no hay pausa a +-1 s: buscá otro punto"
    s0, s1, text = span(min(runs, key=lambda r: min(abs(kc - r[0]), abs(kc - r[1]))))
    half = (s1 - s0) / 2
    return strip, (f"EL CORTE CAE EN LA VOZ. Pausa más cercana {text}: como salida "
                   f"{s0 + min(0.12, half):.2f}, como entrada {s1 - min(0.08, half):.2f}")


def bounds(*cuts):
    # Silences are measured over +-1 s, so a pause wider than the strip shows whole.
    for c in map(float, cuts):
        a, b = max(0.0, c - 1.0), c + 1.0
        strip, note = cut_report(list(windows(a, b)), a, b, c)
        print(f"{c:8.2f}  {strip}  {note}")


def font(size):
    from PIL import ImageFont
    for f in ("/System/Library/Fonts/Helvetica.ttc", "/Library/Fonts/Arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def contact(tiles, cols, out):
    """Grid of (image, label) tiles, each label above its image."""
    from PIL import Image, ImageDraw
    w = max(im.width for im, _ in tiles)
    h = max(im.height for im, _ in tiles)
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (w + 6), rows * (h + 26)), "white")
    draw = ImageDraw.Draw(sheet)
    fnt = font(18)
    for k, (im, label) in enumerate(tiles):
        x, y = (k % cols) * (w + 6), (k // cols) * (h + 26)
        sheet.paste(im, (x, y + 24))
        draw.text((x + 2, y + 2), label, fill="black", font=fnt)
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    sheet.save(out, quality=85)
    print(out)


def faces(a, b, fps="4", crop="iw*0.5:iw*0.5:iw*0.25:ih*0.3"):
    # crop is ffmpeg's w:h:x:y on the source frame; measure the face on a still first.
    # 4 fps to scan a take, 8-30 around a doubtful spot (eyes leaving the lens, head dropping).
    from PIL import Image
    a, b, fps = float(a), float(b), float(fps)
    rate = subprocess.run(["npx", "remotion", "ffprobe", "-v", "error", "-select_streams", "v:0",
                           "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", SRC],
                          check=True, capture_output=True, text=True).stdout.strip()
    num, den = rate.split("/")
    src_fps = float(num) / float(den)
    step = max(1, round(src_fps / fps))
    with tempfile.TemporaryDirectory() as d:
        ffmpeg("-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", SRC, "-an",
               "-vf", f"crop={crop},scale=128:-2", "-q:v", "4", os.path.join(d, "%05d.jpg"))
        files = sorted(os.listdir(d))[::step]
        tiles = [(Image.open(os.path.join(d, f)).convert("RGB"), f"{a + k * step / src_fps:.2f}")
                 for k, f in enumerate(files)]
    contact(tiles, 8, f"out/faces/faces_{a:.2f}-{b:.2f}.jpg")


def sheet(out, *files):
    # Cover options: npm run frames -- t1 ... t6, then sheet out/portadas.jpg out/frames/t*.jpg
    from PIL import Image
    tiles = []
    for f in files:
        im = Image.open(f).convert("RGB")
        im = im.resize((360, round(im.height * 360 / im.width)))
        tiles.append((im, os.path.splitext(os.path.basename(f))[0]))
    contact(tiles, 3, out)


def same(a, b):
    # Frame-exactness: a frame of public/cut.mp4 against the source frame it should be.
    from PIL import Image, ImageChops, ImageStat
    x = Image.open(a).convert("RGB")
    y = Image.open(b).convert("RGB").resize(x.size)
    diff = sum(ImageStat.Stat(ImageChops.difference(x, y)).mean) / 3
    print(f"{diff:.2f}  {'mismo cuadro' if diff < 2 else 'distinto'}")


def place(words, spans):
    """Map words of the probe file back to source time. spans: (offset, a, b)."""
    out = {span: [] for span in spans}
    lost = []
    for w in words:
        t = w["startMs"] / 1000
        span = next((s for s in spans if s[0] <= t < s[0] + s[2] - s[1]), None)
        if span:
            out[span].append((w["text"].strip(), span[1] + t - span[0]))
        else:
            lost.append(w["text"].strip())
    return out, lost


def probe(*ranges):
    # The ranges go 1 s of silence apart into one model run: fast, and the words are not
    # glued to what comes before or after. Whisper may still drop a phrase said twice
    # (a restart): if a range's first word lands well after its onset on the envelope,
    # the opening was swallowed; probe that range alone.
    gap = array("h", [0] * SR)
    pcm, spans = array("h"), []
    for r in ranges:
        a, b = map(float, r.split("-"))
        spans.append((len(pcm) / SR, a, b))
        pcm += samples(a, b) + gap
    os.makedirs("out/probe", exist_ok=True)
    with wave.open("out/probe/probe.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        if sys.byteorder == "big":
            pcm.byteswap()
        w.writeframes(pcm.tobytes())
    subprocess.run(["npx", "tsx", "scripts/transcribe.mts", "out/probe/probe.wav",
                    os.environ.get("WHISPER_LANG", "es"), "out/probe/probe.json"],
                   check=True, stdout=subprocess.DEVNULL)
    with open("out/probe/probe.json") as f:
        found, lost = place(json.load(f), spans)
    for (_, a, b), words in found.items():
        print(f"[{a:.2f}-{b:.2f}] " + " ".join(f"{t}@{s:.2f}" for t, s in words))
    if lost:
        print("En el silencio entre tramos (Whisper lo inventó): " + " ".join(lost))


def selftest():
    tone = array("h", (round(8000 * math.sin(2 * math.pi * 200 * i / SR)) for i in range(WIN)))
    db, z = measure(tone)
    assert -16 < db < -14 and z < 0.05, (db, z)
    hiss = array("h", (8000 if (i * 7919) % 3 else -8000 for i in range(WIN)))
    assert measure(hiss)[1] > 0.3
    spans = [(0.0, 3.4, 5.0), (2.6, 11.0, 12.0)]
    found, lost = place([{"text": " Soy", "startMs": 100}, {"text": " Seguro", "startMs": 2700},
                         {"text": " en", "startMs": 2000}], spans)
    assert [w for w, _ in found[spans[0]]] == ["Soy"] and abs(found[spans[0]][0][1] - 3.5) < 1e-9
    assert abs(found[spans[1]][0][1] - 11.1) < 1e-9
    assert lost == ["en"]
    # bounds: speech 2.00-2.50, silence 2.50-3.00, speech from 3.00 (rows over 2.05-4.05).
    ts = [2.05 + k / 100 for k in range(200)]
    rows = [(t, -60.0 if 2.495 < t < 2.995 else -10.0, 0.0) for t in ts]
    strip, note = cut_report(rows, 2.05, 4.05, 3.05)
    assert "CAE EN LA VOZ" in note and "2.50-3.00 (500 ms)" in note and "entrada 2.92" in note, note
    assert strip.index("|") == 40 and strip[34] == "·" and strip[35] != "·", strip
    assert cut_report(rows, 2.05, 4.05, 2.70)[1] == "en silencio 2.50-3.00 (500 ms)"
    edge = [(t, -60.0 if t < 2.995 else -10.0, 0.0) for t in ts]
    assert "(≥950 ms)" in cut_report(edge, 2.05, 4.05, 2.70)[1]
    # A 20 ms dip inside a word is not a pause.
    dip = [(t, -60.0 if 3.495 < t < 3.515 else -10.0, 0.0) for t in ts]
    assert "CAE EN LA VOZ" in cut_report(dip, 2.05, 4.05, 3.50)[1]
    # A breath (-44 dB, noisy, with 30 ms silent holes) 2.60-2.80 inside the 2.50-3.00 pause.
    br = [(t, -44.0, 0.3) if 2.595 < t < 2.795 and not 2.645 < t < 2.675 else r
          for t, r in zip(ts, rows)]
    note = cut_report(br, 2.05, 4.05, 2.70)[1]
    assert "respiración 2.60-2.80" in note and "antes de 2.60" in note and "entrada 2.92" in note, note
    # The same noise for only 30 ms is the soft end of an /s/: voice, not a pause.
    tail = [(t, -44.0, 0.3) if 2.495 < t < 2.525 else r for t, r in zip(ts, rows)]
    assert cut_report(tail, 2.05, 4.05, 2.70)[1] == "en silencio 2.53-3.00 (470 ms)"
    print("ok")


if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["help"]
    tools = {"envelope": envelope, "zcr": zcr, "bounds": bounds, "faces": faces,
             "probe": probe, "sheet": sheet, "same": same, "selftest": selftest}
    if cmd not in tools:
        sys.exit(__doc__)
    tools[cmd](*args)
