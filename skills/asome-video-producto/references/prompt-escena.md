# Prompt: scene builder (Fase 3, one agent per scene, in parallel)

One agent per file in `src/{tema}/scenes/`. Hook and Close need no client UI, so they start
on the first pass of `brief.md` (written right after the voice); Reveal, SideA and SideB start
on the second pass, when the Fase 2 screen agents are done. Each builder is followed by ONE adversarial review (`prompt-revisor.md`) and a fix
pass only if the review returns high or medium issues.

## COMMON block (same for every scene)

```text
Read {repo}/docs/{tema}/brief.md completely (its rules are binding), then the files it lists: the
screen components in src/{tema}/ui/ (read their source), ui/Kit.tsx, ui/Devices.tsx,
timeline.ts, Promo.tsx (the shell, read only), src/brand.tsx, src/IconCard.tsx,
src/GrowthPlate.tsx, and {SKILL_DIR}/references/brand-producto.md.
Honesty: {tabla de verdad de plataformas de Fase 2, en 3-6 líneas}. All data is invented
(ui/data.ts). Numbers in the UI are product examples, never results.
Clock: inside your scene use `const f = useSceneFrame("<id>")`; then rel(BEATS.x, "<id>") or
rel(word("palabra", SCENES.<id>.from), "<id>") gives the frame of each word.
Hand-offs (sideA, sideB and close slide in over 12 frames that END on their `from`):
- reveal, sideA, sideB: your LAST 12 frames (sceneFrames(id)-12 … sceneFrames(id)-1) are being
  covered by the next scene's slide. Land your last beat (summary, pull-back) before them, then hold.
- sideA, sideB, close: you are on screen from f = -12 (your own slide-in). Your scene window does not
  show it: it is the last 12 frames of the PREVIOUS scene's window ({tema}-reveal for sideA, {tema}-sideA
  for sideB, {tema}-sideB for close). Render those to check it.
- hook cuts to reveal. The close ends under the end-card sheet that rises over 15 frames from
  END_CARD.from: check that in the {tema} composition.
The scene must look complete and intentional at EVERY frame, including all of the above.
Camera, cursor, scroll, nav: one keyframe list each, `track(f, KEYS, mix)` from ui/Kit
(`mixCamera` for cameras, `lerpPt` for cursor/touch paths, `lerp` for numbers), with cameras on
the Fase 2 regions and the screen of the device that shows them:
`focusCamera(sideARegions.<clave>, LAPTOP_SCREEN)`, `focusCamera(sideBRegions.<clave>, PHONE_SCREEN)`
(a phone region fitted to the laptop screen over-zooms ~3x). Do not measure screen coordinates
by eye and do not write your own interpolation helpers.
Timing: every visual beat lands on the word that names it (± 3 frames; a title may lead by
~9). Check by rendering the frame of each beat and 6 frames after.
Dynamic but ASOME-clean (brief "Motion"): nothing static for more than ~1.5 s while the voice
talks, nothing frantic. Keep y 1540-1920 clear (captions + signature belong to the shell).
SFX: <Sfx scene="<id>" at={frame} src="audio/tick.wav" volume={0.2} /> from ui/Kit, a few, soft.
```

## BUILD prompt

```text
{COMMON}

YOUR SCENE: {storyboard de la escena, copiado del brief, con los tiempos de cada beat}.
{Notas específicas: dispositivo y ancho, qué pantallas de ui/ usar, cámara por beat, qué título.}

You own ONLY {repo}/src/{tema}/scenes/{Archivo}.tsx (export const {Export}: React.FC, no
props) and optional helpers under src/{tema}/scenes/{id}/. Replace the stub. If the file
already holds partial work from an interrupted run, read it first and finish it instead of
starting over.
Render {tema}-{id} stills (frame 0 = scene start, with captions/signature/transitions) into
{scratchpad}/scene-{id}/ at every beat and in between, LOOK at them, and iterate: at least 3
render -> look -> fix loops; check small UI text at --scale=1 with a crop.
  bash scripts/still.sh {tema}-{id} {scratchpad}/scene-{id}/f<N>.png --frame=<N> --scale=0.5
(from the project root, Bash with the sandbox disabled, ~3 s per still.) npx tsc --noEmit and npx eslint on your files
must pass.
Final answer: what the scene does beat by beat (frame numbers), what you verified, the paths of
your 3 best stills, and any request for shell/timeline changes (do not make them yourself).
```

## FIX prompt (only when the review has high/medium issues)

```text
{BUILD prompt}

The scene already exists (your earlier work; report below). A reviewer found these issues:
verify each by rendering, fix the real ones, explain any you reject.
Earlier report: {informe del builder}
Issues: {JSON de issues high/medium}
Reviewer verdict: {veredicto}
Final answer: updated beat-by-beat summary, fixed/rejected issues, final still paths.
```

## Running it

With the Workflow tool (if this session has it), one script runs the scenes as a pipeline:
build -> review -> fix, scenes in parallel. Run it twice with the same skeleton: once with
hook + close on brief pass 1, once with reveal + sideA + sideB on pass 2 (when the Fase 2 screen
agents have returned). Skeleton (fill the prompts above in; keep only the scenes of that run):

```js
export const meta = { name: 'producto-escenas', description: 'Build, review and fix the reel scenes', phases: [{ title: 'Build' }, { title: 'Review' }, { title: 'Fix' }] }
const SCENES = [
  { id: 'hook', file: 'Hook.tsx', export: 'HookScene', extra: '…' },
  { id: 'reveal', file: 'Reveal.tsx', export: 'RevealScene', extra: '…' },
  { id: 'sideA', file: 'SideA.tsx', export: 'SideAScene', extra: '…' },
  { id: 'sideB', file: 'SideB.tsx', export: 'SideBScene', extra: '…' },
  { id: 'close', file: 'Close.tsx', export: 'CloseScene', extra: '…' },
]
const ISSUES = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { frame: { type: 'number' }, element: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['element', 'problem', 'fix', 'severity'] } }, verdict: { type: 'string' } }, required: ['issues', 'verdict'] }
return await pipeline(
  SCENES,
  (s) => agent(BUILD(s), { label: `build:${s.id}`, phase: 'Build' }),
  (report, s) => agent(REVIEW(s, report), { label: `review:${s.id}`, phase: 'Review', schema: ISSUES }).then((review) => ({ report, review })),
  (prev, s) => {
    const issues = (prev.review?.issues ?? []).filter((i) => i.severity !== 'low')
    if (!issues.length) return { id: s.id, ...prev, fixed: 'no high/medium issues' }
    return agent(FIX(s, prev, issues), { label: `fix:${s.id}`, phase: 'Fix' }).then((fixed) => ({ id: s.id, ...prev, fixed }))
  },
)
```

Without it, launch the BUILD agents in parallel with the Agent tool (background): hook + close
on brief pass 1, the other three on pass 2. Start each review as its builder returns. Either way, send the user 1–2 stills per scene as
they land: early feedback is cheaper than a re-render.
