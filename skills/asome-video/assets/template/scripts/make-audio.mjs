// Synthesizes the shared sound kit into public/audio/ and the current reel's music bed into
// public/<tema>/bed.wav (48 kHz, 16-bit WAV). Deterministic (seeded noise), no dependencies:
// `npm run audio -- <bed seconds>`. Pass the reel length plus 2 s so the bed covers it
// (default 24 s). Without a current reel (.reel / $REEL) the bed goes to public/audio/.
// ponytail: synthesized placeholders. Drop a licensed track over public/<tema>/bed.wav
// (same name) when one is chosen; levels are set in src/<tema>/Reel.tsx.
import { mkdirSync, writeFileSync } from "node:fs";
import { currentReel } from "./reel.mjs";

const SR = 48000;
const OUT = new URL("../public/audio/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// mulberry32: same noise on every run, so renders stay reproducible.
let seed = 7;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;

const writeWav = (name, left, right = left) => {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // stereo
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  const clip = (v) => Math.max(-1, Math.min(1, v));
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(clip(left[i]) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clip(right[i]) * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(name, OUT), buf);
};

const normalize = (peak, ...chs) => {
  let max = 0;
  for (const ch of chs) for (const v of ch) max = Math.max(max, Math.abs(v));
  for (const ch of chs) for (let i = 0; i < ch.length; i++) ch[i] *= peak / max;
};

// RBJ band-pass, coefficients recomputed per sample so the centre can sweep.
const bandpass = () => {
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  return (x, fc, q) => {
    const w = (2 * Math.PI * fc) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    const y =
      (alpha / a0) * x -
      (alpha / a0) * x2 +
      ((2 * Math.cos(w)) / a0) * y1 -
      ((1 - alpha) / a0) * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
};
const lowpass = (fc) => {
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  return (x) => (y += a * (x - y));
};
const smooth = (x) => x * x * (3 - 2 * x);

// Whoosh: noise through a sweeping band-pass, bell envelope, slight L→R drift.
const whoosh = (dur, from, peakHz, to, rise) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  const bp = bandpass(),
    lp = lowpass(7000);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const fc =
      t < rise
        ? from * (peakHz / from) ** smooth(t / rise)
        : peakHz * (to / peakHz) ** smooth((t - rise) / (1 - rise));
    const env =
      t < rise
        ? smooth(t / rise) ** 1.6
        : (1 - smooth((t - rise) / (1 - rise))) ** 1.3;
    const v = lp(bp(noise(), fc, 0.8)) * env;
    const pan = -0.35 + 0.7 * t;
    L[i] = v * Math.cos(((pan + 1) * Math.PI) / 4);
    R[i] = v * Math.sin(((pan + 1) * Math.PI) / 4);
  }
  normalize(0.5, L, R);
  return [L, R];
};

// Tick: short soft tap for a card landing.
const tick = () => {
  const n = Math.round(0.09 * SR);
  const out = new Float32Array(n),
    hp = lowpass(3000);
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    const body =
      Math.sin(2 * Math.PI * 1500 * s) * Math.exp(-s / 0.016) +
      0.35 * Math.sin(2 * Math.PI * 2250 * s) * Math.exp(-s / 0.008);
    const nz = noise();
    const click = s < 0.003 ? (nz - hp(nz)) * (1 - s / 0.003) * 0.4 : 0;
    out[i] = body + click;
  }
  normalize(0.4, out);
  return out;
};

// Thump: low pitch-dropping hit for the logo landing.
const thump = () => {
  const n = Math.round(0.6 * SR);
  const out = new Float32Array(n),
    lp = lowpass(900);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    const f = 46 + (120 - 46) * Math.exp(-s / 0.07);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, s / 0.004) * Math.exp(-s / 0.17);
    const transient = s < 0.03 ? lp(noise()) * (1 - s / 0.03) * 0.5 : 0;
    out[i] = Math.sin(phase) * env + transient;
  }
  normalize(0.7, out);
  return out;
};

