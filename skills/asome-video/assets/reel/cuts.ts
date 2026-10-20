// The edit, in seconds of public/<tema>/clip.mp4 (one file: join several recordings first, Fase 3).
// One segment per kept line, in REEL order: source order is not required (a hook re-recorded
// at the end of the take can go first). In and out points sit in silences measured on the
// 10 ms envelope (npm run analyze -- bounds ...), never on Whisper times, and stop before
// every glance away from the lens (npm run analyze -- faces ...). Pauses over ~0.3 s inside
// a take become two segments joined by MICRO.
// After every change: npm run cut (renders public/<tema>/cut.mp4 and blend.mp4).

type Segment = {
  readonly in: number;
  readonly out: number;
  readonly line: string; // what is said, so the plan reads against the transcript
  // Speech runs right up to the next word (no gap to crossfade in): the audio ends here
  // with a 12 ms fade and no handle. Example: an aspirated final /s/ that touches a vowel.
  readonly audioOut?: number;
  // Dissolve into this segment: frames blended before and after the cut (default 3 + 3).
  readonly blend?: readonly [number, number];
};

// Pause removed inside one take: same framing, so a 4-frame dissolve is enough.
export const MICRO: readonly [number, number] = [2, 2];

export const SEGMENTS: readonly Segment[] = [
  // Placeholder until the edit plan (Fase 4) is approved.
  { in: 0, out: 10, line: "(reemplazar con las tomas del plan de edición)" },
];

// Audible inhales inside kept ranges, in source seconds: lowered 12 dB in the mix.
export const BREATHS: ReadonlyArray<readonly [number, number]> = [];

export const FPS = 30;
// Audio crossfade at every cut: each side runs this far past the cut (s), equal-power.
export const AUDIO_HANDLE = 0.06;
const DEFAULT_BLEND: readonly [number, number] = [3, 3];

// Frame-exact layout of the edit: source range and position on the output timeline.
export const CUTS = (() => {
  let outFrom = 0;
  return SEGMENTS.map((s, k) => {
    const srcFrom = Math.round(s.in * FPS);
    const srcTo = Math.round(s.out * FPS);
    const cut = {
      srcFrom,
      srcTo,
      len: srcTo - srcFrom,
      outFrom,
      blend: k === 0 ? ([0, 0] as const) : (s.blend ?? DEFAULT_BLEND),
    };
    outFrom += cut.len;
    return cut;
  });
})();

export const CUT_FRAMES = CUTS.reduce((sum, c) => sum + c.len, 0);

// Source seconds -> output frame. Overlays are written in source seconds so they read
// against transcript.json. Works for any segment order. A time inside a removed range snaps
// to the start of the next kept piece in source order (the end of the reel if none follows).
export const at = (srcSec: number) => {
  const f = srcSec * FPS;
  const hit = CUTS.find((c) => f >= c.srcFrom && f <= c.srcTo);
  if (hit) return hit.outFrom + (f - hit.srcFrom);
  const later = CUTS.filter((c) => c.srcFrom > f);
  if (later.length === 0) return CUT_FRAMES;
  return later.reduce((a, b) => (b.srcFrom < a.srcFrom ? b : a)).outFrom;
};

// Opacity of blend.mp4 at an output frame. Around a cut that file holds the incoming
// take's lead-in (before the cut) and the outgoing take's tail (after it), so fading it
// like this turns every hard cut into a short centered cross-dissolve.
export const blendOpacity = (frame: number) => {
  for (const c of CUTS) {
    const [before, after] = c.blend;
    if (frame >= c.outFrom - before && frame < c.outFrom + after) {
      const mix = (frame - (c.outFrom - before) + 0.5) / (before + after);
      return frame < c.outFrom ? mix : 1 - mix;
    }
  }
  return 0;
};

// What blend.mp4 holds, as [sourceFrom, frames] pieces back to back (CUT_FRAMES in total).
export const blendPieces = () =>
  CUTS.flatMap((c, k) => {
    const prev = CUTS[k - 1];
    const next = CUTS[k + 1];
    const tail = prev ? c.blend[1] : 0;
    const lead = next ? next.blend[0] : 0;
    return [
      ...(tail ? [[prev.srcTo, tail] as const] : []),
      [c.srcFrom + tail, c.len - tail - lead] as const,
      ...(lead ? [[next.srcFrom - lead, lead] as const] : []),
    ];
  });
