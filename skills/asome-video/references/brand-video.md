# ASOME design system for video

Distilled from the **Brandbook** (agosto 2025) and the **Sistema visual de marketing ASOME
v2.0** (octubre 2026), plus the decisions taken on the first reel (2026-10-14) and on the
"Consejo" talking-head reel (2026-10-17, `lecciones-consejo.md`). Every value here is already
coded in `assets/template/src/brand.tsx` and the components; this file says **why** and
**when**, so new scenes stay on brand.

## Canvas and safe zones

| Item | Value |
|---|---|
| Reel | 1080 × 1920, 30 fps |
| Side margin | 96 px |
| Top keep-out | y < 250 (profile and progress bar) |
| Bottom keep-out | y > 1500 (Instagram reel UI: username, caption, audio) |
| Right action column | x > ~960 in the lower half: keep text ≤ 760 px wide there |
| Cover title zone | y 285 to 1500; the grid crops 4:5 (y 285–1635) and 3:4 (y 240–1680) |
| Alignment | Everything left-aligned |

## Color: five colors, each with a job

| Color | Hex | Job |
|---|---|---|
| Penn Blue | `#011F5B` | Dark flat background; titles on White Smoke |
| White Smoke | `#F5F5F5` | Light flat background; titles and text on Penn Blue |
| Persian Blue | `#1C39BB` | Every @, most icons, details and highlights on light |
| Cornflower | `#6495ED` | Highlights and details on dark. **Never a background** |
| Black | `#000000` | Body text and the photo gradient. **Never a background** |

- Flat backgrounds are only Penn Blue or White Smoke. Footage is its own composition.
- One accent per piece. On dark (footage, Penn plates) the accent is Cornflower.
- Avoid: Cornflower or black as a flat background, an @ in any color but Persian.

## Typography

Maax for titles, Inter for reading. Everything left-aligned.

| Style (1080 canvas) | Spec | Use |
|---|---|---|
| Title XL | Maax Bold 92/96 | Cover |
| Title | Maax Bold 76/82 | Standard (end card) |
| Title S | Maax Bold 60/68 | Interior, minimum title |
| Subtitle | Maax Medium 40/50 | Support line |
| Body | Inter 34/48, **minimum 30** | Reading text |
| Label | Inter SemiBold 24 UPPERCASE | Series or topic |
| @ | Inter SemiBold 26, Persian Blue | Handle pill |

Sizes the template uses in video: captions Inter SemiBold 50/64 · plate title Maax Bold 72/78 ·
end-card title 76/82 · card title Maax Bold 40/46 · card support Inter 30/38 · chart labels
Inter SemiBold 34 · cover Maax Regular 80/88 with the closing phrase in Maax Bold.
A long title steps down one size; never more than 4 lines.

## Logo

- Penn Blue or White Smoke, by background. **Completo** (iso + wordmark) for covers and closings;
  **logotipo** for the signature; **símbolo** for small spaces. Black only in organic stories
  when blue does not read.
- Sizes on 1080: logotipo 168 wide (min 140) · símbolo 64 tall (min 56) · completo 150 wide
  (min 110). Protection: ¼ of the symbol height free around it.
- Signature: logotipo bottom-left on the margin, `@asomelab` bottom-right in Persian Blue on a
  White Smoke pill. Over footage it sits in the gradient's clean zone, no box.

## Footage

- Full bleed, always with the **black bottom gradient, 86% to 0% upward, no hard edge**
  (`PhotoGradient`). Text only where it gives contrast. Never cover a face.
- Light grade only: `contrast 1.04`, `saturation 0.96`. No LUT looks, vignettes or light leaks.
- The speaker looks at the lens in every kept frame: glances away, a dropping head, false
  starts and long silences are cut. What remains must read as one coherent speech.
- The face is never framed in a box or a rounded card. When motion needs room, the screen
  splits: motion on Penn Blue above, the speaker full width below (R3).

## Emphasis: one per level

- Highlight 1 to 4 words of a title: Persian on light, Cornflower on dark.
- Bold 1 or 2 words of support text.
- One color band per piece at most.
- Never more than two emphasis resources at once. No underlines.

## Cards and modules

- **Card** ("una tarjeta, una idea"): white on light with a 2 px `#D2D7F1` border, or White Smoke
  6% on dark; radius 28; padding 48 (compact 24–36); 24 px between cards; icon box top-left
  (horizontal variant: icon left, centered with the text). In video: 640 wide, icon box 88.
- **Bloque de cierre**: full usable width, padding 40 × 44, radius 28, icon in a 96 px circle,
  White Smoke on dark (Penn Blue on light), at the foot above the signature.

## Icons

24 × 24 grid, stroke 2, round caps, no fill: Tabler matches the brand construction. Persian Blue;
on dark, inside a White Smoke box or circle. One family per piece. The brand's twelve:

| Brand icon | Tabler |
|---|---|
| Datos | `IconDatabase` |
| Personas | `IconUsers` |
| Documento | `IconFileText` |
| Tiempo | `IconClock` |
| Ventas | `IconTrendingUp` |
| Stock | `IconBoxMultiple` |
| Clientes | `IconUserCheck` |
| Reportes | `IconReportAnalytics` |
| Automatizar | `IconSettingsAutomation` |
| Planilla | `IconTable` |
| Mensajes | `IconMessage` |
| Indicador | `IconGauge` |

## Graphic resources: each one explains something

