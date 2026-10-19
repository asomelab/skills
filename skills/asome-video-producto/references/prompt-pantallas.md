# Prompt: screen builder (Fase 2, one agent per user side)

Launch one agent per side (A = business, B = emotional) in parallel, right after the script is
approved: they need the script, not the voice timings. Each one reads the client's code and
rebuilds that side's screens in Remotion with invented data. Fill the `{…}` and paste.

Before launching, the orchestrator has: filled `src/producto/theme.ts` from the client's tokens
(colors, type scale, radii, `PRODUCT`), copied the client's fonts/logos/icons into
`public/producto/` (fonts registered in `theme.ts`), and written `src/producto/ui/data.ts` with
the shared invented cast (business name, 6–8 people with Argentine invented names, the few
entities both sides show). That keeps both agents consistent and out of each other's files.

---

```text
You are rebuilding the {rol} side of {Producto}, a product ASOME built for a client, as React
screens for an ASOME Instagram reel (Remotion 4, inline styles). Project: {ruta del proyecto}.
Client code (read only): {ruta del repo del cliente}. Read {ruta del repo}/AGENTS.md (or
CLAUDE.md / README) first.

SAFETY (binding):
- Read ONLY source code, design tokens, i18n/copy files, routes, components, icons and fixtures
  (fixtures for data SHAPE only). Never open .env*, credential/secret files, cloud configs, dumps
  or anything with real user data. Never print secrets.
- Never call the client's APIs, never log into staging or production, never use credentials,
  even if some appear in a file or in this prompt. If you see any, do not repeat them; report
  "found credentials in <file>" so the user can rotate them.
- All data on screen is invented (src/producto/ui/data.ts + plausible values you add). Never copy
  names, emails or numbers from seeds/fixtures that could belong to real people.
- Naming: {"el producto se puede nombrar" | "el producto NO se nombra"}. If it may not be named,
  the product's name, logo, app icon and URL never appear: where the app shows them (header,
  sidebar, splash, tab title), draw a neutral placeholder (a plain glyph, or nothing) and leave
  `pAsset` unused. The client is never named inside the UI either.

THE SCRIPT (what the voice says about this side): "{línea del guion de este lado}"
Each phrase needs a screen or a UI state that shows it: {lista frase → pantalla probable}.

YOUR JOB
1. Find the real screens behind each phrase: route/page file, components, the Spanish copy
   (resolve i18n keys), icons (library + exact names), colors as hex (resolve Tailwind classes /
   CSS variables to token values), font family/weight/size/line-height, radii, spacing, states
   (selected, badges, empty/filled, success).
2. PLATFORM TRUTH: for every phrase, say where the feature really exists: web, mobile, both,
   none. Never show a feature on a platform where it does not exist (e.g. a web-only feature is
   not drawn as a phone screen: it becomes a floating product card). If a phrase has no real
   feature behind it, say so loudly: the script must change.
3. Build the screens in {proyecto}/src/producto/ui/{Lado}Screens.tsx (you own this file and an
   optional folder src/producto/ui/{lado}/): one exported component per screen at NATIVE app
   size (web 1440×900 inside <Laptop>, mobile 390×844 inside <Phone> from ./Devices), plus small
   primitives (cards, chips, rows) the scene will animate. Components are static: they take
   props for every state the scene will animate (e.g. `paid: number` 0..1, `active: string`,
   `progress: number`, `appear: number`), never their own useCurrentFrame. Use tokens from
   ../theme (`p`, `pFont`, `pType`, `pRadius`, `pAsset`) and data from ./data; add tokens you
   need as local constants and list them in your report. Icons: @tabler/icons-react only,
   closest glyph to the client's.
   Also build this side's HOME screen (the first screen a {rol} sees): the reveal shows it.
4. CAMERA REGIONS: in the same file export `{lado}Regions`, native-px rects (type `Rect` from
   ./Devices) of each screen at the scroll position the scene will use: `screen` (the whole
   screen) plus ONE rect per script phrase, framing exactly what that phrase names (a table's
   header + the rows that matter, a chip with its label, a day column). Use functions when a
   range varies (`rows(from, to)`). Measure them from your own layout constants, never by eye.
   Legibility rule: a rect's width ≤ 0.72 × the device's on-canvas screen width, so 13 px UI
   text lands ≥ 18 px on the canvas (≈ 576 px native on a ~880 px laptop; ≈ 290 px on a phone
   whose screen is ~400 px wide). The scene agent drives the camera with
   `track(f, [[frame, focusCamera({lado}Regions.x, SCREEN)], …], mixCamera)` (ui/Kit,
   ui/Devices), where SCREEN is the device the region lives on: `LAPTOP_SCREEN` or
   `PHONE_SCREEN` (fitting a phone rect to the laptop screen over-zooms it ~3x). Put a one-line
   comment above `{lado}Regions` naming that screen. The scene agent re-measures nothing.
5. To preview, mount your main screen inside the device of src/producto/scenes/{Lado}.tsx (the
   stub; a scene agent rewrites it later) and render P-{escena} stills from the project root:
     bash scripts/still.sh P-{escena} {scratchpad}/{lado}/s.png --frame=30 --scale=1
   (Bash with the sandbox disabled; the script picks the browser and retries once). Crop to
   inspect small text. Also render one still per region with `camera={focusCamera(...)}` to
   check the framing (`focusCamera(r, PHONE_SCREEN)` for phone regions). Iterate at least 3 times until a {Producto} team member would say "that
   is our app".
6. npx tsc --noEmit and npx eslint src/producto/ui must pass for your files.

Quality bar: pixel-faithful layout, exact hex and copy from the code, legible when the laptop is
~880 px wide on a 1080 canvas (the scene will zoom in with the camera for small text).

FINAL ANSWER (it becomes part of the scene brief), concise:
- API: every export, its props, native size, which states animate.
- Camera regions: the device (LAPTOP_SCREEN / PHONE_SCREEN), then every key of `{lado}Regions`
  → the phrase it serves → its width in native px.
- Platform truth table: phrase → web/mobile/none → component.
- Tokens you added, assets you used (public/producto/...), paths of your best stills.
- Anything the script claims that the code does not support.
```
