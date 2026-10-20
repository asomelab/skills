// Writes the reel's captions (src/<tema>/speech.ts, already in reel time) as an SRT file,
// one block per phrase. render.sh runs it; by hand:
//   npx tsx scripts/srt.mts out/20261015_subtitulos_crecer-sin-estructura_v01.srt
import { writeFileSync } from "node:fs";
import { currentReel } from "./reel.mjs";

type Word = { text: string; startMs: number; endMs: number; pageBreakAfter?: boolean };
const { captions } = (await import(`../src/${currentReel()}/speech.ts`)) as {
  captions: Word[];
};

const out = process.argv[2] ?? "out/subtitulos.srt";
const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const ts = (ms: number) => {
  const t = Math.round(ms);
  return `${pad(Math.floor(t / 3600000))}:${pad(Math.floor(t / 60000) % 60)}:${pad(Math.floor(t / 1000) % 60)},${pad(t % 1000, 3)}`;
};

const blocks: string[] = [];
let page: typeof captions = [];
for (const c of captions) {
  page.push(c);
  if (!c.pageBreakAfter) continue;
  const text = page.map((w) => w.text.trim()).join(" ");
  blocks.push(
    `${blocks.length + 1}\n${ts(page[0].startMs)} --> ${ts(page[page.length - 1].endMs)}\n${text}\n`,
  );
  page = [];
}
writeFileSync(out, blocks.join("\n"));
console.log(`${out}  ${blocks.length} subtítulos`);
