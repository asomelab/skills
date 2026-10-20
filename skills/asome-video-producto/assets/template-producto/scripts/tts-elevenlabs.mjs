// AI voiceover with ElevenLabs, with per-character timings turned into word timings and SRT.
// The API key is read ONLY from the ELEVENLABS_API_KEY environment variable, which the user
// writes into ~/.zshenv from their own Terminal (references/guion-y-voz.md has the command;
// Claude's shell is `zsh -c`, which reads ~/.zshenv but not ~/.zshrc). Never pass it as an
// argument, never write it to a file, never print it.
//
//   node scripts/tts-elevenlabs.mjs voces                       premade voices (name, id, accent)
//   node scripts/tts-elevenlabs.mjs muestra docs/<tema>/guion.txt <id> [<id>…]   first line per voice
//   node scripts/tts-elevenlabs.mjs generar docs/<tema>/guion.txt <id>      the full voiceover
//
// `generar` writes, for the reel in .reel ($REEL): public/<tema>/voz.mp3, src/<tema>/voz-words.json,
// out/<tema>/voz-alignment.json and out/<tema>/voz.srt, and prints when each line of the script starts and ends (= SCENES).
// Options: --model eleven_multilingual_v2 (default) · --lang es (default; --lang "" to omit).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { currentReel } from "./reel.mjs";
import { wordsToSrt } from "./words-to-srt.mjs";

const API = "https://api.elevenlabs.io/v1";
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1] ?? "";
  args.splice(i, 2);
  return v;
};
const model = opt("model", "eleven_multilingual_v2");
const lang = opt("lang", "es");
const [cmd, ...rest] = args;

// Characters with start/end times -> words (punctuation stays attached: "Producto,").
const alignmentToWords = (a) => {
  const words = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: "", start: a.character_start_times_seconds[i], end: 0 };
    cur.text += ch;
    cur.end = a.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words.map((w) => ({ text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
};

if (cmd === "--test") {
  // Self-check without the API: `node scripts/tts-elevenlabs.mjs --test [alignment.json words.json]`.
  const a = rest[0]
    ? JSON.parse(readFileSync(rest[0], "utf8"))
    : { characters: [..."Hola, mundo."], character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], character_end_times_seconds: [0.1, 0.2, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1] };
  const got = JSON.stringify(alignmentToWords(a));
  const want = rest[1] ? JSON.stringify(JSON.parse(readFileSync(rest[1], "utf8"))) : JSON.stringify([{ text: "Hola,", start: 0, end: 0.4 }, { text: "mundo.", start: 0.5, end: 1.1 }]);
  if (got !== want) throw new Error(`alignmentToWords: ${got.slice(0, 200)}`);
  console.log("ok");
  process.exit(0);
}

// Same command as references/guion-y-voz.md: hidden prompt, nothing in the shell history,
// replaces an older key, file readable only by the user. zsh syntax (macOS default shell).
const SAVE_KEY = `read -rs "k?Clave de ElevenLabs: " && echo && touch ~/.zshenv && sed -i '' '/ELEVENLABS_API_KEY/d' ~/.zshenv && print -r -- "export ELEVENLABS_API_KEY='$k'" >> ~/.zshenv && chmod 600 ~/.zshenv && unset k && echo listo`;
// Premade voices to try when the key cannot list voices. Sarah was used in the first reel; the
// others are long-standing premade ids: if one answers 404 it was retired, try the next.
const KNOWN_VOICES = [
  ["Sarah", "EXAVITQu4vr4xnSDxMaL"],
  ["Laura", "FGY2WhTYpPnrIDTdsKH5"],
  ["Matilda", "XrExE9yKIg1WjnnlVkGX"],
  ["George", "JBFqnCBsd6RMkjVDRZzb"],
  ["Brian", "nPczCjzI2devNBz1zQrb"],
];

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error(`Falta la clave de ElevenLabs en la variable ELEVENLABS_API_KEY.
Cargala vos, en tu propia app Terminal (nunca en el chat). Pegá esta línea, apretá Enter,
pegá la clave (no se ve mientras la escribís) y apretá Enter otra vez:
  ${SAVE_KEY}
Si la clave ya se pegó en un chat o en un archivo, rotala hoy mismo en ElevenLabs
(Profile > API Keys: borrala y creá otra) y cargá la nueva con la misma línea.`);
  process.exit(2);
}

