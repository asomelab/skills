// Word timings ([{ text, start, end }] in seconds) -> SRT subtitles for Instagram/YouTube.
//   node scripts/words-to-srt.mjs src/<tema>/voz-words.json out/<tema>/voz.srt
//   node scripts/words-to-srt.mjs --test        (self-check)
// A cue ends on sentence punctuation, on a pause > 0.35 s, on a comma once it has 3+ words, or
// before it passes 32 characters (then after a comma, never on "de", "en", "y"…); the last word
// of a sentence never stays alone in its own cue.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX = 32;

const stamp = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// Spanish words a line should not end on (articles, prepositions, conjunctions, possessives).
const WEAK = new Set("a al con de del el en la las lo los mi para por que se sin su sus tu un una y o".split(" "));
const bare = (w) => w.text.toLowerCase().replace(/[^a-záéíóúñü]/g, "");

export const toCues = (words) => {
  const cues = [];
  let cur = [];
  const len = (ws) => ws.map((w) => w.text).join(" ").length;
  words.forEach((w, i) => {
    const next = words[i + 1];
    if (cur.length && len([...cur, w]) > MAX) {
      // Would overflow. Keep a sentence's last word with its phrase (up to MAX + 12); otherwise
      // break after the last comma, or move trailing weak words down to the next cue.
      const endsSentence = /[.?!]$/.test(w.text);
      if (!(endsSentence && len([...cur, w]) <= MAX + 12)) {
        let cut = cur.map((x) => /,$/.test(x.text)).lastIndexOf(true) + 1;
        if (cut < 2) {
          cut = cur.length;
          while (cut > 1 && WEAK.has(bare(cur[cut - 1]))) cut--;
        }
        cues.push(cur.slice(0, cut));
        cur = cur.slice(cut);
      }
    }
    cur.push(w);
    const pause = next ? next.start - w.end > 0.35 : true;
    if (!next || /[.?!:;]$/.test(w.text) || pause || (/,$/.test(w.text) && cur.length >= 3)) {
      cues.push(cur);
      cur = [];
    }
  });
  if (cur.length) cues.push(cur);
  return cues;
};

export const wordsToSrt = (words) => {
  const cues = toCues(words);
  return cues
    .map((c, i) => {
      const next = cues[i + 1];
      const last = c[c.length - 1].end;
      // Continuous captions while speaking; after a real pause, end 0.2 s after the last word.
      const end = next && next[0].start - last < 0.6 ? next[0].start : last + 0.2;
      return `${i + 1}\n${stamp(c[0].start)} --> ${stamp(end)}\n${c.map((w) => w.text).join(" ")}\n`;
    })
    .join("\n");
};

const selfCheck = () => {
  const ws = "Eso es Producto, la plataforma que construimos en ASOME para una distribuidora de alimentos."
    .split(" ")
    .map((text, i) => ({ text, start: i * 0.3, end: i * 0.3 + 0.25 }));
  const cues = toCues(ws).map((c) => c.map((w) => w.text).join(" "));
  if (cues[cues.length - 1].split(" ").length < 2) throw new Error(`orphan last word: ${JSON.stringify(cues)}`);
  if (cues.some((c) => WEAK.has(c.split(" ").pop()))) throw new Error(`weak line end: ${JSON.stringify(cues)}`);
  if (cues[0] !== "Eso es Producto,") throw new Error(`comma rule: ${cues[0]}`);
  if (stamp(3725.5) !== "01:02:05,500") throw new Error(`stamp: ${stamp(3725.5)}`);
  if (!wordsToSrt(ws).startsWith("1\n00:00:00,000 --> ")) throw new Error("srt header");
  console.log("ok", cues);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (input === "--test") selfCheck();
  else if (!input || !output) {
    console.error("Uso: node scripts/words-to-srt.mjs <words.json> <salida.srt>");
    process.exit(1);
  } else {
    writeFileSync(output, wordsToSrt(JSON.parse(readFileSync(input, "utf8"))));
    console.log(`SRT: ${output}`);
  }
}
