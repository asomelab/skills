---
name: asome-video-producto
description: >
  Makes an ASOME product / case-study reel (Instagram 9:16, ~50 s, Remotion) that presents
  software ASOME built for a client: emotional hook, "lo construimos en ASOME para un cliente",
  the business side, the end-user side and the ASOME close, with an AI voiceover (ElevenLabs),
  the product's screens rebuilt from the client's code with invented data inside neutral device
  mockups, brand captions, a beat that follows the scenes, cover, Instagram copy, SRT and Drive
  upload. Explains the process and the ETA in Spanish, asks everything in one message, and runs
  the build with parallel agents so it lands in under two hours. Depends on asome-video for the
  machine setup, the Remotion template and the brand system. Use it whenever someone wants a
  video that shows an app or platform ASOME developed, even if they only say "mostremos la app".
  Trigger: "reel de producto", "video de presentación de app", "mostrar la app que hicimos",
  "caso de éxito en video", "motion de la app", "video del producto", "reel del caso",
  "presentar la plataforma en un reel", "product reel", "app promo video", "/asome-video-producto".
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Video de producto

Turns a product ASOME built for a client into an ASOME reel: a voiceover script that sells both
user sides, the real screens rebuilt in Remotion with invented data, motion tied to every word,
music, cover, copy and subtitles, delivered "con todo". The look is asome-video's
(`../asome-video/references/brand-video.md`) plus the product rules in
**`references/brand-producto.md`**; the method comes from the first product reel (October 2026),
which the team loved but took ~4 h. This skill is the fast version: **target under 2 h**.

**Talk to the user in Spanish (rioplatense, voseo), in plain words, always.** Say what you are
about to do in one line before doing it; never paste code at them unless they ask.

**Executes directly**, with three stops: the Fase 0 answers, the script + voice choice
(Fase 1), and the final look before uploading to Drive (Fase 5). Everything else runs without
asking, and you send preview stills as they land.

> No `.asome/config.json` needed: this skill works in any folder.

`SKILL_DIR` is the folder that holds this file; `VIDEO_SKILL` is its sibling asome-video
(`$SKILL_DIR/../asome-video`). If asome-video is not installed, install it first: this skill
reuses its setup, template, brand components and Drive script.

| Path | What it is |
|---|---|
| `references/guia-usuario.md` | The Spanish explanation for the user, with the ETA (Fase 0) |
| `references/brand-producto.md` | How a client's product sits on the ASOME system: zones, devices, honesty, motion |
| `references/guion-y-voz.md` | Script structure and rules, ElevenLabs key/plans/voices, own-voice option |
| `references/brief-template.md` | The `brief.md` every scene agent reads |
| `references/prompt-pantallas.md` | Fase 2 agent: rebuild one user side's screens from the client code |
| `references/prompt-escena.md` | Fase 3 scene builder + fix prompt + Workflow skeleton |
| `references/prompt-revisor.md` | Adversarial reviewer per scene, and optional final MP4 lenses |
| `references/prompt-copy.md` | Instagram copy panel: three angles + editor |
| `scripts/add-producto.sh` | Drops `assets/template-producto` into an asome-video project and registers it |
| `assets/template-producto/` | `src/producto/` shell, timeline, theme, devices, kit, scene stubs, cover, QA sheet; `scripts/` voice, SRT, beat, QA, render |

---

## Rules that hold in every phase

- **Never log into the client's staging or production, never use their accounts, never type a
  password.** If the user offers credentials or pastes a key or password, do not use it: tell
  them it is exposed and must be rotated today (manual §8.2), and continue without it.
- **Client production data never enters the context** (manual §8.6). Read only source code,
  tokens, i18n/copy, routes, components, icons, fixtures for shape. Never `.env*`, credential
  files, dumps, APIs.
- **Screens are rebuilt from code with invented data**, and the reel says so: "Interfaz de
  <producto> · datos de ejemplo". Show each feature only on the platform where it exists.
- **No invented metrics, results or testimonials; the client is not named without permission.**
- **The ElevenLabs key lives only in `ELEVENLABS_API_KEY`, which the user writes into
  `~/.zshenv` from their own Terminal** (the exact message is in `guion-y-voz.md`). Check it with
  `[ -n "$ELEVENLABS_API_KEY" ] && echo cargada || echo falta`; never print, write or pass it.
- **Client assets (fonts, logos, icons) stay in the video project** (`public/producto/`, ignored
  by git). Never copy them into the skills repo or any shared place.
- **State lives on disk** (`guion.txt`, `timeline.ts`, `brief.md`, scene files), so a new
  session can resume where an interrupted one stopped.

## Time budget (say it in Fase 0)

