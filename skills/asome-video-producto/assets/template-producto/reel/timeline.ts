import words from "./voz-words.json";

// Every time here is ABSOLUTE seconds in the voiceover (public/<tema>/voz.mp3, word timings
// in ./voz-words.json, both written by scripts/tts-elevenlabs.mjs). Scenes render inside a
// <Sequence> of the shell; inside a scene, `useSceneFrame(id)` (ui/Kit.tsx) gives the frame on
// the same clock as rel(BEATS.x, id). Fill SCENES from the per-line times the TTS script prints.

export const FPS = 30;

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export const WORDS = words as Word[];

// One scene per line of the script (Fase 1). Placeholder times: replace them.
export const SCENES = {
  hook: { from: 0, to: 5.5 }, // emotional hook
  reveal: { from: 5.5, to: 11.9 }, // "Eso es <producto>, lo construimos en ASOME para un cliente…"
  sideA: { from: 11.9, to: 23.6 }, // business side ("Para el <rol A>: …")
  sideB: { from: 23.6, to: 35.5 }, // emotional side ("Para el <rol B>: …")
  close: { from: 35.5, to: 46.6 }, // ASOME close + "¿Tenés un proyecto así? Escribinos."
} as const;
export type SceneId = keyof typeof SCENES;

// How each scene arrives. "cut" lands on its first frame; the others slide in over MOVE frames
// that END on SCENES[id].from, so they start MOVE frames early (see lead()).
export const MOVE = 12;
export const ENTRANCE: Record<SceneId, "cut" | "up" | "left"> = {
  hook: "cut",
  reveal: "cut",
  sideA: "up",
  sideB: "left",
  close: "up",
};
/** Frames a scene is mounted before SCENES[id].from (its slide-in). */
export const lead = (scene: SceneId) => (ENTRANCE[scene] === "cut" ? 0 : MOVE);

/** Onset (s) of the first word starting with `prefix` at or after `after` seconds. Throws if missing. */
export const word = (prefix: string, after = 0): number => {
  const norm = (s: string) => s.toLowerCase().replace(/[.,:;¿?¡!"«»]/g, "");
  const w = WORDS.find((x) => x.start >= after && norm(x.text).startsWith(norm(prefix)));
  if (!w) throw new Error(`timeline: no word "${prefix}" after ${after}s in voz-words.json`);
  return w.start;
};

// Word onsets worth animating on (absolute s), one entry per visual beat of the storyboard:
//   planifica: word("planifica", SCENES.sideA.from),
// A typo in a beat name is a type error, a word missing from the voice throws on load.
export const BEATS = {} as const satisfies Record<string, number>;

export const VOICE_END = WORDS.length ? WORDS[WORDS.length - 1].end : SCENES.close.to;
// ASOME EndCard (3.4 s) slides up right after the last word.
export const END_CARD = { from: Math.max(SCENES.close.to, VOICE_END), frames: 102 } as const;
export const TOTAL_FRAMES = Math.round(END_CARD.from * FPS) + END_CARD.frames;

// The hook's kinetic title already says its words: captions start at the reveal.
export const CAPTIONS_FROM = SCENES.reveal.from;

/** Frame of an absolute time, on a scene's clock (0 = SCENES[scene].from). */
export const rel = (absSec: number, scene: SceneId) => Math.round((absSec - SCENES[scene].from) * FPS);
export const sceneFrames = (scene: SceneId) => Math.round((SCENES[scene].to - SCENES[scene].from) * FPS);

// Canvas 1080x1920 shared by every scene:
//   y 0-250      Instagram chrome: nothing important
//   y 250-1540   scene content (label, title, devices, graphics); text between x 96 and 984
//   y 1540-1730  captions (shell)
//   y 1750-1820  ASOME signature row (shell)
export const SAFE = { top: 250, contentBottom: 1540, margin: 96, right: 984 } as const;
