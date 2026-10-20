# Motion recipes

The building blocks of an ASOME reel and how to wire them. R1–R3 and R6–R8 come from the
"Consejo" talking-head reel (2026-10-17, the accepted second cut) and are already wired in the
reel skeleton's `Reel.tsx` and `cuts.ts` (`assets/reel/`, copied to `src/<tema>/`) and `scripts/build-cut.mts`. R4–R5 and `GrowthPlate`
come from the first reel (`example-reel.tsx`); that file's hard cuts, punch-in (old R2) and
speaker card (old R3) are retired: see `lecciones-consejo.md`.
Brand rules behind every number: `brand-video.md`.

## Anatomy of `src/<tema>/Reel.tsx`

```
<AbsoluteFill Penn Blue>
  Panels of the active split        under the footage, opacity = split
  <Footage split>                   cut.mp4 + blend.mp4 (dissolves), drops into the lower half
  <Captions>                        opacity 1 - split
  <Signature>                       off during a split and when the end card comes
  <Sequence "End card" from={CUT_FRAMES - 15}>  opaque Penn sheet sliding up, EndCard at 0
  SFX per split move · whoosh into the end card · music bed
```

- `Compositions.tsx` takes `REEL_FRAMES` from `Reel.tsx`: kept frames − 15 (the slide overlaps the
  last half second) + 102 (the 3.4 s end card).
- Everything over the footage is timed in **source seconds** through `at(<s>)`, which returns
  the reel frame. A time inside a removed range snaps to the next cut.
- Every timed node gets `premountFor={fps}` and a `name` (it is the label in the Studio timeline).

## R1 · Pre-cut take list (the base of everything)

`src/<tema>/cuts.ts`, one entry per kept piece in reel order (it may differ from source order, e.g.
a hook re-recorded at the end goes first), in source seconds of `public/<tema>/clip.mp4`:

```ts
export const SEGMENTS: readonly Segment[] = [
  // 1.8-2.75 is a false start; the take restarts at 3.45. "cosas en" is one sound, so the
  // line runs to the end of the sentence.
  { in: 3.4, out: 9.8, line: "Soy dueño de una empresa de software y …" },
  { in: 11.15, out: 17.86, line: "Seguro ya te pasó: …" },
  { in: 41.2, out: 43.85, line: "Ahora, hagamos una cuenta con números redondos." },
  { in: 44.15, out: 46.66, blend: MICRO, line: "Supongamos que tenés 200 consultas por mes." },
];
export const BREATHS = [[11.05, 11.38]]; // inhale inside a kept range, -12 dB
```

- In and out in pauses from `npm run analyze -- bounds` (silence, or a breath that goes into
  `BREATHS`, like the in-point at 11.15 above); out ≈ 0.10–0.15 s after the last
  sound, in ≈ 0.05–0.10 s before the first: joined pauses land at 0.2–0.25 s.
- `audioOut`: the speech runs into the next word with no gap (an aspirated /s/ touching a
  vowel). The audio ends there with a 12 ms fade and no handle.
- `npm run cut` builds `public/<tema>/cut.mp4` and `blend.mp4` and prints each cut's reel time.
  Then re-transcribe `cut.mp4` into `src/<tema>/captions-raw.json` and read it (coherence check).

## R2 · Dissolve between takes (replaces hard cuts and punch-ins)

Built in: at every cut `blend.mp4` holds the incoming take's lead-in before the cut and the
outgoing take's tail after it, and `blendOpacity(frame)` fades it in and out around the cut.
The result is a centered cross-dissolve; the audio crossfades equal-power over ±60 ms.

| Join | `blend` | Reads as |
|---|---|---|
| Between takes (default) | `[3, 3]` | 6-frame dissolve |
| A pause removed inside one take | `MICRO` = `[2, 2]` | barely visible |
| A cut that still feels abrupt | `[3, 4]` or move it into a longer silence | softer |

Never scale the footage to hide a cut, and never alternate zoom levels between takes.

## R3 · Split screen (1 or 2 per reel)

