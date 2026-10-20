# ASOME product reel: how a client's product sits on the ASOME system

The base system (colors, type scale, logo, icons, captions, sound, export) is the one in the
asome-video skill: `../asome-video/references/brand-video.md`. Read it first. This file adds
what is specific to presenting software ASOME built for a client, as decided on the first
product reel (October 2026, approved by the team). The marketing visual system says nothing
about device mockups, product screens or co-branding: the rules below apply ASOME's own rules
to that case.

## The frame of the story

- ASOME is a Software Factory (operational consultancy + custom software) that "escala la
  facturación de empresas sin aumentar proporcionalmente su estructura". The product is the
  CLIENT's; ASOME built it. Say it early: "lo construimos en ASOME para un cliente".
- Sell both user sides: the business side (what the owner/operator gains: control, time,
  revenue that scales) and the emotional side (what the end user feels). Close on ASOME.
- The client is not named unless the user confirms permission. The product name may appear only
  with permission too (Fase 0).

## Canvas and zones (1080 × 1920, `SAFE` in `timeline.ts`)

| Zone | y | Owner |
|---|---|---|
| Instagram chrome | 0–250 | nothing important |
| Scene content | 250–1540 | label, title, devices, graphics; text between x 96 and 984 |
| Captions | ~1590–1722 | the shell (Inter SemiBold 50/64, 820 wide) |
| Signature | 1768–1816 | the shell (logotipo left, @ pill right) |

- Title module first, then content: label (Inter SemiBold 24 caps, y ≈ 270) → 24 px → title
  (Maax Bold 76/82, never under 60/68; 92/96 for hero moments) → 32 px → support (Inter 34/48)
  → 48 px → device or graphic.
- The canvas is always ASOME: flat Penn Blue (or White Smoke). The client's dark or colored
  surfaces never become a full-frame background.
- Captions and signature sit inside Instagram's lower UI zone because the devices need the
  height above 1540. It is the layout the team approved; check it once in Instagram's upload
  preview before publishing.

## The client's look: only inside the devices

- Client colors, fonts, logos and icons render only inside device screens and floating product
  cards ("product components"). Never on ASOME titles, highlights, connectors or captions.
- Client fonts load under separate family names (`pFont` in `theme.ts`), even when the client
  also uses Inter, so they never collide with ASOME's faces.
- A strong client accent (a neon, a saturated brand color) next to a Cornflower highlight
  competes: prefer leaving that scene's title without highlight, or keep the accent area small.
- Device frames are neutral: dark bezel, thin base, no glow, no colored rim, no reflections.
  The screen is the content module under an ASOME title.
- The client logo is product content (inside a screen or as the subject of the reveal), never
  in the signature position and never on the end card.

## Honesty

- Screens are rebuilt from the client's code (tokens, layouts, copy, icons) with **invented
  data**. Never screenshots of a real environment, never real names or numbers.
- One small line under the product in the reveal: "Interfaz de <producto> · datos de ejemplo"
  (`Honest` in `ui/Kit.tsx`), Inter 24 at 66% White Smoke. When the product may not be named it
  reads "Interfaz del producto · datos de ejemplo", and its logo, app icon and URL never appear:
  they identify the client as surely as the name.
- Show a feature only on the platform where it exists. A web-only feature next to the phone is
  a floating product card, never a fake phone screen. Forms are shown when they are really
  filled (after a session, before an order…), with their real fields.
- Numbers inside the UI are product examples. Numbers on the ASOME canvas need a source; the
  close shows the business result as shape (a line that rises, a team line that stays flat)
  with direct labels and no figures.

## Motion for a product reel

- Arrival: fade 9 f + rise 28 px over 16 f on `ease.out`, then hold (`rise` in `ui/Kit.tsx`).
- Camera inside a device: move to the region the voice is naming with `focusCamera` +
  `mixCamera` on `ease.inOut` (~0.6 s), zoom 1.8–2.6× so UI text reads on a phone, pull back to
  the whole screen on the summary line ("todo desde un solo panel").
- One UI state change per beat: a chip turning "pagado", a card landing on a day, a count-up, a
  cursor click, a touch on the phone. Then hold until the next word.
- Scene to scene: the shell slides the next scene up (or in from the right) over 12 frames that
  end on its first word; the outgoing scene may scroll with it so the two read as one page.
- Nothing static for more than ~1.5 s while the voice talks; nothing frantic. The emotional side
  is the warmest and most dynamic scene, the close is the calmest.
- Banned: light leaks, glows, particles, decorative progress bars, pills behind caption words,
  emoji, mixed icon sets, punch-ins, shakes, whip pans, templated layouts.

## Sound

- Voice leads. Music bed 0.16 under the voice, 0.34 on the end card (`Promo.tsx`).
- The beat (`scripts/make-beat.mjs`) follows the scenes: intro building under the hook, full
  groove from the reveal, open hats on the two product sides, calmer under the ASOME close, a
  short build into the end-card hit. 1–4 kHz stays quiet for the voice.
- SFX soft and few: tick 0.18–0.22 when a card or chip lands, whoosh-soft ~0.22 on camera moves.

## Cover

- The reveal's settled frame (label "CASO · <PRODUCTO>" or "CASO · <kind>", "Lo construimos en ASOME", support
  line, devices) without captions, with the signature. Title inside y 285–1635 so the 4:5
  profile grid keeps it.

## Before exporting

- Every title Maax ≥ 60, at x = 96; one accent; nothing of the scene below y 1540.
- No client color on the canvas; device frames neutral; client fonts only in screens.
- Honest line present in the reveal; invented data everywhere; platform truth respected.
- Every beat on its word; no static stretch > 1.5 s; transitions clean at 30 fps.
- End card per template, signature on every frame until it.
