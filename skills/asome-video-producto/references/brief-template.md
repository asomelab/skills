# Brief template for the scene agents

Copy this to `<proyecto>/brief.md` and fill every `{…}`. It is the single document every scene
agent and reviewer reads first, so it must stand alone: an agent with no chat history builds
its scene from this file, the files it lists and the code. Keep it under ~150 lines; link
files instead of pasting them.

Write it in **two passes**, so hook and close do not wait for the screens:

- **Pass 1, right after the voice** (Fase 1 step 5, timings in `timeline.ts`): everything except
  the lines marked `[pasada 2]`, with the full storyboard and beat times (reveal and the two sides
  may stay rough). Launch the **hook** and **close** agents now: they need no client UI.
- **Pass 2, when the Fase 2 screen agents return**: fill the `[pasada 2]` lines (screen API,
  camera regions, platform truth table) and refine the reveal and side storyboards with the real
  screens. Then launch **reveal**, **sideA** and **sideB**. Agents already running do not need
  to re-read it.

---

```markdown
# {Producto} × ASOME reel — build brief (read fully before writing code)

## What we're making
An ASOME Instagram reel (1080×1920, 30 fps, ~{N} s, Remotion) that presents **{Producto}**, a
{tipo de producto, genérico} **ASOME built for a client** (it is the client's product; ASOME is
the studio that built it). It sells both sides: **{rol A}** (business: {3 verbos del guion}) and
**{rol B}** (emotional: {3 cosas del guion}). AI voiceover (ElevenLabs "{voz}").
Client naming: {"el cliente no se nombra" | "se puede nombrar a {cliente}"}. Product name on
screen: {sí/no}. If no: `PRODUCT.name` is "", and the product's name, logo, app icon and URL
appear nowhere (label "CASO · {PRODUCT.kind}", honest line "Interfaz del producto · datos de
ejemplo"); `Honest`, the reveal label and the laptop address bar already do this.

## Read these first
- Brand rules (binding): `{SKILL_DIR}/references/brand-producto.md`, and for the base system
  `{VIDEO_SKILL}/references/brand-video.md`.
- `[pasada 2]` Screen specs + UI built in Fase 2: `src/producto/ui/` ({lista de archivos y qué
  exporta cada uno}), shared invented data `src/producto/ui/data.ts`. Platform truth table:
  {pegar la tabla de Fase 2: función → existe en web / móvil → componente}.
- Project: `{ruta del proyecto}` (Remotion 4, React 19).
  - `src/brand.tsx` ASOME tokens (`color`, `font`, `layout`, `radius`, `ease`), `Handle`, `IsoMark`.
  - `src/IconCard.tsx`, `src/GrowthPlate.tsx`, `src/EndCard.tsx`, `src/Captions.tsx`: reuse where they fit.
  - `src/producto/theme.ts`: client tokens `p`, `pFont`, `pType`, `pRadius`, `pAsset`, `PRODUCT`.
  - `src/producto/timeline.ts`: `SCENES`, `BEATS`, `word()`, `rel()`, `sceneFrames()`, `SAFE`.
  - `src/producto/voz-words.json`: every voiceover word with start/end seconds.
  - `src/producto/ui/Kit.tsx`: `useSceneFrame`, `rise`, `Label`, `Title`, `Honest`, `Sfx`, `clamp`,
    and `track(f, keys, mix)` with `Key<V>` / `lerp` / `lerpPt`: one keyframe helper for camera,
    cursor path, scroll and nav state.
  - `src/producto/ui/Devices.tsx`: `Laptop` (1440×900) / `Phone` (390×844) with `camera`,
    `focusCamera`, `mixCamera`, `overlay`, `Cursor`, `Touch`, type `Rect`.
  - `[pasada 2]` Camera regions from Fase 2 (native px, one per phrase; already within the
    legibility rule): {pegar las listas de `sideARegions` / `sideBRegions`: clave → frase →
    ancho, y en qué dispositivo está cada lado}. Cameras are
    `track(f, [[frame, focusCamera(regions.x, SCREEN)], …], mixCamera)` with `SCREEN` the device
    that shows the region: `LAPTOP_SCREEN` or `PHONE_SCREEN` (a phone region fitted to the
    laptop over-zooms ~3x). Never re-measure by eye.
  - `src/producto/Promo.tsx`: the shell (DO NOT EDIT). It owns voice, music, captions
    (y ≈ 1590–1722), the signature (y 1768–1816), the slide-ins (sideA up, sideB from the right,
    close up; 12 frames ending on the scene's `from`) and the end card. So the last 12 frames of
    reveal, sideA and sideB are covered by the next slide (land the last beat before them), and
    a scene's own slide-in (f −12…−1) shows only in the PREVIOUS scene's P-window (P-reveal for
    sideA, P-sideA for sideB, P-sideB for close).
- Icons: `@tabler/icons-react` only (no new dependencies). If the client uses another set, use
  the closest Tabler glyph inside the product UI.

## Visual system (non-negotiable)
- Canvas = ASOME: flat Penn Blue `#011F5B`, Maax Bold titles ≥ 60/68 in White Smoke at x = 96,
  max 888 wide, 1–4 highlighted words in Cornflower `#6495ED`, labels Inter SemiBold 24 caps.
  One accent per piece. Black is never a canvas background.