- Labels and numbers order series and steps. Arrows: solid connects, dotted does not.
- Diagrams: up to 6 nodes, each with an icon.
- Dot pattern: one per piece, in a corner, never behind all the text.
- Charts: direct labels in text color (never the series color), one accent series, neutral
  reference lines, no axes or gridlines, 6 px strokes, **no invented numbers**.

## Motion

- **Motion must explain.** Each animation shows hierarchy, a sequence in the story, or a change
  of state. Budget: **1 or 2 split-screen moments per reel**, only where they show what the
  voice alone cannot (a calculation, the list of what ASOME does); the rest is the speaker and
  the captions. Motion on every sentence reads as a template.
- **Easing tokens** (`ease` in brand.tsx): `out` for arrivals (0.4–0.6 s), `in` for exits
  (0.2–0.3 s), `inOut` for camera-like moves (0.6 s).
- **One direction for the whole film:** things enter rising (24–40 px up to rest) and leave
  rising (to −16/−24 px). The end card slides up from the bottom.
- **Sync to speech:** an element lands on its word (± 0.1 s). A title may lead by ~0.3 s.
- **Stagger** lines and cards by 0.1–0.15 s; in a list, one card per spoken item.
- **Then hold still.** No idle wobble, no looping micro-motion, no constant zoom.
- **Camera:** never a punch-in or a push-in on the speaker (footage often has an in-camera
  zoom already). Joins between takes are a centered **cross-dissolve of 4–6 frames** with an
  equal-power audio crossfade (±60 ms), 4 frames inside one take (R2). A split opens 6 frames
  before a cut and settles 12 after it, so the layout move carries the cut.
- **Banned (they read as "edited by AI"):** light leaks, glitches, whip pans, emoji, pills or
  boxes behind caption words, bouncing words, progress bars, neon glows, gradient text,
  invented statistics, a rounded box framing the face, punch-in zooms, hard jump cuts with
  alternating zoom (1.0 / 1.08), motion on every sentence, template-looking edits in general.

## Captions

- Inter SemiBold 50/64, White Smoke, left at x = 96, bottom edge at y = 1340, max 760 wide.
- Phrases break where the speaker breathes (`pageBreakAfter`), 2–6 words, 2 lines max.
- Each word fades up as it is spoken (0.18 s, 10 px). A phrase fades out in 0.14 s.
- Highlights: 1–4 words in Cornflower, only the key ideas (about one every 2–3 phrases).
- Fix the transcript before inlining it: brand names (Whisper writes "Asom" for ASOME),
  mis-heard verbs, voseo spelling ("envianos"), stray commas after names.
- Hide the captions while a split screen carries the message on screen.
- In the pre-cut workflow the captions come from transcribing `public/<tema>/cut.mp4` (already reel
  time); text fixes go by phrase (`FIXES` in `src/<tema>/speech.ts`), so they survive re-transcription.

## Sound

- The voice leads. Music bed at 0.10 under the voice when the speaker talks the whole reel
  (0.14 for short pieces), up to 0.30 on the end card.
- SFX are soft and few: `whoosh-soft` 0.25 when a split opens and 0.2 when it closes · `tick`
  0.22 per number or card landing in a panel · `rise` 0.18 under a total or a line drawing
  itself · `whoosh` 0.35 into the end card · `thump` 0.4 when the logo lands. No meme or
  cartoon sounds.
- Every cut is crossfaded in the audio; audible inhales inside a kept take are lowered 12 dB.

## Copy on screen

- Rioplatense voseo, like the brand ("Escribinos", "Crecé", "mirá").
- Never invent numbers, clients, results or promises: on-screen text says what the speaker said.
- No em-dashes in on-screen text.

## Cover (portada)

- A real frame of the take: eyes open to the lens, mouth closed, a relaxed face (a slight
  smile works), hands calm. A serious neutral "foto carnet" face and a mid-word frame were
  both rejected. Show the user a sheet of 6 options and let them pick.
- Penn Blue gradient from the bottom (team reference, 2026-10-15), unlike the black gradient
  used over footage. Title in Maax Regular, the closing phrase in Maax Bold Cornflower on its
  own line, logotipo 230 wide under it.
- Delivered 9:16 (uploaded with the reel) and 4:5 (to check the profile grid).

## Export

- Names: `AAAAMMDD_formato_tema_vNN` in lowercase, no accents, hyphens between words
  (`20261015_reel_crecer-sin-estructura_v01.mp4`).
- Video 1080 × 1920 MP4 H.264, sRGB/BT.709, AAC 48 kHz: the file to upload. A 4K master
  (2160 × 3840) is kept for archive. Covers as JPG at 90%.
- With them: the captions as SRT (`_subtitulos_`) and the caption copy (`_copy_…md`: hook of at
  most 125 characters, body, call to action, hashtags, first comment, alt text; no invented
  metrics, no emoji).
- Delivered to Downloads and to the ASOME Drive in `ASOME/marketing/reels/<YYYY-MM-DD> <tema>/`.

## Before exporting

- Maax titles, Inter text, sizes from the scale.
- Backgrounds Penn Blue, White Smoke or footage; one accent.
- The title reads at 33% size; captions match what is said.
- Nothing in the keep-out zones; the cover works in 4:5.
- Logo version by background, minimum sizes, @ in Persian.
- One icon family in Persian Blue.
- Every motion moment lands on its word; no AI tells from the list above.
- Eyes on the lens in every kept frame; no false start, repeated phrase or long pause left.
- Every cut dissolves; the end card visibly slides up and its logo arrives with it.
