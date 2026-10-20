---
name: asome-video
description: >
  Turns raw talking-head footage into an ASOME branded Instagram reel with Remotion, for people
  who are not technical. Explains the process in Spanish, installs what is missing, measures the
  footage (false starts, silences, breaths, gaze) to propose an edit plan and waits for the
  user's OK; then pre-cuts the clean takes with soft dissolves, builds captions, 1-2 split-screen
  moments, end card and sound on the ASOME design system, previews it in Remotion Studio,
  applies changes asked in plain words, and exports the reel, a 4K master, covers, SRT and a
  publish-ready Instagram package to Downloads and the ASOME Drive. Every reel's source is
  committed to the private asomelab/videos repo. Use it whenever someone wants to turn raw
  footage into an ASOME reel, even if they only say "editame este video" or "le ponés
  subtítulos?".
  Trigger: "editar video", "editame este video", "editar reel", "armar un reel", "hacer un reel
  con este video", "subtítulos para el video", "video para Instagram", "exportar el reel",
  "portada del reel", "motion graphics", "edit this video", "/asome-video".
license: Apache-2.0
metadata:
  author: asome
  version: "1.2"
---

# ASOME — Video

Turns a raw talking-head recording into an ASOME reel: clean takes joined by soft dissolves,
brand captions, one or two motion moments that explain what is said, soft sound design, end
card and cover, exported for Instagram with a publish-ready copy package, and its source
committed to the private videos repo (`references/repo-videos.md`). The look is the one in
**`references/brand-video.md`** (brandbook + Sistema visual de marketing v2.0), the moves are
the ones in **`references/motion-recipes.md`**, and **`references/lecciones-consejo.md`** says
what a user rejected in a first cut and what fixed it. Read the three before Fase 4.

**Talk to the user in Spanish (rioplatense, voseo), in plain words, always.** Assume they have
never used a terminal: say what you are about to do in one line before doing it, never paste
code at them unless they ask, and translate errors into what they mean.

**Executes directly**, with two stops: the edit plan (Fase 4) needs the user's OK, and any step
that needs an admin password is done by the user with your exact instructions. Never ask for
or type a password. Tell the user, once, never to paste passwords, API keys or tokens in the
chat; if they do, do not use it, and tell them it is exposed and must be changed (rotated)
the same day.

> No `.asome/config.json` needed: this skill works in any folder, outside ASOME code repos.

`SKILL_DIR` below is the folder that holds this file (usually `~/.claude/skills/asome-video`
or `~/.agents/skills/asome-video`).

| Path | What it is |
|---|---|
| `references/guia-usuario.md` | The Spanish explanation for the user (Fase 0) |
| `references/brand-video.md` | ASOME design system for video: color, type, layout, motion, captions, sound |
| `references/motion-recipes.md` | Building blocks with code and timing (R1–R8) |
| `references/lecciones-consejo.md` | What was rejected in a first talking-head cut, and the pipeline that fixed it |
| `references/example-reel.tsx` | The first reel (v1.0): reference for cards and the growth plate only |
| `references/repo-videos.md` | The videos repo: layout, what is committed, commits, README section |
| `references/copy-instagram.md` | The publish-ready Instagram package (rules, 3 angles + editor, settings, checklist) |
| `assets/template/` | The repo base: shared brand components, scripts, configs (seeds what the repo lacks) |
| `assets/reel/` | One talking-head reel, copied to `src/<tema>/` |
| `scripts/check-setup.sh` | Read-only machine diagnosis (OK / FALTA / AVISO lines) |
| `scripts/new-reel.sh` | Clones or reuses the videos repo and adds a ready reel folder to it |
| `scripts/find-maax.sh` | Finds Maax in the Drive app or Downloads (only without repo access) |