const call = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "xi-api-key": key, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`ElevenLabs respondió ${res.status}: ${body.slice(0, 600)}`);
    if (res.status === 401 || res.status === 403 || /permission/i.test(body)) {
      console.error("La clave no es válida o le falta un permiso. Necesita «Text to Speech» y «Voices: Read» (o crearla sin restricciones).");
      if (cmd === "voces") {
        console.error("Mientras tanto, si solo falta «Voices: Read», podés pedir muestras con voces premade conocidas:");
        for (const [name, id] of KNOWN_VOICES) console.error(`  ${name.padEnd(8)} ${id}`);
      }
    }
    if (/language/i.test(body)) console.error('Probá de nuevo con --lang "" (este modelo no acepta language_code).');
    if (/quota|credits/i.test(body)) console.error("Se terminaron los créditos del mes del plan.");
    if (/library|free/i.test(body)) console.error("Esa voz no está disponible en el plan gratis por API: elegí una voz premade.");
    process.exit(1);
  }
  return res.json();
};

const speak = (voice, text) =>
  call(`/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify({
      text,
      model_id: model,
      ...(lang ? { language_code: lang } : {}),
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
  });

const write = (file, data) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
};

const readScript = (file) =>
  readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

if (cmd === "voces") {
  const { voices } = await call("/voices");
  for (const v of voices.filter((x) => x.category === "premade")) {
    const l = v.labels ?? {};
    console.log(`${v.name.padEnd(12)} ${v.voice_id}  ${[l.gender, l.age, l.accent, l.description].filter(Boolean).join(", ")}`);
  }
  console.log("\nEn el plan gratis solo las voces premade funcionan por API. Elegí 2 o 3 y pedí muestras.");
} else if (cmd === "muestra" && rest.length >= 2) {
  const [file, ...voices] = rest;
  const first = readScript(file)[0];
  for (const voice of voices) {
    const r = await speak(voice, first);
    write(`out/voz-pruebas/${voice}.mp3`, Buffer.from(r.audio_base64, "base64"));
    console.log(`out/voz-pruebas/${voice}.mp3`);
  }
} else if (cmd === "generar" && rest.length === 2) {
  const [file, voice] = rest;
  const lines = readScript(file);
  const r = await speak(voice, lines.join("\n"));
  const words = alignmentToWords(r.alignment);
  const reel = currentReel();
  write(`public/${reel}/voz.mp3`, Buffer.from(r.audio_base64, "base64"));
  write(`out/${reel}/voz-alignment.json`, JSON.stringify(r.alignment));
  write(`src/${reel}/voz-words.json`, JSON.stringify(words, null, 1) + "\n");
  write(`out/${reel}/voz.srt`, wordsToSrt(words));
  console.log(`${words.length} palabras, ${words[words.length - 1].end.toFixed(2)} s de voz`);
  console.log(`public/${reel}/voz.mp3 · src/${reel}/voz-words.json · out/${reel}/voz-alignment.json · out/${reel}/voz.srt\n`);
  // Each script line = one scene: its first and last word times go into SCENES (timeline.ts).
  let k = 0;
  lines.forEach((line, i) => {
    const n = line.split(/\s+/).length;
    const a = words[k];
    const b = words[Math.min(words.length, k + n) - 1];
    k += n;
    if (a && b) console.log(`línea ${i + 1}: ${a.start.toFixed(2)}–${b.end.toFixed(2)} s  «${line.slice(0, 60)}${line.length > 60 ? "…" : ""}»`);
  });
  if (k !== words.length) console.log(`(aviso: el guion tiene ${k} palabras y la alineación ${words.length}: revisá los cortes a mano)`);
} else {
  console.error("Uso: tts-elevenlabs.mjs voces | muestra <guion.txt> <voiceId>… | generar <guion.txt> <voiceId>");
  process.exit(1);
}