When: a passage where the screen can show what the voice alone cannot: the speaker's own
calculation, the list of what ASOME does, a before/after. The top half turns Penn Blue and
carries the motion; the video drops so the face centers in the lower half; captions hide.

```tsx
// Reel.tsx. from = `in` of the segment where it opens, to = `in` of the segment where it closes.
const SPLITS: readonly Split[] = [
  { from: 41.2, to: 112.05, Panel: MathPanel }, // "Ahora, hagamos una cuenta" … "Eso no lo arregla"
  { from: 149.88, to: 179.82, Panel: AsomePanel }, // "Esto es lo que hacemos en ASOME" … the CTA
];
```

- The move opens 6 frames before the cut at `from` and settles 12 after it (`ease.inOut`), and
  closes the same way on the cut at `to`: the layout change carries the cut.
- `FACE_Y` = face center on the full frame (the Consejo footage: 855, so the video drops 585).
- Panel layout: top half only, y 280–900, x 96, width 888. Build it from `src/<tema>/Panels.tsx`;
  every `start` is the source second of the word that brings the item in. Each item rises on
  that word with its own SFX and holds; nothing leaves before the split closes.

| Block | What it draws | SFX |
|---|---|---|
| `PanelTitle` | Maax Bold 60/68 White Smoke (Title S, the minimum); wrap one phrase in `<Hi>` for Cornflower | none |
| `Row` | value Maax Bold 56/64 (400 wide, nowrap) + label Inter 32/40 at 78%; rows 96 px apart | `tick` 0.22 |
| `Total` | 2 px rule that draws across, then the total counted up over 0.9 s in Maax Bold 88 Cornflower + unit | `rise` 0.18 |
| `ServiceGrid` | `IconCard`s two per row (436 wide, gap 16, rows 156 apart), label = the speaker's word | `tick` 0.22 each |

```tsx
// Reel.tsx
import { IconCode, IconDatabase, IconSettingsAutomation, IconSparkles } from "@tabler/icons-react";
import { Hi, PanelTitle, Row, ServiceGrid, Total } from "./Panels";

// "Ahora, hagamos una cuenta": the speaker's own numbers, one row as each is said.
const MathPanel: React.FC = () => (
  <>
    <PanelTitle start={42.18} top={280}>Hagamos una cuenta.</PanelTitle>
    <Row value="200" label="consultas por mes" start={45.5} top={380} />
    <Row value="1 de cada 10" label="se pierde entre WhatsApp y planillas" start={49.9} top={476} />
    <Row value="20" label="clientes perdidos por mes" start={80.3} top={572} />
    <Row value="× $1.000.000" label="trabajo promedio" start={106.54} top={668} />
    <Total value={20_000_000} step={1_000_000} format={(n) => `$${n.toLocaleString("es-AR")}`}
      unit="por mes" start={108.46} top={772} />
  </>
);

// "Esto es lo que hacemos en ASOME": the promise, then the services as he names them.
const AsomePanel: React.FC = () => (
  <>
    <PanelTitle start={151.62} top={340}>
      Escalamos tu facturación <Hi>sin aumentar tu estructura.</Hi>
    </PanelTitle>
    <ServiceGrid top={528} items={[
      { label: "Tecnología", icon: IconSettingsAutomation, start: 157.44 },
      { label: "Datos", icon: IconDatabase, start: 158.4 },
      { label: "Inteligencia artificial", icon: IconSparkles, start: 158.82 },
      { label: "Desarrollo de software", icon: IconCode, start: 166.12 },
    ]} />
  </>
);

const SPLITS: readonly Split[] = [
  { from: 41.2, to: 112.05, Panel: MathPanel },
  { from: 149.88, to: 179.82, Panel: AsomePanel },
];
```

- Numbers only if the speaker said them, in his words; a label never adds a claim.
- Keep the last block above y 900: a two-line title moves everything under it down 68 px.
- SFX for the split itself: `whoosh-soft` 0.25 at `at(from) - 8`, 0.2 at `at(to) - 8` (wired in
  `Reel.tsx`).

