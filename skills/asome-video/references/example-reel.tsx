import { contrast } from "@remotion/effects/contrast";
import { saturation } from "@remotion/effects/saturation";
import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  IconDatabase,
  IconMessage,
  IconSettingsAutomation,
  IconUsers,
} from "@tabler/icons-react";
import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color, ease, layout, PhotoGradient, radius, Signature } from "./brand";
import { Captions } from "./Captions";
import { EndCard } from "./EndCard";
import { GrowthPlate } from "./GrowthPlate";
import { IconCard } from "./IconCard";

// WORKED EXAMPLE, not compiled. The first ASOME reel (2026-10-14), kept as the reference
// for every pattern in motion-recipes.md. Drop it in as src/Reel.tsx only to study it;
// for a new video, write the scenes again with the new transcript and timings.
// Root.tsx needs durationInFrames={639} for this cut.
//
// Source: public/clip.mp4, one raw 38 s take. Kept: the clean pitch (6.6-19.2 s)
// and the clean CTA (28.2-34.1 s); the flubbed attempts in between are cut.
// Inside each scene frames are source-relative (the sequence's trimBefore), so
// every timing below reads as seconds of the original recording.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PitchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 0 = speaker full frame, 1 = speaker framed as a card above the Penn Blue plate.
  const card = interpolate(
    frame,
    [9.35 * fps, 9.95 * fps, 12.95 * fps, 13.55 * fps],
    [0, 1, 1, 0],
    { ...clamp, easing: ease.inOut },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <GrowthPlate
        name="Growth plate"
        title="Más facturación con"
        highlight="la misma estructura."
        risingLabel="Facturación"
        flatLabel="Estructura"
        from={9.7 * fps}
        durationInFrames={3.4 * fps}
        premountFor={fps}
        style={{
          opacity: interpolate(
            frame,
            [12.75 * fps, 13.05 * fps],
            [1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [12.75 * fps, 13.05 * fps],
            ["0px 0px", "0px -24px"],
            {
              ...clamp,
              easing: ease.in,
            },
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          overflow: "hidden",
          left: interpolate(card, [0, 1], [0, layout.margin]),
          top: interpolate(card, [0, 1], [0, layout.safeTop]),
          width: interpolate(card, [0, 1], [1080, 1080 - 2 * layout.margin]),
          height: interpolate(card, [0, 1], [1920, 540]),
          borderRadius: interpolate(card, [0, 1], [0, radius.card]),
        }}
      >
        <Video
          name="Pitch footage"
          src={staticFile("clip.mp4")}
          premountFor={fps}
          objectFit="cover"
          effects={[contrast({ amount: 1.04 }), saturation({ amount: 0.96 })]}
          style={{
            position: "absolute",
            width: 1080,
            height: 1920,
            transformOrigin: "0 0",
            // Keeps the face (around 540, 1050) centered in the card as it shrinks.
            scale: interpolate(card, [0, 1], [1, 0.9]),
            translate: interpolate(card, [0, 1], ["0px 0px", "-42px -675px"]),
          }}
        />
        <PhotoGradient style={{ opacity: 1 - card }} />
      </div>
      <IconCard
        name="Card: Tecnología"
        from={14.9 * fps}
        durationInFrames={4.3 * fps}
        premountFor={fps}
        icon={IconSettingsAutomation}
        support="Sistemas a medida"
        style={{
          left: layout.margin,
          top: 300,
          opacity: interpolate(
            frame,
            [14.9 * fps, 15.2 * fps, 18.95 * fps, 19.15 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [14.9 * fps, 15.45 * fps, 18.95 * fps, 19.15 * fps],
            ["0px 28px", "0px 0px", "0px 0px", "0px -16px"],
            { ...clamp, easing: ease.out },
          ),
        }}
      >
        Tecnología
      </IconCard>
      <IconCard
        name="Card: Datos"
        from={16.2 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
        icon={IconDatabase}
        support="Información en un solo lugar"
        style={{
          left: layout.margin,
          top: 460,
          opacity: interpolate(
            frame,
            [16.2 * fps, 16.5 * fps, 18.98 * fps, 19.18 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [16.2 * fps, 16.75 * fps, 18.98 * fps, 19.18 * fps],
            ["0px 28px", "0px 0px", "0px 0px", "0px -16px"],
            { ...clamp, easing: ease.out },
          ),
        }}
      >
        Datos
      </IconCard>
      <IconCard
        name="Card: Procesos"
        from={17.1 * fps}
        durationInFrames={2.1 * fps}
        premountFor={fps}
        icon={IconUsers}
        support="Orden en cómo trabaja el equipo"
        style={{
          left: layout.margin,
          top: 620,
          opacity: interpolate(
            frame,
            [17.1 * fps, 17.4 * fps, 19 * fps, 19.2 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [17.1 * fps, 17.65 * fps, 19 * fps, 19.2 * fps],
            ["0px 28px", "0px 0px", "0px 0px", "0px -16px"],
            { ...clamp, easing: ease.out },
          ),
        }}
      >
        Procesos
      </IconCard>
      <Captions
        name="Pitch captions"
        premountFor={fps}
        width={760}
        highlights={["facturación"]}
        style={{
          position: "absolute",
          left: layout.margin,
          bottom: 1920 - 1340,
          opacity: 1 - card,
        }}
        captions={[
          {
            text: " En",
            startMs: 6820,
            endMs: 7040,
            timestampMs: 6930,
            confidence: null,
          },
          {
            text: " ASOME",
            startMs: 7040,
            endMs: 7440,
            timestampMs: 7240,
            confidence: null,
          },
          {
            text: " ayudamos",
            startMs: 7560,
            endMs: 7840,
            timestampMs: 7700,
            confidence: null,
          },
          {
            text: " a",
            startMs: 7840,
            endMs: 8120,
            timestampMs: 7980,
            confidence: null,
          },
          {
            text: " empresas",
            startMs: 8120,
            endMs: 8500,
            timestampMs: 8310,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " a",
            startMs: 8500,
            endMs: 8660,
            timestampMs: 8580,
            confidence: null,
          },
          {
            text: " escalar",
            startMs: 8660,
            endMs: 9060,
            timestampMs: 8860,
            confidence: null,
          },
          {
            text: " su",
            startMs: 9060,
            endMs: 9280,
            timestampMs: 9170,
            confidence: null,
          },
          {
            text: " facturación",
            startMs: 9280,
            endMs: 10120,
            timestampMs: 9700,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " sin",
            startMs: 10120,
            endMs: 10520,
            timestampMs: 10320,
            confidence: null,
          },
          {
            text: " aumentar",
            startMs: 10520,
            endMs: 10820,
            timestampMs: 10670,
            confidence: null,
          },
          {
            text: " proporcionalmente",
            startMs: 10820,
            endMs: 11700,
            timestampMs: 11260,
            confidence: null,
          },
          {
            text: " su",
            startMs: 11700,
            endMs: 11940,
            timestampMs: 11820,
            confidence: null,
          },
          {
            text: " estructura,",
            startMs: 11940,
            endMs: 13000,
            timestampMs: 12470,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " a",
            startMs: 13160,
            endMs: 13300,
            timestampMs: 13230,
            confidence: null,
          },
          {
            text: " través",
            startMs: 13300,
            endMs: 13420,
            timestampMs: 13360,
            confidence: null,
          },
          {
            text: " de",
            startMs: 13420,
            endMs: 13500,
            timestampMs: 13460,
            confidence: null,
          },
          {
            text: " la",
            startMs: 13500,
            endMs: 13680,
            timestampMs: 13590,
            confidence: null,
          },
          {
            text: " implementación",
            startMs: 13680,
            endMs: 14320,
            timestampMs: 14000,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " de",
            startMs: 14320,
            endMs: 14900,
            timestampMs: 14610,
            confidence: null,
          },
          {
            text: " tecnología,",
            startMs: 14900,
            endMs: 15740,
            timestampMs: 15320,
            confidence: null,
          },
          {
            text: " datos",
            startMs: 16200,
            endMs: 16840,
            timestampMs: 16520,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " y",
            startMs: 16840,
            endMs: 17060,
            timestampMs: 16950,
            confidence: null,
          },
          {
            text: " ordenando",
            startMs: 17060,
            endMs: 17720,
            timestampMs: 17390,
            confidence: null,
          },
          {
            text: " cómo",
            startMs: 17720,
            endMs: 18140,
            timestampMs: 17930,
            confidence: null,
          },
          {
            text: " trabajan.",
            startMs: 18140,
            endMs: 19000,
            timestampMs: 18570,
            confidence: null,
          },
        ]}
      />
      <Audio
        name="SFX: into card"
        src={staticFile("audio/whoosh-soft.wav")}
        from={9.3 * fps}
        premountFor={fps}
        volume={0.35}
      />
      <Audio
        name="SFX: revenue line"
        src={staticFile("audio/rise.wav")}
        from={9.95 * fps}
        premountFor={fps}
        volume={0.2}
      />
      <Audio
        name="SFX: out of card"
        src={staticFile("audio/whoosh-soft.wav")}
        from={12.9 * fps}
        premountFor={fps}
        volume={0.3}
      />
      <Audio
        name="SFX: Tecnología"
        src={staticFile("audio/tick.wav")}
        from={14.9 * fps}
        premountFor={fps}
        volume={0.35}
      />
      <Audio
        name="SFX: Datos"
        src={staticFile("audio/tick.wav")}
        from={16.2 * fps}
        premountFor={fps}
        volume={0.35}
      />
      <Audio
        name="SFX: Procesos"
        src={staticFile("audio/tick.wav")}
        from={17.1 * fps}
        premountFor={fps}
        volume={0.35}
      />
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ backgroundColor: color.pennBlue, overflow: "hidden" }}
    >
      <Video
        name="CTA footage"
        src={staticFile("clip.mp4")}
        premountFor={fps}
        objectFit="cover"
        effects={[contrast({ amount: 1.04 }), saturation({ amount: 0.96 })]}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transformOrigin: "50% 55%",
          // Tighter than the pitch so the jump between takes reads as an intended cut.
          scale: interpolate(
            frame,
            [28.2 * fps, 34.1 * fps],
            [1.1, 1.14],
            clamp,
          ),
        }}
      />
      <PhotoGradient />
      <IconCard
        name="Card: WhatsApp"
        from={32.2 * fps}
        durationInFrames={1.9 * fps}
        premountFor={fps}
        icon={IconMessage}
        style={{
          left: layout.margin,
          top: 300,
          opacity: interpolate(frame, [32.2 * fps, 32.5 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [32.2 * fps, 32.75 * fps],
            ["0px 28px", "0px 0px"],
            {
              ...clamp,
              easing: ease.out,
            },
          ),
        }}
      >
        Escribinos por WhatsApp
      </IconCard>
      <Captions
        name="CTA captions"
        premountFor={fps}
        width={760}
        highlights={["la misma estructura", "WhatsApp"]}
        style={{
          position: "absolute",
          left: layout.margin,
          bottom: 1920 - 1340,
        }}
        captions={[
          {
            text: " Si",
            startMs: 28420,
            endMs: 28580,
            timestampMs: 28500,
            confidence: null,
          },
          {
            text: " querés",
            startMs: 28580,
            endMs: 28820,
            timestampMs: 28700,
            confidence: null,
          },
          {
            text: " crecer",
            startMs: 28820,
            endMs: 29420,
            timestampMs: 29120,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " con",
            startMs: 29420,
            endMs: 29580,
            timestampMs: 29500,
            confidence: null,
          },
          {
            text: " la",
            startMs: 29580,
            endMs: 29820,
            timestampMs: 29700,
            confidence: null,
          },
          {
            text: " misma",
            startMs: 29820,
            endMs: 30080,
            timestampMs: 29950,
            confidence: null,
          },
          {
            text: " estructura",
            startMs: 30080,
            endMs: 30540,
            timestampMs: 30310,
            confidence: null,
          },
          {
            text: " que",
            startMs: 30560,
            endMs: 30580,
            timestampMs: 30570,
            confidence: null,
          },
          {
            text: " tenés",
            startMs: 30720,
            endMs: 31200,
            timestampMs: 30960,
            confidence: null,
          },
          {
            text: " hoy,",
            startMs: 31200,
            endMs: 31840,
            timestampMs: 31520,
            confidence: null,
            pageBreakAfter: true,
          },
          {
            text: " envianos",
            startMs: 31960,
            endMs: 32260,
            timestampMs: 32110,
            confidence: null,
          },
          {
            text: " un",
            startMs: 32260,
            endMs: 32440,
            timestampMs: 32350,
            confidence: null,
          },
          {
            text: " mensaje",
            startMs: 32440,
            endMs: 32700,
            timestampMs: 32570,
            confidence: null,
          },
          {
            text: " a",
            startMs: 32700,
            endMs: 32820,
            timestampMs: 32760,
            confidence: null,
          },
          {
            text: " nuestro",
            startMs: 32820,
            endMs: 33240,
            timestampMs: 33030,
            confidence: null,
          },
          {
            text: " WhatsApp.",
            startMs: 33240,
            endMs: 33420,
            timestampMs: 33330,
            confidence: null,
          },
        ]}
      />
      <Audio
        name="SFX: WhatsApp"
        src={staticFile("audio/tick.wav")}
        from={32.2 * fps}
        premountFor={fps}
        volume={0.35}
      />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <TransitionSeries name="Timeline">
        <TransitionSeries.Sequence
          name="Pitch"
          trimBefore={6.6 * fps}
          durationInFrames={12.6 * fps}
          premountFor={fps}
        >
          <PitchScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="CTA"
          trimBefore={28.2 * fps}
          durationInFrames={5.9 * fps}
          premountFor={fps}
        >
          <CtaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({
            durationInFrames: 0.6 * fps,
            easing: ease.inOut,
          })}
        />
        <TransitionSeries.Sequence
          name="End card"
          durationInFrames={3.4 * fps}
          premountFor={fps}
        >
          <EndCard
            name="End card"
            premountFor={fps}
            title="Crecé con la misma estructura que tenés hoy."
            highlight="la misma estructura"
            action="Escribinos por WhatsApp"
          />
          <Audio
            name="SFX: logo"
            src={staticFile("audio/thump.wav")}
            from={0.4 * fps}
            premountFor={fps}
            volume={0.45}
          />
          <Audio
            name="SFX: closing block"
            src={staticFile("audio/tick.wav")}
            from={1.2 * fps}
            premountFor={fps}
            volume={0.3}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {/* Signature on every footage frame; the end card carries its own. It hands off at 17.9 s, when the end card starts sliding in. */}
      <Signature
        style={{
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, 17.9 * fps, 18.2 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      />
      <Audio
        name="SFX: to end card"
        src={staticFile("audio/whoosh.wav")}
        from={17.8 * fps}
        premountFor={fps}
        volume={0.4}
      />
      <Audio
        name="Music bed"
        src={staticFile("audio/bed.wav")}
        premountFor={fps}
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              0.5 * fps,
              17.9 * fps,
              18.5 * fps,
              durationInFrames - 0.8 * fps,
              durationInFrames,
            ],
            [0, 0.14, 0.14, 0.32, 0.32, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
