// Renders the edit in src/cuts.ts to two files that the Reel plays as single continuous
// videos, so Studio preview stays in sync across every cut:
//   public/cut.mp4    the kept ranges back to back, with the mixed audio
//   public/blend.mp4  the frames the dissolves need (see blendPieces), no audio
// Audio is mixed here sample-exact, with an equal-power crossfade at every cut, because
// Remotion's bundled ffmpeg has no xfade/acrossfade/afade/fade/overlay filters.
//   npm run cut
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AUDIO_HANDLE,
  blendPieces,
  BREATHS,
  CUT_FRAMES,
  CUTS,
  FPS,
  SEGMENTS,
} from "../src/cuts";

const SRC = "public/clip.mp4";
const SR = 48000;
const CH = 2;
const tmp = mkdtempSync(join(tmpdir(), "asome-cut-"));
const ffmpeg = (args: string[]) =>
  execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", ...args], {
    stdio: "inherit",
  });

for (const [k, c] of CUTS.entries()) {
  if (c.len <= c.blend[1] + (CUTS[k + 1]?.blend[0] ?? 0)) {
    throw new Error(`Segment ${k + 1} is shorter than its dissolves`);
  }
}

// -ss/-t as input options are frame-accurate on re-encode and restart timestamps at 0,
// which the concat filter needs. Floor to the microsecond so frame N is the first kept.
const sec = (frames: number) =>
  (Math.floor((frames / FPS) * 1e6) / 1e6).toFixed(6);

const concat = (
  pieces: ReadonlyArray<readonly [number, number]>,
  out: string,
  more: { readonly inputs?: string[]; readonly args: string[] },
) => {
  const inputs = pieces.flatMap(([from, len]) => [
    "-ss", sec(from), "-t", sec(len), "-an", "-i", SRC,
  ]);
  const graph = `${pieces.map((_, i) => `[${i}:v]`).join("")}concat=n=${pieces.length}:v=1:a=0[v]`;
  ffmpeg([
    ...inputs,
    ...(more.inputs ?? []),
    "-filter_complex", graph,
    "-map", "[v]",
    ...more.args,
    "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-g", String(FPS), "-keyint_min", String(FPS), "-sc_threshold", "0",
    "-fps_mode", "cfr", "-r", String(FPS),
    "-movflags", "+faststart",
    out,
  ]);
};

// 1. Audio: every segment with handles, faded and summed onto the output timeline.
ffmpeg([
  "-i", SRC, "-vn", "-ac", String(CH), "-ar", String(SR),
  "-map_metadata", "-1", "-fflags", "+bitexact", "-c:a", "pcm_s16le",
  join(tmp, "src.wav"),
]);
const wav = readFileSync(join(tmp, "src.wav"));
const data = wav.subarray(wav.indexOf("data") + 8);
const src = new Int16Array(data.length >> 1);
for (let i = 0; i < src.length; i++) src[i] = data.readInt16LE(i * 2);
const srcSamples = src.length / CH;

// Breaths: -12 dB with 20 ms ramps, applied to the source before cutting.
for (const [a, b] of BREATHS) {
  const ramp = 0.02 * SR;
  const i0 = Math.round(a * SR) - ramp;
  const i1 = Math.round(b * SR) + ramp;
  for (let i = Math.max(0, i0); i < Math.min(srcSamples, i1); i++) {
    const g = 1 - 0.75 * Math.min(1, Math.min(i - i0, i1 - i) / ramp);
    for (let ch = 0; ch < CH; ch++) {
      src[i * CH + ch] = Math.round(src[i * CH + ch] * g);
    }
  }
}

// Lengths must be whole samples, or ffmpeg rejects the file ("Invalid PCM packet").
const outSamples = Math.round((CUT_FRAMES * SR) / FPS);
const mix = new Float32Array(outSamples * CH);
CUTS.forEach((c, k) => {
  const seg = SEGMENTS[k];
  const first = k === 0;
  const last = k === CUTS.length - 1;
  const pre = first ? 0 : AUDIO_HANDLE;
  const post = seg.audioOut || last ? 0 : AUDIO_HANDLE;
  const start = c.srcFrom / FPS - pre;
  const end = (seg.audioOut ?? c.srcTo / FPS) + post;
  const fadeIn = first ? 0.01 : 2 * pre;
  const fadeOut = seg.audioOut ? 0.012 : last ? 0.1 : 2 * post;
  const s0 = Math.round(start * SR);
  const o0 = Math.round((c.outFrom / FPS - pre) * SR);
  const n = Math.round((end - start) * SR);
  const fin = Math.round(fadeIn * SR);
  const fout = Math.round(fadeOut * SR);
  for (let i = 0; i < n; i++) {
    const o = o0 + i;
    if (o < 0 || o >= outSamples || s0 + i < 0 || s0 + i >= srcSamples) continue;
    const gIn = i < fin ? Math.sin((Math.PI / 2) * (i / fin)) : 1;
    const gOut = i >= n - fout ? Math.sin((Math.PI / 2) * ((n - i) / fout)) : 1;
    for (let ch = 0; ch < CH; ch++) {
      mix[o * CH + ch] += gIn * gOut * src[(s0 + i) * CH + ch];
    }
  }
});

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + mix.length * 2, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(CH, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * CH * 2, 28);
header.writeUInt16LE(CH * 2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(mix.length * 2, 40);
const pcm = Buffer.alloc(mix.length * 2);
for (let i = 0; i < mix.length; i++) {
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(mix[i]))), i * 2);
}
writeFileSync(join(tmp, "mix.wav"), Buffer.concat([header, pcm]));

// 2. Video: the cut (with the mix muxed in) and the dissolve helper.
const cutPieces = CUTS.map((c) => [c.srcFrom, c.len] as const);
concat(cutPieces, "public/cut.mp4", {
  inputs: ["-i", join(tmp, "mix.wav")],
  args: ["-map", `${cutPieces.length}:a`, "-crf", "14", "-c:a", "aac", "-b:a", "256k"],
});
concat(blendPieces(), "public/blend.mp4", { args: ["-crf", "18"] });
rmSync(tmp, { recursive: true });

// 3. Self-check: both files hold exactly the edit's frame count.
for (const f of ["public/cut.mp4", "public/blend.mp4"]) {
  const frames = Number(
    execFileSync("npx", [
      "remotion", "ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
      "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", f,
    ])
      .toString()
      .trim(),
  );
  if (frames !== CUT_FRAMES) {
    throw new Error(`${f}: ${frames} frames, expected ${CUT_FRAMES}`);
  }
  console.log(`${f}  ${frames} frames (${(frames / FPS).toFixed(2)} s)`);
}

// Where each cut lands, to check frames and to time overlays against the reel.
for (const [k, c] of CUTS.entries()) {
  console.log(
    `${String(k + 1).padStart(2)}  src ${(c.srcFrom / FPS).toFixed(2)}-${(c.srcTo / FPS).toFixed(2)}  ` +
      `reel ${(c.outFrom / FPS).toFixed(2)}  ${SEGMENTS[k].line.slice(0, 48)}`,
  );
}