## R4 · Icon cards for a list (1 to 3 items)

Inside a split panel (R3) when the speaker names pillars or steps ("tecnología, datos y
ordenando cómo trabajan"). Two or more short labels: `ServiceGrid` (R3). One card per row with
a support line:

```tsx
<IconCard name="Card: Datos" from={at(16.2)} premountFor={fps} icon={IconDatabase}
  support="Información en un solo lugar"
  style={{ left: layout.margin, top: 460, ...rise(frame, at(16.2)) }}>
  Datos
</IconCard>
```

- Title = the spoken word; support = a short paraphrase (≤ 6 words), never a new claim.
- Icons from the brand mapping in `brand-video.md`. `tick` at 0.22 per landing.
- Not over the full-frame speaker on every sentence: that is the "template" look.

## R5 · Call-to-action card

Usually not needed: the end card already carries the action. Use it only if the action is said
well before the end: one `IconCard` in the top of a split with `IconMessage` (or the matching
icon), title = the action, no support line, landing on the action's first word.

## R6 · End card on an opaque sheet

Wired in the template: `<Sequence from={CUT_FRAMES - 15}>` holds an `AbsoluteFill` with
`backgroundColor: color.pennBlue` and `translate: 0px ${(1 - slide) * 1920}px`, and the
`<EndCard>` inside it **without** `from` (it mounts at 0). A transparent sheet makes the slide
invisible, and a later `from` makes the card pop in a second late. `thump` 0.4 at 0.4 s,
`tick` 0.3 at 1.2 s, `whoosh` 0.35 three frames before the slide.
- `title`: the video's promise in the speaker's words (≤ 8 words); `highlight`: the 1–4 words
  that carry it (they get their own line in Cornflower).
- `action`: the CTA the speaker asked for. If none, ask the user; never invent a channel.

## R7 · Cover (portada)

1. Pick 6 calm frames with the eyes on the lens and the mouth closed: `npm run frames -- …`,
   then `npm run analyze -- sheet out/portadas.jpg <the 6 JPGs>`. The user picks one.
2. Extract it at full size: `npx remotion ffmpeg -ss 28.0 -i public/<tema>/clip.mp4 -frames:v 1 -q:v 1 -y public/<tema>/cover-frame.jpg`.
3. In `src/<tema>/Compositions.tsx`, set on both stills (`frame` already points at that file): `title` (first line), `highlight` (closing phrase),
   `faceYInFrame` (face center y on a 1080 × 1920 canvas). Keep `faceY` 760 / 520 and
   `contentBottom` 1480 / 1254 unless the face would sit under the text.
4. Render the stills and look at both: the highlight must start its own line.

## R8 · Sound map

| Moment | File | Volume |
|---|---|---|
| Split opens / closes | `whoosh-soft.wav` | 0.25 / 0.2 |
| Number or card lands in a panel | `tick.wav` | 0.22 |
| A total, a line drawing itself | `rise.wav` | 0.18 |
| Into the end card | `whoosh.wav` | 0.35 |
| Logo lands / closing block | `thump.wav` / `tick.wav` | 0.4 / 0.3 |
| Music bed | `bed.wav` | 0.10 under the voice, up to 0.30 on the end card |

After the final cut, regenerate the bed to its length: `npm run audio -- <reel seconds + 2>`.

## Rhythm of the Consejo reel (~76 s, 16 pieces of one 186 s take)

| Reel part | What happens |
|---|---|
| Hook | Full frame from the clean restart (the false start before it is cut) |
| Problem, 4 lines | Full frame + captions, 6-frame dissolves between takes |
| "Ahora, hagamos una cuenta" → "Eso no lo arregla" | Split 1: the speaker's numbers one row at a time, the total counted up |
| "Lo arregla saber…", "Primero el proceso…" | Full frame again |
| "Esto es lo que hacemos en ASOME" → the CTA | Split 2: the promise, then four service cards as he names them |
| CTA | Full frame; the end card slides up after the last word |