| Fase | What | Target | Runs in parallel with |
|---|---|---|---|
| 0 | Explain + 4 questions | 5 min | — |
| 1 | Script, voice | 20 min | project setup, screen agents once the script is approved |
| 2 | Screens from the client code | 20 min | voice, brief pass 1, music, hook + close scenes |
| 3 | Scenes, copy, cover, music | 40 min | each other |
| 4 | QA on the rendered MP4 | 10 min | — |
| 5 | Deliverables + Drive | 10 min | — |
| | **Total** | **~1 h 45** | (+15–30 min the first time, for asome-video's setup) |

The old time sinks and their fix: separate spec and foundation rounds (now one screen agent per
side that reads the code and builds the UI), two review rounds (now one, only high/medium gets
a fix), render debugging (system Chrome from the start), a mid-run session restart (state on
disk, agents resume their file), copy/cover/music done at the end (now in parallel).

---

## Fase 0 — Explain and ask (in Spanish, one message)

Give the user a short version of `references/guia-usuario.md` (about 12 lines): what they get,
the five steps with the time table, what they need (the client repo on this machine, an
ElevenLabs account, naming permission), and the security rules (no keys or passwords in the
chat; we never enter the client's systems). Then ask, **in one message**:

1. **El producto y dónde está su código** (the repo folder on this machine).
2. **Qué lados vendemos**: the business role (rol A: who runs it, e.g. the sales
   team) and the end-user role (rol B: who lives it). Offer defaults read from the repo if they
   are not sure.
3. **Permiso de nombres**: ¿se puede mostrar el nombre del producto? ¿y nombrar al cliente?
   (Default: product yes if it is public, client no.) Tell them the product's logo, app icon
   and URL count as naming it: with "no", none of them appear (variant in `guion-y-voz.md`).
4. **Formato**: reel 9:16 de ~45–50 s con voz IA (default), or their own voice; the CTA
   (default "Escribinos por WhatsApp").

Only the repo path blocks you. While they answer, run asome-video's setup check
(`bash "$VIDEO_SKILL/scripts/check-setup.sh"`) and fix any `FALTA` as asome-video's Fase 1 says.

**Working directories, before any agent runs.** The client repo and `~/Documents/asome-videos`
are usually outside this session's folders, and a background agent cannot answer a permission
prompt: it stalls. As soon as you have the repo path, ask the user to type
`/add-dir <ruta del repo>` and `/add-dir ~/Documents/asome-videos` (or to approve each folder
once when Claude Code asks; if this session has a tool to request a directory, use it), and say
why: "para que los agentes puedan leer el código y armar el video sin frenarse a pedir
permiso". The repo is read only.

## Fase 1 — Script and voice (stop: script OK + voice picked)

1. **Project** (background, while you write): one folder per video,
   `~/Documents/asome-videos/<AAAAMMDD>_<tema>`, e.g. `20261020_caso-plataforma-pedidos`:
   ```bash
   bash "$VIDEO_SKILL/scripts/new-project.sh" ~/Documents/asome-videos/20261020_caso-plataforma-pedidos
   bash "$SKILL_DIR/scripts/add-producto.sh"  ~/Documents/asome-videos/20261020_caso-plataforma-pedidos
   ```
   `add-producto.sh` copies `src/producto/` and the scripts, registers `<ProductoCompositions />`
   in `src/Root.tsx` and generates a first beat. Work inside that folder from here on.
2. **Read the product** (one Explore agent or inline, 10 min max): README/AGENTS.md,
   `docs/product` if any, the route/page tree of each app (web, mobile), the Spanish i18n file.
   You need: what each role can do, on which platform, with which words the app uses.
3. **Draft the script** per `references/guion-y-voz.md`: five lines (hook → reveal → side A →
   side B → ASOME close + CTA), 105–120 words. Check every claim against the code before
   showing it. Present it with the word count, the estimated length and one beat per phrase.
   Iterate until the user says yes. **Do not touch the voice until the script is final.**
4. As soon as the script is approved, **launch Fase 2** (the screen agents need the script, not
   the timings) and, in parallel, do the voice:
   - Send the user the exact key message in `guion-y-voz.md` (one line they paste in their own
     Terminal; it saves the key in `~/.zshenv`, which Claude's shell reads with no restart) and
     wait for "listo". Check it is loaded without printing it.
   - `node scripts/tts-elevenlabs.mjs voces`, pick three, `… muestra guion.txt <id1> <id2> <id3>`,
     send the three MP3s (SendUserFile) and let them choose by ear. Mention the free plan has no
     commercial license. If `voces` has no permission, it prints known premade ids: use those.
   - `node scripts/tts-elevenlabs.mjs generar guion.txt <id>`: voice, word timings, SRT, and the
     time of each line.
5. Fill `src/producto/timeline.ts`: `SCENES` from the printed line times (`to` = next `from`,
   `close.to` = last word end), `BEATS` with `word("palabra", SCENES.x.from)` for every visual
   beat. Then `node scripts/make-beat.mjs --drop <reveal.from> --lift <sideA.from> --close
   <close.from> --build <start of "¿Tenés"> --hit <END_CARD.from>`.
6. **Brief pass 1 and the first two scenes**: write `<proyecto>/brief.md` from
   `references/brief-template.md` without its `[pasada 2]` lines (what we make, rules,
   storyboard with the beat times), and launch the **hook** and **close** scene agents now
   (Fase 3 step 3): they need no client UI, so they do not wait for Fase 2.

## Fase 2 — Screens from the client's code

1. Inline, 5 minutes, before launching: fill `src/producto/theme.ts` from the client's tokens
   (hex, type scale, radii, `PRODUCT` per the naming permission: `name: ""` plus `kind` when
   the product may not be named); copy the client's font files (and, only if it may be named,
   the logo and app icon) from their repo into `public/producto/` and register the fonts in
   `theme.ts`; write `src/producto/ui/data.ts` with the shared invented cast (a business name,
   6–8 people with invented Argentine names, the few entities both sides show).
2. Launch **one agent per side in parallel** with `references/prompt-pantallas.md`. Each one
   reads the client code under the safety rules, builds `ui/<Lado>Screens.tsx` at native size
   (laptop 1440×900, phone 390×844) including that side's home screen, previews it in its
   scene stub, and returns the API, a **platform truth table** (phrase → web/mobile/none →
   component) and anything the script claims that the code does not support.
3. If a claim has no feature behind it, stop and fix the script with the user (and regenerate
   the voice) now: it is the only time this is cheap.

## Fase 3 — Build (parallel)

1. **Brief pass 2**, when Fase 2 returns: fill the `[pasada 2]` lines of `brief.md` (screen
   APIs, camera regions with their device, the platform truth table) and refine the reveal and
   side storyboards with the real screens.
2. In `src/producto/Promo.tsx` set `HIGHLIGHTS` (product name, ASOME, 1–4 key words per side,
   the CTA) and `END_CARD_TEXT`. `npm run lint` must pass.
3. **Scenes**: one agent per file in `src/producto/scenes/` with `references/prompt-escena.md`:
   hook and close already started on brief pass 1 (Fase 1 step 6); reveal, sideA and sideB
   start now, on pass 2. Each builder is followed by one adversarial review (`references/prompt-revisor.md`)
   and a fix only for high/medium issues. With the Workflow tool, use the skeleton in
   `prompt-escena.md`; otherwise background Agent calls.
4. **In parallel with the scenes**: the copy panel (`references/prompt-copy.md`, three angles +
   editor; save the result as `<proyecto>/copy.md`), and the cover: once the reveal is built, set
   `SETTLED` in `src/producto/Cover.tsx` to the reveal frame where everything has landed and
   render `PromoCover`.
5. Send the user 1–2 stills per scene as they land, with one line on what they show. Apply what
   they ask through the scene's owner agent or inline if it is small.

Renders and stills, always with the Bash sandbox disabled:
```bash
npx remotion still P-<scene> out/check/f<N>.png --frame=<N> --scale=0.5 \
  --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --log=error
```
`P-<scene>` is a window of the whole promo (frame 0 = the scene's start), with captions,
signature and transitions as in the final.

## Fase 4 — QA on the rendered MP4

1. `bash scripts/render-producto.sh <tema>` (renders `Promo` + `PromoCover` and gathers the
   deliverables; see Fase 5). Check `npx remotion ffprobe -v error -show_entries
   stream=codec_name,width,height,r_frame_rate -of compact <mp4>`: 1080×1920, h264 + aac, 30/1.
2. Contact sheets, then Read them:
   ```bash
   node scripts/qa-sheet.mjs out/<reel>.mp4 general 0.5 2 4 6 8 10 …        # one frame every ~2 s
   node scripts/qa-sheet.mjs out/<reel>.mp4 corte-1 @<reveal.from>          # 12 frames at 30 fps
   ```
   One `@` sheet per transition (each scene's `from` and `END_CARD.from`). Look for: blank or
   doubled frames, popping, clipped text, anything over the captions, static stretches, a
   visual off its word, client colors on the canvas.
3. Fix what is high severity, re-render once. The three final lenses in `prompt-revisor.md`
   are optional (a heavily promoted reel, or doubts after your own pass).

## Fase 5 — Deliverables "con todo" (stop: final look before Drive)

`render-producto.sh` leaves in `~/Downloads/<AAAAMMDD>_<tema>/`, named `AAAAMMDD_formato_tema_vNN`:

- `reel` MP4 1080×1920 (the file to upload) · `portada-reel` 9:16 JPG (`PromoCover`)
- `copy` (caption with its hook in the first 125 characters, body, CTA, hashtags, first
  comment, alt text; no invented metrics; client unnamed unless approved)
- `subtitulos` SRT · `guion` TXT · `voz` MP3

Then:
1. Show the user the reel and the cover; tell them in Spanish where everything is and how to
   publish (`guia-usuario.md`, "Cómo subirlo a Instagram").
2. Ask "¿Lo subo al Drive de ASOME?". On yes: `bash scripts/drive.sh <tema>` (asome-video's
   script, in the project) copies the folder to `ASOME/marketing/reels/<YYYY-MM-DD> <tema>/`
   through Google Drive for desktop. Without it, tell them to drag the Downloads folder there.
3. Security close: if a key or password appeared anywhere in the session, remind them to rotate
   it today; remind them the ElevenLabs key stays only in their `~/.zshenv` (running the same
   line with a new key replaces it), and the client assets stay in the video project.

---

## Known gotchas

- **Rendering from Claude's shell**: use the system Chrome (`--browser-executable=".../Google
  Chrome"`) with the Bash sandbox disabled; the bundled chrome-headless-shell crashed there with
  "GPU process isn't usable". Full renders take `--concurrency=4`. `scripts/browser.sh` picks
  the flags (falls back to asome-video's `chrome-single.sh`). Stills take ~3 s: agents render,
  Read the PNG and iterate.
- **The shell never uses `useVideoConfig().durationInFrames`**: the `P-<scene>` windows mount
  it with a shorter duration. Lengths come from `TOTAL_FRAMES`.
- **Sliding scenes start 12 frames early**: in sideA, sideB and close, `useCurrentFrame()` is 0
  twelve frames before `SCENES.x.from`. Always use `useSceneFrame(id)` so `rel()` frames match;
  `Sfx` takes the same clock.
- **End card**: it rides an opaque Penn Blue sheet and `EndCard` mounts at the sheet's frame 0.
  A transparent sheet or a later `from` makes the slide invisible and the card pops in ~1 s late.
- **Captions start at the reveal** (`CAPTIONS_FROM`): the hook's kinetic title already says its
  words; doubling them clutters the first second.
- **Platform truth**: features that exist only on the web never appear as a phone screen; show
  them as floating product cards next to the phone. Surveys/forms appear when they are really
  filled, with their real fields.
- **ElevenLabs free plan**: only premade voices through the API (library voices need Starter;
  voice design needs a paid plan) and no commercial license. If `language_code` is rejected for
  the model, run `generar` with `--lang ""`.
- **Captions come from the TTS text**: a phonetic spelling used to fix a pronunciation shows in
  the captions. Fix that word's `text` in `voz-words.json` (times stay) and rebuild the SRT.
- **zsh eats `~`**: QA marks are `@11.9`, never `~11.9` (zsh reads it as a named directory).
- **Claude's shell reads `~/.zshenv`, not `~/.zshrc`**: each Bash call is a fresh `zsh -c`, so a
  key exported in `~/.zshrc` or in the user's own terminal never reaches it, and one written to
  `~/.zshenv` does at the next call. That is why the key line writes there.
- **`focusCamera(rect, screen)` has no default screen**: phone regions take `PHONE_SCREEN`.
  Fitted to the laptop screen, a phone rect over-zooms ~3x and crops the content.
- **Hand-offs**: the next scene's slide covers a scene's LAST 12 frames (it ends on `to`), so
  the last beat lands before them; a scene's own slide-in shows only in the previous scene's
  `P-` window.
- **Remotion's bundled ffmpeg has no `tile`, `fps`, `overlay` or `xfade`**: that is why
  `qa-sheet.mjs` extracts frames one by one and composes the sheet as the `P-qa` Still.
- **Two `rise` helpers**: newer asome-video templates export one from `brand.tsx`; scenes use
  the one in `ui/Kit.tsx` (it also does exits). Do not mix them in one file.
- **Handle**: the template's pill reads `@asomelab`; older projects showed `@asome.ar`. Confirm
  the current handle with the user before the final render.
- **Client fonts** register under separate family names (`Producto Heading/Body`), never as
  "Inter" or "Maax", or they override ASOME's faces.
- If the session restarts mid-run, rebuild state from disk (`guion.txt`, `timeline.ts`,
  `brief.md`, the scene files) and tell each agent to read its file first and finish it.