- {Producto}'s look ({colores clave del cliente}, {fuentes}) lives ONLY inside device screens and
  floating product cards. Device frames neutral, no glow, no colored rim. Client accent colors
  never on the ASOME canvas.
- Layout: title module from y ≥ 270, device/content below, **y 1540–1920 free** (captions +
  signature). Text between x 96 and 984.
- Invented data only (`ui/data.ts`). Numbers inside the UI are illustrative product data, never
  presented as results. The reveal carries the honest line (`Honest`: "Interfaz de {Producto} ·
  datos de ejemplo", or "del producto" when unnamed).
- Motion: arrivals fade 9 f + rise 28 px over 16 f on `ease.out`; camera/layout moves on
  `ease.inOut`; then HOLD. Every visual lands on the word that names it (`BEATS`, `word()`).
  Dynamic = camera moves inside a device to the region being named, staggered reveals,
  count-ups, cursor/touch interactions, a status chip changing, one UI state change per beat.
  Banned: light leaks, glows, particles, decorative progress bars, word pills, emoji, mixed icon
  sets, punch-ins on people, shakes, anything templated.
- Remotion: all animation from `useSceneFrame()`/`useCurrentFrame()` + clamped `interpolate` or
  `spring`; no CSS transitions, no `Math.random()`/`Date.now()`; `<Img src={staticFile()}>`;
  inline styles; no heavy blur on large areas.

## Storyboard (absolute seconds; voice line in quotes)
1. **Hook {from}–{to}** "{línea 1}". {metáfora visual simple + título cinético; qué palabras
   resaltan}. Captions start after this scene: the title says the words.
2. **Reveal {from}–{to}** "{línea 2}". At "{Producto}" ({t}): the product enters (icon/logo, then
   laptop + phone with their home screens; unnamed: no icon/logo, the devices enter on
   "plataforma"). At "construimos en ASOME" ({t}): label "CASO · {PRODUCTO | KIND}" + title
   "Lo construimos en ASOME". At "{cliente…}" ({t}): support line +
   {iconos}. Honest line under the devices. Its settled frame is the cover.
3. **{Rol A} {from}–{to}** Title "Para el {rol A}". {dispositivo}. Beats: "{frase}" ({t}) → {qué
   pantalla y qué cambia}; … ; "{frase resumen}" ({t}) → camera pulls back to the whole screen.
4. **{Rol B} {from}–{to}** Title "Para el {rol B}". {dispositivo}. Beats: … Warm, emotional, the
   most dynamic scene. {Funciones que no existen en el teléfono → tarjetas flotantes.}
5. **Close {from}–{to}** "{línea 5}". ASOME canvas only. "{a medida en ASOME}" ({t}): title.
   "{resultado de negocio}" ({t}): ASOME graphic, no invented numbers. "¿Tenés un proyecto así?"
   ({t}) title; "Escribinos" ({t}) IconCard CTA held until the end card at {END_CARD.from}.

## How to check your work visually (do this, repeatedly)
    cd {ruta del proyecto} && bash scripts/still.sh P-<scene> <out.png> --frame=<N> --scale=0.5
Run it with the Bash sandbox disabled (headless Chrome needs it); ~3 s per frame. The script
picks this machine's browser flags and retries once if Chrome does not answer. Frame 0 of
`P-<scene>` = `SCENES[scene].from` = `rel(…, scene)` frame 0, with captions, signature and
transitions exactly as in the final. Use `--scale=1` and crop to check small UI text. Write PNGs
to `{scratchpad}/<your-name>/`. Also run `npx tsc --noEmit` and `npx eslint <your files>`; only
errors in YOUR files are yours.

## File ownership
Write only the files assigned to you. Never edit `src/Root.tsx`, `src/producto/Promo.tsx`,
`timeline.ts`, `theme.ts`, `brand.tsx` or other agents' files; ask in your final report.
```