Inside the repo, the tools are npm scripts and they work on the reel named in `.reel`
(`REEL=<tema> npm run …` for another one): `transcribe`, `frames`, `analyze` (silences,
onsets, face sheets, Whisper probe, image sheets; `npm run analyze` lists them), `cut`,
`audio`, `lint`, `dev`, `render`, `drive`. Below, `<tema>` is the reel's folder name:
`src/<tema>/` holds its code and `public/<tema>/` its media.

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
| Python 3 | `brew install python`. Without Homebrew: `xcode-select --install` and the user clicks Instalar in the window that opens. |
| Pillow | `python3 -m pip install --user Pillow`. If pip answers "externally-managed-environment": `brew install pillow`. |
| `remotion-best-practices` skill | `npx -y skills add remotion-dev/skills@remotion-best-practices -g -y`. It loads from the next session; this skill already carries what this workflow needs. |
| git | `xcode-select --install` (the user clicks Instalar in the window that opens). |
| GitHub CLI (`gh`) | `brew install gh`. Without Homebrew: the user installs the macOS package from cli.github.com. |
| Sesión de GitHub | The user runs it in their own Terminal (it opens the browser): `gh auth login` → GitHub.com → HTTPS → "Login with a web browser", pastes the one-time code shown, authorizes. Never ask for their GitHub password or a token. |
| AVISO "Sin acceso a asomelab/videos" | Not a blocker. Tell the user to ask the ASOME team for access to the private repo `asomelab/videos` with their GitHub user; meanwhile `new-reel.sh` works in a local repo and Maax comes from the Drive. |
| Maax (only without repo access) | Ask the user to download the Drive folder brand > Tipografia > Maax into Downloads (in Google Drive: right click, Descargar), unzip it, and tell you. |
| Internet or disk space | Tell the user what is needed; nothing to install. |

Re-run the check until it has no `FALTA`. `AVISO` lines are information, not blockers.

## Fase 2 — Project

Every reel lives in the videos repo (`references/repo-videos.md`, read it now): the private
`asomelab/videos`, cloned once to `~/Documents/asome-videos/videos`. One folder per reel,
`src/<tema>/`, where `tema` is the topic in lowercase, without accents, words joined by
hyphens:

```bash
bash "$SKILL_DIR/scripts/new-reel.sh" crecer-sin-estructura
```

It clones the repo (or reuses and updates it), copies the shared files it lacks, creates
`src/crecer-sin-estructura/` from `assets/reel` and `public/crecer-sin-estructura/`, registers
the reel's compositions in `src/Root.tsx`, writes `.reel`, runs `npm install` if needed, the
sound kit and the render browser. Maax comes versioned in the repo. Without access it builds a
local repo with `git init` and copies Maax from the Drive; exit 3 means Maax is still missing
(see Fase 1). `DIFIERE <file>` lines mean the repo predates this skill: merge those files once
as `repo-videos.md` says ("First reel from the skill in an existing repo") before Fase 5.
From here on, work inside the repo folder.

Copy the raw recording(s) to the ASOME Drive, `workspace/resources/crudos/<REEL TEMA>/`, as
soon as you have them (`repo-videos.md`, "The raws"): the repo never holds them.

## Fase 3 — Footage

Tell the user this is the slow, careful part: you listen to every cut and look at every take.

1. Copy the video to `public/<tema>/clip.mp4`. Several recordings → join them into that one
   file first (same size and frame rate):
   `npx remotion ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 16 -c:a aac -b:a 320k public/<tema>/clip.mp4`.
   Check it: `npx remotion ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact public/<tema>/clip.mp4`
2. Not H.264 (iPhone `.MOV` is usually HEVC) or not 30 fps → convert it first:
   `npx remotion ffmpeg -i <original> -r 30 -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 320k -movflags +faststart public/<tema>/clip.mp4`
3. Not vertical → ask: crop to the center or keep it framed on a Penn Blue background.
4. Transcribe: `npm run transcribe -- public/<tema>/clip.mp4 es`. The first run downloads the model
   (a few minutes, warn the user). It prints the words grouped by pauses: repeated lines are
   retakes, broken lines are flubs. Keep the last complete clean take of each line.
5. Look at the footage: `npm run frames -- <6 to 8 seconds spread over the video>` and open the
   JPGs. Note the face center on the 1080 × 1920 frame (`FACE_Y` for the splits) and a crop box
   around the face in source pixels (for `faces`), plus framing changes (in-camera zooms).
