# Script and voiceover (Fase 1)

## Structure: five lines, five scenes

Write `guion.txt` in the project root with **one line per scene**. The TTS script prints the
start and end of each line, and those are the `SCENES` of `timeline.ts`.

| # | Scene | Job | Words | ~Seconds |
|---|---|---|---|---|
| 1 | hook | Emotional or pain hook that stops the scroll. No product yet. | 8–14 | 4–6 |
| 2 | reveal | "Eso es <producto>, la plataforma que construimos en ASOME para <un cliente de tal rubro>." | 14–18 | 6 |
| 3 | sideA | Business side: "Para el <rol A>: <3 cosas que hace>. <resumen>." | 25–32 | 11 |
| 4 | sideB | Emotional side: "Para el <rol B>: <3 cosas que vive>." | 25–32 | 11 |
| 5 | close | "Lo construimos a medida en ASOME para que nuestro cliente <resultado de negocio> y crezca con el mismo equipo de hoy. ¿Tenés un proyecto así? Escribinos." | 25–30 | 11 |

Target 105–120 words: ~45 s of voice at ~2.6 words/s, plus the 3.4 s end card. The ASOME close
can be reused almost as is; it carries the brand promise.

**If the product may not be named** (Fase 0), line 2 becomes "Esta es la plataforma de <rubro>
que construimos en ASOME para <un cliente de tal rubro>." and `PRODUCT.name = ""` in `theme.ts`
(the reveal label then reads "CASO · <PRODUCT.kind>" and the honest line "Interfaz del producto ·
datos de ejemplo"). No logo, app icon or URL either: they name the client as surely as the name.

## Rules

- Rioplatense Spanish. Voseo when talking to the viewer ("¿Tenés…?", "Escribinos"); the roles
  in third person ("planifica", "cobra", "ve").
- Each phrase of a side names ONE thing the viewer will see on screen: it becomes one visual
  beat. Three per side at most, plus the summary line.
- Every claim exists in the client's code. Before showing the draft, check each one (route,
  screen, component, i18n string): if the app does not do it, the line changes. Note where each
  feature lives (web, mobile, both); Fase 2 confirms it.
- No invented metrics, results, testimonials or client names. "Un cliente del mundo de…" unless
  the user confirmed the name can be said.
- Short words for the TTS: no symbols ("24/7", "%", "&"), no abbreviations, no em dashes. Write
  numbers in words if they must be said.
- Present the draft with its word count and estimated length, and the beat list per line
  ("planifica la semana → calendario con sesiones"). Iterate until the user says yes. Change the
  script now, never after the voice is generated.

Example with an invented product (structure only, not a real case):

```text
Cada pedido por WhatsApp es una planilla más que alguien tiene que cargar.
Eso es Pedidos Ya Listos, la plataforma que construimos en ASOME para una distribuidora de alimentos.
Para el equipo comercial: ve los pedidos del día en un solo tablero, controla el stock y factura sin cargar nada a mano. Todo desde un mismo lugar.
Para el cliente: pide desde el celular cuando quiere, repite su pedido de siempre con un toque y sabe cuándo le llega.
Lo construimos a medida en ASOME para que nuestro cliente venda más y crezca con el mismo equipo de hoy. ¿Tenés un proyecto así? Escribinos.
```

## Voiceover with ElevenLabs

The script `scripts/tts-elevenlabs.mjs` (copied into the project) calls
`/v1/text-to-speech/<voz>/with-timestamps` with `eleven_multilingual_v2` and `language_code es`,
and turns the per-character alignment into word timings, SRT and per-line times.

**The key.** The user creates an API key in their ElevenLabs account (Profile → API Keys) with
the permissions **Text to Speech** and **Voices: Read** (or no restrictions), and loads it
THEMSELVES, never in the chat. Claude's Bash runs `zsh -c`, which reads `~/.zshenv` (not
`~/.zshrc`, and not a variable exported in another terminal), so the key goes into `~/.zshenv`
and Claude's next command sees it with no restart. Send the user exactly this:

> Ahora la voz. Necesito que cargues vos la clave de ElevenLabs en tu compu, así nunca pasa por
> el chat:
> 1. En tu cuenta de ElevenLabs, entrá a Profile → API Keys y creá una clave con los permisos «Text to
>    Speech» y «Voices: Read» (o sin restricciones). Copiala.
> 2. Abrí la app Terminal de la Mac (Cmd + espacio, escribí "Terminal").
> 3. Pegá esta línea y apretá Enter:
>    `read -rs "k?Clave de ElevenLabs: " && echo && touch ~/.zshenv && sed -i '' '/ELEVENLABS_API_KEY/d' ~/.zshenv && print -r -- "export ELEVENLABS_API_KEY='$k'" >> ~/.zshenv && chmod 600 ~/.zshenv && unset k && echo listo`
> 4. Pegá la clave (no se ve mientras la pegás, es normal) y apretá Enter. Tiene que decir
>    "listo".
> 5. Escribime "listo" acá. **No pegues la clave en el chat.**

The line hides what is typed, keeps the key out of the shell history, replaces an older key and
leaves the file readable only by the user. Running it again with a new key is how they rotate.
Then check it without printing it: `[ -n "$ELEVENLABS_API_KEY" ] && echo cargada || echo falta`.
If it says `falta`, ask whether the Terminal printed "listo" (the line is zsh, the Mac's default
shell; in another shell it fails before saving anything). As a last resort, restart Claude Code
once. Never offer "pasámela por acá" as a shortcut.
Never `echo` the variable, never write it to a file, never pass it as an argument. If the user
pastes a key (or any password) in the chat, do not use it: tell them it is exposed and must be
rotated today (delete it in ElevenLabs and create a new one), then continue once they loaded
the new one themselves.

**Plans** (as of October 2026; ask the user to check their account):

- The free plan works through the API **only with premade voices**. Library voices (for
  example Argentine ones) need the Starter plan or higher; designing a voice needs a paid plan.
- The free plan has **no commercial license**. An ASOME marketing reel is commercial use: say
  so plainly and let the user decide (Starter includes it).
- Each generation spends credits (characters). A 45 s script is ~700 characters; samples are
  short. If the API says the quota is over, wait for the monthly reset or upgrade.

**Choosing the voice** (2 minutes, one stop):

```bash
node scripts/tts-elevenlabs.mjs voces                          # premade voices: name, id, accent
node scripts/tts-elevenlabs.mjs muestra guion.txt <id1> <id2> <id3>   # first line, out/voz-pruebas/
```

Propose three (warm, clear, neutral Spanish works; the first reel used the premade "Sarah",
`EXAVITQu4vr4xnSDxMaL`), send the three MP3s to the user and let them pick by ear. If `voces`
fails with a permission error (the key has Text to Speech but not Voices: Read), it prints a
short list of known premade ids: go on with `muestra` using those instead of asking for a new
key.

**Generating:**

```bash
node scripts/tts-elevenlabs.mjs generar guion.txt <id>
```

Writes `public/producto/voz.mp3`, `src/producto/voz-words.json`, `out/voz-alignment.json`,
`out/voz.srt`, and prints `línea N: a–b s` for each line. Then in `timeline.ts`: each scene's
`from` = its line's start (the hook keeps 0), `to` = the next line's start; `close.to` = the
last word's end. Add the `BEATS` with `word("palabra", SCENES.x.from)`.

Listen to it (or have the user listen) before building: a mispronounced name or a strange
pause is fixed now by regenerating, not later. A product name the voice mispronounces can be
written phonetically in the TTS text; then fix that word's `text` in `voz-words.json` (times do
not change) and rebuild the SRT: `node scripts/words-to-srt.mjs src/producto/voz-words.json out/voz.srt`.

**Own voice instead of AI:** record the whole script in one quiet take, save it as
`public/producto/voz.m4a`, point `VOICE` in `Promo.tsx` to it, transcribe it with asome-video's
`npm run transcribe -- public/producto/voz.m4a es`, fix the words Whisper got wrong, and convert
`transcript.json` to the words file:
`node -e 'const t=require("./transcript.json");require("fs").writeFileSync("src/producto/voz-words.json",JSON.stringify(t.map(c=>({text:c.text.trim(),start:c.startMs/1000,end:c.endMs/1000}))))'`
then `node scripts/words-to-srt.mjs src/producto/voz-words.json out/voz.srt`.
