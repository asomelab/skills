// Music for the product reel: a seeded, deterministic house groove under the voiceover, built
// on the reel's own sections so the drop and the end-card hit land on downbeats. No
// dependencies, same file on every run. Ported from the first ASOME product reel (Oct 2026).
//
//   node scripts/make-beat.mjs --drop 5.5 --lift 11.9 --close 35.5 --build 43.9 --hit 46.6
//
// Times are absolute seconds from src/producto/timeline.ts:
//   --drop   full beat comes in (SCENES.reveal.from)
//   --lift   open hats + bass 8ths, the full groove (SCENES.sideA.from)
//   --close  hats out, calmer under the ASOME message (SCENES.close.from)
//   --build  16th hats + riser into the hit (onset of "¿Tenés un proyecto así?")
//   --hit    final chord + kick (END_CARD.from)
//   --dur    file length (default hit + 3.4, the end card)   --bpm target tempo (default 118)
//   --seed   noise seed (default 118)   --out  default public/audio/promo-beat.wav
// The tempo is nudged so drop -> hit is a whole number of bars. A minor (Am7-Fmaj7-C-G, one
// chord per bar), no melody, every tonal layer low-passed: 1-4 kHz stays free for the voice.
// ponytail: synthesized placeholder; drop a licensed track at the same path if one is chosen.
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const num = (name, fallback) => {
  const v = Number(arg(name, fallback));
  if (!Number.isFinite(v)) throw new Error(`--${name} must be a number`);
  return v;
};
const DROP = num("drop", 5.5);
const LIFT = num("lift", 11.9);
const CLOSE = num("close", 35.5);
const BUILD = num("build", 43.9);
const HIT = num("hit", 46.6);
const DUR = num("dur", HIT + 3.4);
const BPM = num("bpm", 118);
const OUT = arg("out", "public/audio/promo-beat.wav");
if (!(DROP < LIFT && LIFT <= CLOSE && CLOSE <= BUILD && BUILD < HIT && HIT < DUR)) {
  throw new Error("expected drop < lift <= close <= build < hit < dur");
}

const SR = 48000;
const FADE = 1.2;

// mulberry32: same noise on every run, so renders stay reproducible.
let seed = num("seed", 118);
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;

const writeWav = (file, left, right) => {
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
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
};

const normalize = (peak, ...chs) => {
  let max = 0;
  for (const ch of chs) for (const v of ch) max = Math.max(max, Math.abs(v));
  for (const ch of chs) for (let i = 0; i < ch.length; i++) ch[i] *= peak / max;
};

// RBJ band-pass, coefficients recomputed per sample so the centre can sweep.
const bandpass = () => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, fc, q) => {
    const w = (2 * Math.PI * fc) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    const y = (alpha / a0) * x - (alpha / a0) * x2 + ((2 * Math.cos(w)) / a0) * y1 - ((1 - alpha) / a0) * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};
const lowpass = (fc) => {
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  return (x) => (y += a * (x - y));
};
const smooth = (x) => x * x * (3 - 2 * x);

const BARS = Math.max(1, Math.round(((HIT - DROP) * BPM) / 240));
const BEATS = BARS * 4;
const B = (HIT - DROP) / BEATS; // one beat
const at = (k) => DROP + k * B; // time of beat k (negative = intro)
const SWING = 0.06 * B; // offbeat 8ths land a touch late
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const PADS = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 67]];
const ROOTS = [33, 29, 36, 31]; // A1 F1 C2 G1
const ofBar = (k) => ((Math.floor(k / 4) % 4) + 4) % 4; // chord index at beat k

const n = Math.round(DUR * SR);
const kick = new Float32Array(n), duck = new Float32Array(n), bass = new Float32Array(n);
const keysL = new Float32Array(n), keysR = new Float32Array(n);
const topL = new Float32Array(n), topR = new Float32Array(n);