6. Measure every candidate take. Never decide a boundary finer than 0.1 s with Whisper times:
   they run long on held words, and Whisper invents words over breaths and suspended
   intonation, merges or drops a phrase said twice. The envelope decides.
   - **False starts:** `npm run analyze -- zcr <start> <start+1.5>` on the head of each take
     and of the attempt before it. The same onset pattern twice (for example ~0.1 s of `S`
     then a loud `V` vowel) means the speaker restarted, even when the transcript reads clean:
     keep from the second onset. `npm run analyze -- probe <a-b> <a-b>` transcribes only the
     ranges you doubt, in one pass.
   - **Cut points:** `npm run analyze -- bounds <in> <out> …` for every proposed point. Each
     must sit in a pause: a silence (`·`) or a breath (`~`, see below). Out ≈ 0.10–0.15 s after the last sound, in ≈ 0.05–0.10 s
     before the first, so a joined pause lands at 0.2–0.25 s. A pause over ~0.3 s inside a
     take becomes two segments joined by `blend: MICRO`. Two words with no gap between them
     ("cosas en") are one sound: never cut between them; keep the phrase to the next real pause.
   - **Gaze:** `npm run analyze -- faces <in> <out> 4 <crop>` for every kept range, and read the
     sheet. Every tile looks at the lens; end the take before the head drops or the eyes leave.
     Around a doubtful spot re-run at 8–30 fps over ±0.5 s. A glance away mid-line → use a
     clean alternate take; if there is none, cut there.
   - **Breaths:** in `zcr` a breath is a run of `~` lasting 0.1 s or more: about −50 to −40 dB,
     zcr 0.25 or more, no loud `S` or `V`, usually right before a voiced onset. It hovers
     around the silence threshold, so it flickers between `~` and `·`: never take a 10–30 ms
     `·` inside it as the silence to cut in. `bounds` reports it as "en pausa … con respiración
     a–b". A cut inside a breath is fine when that range goes into `BREATHS` (lowered 12 dB);
     otherwise `in` goes 0.05–0.10 s before the first loud onset after it (the "entrada" that
     `bounds` gives). A soft /s/ at the end of a word is the same noise but shorter: it stays voice.
   - `SILENCE=-40 BREATH=-35 npm run analyze -- …` if the room is noisy: read the envelope of
     a known pause, set `SILENCE` a few dB above it and keep `BREATH` about 5 dB over `SILENCE`.
7. Cover options: pick 6 frames with the eyes open to the lens, mouth closed and a relaxed
   face (a slight smile is good; a serious neutral "foto carnet" face and mid-word frames get
   rejected), extract them with `npm run frames -- <t1> … <t6>`, and make one sheet:
   `npm run analyze -- sheet out/portadas.jpg out/frames/t<t1>.jpg … out/frames/t<t6>.jpg`.

## Fase 4 — Edit plan (stop for the user's OK)

Present in Spanish, compact:

1. **Tomas:** each kept piece (start and end second, and its text) and what goes, with the
   reason in plain words: falso arranque, mirada fuera de cámara, pausa larga, repetición.
2. **Correcciones del texto:** every word the transcription got wrong (brand names, verbs).
3. **Motion graphics:** by default none: the speaker full frame with captions. Propose 1 or 2
   split-screen moments (motion on Penn Blue above, the speaker below) only where they show
   what the voice alone cannot, such as a calculation with the speaker's own numbers or the
   list of what ASOME does: each one is phrase range → what appears in the top half. Never a
   box framing the face, no punch-in zooms, no cards on every sentence.
4. **Uniones:** every cut is a soft dissolve of 4–6 frames with a crossfade in the sound.
5. **Cierre:** title, highlighted words, action.
6. **Portada:** show `out/portadas.jpg` and let the user pick one by number; propose the
   title and its closing phrase. Do not choose the frame for them.
7. **Duración** approximate.

Ask "¿Avanzo así?" and apply what they change. Never invent numbers, clients or claims: on-screen
text paraphrases what the speaker said.

On the OK, write the plan into `src/<tema>/cuts.ts` (Fase 5 step 1) and the README section draft
(`repo-videos.md`), then commit and push: `feat(<tema>): plan de edición aprobado`.

## Fase 5 — Build

1. **The cut.** Write `src/<tema>/cuts.ts`: one entry in `SEGMENTS` per kept piece, in reel order
   (`in`, `out`, `line`; `blend: MICRO` inside a take; `audioOut` when the speech runs up to
   the next word) and the `BREATHS`. Reel order may differ from source order: a hook
   re-recorded at the end of the take goes first, and `at()` still maps every source second. Then `npm run cut`: it renders `public/<tema>/cut.mp4` (every piece back to back,
   audio mixed sample-exact with an equal-power crossfade at each cut) and `blend.mp4`
   (the frames the dissolves need), checks both have the edit's frame count, and prints where
   each cut lands in reel time. Never cut takes with `<Sequence>`/`TransitionSeries` and
   `trimBefore`: with many takes the preview drifts and the cuts read as jumps.