// Rise: gentle upward glide under the revenue line drawing itself.
const rise = () => {
  const n = Math.round(1.2 * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  const bp = bandpass();
  let p1 = 0,
    p2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = 330 * 2 ** smooth(t);
    p1 += (2 * Math.PI * f) / SR;
    p2 += (2 * Math.PI * f * 1.003) / SR;
    const env = t < 0.8 ? smooth(t / 0.8) ** 2 : 1 - smooth((t - 0.8) / 0.2);
    const tone = 0.5 * Math.sin(p1) + 0.12 * Math.sin(2 * p1);
    const air = bp(noise(), f * 3, 1.2) * 0.6;
    L[i] = (tone + air) * env;
    R[i] = (0.5 * Math.sin(p2) + 0.12 * Math.sin(2 * p2) + air) * env;
  }
  normalize(0.35, L, R);
  return [L, R];
};

// Bed: four-chord pad (A maj9, F#m9, D maj9, E6/9), soft partials, slow crossfades.
// About 6 s per chord, the progression repeating, so a long talk never drags on one chord.
const bed = (dur) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n),
    R = new Float32Array(n);
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
  const chords = [
    [57, 64, 68, 71, 73], // A3 E4 G#4 B4 C#5
    [54, 61, 64, 68, 69], // F#3 C#4 E4 G#4 A4
    [50, 62, 66, 69, 73], // D3 D4 F#4 A4 C#5
    [52, 59, 61, 66, 68], // E3 B3 C#4 F#4 G#4
  ];
  const count = Math.max(chords.length, Math.round(dur / 6));
  const len = dur / count;
  const fade = 1.6;
  const lpL = lowpass(1700),
    lpR = lowpass(1700);
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    let l = 0,
      r = 0;
    for (let c = 0; c < count; c++) {
      const notes = chords[c % chords.length];
      const start = c * len - (c === 0 ? 0 : fade / 2);
      const end = (c + 1) * len + (c === count - 1 ? 0 : fade / 2);
      if (s < start || s > end) continue;
      const gIn = c === 0 ? 1 : smooth(Math.min(1, (s - start) / fade));
      const gOut = c === count - 1 ? 1 : smooth(Math.min(1, (end - s) / fade));
      const g = gIn * gOut;
      notes.forEach((m, k) => {
        const f = hz(m);
        const amp = (k === 0 ? 0.55 : 1) / notes.length;
        for (let h = 1; h <= 4; h++) {
          const a = amp / (h * h);
          l += a * g * Math.sin(2 * Math.PI * f * h * s * 0.9977);
          r += a * g * Math.sin(2 * Math.PI * f * h * s * 1.0023);
        }
      });
    }
    const swell = 0.94 + 0.06 * Math.sin(2 * Math.PI * 0.12 * s);
    L[i] = lpL(l) * swell;
    R[i] = lpR(r) * swell;
  }
  // 1.5 s fades at both ends so the bed never clicks in or out.
  const f = Math.round(1.5 * SR);
  for (let i = 0; i < f; i++) {
    const g = smooth(i / f);
    L[i] *= g;
    R[i] *= g;
    L[n - 1 - i] *= g;
    R[n - 1 - i] *= g;
  }
  normalize(0.45, L, R);
  return [L, R];
};

writeWav("whoosh.wav", ...whoosh(0.7, 380, 2600, 900, 0.6));
writeWav("whoosh-soft.wav", ...whoosh(0.5, 300, 1600, 600, 0.55));
writeWav("tick.wav", tick());
writeWav("thump.wav", thump());
writeWav("rise.wav", ...rise());
const bedSeconds = Number(process.argv[2] ?? 24);
if (!Number.isFinite(bedSeconds) || bedSeconds < 4) {
  throw new Error(
    `Bed length must be a number of seconds >= 4, got "${process.argv[2]}"`,
  );
}
let bedFile = "bed.wav";
try {
  const reel = currentReel();
  mkdirSync(new URL(`../${reel}/`, OUT), { recursive: true });
  bedFile = `../${reel}/bed.wav`;
} catch {
  // No reel yet: the bed stays in public/audio/.
}
writeWav(bedFile, ...bed(bedSeconds));

// Self-check: every file exists with a sane length.
const { statSync } = await import("node:fs");
for (const f of ["whoosh.wav", "whoosh-soft.wav", "tick.wav", "thump.wav", "rise.wav", bedFile]) {
  const size = statSync(new URL(f, OUT)).size;
  if (size < 4000) throw new Error(`${f} looks empty (${size} bytes)`);
  console.log(`${f}  ${(size / 1024).toFixed(0)} KB`);
}
