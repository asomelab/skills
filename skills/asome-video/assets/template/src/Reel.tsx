import { contrast } from "@remotion/effects/contrast";
import { saturation } from "@remotion/effects/saturation";
import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color, ease, layout, PhotoGradient, Signature } from "./brand";
import { Captions } from "./Captions";
import { EndCard } from "./EndCard";

// The reel. It starts as "the whole clip + the closing card" so Studio shows something
// the moment public/clip.mp4 exists. The asome-video skill then rewrites the scenes
// following references/motion-recipes.md (worked example: references/example-reel.tsx).
//
// Timing rule: inside a scene, frames are seconds of the ORIGINAL file, because the
// scene's <TransitionSeries.Sequence> carries trimBefore. Write `12.4 * fps`, not frame math.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const TakeScene: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ backgroundColor: color.pennBlue, overflow: "hidden" }}
    >
      <Video
        name="Footage"
        src={staticFile("clip.mp4")}
        premountFor={fps}
        objectFit="cover"
        effects={[contrast({ amount: 1.04 }), saturation({ amount: 0.96 })]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      <PhotoGradient />
      <Captions
        name="Captions"
        premountFor={fps}
        width={760}
        highlights={[]}
        style={{
          position: "absolute",
          left: layout.margin,
          bottom: 1920 - 1340,
        }}
        captions={[]}
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
          name="Take"
          trimBefore={0 * fps}
          durationInFrames={durationInFrames - 2.8 * fps}
          premountFor={fps}
        >
          <TakeScene />
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
      {/* Hands off to the end card's own logo when the slide starts (3.4 s before the end). */}
      <Signature
        style={{
          opacity: interpolate(
            frame,
            [
              0,
              0.4 * fps,
              durationInFrames - 3.4 * fps,
              durationInFrames - 3.1 * fps,
            ],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      />
      <Audio
        name="SFX: to end card"
        src={staticFile("audio/whoosh.wav")}
        from={durationInFrames - 3.5 * fps}
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
              durationInFrames - 3.4 * fps,
              durationInFrames - 2.8 * fps,
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