2. **Coherence check.** `npm run transcribe -- public/<tema>/cut.mp4 es src/<tema>/captions-raw.json`, then
   read the printed lines as a viewer would: every sentence complete and said once, no clipped
   word, no stray "eh". Fix `cuts.ts`, `npm run cut`, repeat until it reads clean. That file is
   also the captions, already in reel time.
3. **Frame check** on 2 or 3 cuts: `SRC=public/<tema>/cut.mp4 npm run frames -- <reel second>` and
   `npm run frames -- <source second>`, then `npm run analyze -- same <one> <other>`
   (under 2 = the same frame).
4. **Captions.** Fixes go in `FIXES` of `src/<tema>/speech.ts` as `[heard, said]` phrases, so
   they survive the next transcription. Highlights (1–4 words, about one every 2–3 phrases) go
   in the `highlights` of `<Captions>` in `src/<tema>/Reel.tsx`.
5. **The reel** (`src/<tema>/Reel.tsx`): `FACE_Y` from Fase 3, the `SPLITS` with their panels
   (R3), the `EndCard` props. `Compositions.tsx` takes the length from `cuts.ts` by itself.
6. **Cover:** extract the frame the user picked to `public/<tema>/cover-frame.jpg` (R7) and set
   the `ReelCover` props in `src/<tema>/Compositions.tsx`.
7. `npm run audio -- <reel seconds + 2>` regenerates the music bed (`public/<tema>/bed.wav`) to
   the final length.
8. `npm run lint` must pass (for the whole repo) before showing anything. The first time it
   does: commit and push `feat(<tema>): primer armado completo`.

## Fase 6 — Preview and changes

1. Start the Studio with `npm run dev` as a long-running process (background or a terminal tab).
   In the Claude desktop app, open the printed URL (`http://localhost:3000` or the next free
   port) in the browser pane; from a terminal it opens the user's browser. The reel is in the
   folder `<tema>` of the sidebar (other reels of the repo are there too). Reload it after
   every `npm run cut`.
