import type { Caption } from "@remotion/captions";
import raw from "./captions-raw.json";

// Whisper on public/<tema>/cut.mp4, so timings are already reel time. Re-run after every
// `npm run cut`: npm run transcribe -- public/<tema>/cut.mp4 es src/<tema>/captions-raw.json
// Fixes go by phrase, not by timestamp, so they survive a re-transcription: [heard, said].
// Example: ["Asom,", "ASOME."] or ["enviaron su", "envianos un"].
const FIXES: ReadonlyArray<readonly [string, string]> = [];

const words = (raw as Caption[]).map((w) => ({ ...w, text: w.text.trim() }));
for (const [heard, said] of FIXES) {
  const from = heard.split(" ");
  const to = said.split(" ");
  for (let i = 0; i + from.length <= words.length; i++) {
    if (!from.every((t, k) => words[i + k].text === t)) continue;
    // Map the new words onto the old slots; extra old slots are dropped.
    const kept = words.slice(i, i + Math.min(from.length, Math.max(1, to.length)));
    kept.forEach(
      (w, k) => (w.text = k === kept.length - 1 ? to.slice(k).join(" ") : to[k]),
    );
    kept[kept.length - 1].endMs = words[i + from.length - 1].endMs;
    words.splice(i + kept.length, from.length - kept.length);
  }
}

// Phrases: break on punctuation, on a pause over 350 ms, or after 5 words.
let run = 0;
export const captions: Caption[] = words.map((w, i) => {
  const next = words[i + 1];
  run++;
  const pageBreakAfter =
    !next || /[.,:;?!]$/.test(w.text) || next.startMs - w.endMs > 350 || run >= 5;
  if (pageBreakAfter) run = 0;
  return { ...w, text: ` ${w.text}`, pageBreakAfter };
});
