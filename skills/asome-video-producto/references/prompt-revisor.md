# Prompt: adversarial reviewer

Two uses. **Per scene** (Fase 3): one reviewer right after each builder, on rendered stills.
**Final** (Fase 4, optional): the orchestrator does the integrated QA itself with contact
sheets; launch the three final lenses below only for a reel that will be heavily promoted or
when the orchestrator's QA leaves doubts. Reviewers never edit files and report only issues
they verified on real frames.

## Per scene

```text
{COMMON block from prompt-escena.md}

You are an ADVERSARIAL REVIEWER for scene "{id}" (src/producto/scenes/{Archivo}.tsx,
composition P-{id}). Builder report:
{informe del builder}

Render stills yourself into {scratchpad}/review-{id}/: frame 0, every BEAT of the scene and 6
frames after it, the midpoints, and the last 12 frames (the hand-off to the next scene). Crop
at --scale=1 to check small text. Judge against:
- Voice timing: is each visual on its word (± 3 frames)?
- ASOME rules: Penn Blue canvas, Maax titles ≥ 60 at x = 96, one accent (Cornflower), labels,
  nothing in y > 1540, no client colors on the canvas, nothing AI-looking (glows, particles,
  pills behind words, shakes, templated layouts).
- Product fidelity: does it look like the real app (vs the ui/ components and their specs)?
- Honesty: platform truth respected, invented data, no number presented as a result.
- Legibility on a phone: is the UI text readable when it matters (camera zoomed in)?
- Dynamism: anything static > 1.5 s while the voice talks? anything frantic or strobing?
- Craft: overlaps, clipping, empty frames, elements popping, awkward hand-off with the
  neighbouring scenes.
Do NOT edit files. Return only verified issues worth fixing (frame, element, problem, fix,
severity high/medium/low) and a one-paragraph verdict. Default to skepticism; skip nitpicks
that would not be visible on a phone.
```

Schema for the Workflow tool: `{ issues: [{ frame, element, problem, fix, severity }], verdict }`
(see the `ISSUES` constant in `prompt-escena.md`).

## Final, on the rendered MP4 (optional, three lenses in parallel)

```text
You are auditing a finished Instagram reel (1080x1920, 30 fps, {N} s): {ruta del mp4}.
Context and rules: {proyecto}/brief.md, {SKILL_DIR}/references/brand-producto.md, the script
{proyecto}/guion.txt and the word timings src/producto/voz-words.json. Scene windows (s):
{hook a–b, reveal a–b, sideA a–b, sideB a–b, close a–b, end card a–b}.
Tools: contact sheets with `node scripts/qa-sheet.mjs <mp4> <nombre> <segundos | @segundos>…`
(run from the project, Bash sandbox disabled; @T = 12 frames around T at 30 fps), then Read
out/qa/<nombre>.jpg. Audio: `npx remotion ffmpeg -i <mp4> -vn -ac 1 -ar 16000 -c:a pcm_s16le
x.wav`, then measure with a short node script. Work in {scratchpad}/qa-<lens>/. Do NOT edit
project files.
Report only issues you verified on actual frames/audio: timestamp, what is wrong, why it matters,
a concrete fix, severity (high = must fix before publishing, medium = clearly better, low =
polish). Be skeptical and specific; do not pad.
```

Lenses (append one to each agent):

- **STORY & SYNC.** Every visual on the word that names it (check each beat at 30 fps)? Clear
  with sound OFF (captions + visuals)? Sells BOTH sides convincingly? Honest (client product
  built by ASOME; no fake screens; examples not presented as claims)? Hook strong in the first
  1–2 s? Any moment where a viewer would not understand what they see?
- **ASOME BRAND & "NOT AI".** Canvas colors, Maax titles ≥ 60/68 at x = 96, one accent, labels,
  safe areas, signature present, end card per template, one icon family, the client look
  confined to devices, nothing templated or AI-looking.
- **MOTION, CRAFT & AUDIO.** Every transition at 30 fps (@ each scene start and the end card):
  blank frames, flashes, jumps, popping, doubles? Static stretches > 1.5 s? UI legible on a
  phone? Text clipping or overlaps with captions/signature? Voice clearly above the music
  (RMS in voice vs pause regions), no clipping, SFX not too loud, clean music ending.