const kickAt = (t0, amp, fc) => {
  const i0 = Math.round(t0 * SR), lp = lowpass(fc);
  let ph = 0;
  for (let i = 0; i < SR / 2 && i0 + i < n; i++) {
    const s = i / SR;
    ph += (2 * Math.PI * (47 + 110 * Math.exp(-s / 0.03))) / SR;
    kick[i0 + i] += lp(Math.tanh(1.8 * Math.sin(ph))) * Math.min(1, s / 0.002) * Math.exp(-s / 0.2) * amp;
    // soft sidechain: 5 ms dip, ~150 ms recovery
    duck[i0 + i] = Math.max(duck[i0 + i], amp * (s < 0.005 ? s / 0.005 : Math.exp(-(s - 0.005) / 0.09)));
  }
};
const hat = (t0, amp, decay, pan) => {
  const i0 = Math.round(t0 * SR), lp1 = lowpass(7500), lp2 = lowpass(7500);
  for (let i = 0; i < decay * 6 * SR && i0 + i < n; i++) {
    const x = noise(), h = x - lp1(x);
    const v = (h - lp2(h)) * Math.exp(-i / SR / decay) * amp;
    topL[i0 + i] += v * (1 - pan);
    topR[i0 + i] += v * (1 + pan);
  }
};
const bassNote = (t0, dur, m, amp, rel = 0.03) => {
  const i0 = Math.round(t0 * SR), w = 2 * Math.PI * hz(m), lp = lowpass(520);
  for (let i = 0; i < (dur + rel * 6) * SR && i0 + i < n; i++) {
    const s = i / SR, x = Math.sin(w * s);
    const env = Math.min(1, s / 0.006) * (s < dur ? 1 : Math.exp(-(s - dur) / rel));
    bass[i0 + i] += lp(0.6 * x + 0.4 * Math.tanh(2.5 * x) + 0.15 * Math.sin(2 * w * s)) * env * amp;
  }
};
const chord = (t0, t1, notes, att, rel, amp) => {
  const i1 = Math.min(n, Math.round((t1 + rel * 6) * SR));
  for (let i = Math.round(t0 * SR); i < i1; i++) {
    const s = i / SR;
    const env = smooth(Math.min(1, Math.max(0, s - t0) / att)) * (s < t1 ? 1 : Math.exp(-(s - t1) / rel)) * (amp / notes.length);
    let l = 0, r = 0;
    for (const m of notes) {
      const w = 2 * Math.PI * hz(m) * s;
      for (let h = 1; h <= 5; h++) {
        l += Math.sin(w * h * 0.9977) / h;
        r += Math.sin(w * h * 1.0023) / h;
      }
    }
    keysL[i] += l * env;
    keysR[i] += r * env;
  }
};
const riser = (t0, t1, f0, f1, amp) => {
  const bpL = bandpass(), bpR = bandpass();
  for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) {
    const u = (i / SR - t0) / (t1 - t0), fc = f0 * (f1 / f0) ** u, g = amp * u * u;
    topL[i] += bpL(noise(), fc, 0.9) * g;
    topR[i] += bpR(noise(), fc, 0.9) * g;
  }
};