2. Check it yourself first. Render stills of the key moments and look at them:
   `npx remotion still <tema> out/check/f<N>.jpg --frame=<N> --scale=0.5 --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
   (without Google Chrome: `--browser-executable=$PWD/scripts/chrome-single.sh`). Inside
   Claude Code run it with the Bash sandbox disabled. Put several stills on one sheet with
   `npm run analyze -- sheet out/check.jpg out/check/*.jpg`. Check: captions spelled and in
   sync; each split opens and closes on a cut and each panel item lands on its word; at a cut
   frame the two takes blend instead of jumping; the end card visibly slides up and its logo
   arrives with it, not a second later; faces never covered; nothing in the keep-out zones.
3. Show the user in Spanish what they are seeing and what they can ask for.
4. Apply changes with this map:

| They ask | Change |
|---|---|
| A word in a caption | A `[heard, said]` pair in `FIXES` (`src/<tema>/speech.ts`) |
| A caption early or late | Usually a cut point: check it with `bounds`, fix `cuts.ts`, `npm run cut`, re-transcribe |
| Remove a part | Split or trim its segment in `cuts.ts`, `npm run cut`, re-transcribe |
| A cut feels abrupt | Move it into a longer silence, or widen its `blend` (for example `[3, 4]`) |
| A graphic earlier or later | The `at(<source second>)` of that element in its panel |
| More or fewer graphics | Add or remove an entry in `SPLITS`; stay at 1–2 |
| Less music / no music | `Music bed` volume, or remove that `<Audio>` |
| Different closing | `EndCard` props (`title`, `highlight`, `action`) |
| Different cover | Another frame from the sheet → `public/<tema>/cover-frame.jpg` + `ReelCover` props in `src/<tema>/Compositions.tsx` |
| Bigger or smaller text | Stay on the type scale in `brand-video.md`; one step at most |

If a style changed that you did not write (for example a `translate` appeared), the user moved
something in the Studio: keep it and mention it, and say if it breaks a brand rule.

## Fase 7 — Export and delivery

```bash
npm run render -- crecer-sin-estructura
```

Inside Claude Code run it with the Bash sandbox disabled (Chrome needs it). It renders the
compositions of `src/<tema>/` (the Instagram file, the 4K master, both covers and the SRT) into
`out/`, picks the next free `vNN`, and copies them to `~/Downloads/<AAAAMMDD>_<tema>/`. With
Google Chrome installed it renders 4 frames at a time; without it, one (slower). Then:

1. Verify: `npx remotion ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -of compact <file>`
   (1080×1920 and 2160×3840, h264 + aac, 30/1), and look at both covers.
2. **The Instagram package**, per `references/copy-instagram.md` (load the `social` skill first
   if it is available): three caption drafts from different angles, an editor that picks and
   polishes, then caption with a hook of at most 125 characters, body, CTA, 8–15 hashtags in
   priority order, first comment, alt text, the cover check, when to post, the step-by-step
   Instagram settings and the publish checklist. Write it to
   `docs/<tema>/<AAAAMMDD>_copy_<tema>.md` and copy it next to the deliverables in
   `~/Downloads/<AAAAMMDD>_<tema>/`. Show it to the user and apply what they change.
3. Upload: `npm run drive -- <tema>` copies that folder to `ASOME/marketing/reels/<YYYY-MM-DD> <tema>/`
   through the Google Drive for desktop folder. Exit 1 means Drive for desktop is not on this
   Mac: tell the user to upload the Downloads folder to that Drive path themselves.
4. **Commit and push the final version** (`repo-videos.md`): complete the reel's README section,
   copy the SRT to `docs/<tema>/`, read `git status --short` (no raws, pre-cuts, `.wav`, keys or
   `.env`), and commit `feat(<tema>): versión final vNN`. Tell the user the commit is pushed and
   the reel can be rebuilt or varied from the repo.
5. Tell the user in Spanish where the files are, which one to upload, and walk them through the
   package's "Configuración en Instagram" and checklist.

---

## Known gotchas

- **Rendering inside Claude Code:** use the system Google Chrome
  (`--browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`) with the
  Bash sandbox disabled; Remotion's bundled headless shell can crash there ("GPU process isn't
  usable"). At `--concurrency=4` Chrome sometimes fails to open a page ("Visited
  .../index.html but got no response"): `render.sh` retries with 2. Without Google Chrome,
  `scripts/chrome-single.sh` runs Remotion's Chrome as one process ("Target closed" otherwise);
  always with `--concurrency=1`. The Studio's own Render button hits the same walls: use
  `npm run render`.
- A render that hangs often means a stale `remotion render`/`still` process: kill it and retry.
- Remotion's bundled ffmpeg (7.1) has `concat`, `trim`, `atrim`, `amix`, `adelay`, `volume`,
  `crop`, `scale`, `loudnorm`, `silencedetect`, libx264 and aac, but **no** `xfade`,
  `acrossfade`, `afade`, `fade`, `overlay`, `blend`, `setpts`, `fps`, `select`, `tile` and no
  `s16le` output. That is why `build-cut.mts` mixes the audio in Node and the dissolves fade in
  Remotion, why `frames` extracts one still per command, and why `analyze` reads WAV files.
- `concat` needs every piece to start at timestamp 0: one `-ss`/`-t` input per piece, floored to
  the microsecond so frame N stays the first one. Sample counts must be whole numbers or ffmpeg
  says "Invalid PCM packet".
- Overlays are timed in **source** seconds through `at()`: it maps them onto the reel, so they
  survive any change in `cuts.ts`. Rebuild with `npm run cut` after every change there.
- The captions module is `speech.ts`, not `captions.ts`: on macOS a `captions.ts` would
  shadow `Captions.tsx` (same name, different case). Same reason the reel's name lives in
  `id.ts`, never `reel.ts` (it would shadow `Reel.tsx`).
- The npm scripts work on the reel in `.reel`. "No sé qué reel editar" means it is missing or
  points to a folder that does not exist: `echo <tema> > .reel` or `REEL=<tema> npm run …`.
- Composition ids are prefixed with the reel's name (`<tema>`, `<tema>-portada`…) so reels
  never collide in the shared `Root.tsx`; never register a bare `Reel`.
- Run the `.mts` scripts through `tsx` (the npm scripts do): plain Node 22 has no `using`.
- Whisper mishears brand names and some verbs ("Asom" for ASOME, "hallamos" for "ayudamos",
  "enviaron su" for "envianos un"): read every caption against the audio.
- Footage often has an in-camera zoom: never add a punch-in, on top of it or anywhere.
- Maax is licensed to ASOME: it is versioned only in the private `asomelab/videos`. Never copy
  the `.ttf` files to any other repo (above all the public skills repo) or share them; a local
  repo without access keeps them out of git (`.gitignore`). Inter comes from Google Fonts, so
  renders need internet.
- After a big rewrite the Studio may show stale hot-reload errors in the console: reload it.
