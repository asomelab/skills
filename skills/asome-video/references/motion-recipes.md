# Motion recipes

The building blocks of an ASOME reel and how to wire them. Every recipe is taken from the
first reel; the full working code is `example-reel.tsx` (read it before writing scenes).
Brand rules behind every number: `brand-video.md`.

## Anatomy of `src/Reel.tsx`

```
<TransitionSeries>
  Sequence "Toma 1"   trimBefore = start of take 1 · durationInFrames = length of take 1
  Sequence "Toma 2"   trimBefore = start of take 2 · ...                  (hard cut, no transition)
  Transition          slide from-bottom, 0.6 s, ease.inOut
  Sequence "End card" 3.4 s
</TransitionSeries>
<Signature/>   fades out when the end card starts sliding
<Audio whoosh/> 0.1 s before the slide · <Audio bed/> whole reel
```

- `Root.tsx`: `durationInFrames` = frames of all kept takes + 84 (3.4 s end card − 0.6 s slide).
- Inside a take, **frames are seconds of the original file** (the sequence carries `trimBefore`).
  Write `12.4 * fps`, never frame arithmetic. Nested `from` values work the same way.
- Use one-decimal seconds (`17.1 * fps`), so frames stay whole numbers.
- Every timed node gets `premountFor={fps}` and a `name` (it is the label in the Studio timeline).

## R1 · Take scene (the base of everything)

```tsx
<AbsoluteFill style={{ backgroundColor: color.pennBlue, overflow: "hidden" }}>
  <Video name="Toma 1" src={staticFile("clip.mp4")} premountFor={fps} objectFit="cover"
    effects={[contrast({ amount: 1.04 }), saturation({ amount: 0.96 })]}
    style={{ position: "absolute", width: "100%", height: "100%" }} />
  <PhotoGradient />
  <Captions name="Subtítulos toma 1" premountFor={fps} width={760}
    highlights={["facturación"]}
    style={{ position: "absolute", left: layout.margin, bottom: 1920 - 1340 }}
    captions={[ /* inline Caption objects, see below */ ]} />
</AbsoluteFill>
```

Captions: copy the take's words from `transcript.json` **inline** (the Studio caption editor
writes back to that array), fix the text, and put `pageBreakAfter: true` on the last word of
each phrase. Timestamps stay relative to the original file.

## R2 · Cut between takes of the same framing

Start the second take tighter so the cut reads as intended, not as a glitch:

```tsx
style={{ position: "absolute", width: "100%", height: "100%", transformOrigin: "50% 55%",
  scale: interpolate(frame, [28.2 * fps, 34.1 * fps], [1.1, 1.14], clamp) }}
```

No transition, no flash: a hard cut plus the scale change. Skip it if the camera framing
already changed between takes.

## R3 · Speaker card over a Penn plate (the core idea, once per video)

