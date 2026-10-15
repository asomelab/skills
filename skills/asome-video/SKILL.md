---
name: asome-video
description: >
  Edits ASOME branded vertical videos (Instagram reels) from scratch with Remotion, built for
  people who are not technical. Explains the whole process in Spanish first; checks the machine
  and installs what is missing (Node.js, the Remotion skill, a project template with the ASOME
  brand components, the Maax font from the ASOME Drive); transcribes the footage, proposes an
  edit plan (takes to keep, corrected captions, 2-4 motion moments tied to the speech, end card,
  cover) and waits for the user's OK; builds the reel on the ASOME design system with sound
  design, previews it in Remotion Studio, applies changes asked in plain words, and exports the
  Instagram file (1080x1920), a 4K master and the 9:16 and 4:5 covers, named per the brand rule
  and copied to Downloads. Use it whenever someone wants to turn raw footage into an ASOME reel,
  even if they only say "editame este video" or "le ponés subtítulos?".
  Trigger: "editar video", "editame este video", "editar reel", "armar un reel", "hacer un reel
  con este video", "subtítulos para el video", "video para Instagram", "exportar el reel",
  "portada del reel", "motion graphics", "edit this video", "/asome-video".
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Video

Turns a raw talking-head recording into an ASOME reel: clean takes, brand captions, motion
graphics that explain what is said, soft sound design, end card and cover, exported for
Instagram. The look is the one in **`references/brand-video.md`** (brandbook + Sistema visual
de marketing v2.0) and the moves are the ones in **`references/motion-recipes.md`**, both taken
from the first ASOME reel (`references/example-reel.tsx`).

**Talk to the user in Spanish (rioplatense, voseo), in plain words, always.** Assume they have
never used a terminal: say what you are about to do in one line before doing it, never paste
code at them unless they ask, and translate errors into what they mean.

**Executes directly**, with two stops: the edit plan (Fase 4) needs the user's OK, and any step
that needs an admin password is done by the user with your exact instructions. Never ask for
or type a password.

> No `.asome/config.json` needed: this skill works in any folder, outside ASOME code repos.

`SKILL_DIR` below is the folder that holds this file (usually `~/.claude/skills/asome-video`
or `~/.agents/skills/asome-video`).

| Path | What it is |
|---|---|
| `references/guia-usuario.md` | The Spanish explanation for the user (Fase 0) |
| `references/brand-video.md` | ASOME design system for video: color, type, layout, motion, captions, sound |
| `references/motion-recipes.md` | Building blocks with code and timing (R1–R8) |
| `references/example-reel.tsx` | The first reel, complete: the reference for every pattern |
| `assets/template/` | The Remotion project copied for every new video |
| `scripts/check-setup.sh` | Read-only machine diagnosis (OK / FALTA / AVISO lines) |
| `scripts/new-project.sh` | Creates a ready project: template, Maax, dependencies, sound kit, browser |
| `scripts/find-maax.sh` | Finds the licensed Maax font (Drive app, Downloads, Fonts) |

---

## Fase 0 — Explain (in Spanish)

Read `references/guia-usuario.md` and give the user a short version, about 15 lines: what they
will get, the 8 steps, what they need, how long the first time takes. Tell them the full guide
is in that file. Then ask, **in one message**, only what you need:

1. The video: drag it into the chat or tell you where it is.
2. The topic in a few words (it names the files).
3. The call to action, if they have one (WhatsApp, link in bio, DM…).
4. A phrase for the cover, if they already have one.

Only the video blocks you; default the rest and propose them in Fase 4.

## Fase 1 — Setup

Run `bash "$SKILL_DIR/scripts/check-setup.sh"` and fix every `FALTA` line, one Spanish sentence
of explanation before each install:

| Missing | Fix |
|---|---|
| Node.js | With Homebrew: `brew install node`. Without it (no password needed): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh \| bash`, then `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm install --lts` (repeat the export line in every later shell). Last resort: the user installs the LTS package from nodejs.org. Windows: `winget install OpenJS.NodeJS.LTS`. |
| `remotion-best-practices` skill | `npx -y skills add remotion-dev/skills@remotion-best-practices -g -y`. It loads from the next session; this skill already carries what this workflow needs. |
| Maax | Ask the user to download the Drive folder brand > Tipografia > Maax into Downloads (in Google Drive: right click, Descargar), unzip it, and tell you. |
| Internet or disk space | Tell the user what is needed; nothing to install. |

Re-run the check until it has no `FALTA`. `AVISO` lines are information, not blockers.

## Fase 2 — Project

Create one folder per video: `~/Documents/asome-videos/<AAAAMMDD>_<tema>`, where `tema` is the
topic in lowercase, without accents, words joined by hyphens.

```bash
bash "$SKILL_DIR/scripts/new-project.sh" ~/Documents/asome-videos/20261015_crecer-sin-estructura
```

It copies `assets/template`, brings Maax, runs `npm install`, generates the sound kit and
downloads the render browser. Exit 3 means Maax is still missing (see Fase 1). From here on,
work inside that folder.

## Fase 3 — Footage

1. Copy the video to `public/clip.mp4` (several files: `clip-1.mp4`, `clip-2.mp4`, each with
   its own takes). Check it:
   `npx remotion ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact public/clip.mp4`
2. Not H.264 (iPhone `.MOV` is usually HEVC) → convert it first:
   `npx remotion ffmpeg -i <original> -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 320k -movflags +faststart public/clip.mp4`
3. Not vertical → ask: crop to the center or keep it framed on a Penn Blue background.
4. Transcribe: `npm run transcribe -- public/clip.mp4 es`. The first run downloads the model
   (a few minutes, warn the user). It prints the words grouped by pauses: repeated lines are
   retakes, broken lines are flubs.
5. Look at the footage: `npm run frames -- <6 to 8 seconds spread over the video>` and open the
   JPGs. Note framing changes (in-camera zooms), where the face is (for R3 and the cover),
   gestures at cut points, and a calm frame looking at camera for the cover.

## Fase 4 — Edit plan (stop for the user's OK)

Present in Spanish, compact:

1. **Tomas:** what stays (start and end second, and its text) and what goes. Keep the last
   complete clean take of each sentence; cut ~0.2 s before its first word and ~0.3 s after
   its last.
2. **Correcciones del texto:** every word the transcription got wrong (brand names, verbs).
3. **Motion graphics:** 2 to 4 moments, each one a phrase → recipe → what appears on screen.
   The core idea of the video gets R3 (only once); lists get R4; the call to action gets R5.
4. **Cierre:** title, highlighted words, action.
5. **Portada:** the second of the frame and the title with its closing phrase.
6. **Duración** approximate.

Ask "¿Avanzo así?" and apply what they change. Never invent numbers, clients or claims: on-screen
text paraphrases what the speaker said.

## Fase 5 — Build

- Rewrite `src/Reel.tsx` with the recipes: one `TransitionSeries.Sequence` per take
  (`trimBefore` and `durationInFrames` in source seconds × fps), hard cuts between takes (R2),
  the motion moments, then the slide into `EndCard`. Keep `Signature`, the whoosh and the bed.
- Captions inline per take, copied from `transcript.json`, corrected, with `pageBreakAfter`
  on the last word of each phrase and 1–4 `highlights` words where they matter.
- `Root.tsx`: `Reel` duration = frames of the kept takes + 84; cover props (R7).
- Extract the cover frame (R7) and regenerate the bed to the final length:
  `npm run audio -- <reel seconds + 2>`.
- `npm run lint` must pass before showing anything.

## Fase 6 — Preview and changes

1. Start the Studio with `npm run dev` as a long-running process (background or a terminal tab).
   In the Claude desktop app, open the printed URL (`http://localhost:3000` or the next free
   port) in the browser pane; from a terminal it opens the user's browser.
2. Check it yourself first. Render stills of the key moments and look at them:
   `npx remotion still Reel out/check/f<N>.jpg --frame=<N> --scale=0.5`
   (inside Claude Code on macOS add `--concurrency=1 --browser-executable=$PWD/scripts/chrome-single.sh`
   and run it with the Bash sandbox disabled). Check spelling and sync of the captions, faces
   never covered, nothing in the keep-out zones, each card landing on its word, the end card.
3. Show the user in Spanish what they are seeing and what they can ask for.
4. Apply changes with this map:

| They ask | Change |
|---|---|
| A word in a caption | `text` in that take's captions array |
| A caption early or late | `startMs` / `endMs` of those words |
| Remove a part | Split the take into two sequences around it; update `Root.tsx` duration |
| A card earlier or later | Its `from` and the keyframes in its `style` |
| Less music / no music | `Music bed` volume, or remove that `<Audio>` |
| Different closing | `EndCard` props (`title`, `highlight`, `action`) |
| Different cover | New `cover-frame.jpg` + `ReelCover` props in `Root.tsx` |
| Bigger or smaller text | Stay on the type scale in `brand-video.md`; one step at most |

If a style changed that you did not write (for example a `translate` appeared), the user moved
something in the Studio: keep it and mention it, and say if it breaks a brand rule.

## Fase 7 — Export

```bash
npm run render -- crecer-sin-estructura
```

Inside Claude Code run it with the Bash sandbox disabled (Chrome needs it). It renders the
Instagram file, the 4K master and both covers into `out/`, picks the next free `vNN`, and copies
them to `~/Downloads/<AAAAMMDD>_<tema>/`. Then:

- Verify: `npx remotion ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -of compact <file>`
  (1080×1920 and 2160×3840, h264 + aac, 30/1), and look at both covers.
- Tell the user in Spanish where the files are, which one to upload, and how to set the cover
  (`guia-usuario.md`, "Cómo subirlo a Instagram").

---

## Known gotchas

- **"Target closed" when rendering inside the Claude app** (also in its terminal tabs): macOS
  denies Chrome's helper processes a Mach-port lookup. `scripts/chrome-single.sh` runs Chrome as
  one process; always pair it with `--concurrency=1`. `render.sh` does both on macOS. The
  Studio's own Render button hits the same wall there: use `npm run render`.
- A render that hangs often means a stale `remotion render`/`still` process: kill it and retry.
- Inside a take, nested `from` values are source seconds too (the parent's `trimBefore` shifts
  every child). Use one-decimal seconds so frames stay whole numbers.
- Remotion's bundled ffmpeg lacks some filters (`fps`, `hstack`): extract one frame per command.
- Whisper mishears brand names and some verbs ("Asom" for ASOME, "hallamos" for "ayudamos"):
  read every caption before inlining it.
- Footage often has an in-camera zoom: do not add a push-in on top of it.
- Maax is licensed to ASOME: never commit or share the `.ttf` files (the project's
  `.gitignore` already excludes them). Inter comes from Google Fonts, so renders need internet.
- After a big rewrite the Studio may show stale hot-reload errors in the console: reload it.
