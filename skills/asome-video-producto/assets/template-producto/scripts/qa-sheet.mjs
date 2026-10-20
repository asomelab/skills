// Contact sheet of frames from the RENDERED MP4, for QA with one image read.
//   node scripts/qa-sheet.mjs out/<reel>.mp4 general 1 3 5.4 8 12 …     frames at those seconds
//   node scripts/qa-sheet.mjs out/<reel>.mp4 corte-2 @11.9               12 frames around 11.9 s (30 fps)
// Extracts each frame with Remotion's ffmpeg into public/qa/<name>/, then renders the <tema>-qa
// Still (the reel in .reel) to out/qa/<name>.jpg. Inside Claude Code run it with the Bash sandbox disabled.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { currentReel } from "./reel.mjs";

const FPS = 30;
const [mp4, name, ...marks] = process.argv.slice(2);
if (!mp4 || !name || !marks.length || !/^[a-z0-9-]+$/.test(name)) {
  console.error("Uso: node scripts/qa-sheet.mjs <video.mp4> <nombre-en-minusculas> <segundos | @segundos>…");
  process.exit(1);
}

// "@T" = the 12 frames from 6 before T to 5 after it: a transition at full frame rate.
const frames = marks.flatMap((m) => {
  const t = Number(m.replace(/^@/, ""));
  if (!Number.isFinite(t)) throw new Error(`not a time: ${m}`);
  const f = Math.round(t * FPS);
  return m.startsWith("@") ? Array.from({ length: 12 }, (_, i) => f - 6 + i).filter((x) => x >= 0) : [f];
});

const dir = `public/qa/${name}`;
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
mkdirSync("out/qa", { recursive: true });
const tiles = frames.map((f, i) => {
  const src = `qa/${name}/${String(i).padStart(3, "0")}.jpg`;
  // +0.5 frame so the seek lands inside frame f, never on its boundary.
  const ss = ((f + 0.5) / FPS).toFixed(4);
  execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-ss", ss, "-i", mp4, "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "3", `public/${src}`]);
  return { src, label: `${(f / FPS).toFixed(2)} s · f${f}` };
});

const props = `out/qa/${name}.json`;
writeFileSync(props, JSON.stringify({ tiles, cols: 6 }));
// still.sh adds this machine's browser flags and retries once.
execFileSync("bash", ["scripts/still.sh", `${currentReel()}-qa`, `out/qa/${name}.jpg`, `--props=${props}`, "--image-format=jpeg"], { stdio: "inherit" });
console.log(`out/qa/${name}.jpg (${tiles.length} cuadros)`);