// Kick: muffled and opening up through the intro, one beat of air before the drop and the hit.
for (let k = -Math.floor(DROP / B); k < BEATS; k++) {
  if (k === -1 || k === BEATS - 1) continue;
  if (k < 0) kickAt(at(k), 0.35 + 0.4 * (at(k) / DROP), 140 + 1200 * (at(k) / DROP) ** 2);
  else kickAt(at(k), 1, 12000);
}
kickAt(HIT, 1.05, 12000);
hat(DROP, 0.4, 0.5, 0); // soft crashes on the drop and the hit
hat(HIT, 0.4, 0.7, 0);
// Closed hats on swung 8ths until the closing message; open hats lift the two product sides.
for (let e = 0; e < BEATS * 2; e++) {
  const off = e % 2, t = at(e / 2) + off * SWING;
  if (t < CLOSE) hat(t, off ? 0.5 : 0.3, 0.028, off ? 0.15 : -0.1);
  if (off && t >= LIFT && t < CLOSE) hat(t, 0.2, 0.13, 0.05);
}
for (let e = 0; at(e / 4) < HIT; e++) { // build: straight 16ths, getting louder
  const t = at(e / 4);
  if (t >= BUILD) hat(t, 0.12 + 0.45 * ((t - BUILD) / (HIT - BUILD)), 0.022, e % 2 ? 0.15 : -0.15);
}
riser(Math.max(0, at(-4)), DROP, 300, 1800, 0.07);
riser(BUILD, HIT, 250, 2000, 0.17);
// Bass: pumping root per beat, offbeat 8ths (octave on the last one) in the full groove.
for (let k = 0; k < BEATS - 1; k++) {
  const root = ROOTS[ofBar(k)];
  if (at(k) >= LIFT && at(k) < CLOSE) bassNote(at(k + 0.5) + SWING, 0.42 * B, root + (k % 4 === 3 ? 12 : 0), 1);
  else bassNote(at(k), B - 0.03, root, at(k) >= CLOSE && at(k) < BUILD ? 0.6 : 0.75);
}
bassNote(HIT, 0, 33, 1, 1.1); // A1 under the final chord
// Keys: pad on every bar, stabs on the swung "and" of 2 and 4 from the drop to the build.
for (let bar = -Math.ceil(DROP / (4 * B)); bar < BARS; bar++) {
  const notes = PADS[ofBar(bar * 4)];
  chord(Math.max(0, at(bar * 4)), at(bar * 4 + 4), notes, 0.08, 0.15, 0.6);
  for (const b of [1.5, 3.5]) {
    const t = at(bar * 4 + b) + SWING;
    if (t >= DROP && t < BUILD) chord(t, t, notes, 0.004, 0.11, 0.55);
  }
}
chord(HIT, DUR, [45, 57, 60, 64, 67, 71], 0.01, 1, 1); // Am9 resolve

const L = new Float32Array(n), R = new Float32Array(n);
const k1L = lowpass(1400), k2L = lowpass(1400), k1R = lowpass(1400), k2R = lowpass(1400);
for (let i = 0; i < n; i++) {
  const s = i / SR, d = duck[i];
  let g = 1; // keys level per section
  if (s < DROP) g = smooth(Math.min(1, s / 1.5)) * (0.55 + 0.45 * (s / DROP));
  else if (s >= CLOSE && s < BUILD) g = 1.1;
  else if (s >= BUILD && s < HIT) g = 1.1 + 0.5 * ((s - BUILD) / (HIT - BUILD)) ** 2;
  const fade = s > DUR - FADE ? 1 - smooth((s - DUR + FADE) / FADE) : 1;
  const low = kick[i] * 0.9 + bass[i] * 0.42 * (1 - 0.6 * d);
  const kg = 0.55 * g * (1 - 0.5 * d);
  L[i] = (low + k2L(k1L(keysL[i])) * kg + topL[i] * 2) * fade;
  R[i] = (low + k2R(k1R(keysR[i])) * kg + topR[i] * 2) * fade;
}
normalize(0.5, L, R); // peaks at -6 dBFS
writeWav(OUT, L, R);

// Self-check + a level map so the sections are visible without listening.
if (statSync(OUT).size !== 44 + n * 4) throw new Error(`${OUT} has the wrong length`);
const rms = [];
for (let t = 0; t < DUR; t += 2) {
  let acc = 0, c = 0;
  for (let i = Math.round(t * SR); i < Math.min(n, Math.round((t + 2) * SR)); i++, c++) acc += L[i] * L[i];
  rms.push(`${t}s ${(20 * Math.log10(Math.sqrt(acc / c) || 1e-9)).toFixed(0)}dB`);
}
console.log(`${OUT}: ${DUR.toFixed(2)} s, ${((60 / B)).toFixed(1)} BPM, ${BARS} bars drop -> hit`);
console.log(rms.join(" · "));