When: the one sentence that is the whole pitch ("escalar la facturación sin aumentar la
estructura"). The speaker shrinks into a rounded card at the top, the plate explains the idea
below, then the speaker expands back.

```tsx
// 0 = full frame, 1 = card. In 0.6 s on the keyword, out 0.6 s after the idea is said.
const card = interpolate(frame, [IN * fps, (IN + 0.6) * fps, (OUT - 0.6) * fps, OUT * fps],
  [0, 1, 1, 0], { ...clamp, easing: ease.inOut });

<div style={{ position: "absolute", overflow: "hidden",
  left: interpolate(card, [0, 1], [0, layout.margin]),
  top: interpolate(card, [0, 1], [0, layout.safeTop]),
  width: interpolate(card, [0, 1], [1080, 1080 - 2 * layout.margin]),
  height: interpolate(card, [0, 1], [1920, 540]),
  borderRadius: interpolate(card, [0, 1], [0, radius.card]) }}>
  <Video ... style={{ position: "absolute", width: 1080, height: 1920, transformOrigin: "0 0",
    scale: interpolate(card, [0, 1], [1, 0.9]),
    translate: interpolate(card, [0, 1], ["0px 0px", `${444 - FACE_X * 0.9}px ${270 - FACE_Y * 0.9}px`]) }} />
  <PhotoGradient style={{ opacity: 1 - card }} />
</div>
```

- `FACE_X`, `FACE_Y`: center of the face on the 1080 × 1920 canvas, measured from a still
  (`npm run frames`). The first reel used 540, 1050, giving `-42px -675px`.
- Plate content: `<GrowthPlate from={(IN + 0.35) * fps} durationInFrames=... title highlight
  risingLabel flatLabel />` for "more X with the same Y". For other ideas build a plate with
  the same layout (title at y 838, module 48 px below) and brand components.
- The plate leaves 0.2 s before the expand (`opacity` 1 → 0 and 0 → −24 px, `ease.in`).
- Captions fade with `opacity: 1 - card`: the plate carries the words meanwhile.
- SFX: `whoosh-soft` at `IN − 0.05` (0.35), `rise` when the line starts drawing (0.2),
  `whoosh-soft` at `OUT − 0.65` (0.3).

## R4 · Icon cards for a list (1 to 3 items)

When the speaker names pillars or steps ("tecnología, datos y ordenando cómo trabajan").

```tsx
<IconCard name="Card: Datos" from={16.2 * fps} durationInFrames={3 * fps} premountFor={fps}
  icon={IconDatabase} support="Información en un solo lugar"
  style={{ left: layout.margin, top: 460,
    opacity: interpolate(frame, [16.2 * fps, 16.5 * fps, 18.98 * fps, 19.18 * fps], [0, 1, 1, 0], clamp),
    translate: interpolate(frame, [16.2 * fps, 16.75 * fps, 18.98 * fps, 19.18 * fps],
      ["0px 28px", "0px 0px", "0px 0px", "0px -16px"], { ...clamp, easing: ease.out }) }}>
  Datos
</IconCard>
```

- Stack at `top` 300, 460, 620 (above the head). Each card lands on its word.
- All leave together 0.2 s before the cut, staggered by ~0.03 s.
- Title = the spoken word; support = a short paraphrase (≤ 6 words), never a new claim.
- Icons from the brand mapping in `brand-video.md`. `tick` at 0.35 per landing.

## R5 · Call-to-action card

When the speaker says the action ("envianos un mensaje a nuestro WhatsApp"): one `IconCard`
at `top: 300` with `IconMessage` (or the matching icon), title = the action, no support line,
landing on the action's first word, staying until the end card. `tick` at 0.35.

## R6 · End card

Already wired in the template: `<EndCard title highlight action />` inside the last sequence,
`slide({ direction: "from-bottom" })` 0.6 s before it, `thump` at 0.4 s and `tick` at 1.2 s.
- `title`: the video's promise in the speaker's words (≤ 8 words); `highlight`: the 1–4 words
  that carry it (they get their own line in Cornflower).
- `action`: the CTA the speaker asked for. If none, ask the user; never invent a channel.

## R7 · Cover (portada)

1. Look for a frame with eyes to camera, mouth closed, hands calm: `npm run frames -- 6 12 18 24 28`.
2. Extract it: `npx remotion ffmpeg -ss 28.0 -i public/clip.mp4 -frames:v 1 -q:v 1 -y public/cover-frame.jpg`.
3. In `Root.tsx`, set on both stills: `title` (first line), `highlight` (closing phrase),
   `faceYInFrame` (face center y on a 1080 × 1920 canvas). Keep `faceY` 760 / 520 and
   `contentBottom` 1480 / 1254 unless the face would sit under the text.
4. Render the stills and look at both: the highlight must start its own line.

## R8 · Sound map

| Moment | File | Volume |
|---|---|---|
| Speaker shrinks / expands | `whoosh-soft.wav` | 0.35 / 0.3 |
| Chart line draws | `rise.wav` | 0.2 |
| Card lands | `tick.wav` | 0.35 |
| Into the end card | `whoosh.wav` | 0.4 |
| Logo lands / closing block | `thump.wav` / `tick.wav` | 0.45 / 0.3 |
| Music bed | `bed.wav` | 0.14, up to 0.32 on the end card |

After the final cut, regenerate the bed to its length: `npm run audio -- <reel seconds + 2>`.

## Rhythm of the first reel (21.3 s)

| Source time | What happens |
|---|---|
| 6.6 | Cut in: speaker full frame, captions start |
| 9.35 | On "facturación": speaker shrinks into the card, plate title, revenue line rises |
| 11.0–12.4 | Structure line draws flat on "sin aumentar… su estructura" |
| 12.95 | Speaker expands back, captions return |
| 14.9 / 16.2 / 17.1 | "tecnología" / "datos" / "ordenando": three icon cards land |
| 19.2 → 28.2 | Hard cut to the CTA take, 1.1× tighter |
| 32.2 | "envianos un mensaje…": WhatsApp card |
| 33.5 | End card slides up: logo, title, @, closing block |
