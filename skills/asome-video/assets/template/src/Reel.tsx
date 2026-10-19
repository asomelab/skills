import { contrast } from "@remotion/effects/contrast";
import { saturation } from "@remotion/effects/saturation";
import { Audio, Video } from "@remotion/media";
import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color, ease, layout, PhotoGradient, Signature } from "./brand";
import { Captions } from "./Captions";
import { captions } from "./speech";
import { at, blendOpacity, CUT_FRAMES } from "./cuts";
import { EndCard } from "./EndCard";

// The reel: public/cut.mp4 (every kept take back to back, built by `npm run cut` from
// src/cuts.ts) plays full frame with the brand captions. Motion appears only in 1-2
// split-screen moments: the motion on Penn Blue above, the speaker below. Never a box
// around the face, never a punch-in. Then the end card slides up.
// Overlay times are SOURCE seconds through at(), so they read against transcript.json.
// Worked example of every piece: references/motion-recipes.md (R1-R3, R6).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const END_SLIDE = 15; // the end card slides up over the last half second, after the last word
const END_CARD = 102; // 3.4 s
export const REEL_FRAMES = CUT_FRAMES - END_SLIDE + END_CARD;

// Face center on the full 1080x1920 frame, measured on a still (npm run frames).
const FACE_Y = 855;
const HALF = 960;
// In a split the video drops so the face centers in the lower half.
const SPLIT_DROP = HALF + HALF / 2 - FACE_Y;

// Split-screen moments. `from` is the `in` of the segment where it opens and `to` the `in`
// of the segment where it closes (source seconds), so each layout move rides a cut: it
// opens 6 frames before the cut and settles 12 after. Panel: the motion for the top half
// (y 280-900), built from src/Panels.tsx (PanelTitle, Row, Total, ServiceGrid), each item
// on the source second of its word; worked example in R3 of motion-recipes.md.
type Split = {
  readonly from: number;
  readonly to: number;
  readonly Panel: React.FC;
};
const SPLITS: readonly Split[] = [];

const splitAt = (frame: number) =>
  Math.max(
    0,
    ...SPLITS.map(({ from, to }) =>
      interpolate(
        frame,
        [at(from) - 6, at(from) + 12, at(to) - 6, at(to) + 12],
        [0, 1, 1, 0],
        { ...clamp, easing: ease.inOut },
      ),
    ),
  );

const Footage: React.FC<{ readonly split: number }> = ({ split }) => {
  const frame = useCurrentFrame();
  const top = HALF * split;
  const effects = [contrast({ amount: 1.04 }), saturation({ amount: 0.96 })];
  const fill: React.CSSProperties = {
    position: "absolute",
    width: 1080,
    height: 1920,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: 1080,
        height: 1920 - top,
        overflow: "hidden",
      }}
    >
      <div style={{ ...fill, top: (SPLIT_DROP - HALF) * split }}>
        {/* One continuous file each, so the preview stays in sync across every cut. */}
        <Video
          name="Edit"
          src={staticFile("cut.mp4")}
          objectFit="cover"
          effects={effects}
          style={fill}
        />
        <Video
          name="Dissolves"
          src={staticFile("blend.mp4")}
          muted
          objectFit="cover"
          effects={effects}
          style={{ ...fill, opacity: blendOpacity(frame) }}
        />
      </div>
      <PhotoGradient style={{ opacity: 1 - split }} />
    </div>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const split = splitAt(frame);
  const endFrom = CUT_FRAMES - END_SLIDE;
  const slide = interpolate(frame, [endFrom, CUT_FRAMES], [0, 1], {
    ...clamp,
    easing: ease.inOut,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      {/* Panels sit under the footage, so closing a split slides the speaker back over them. */}
      <AbsoluteFill style={{ opacity: split }}>
        {SPLITS.map(({ from, to, Panel }) =>
          frame >= at(from) - 6 && frame < at(to) + 12 ? (
            <Panel key={from} />
          ) : null,
        )}
      </AbsoluteFill>

      <Footage split={split} />

      {/* The split hides the captions: the panel carries the words meanwhile. */}
      <Captions
        name="Captions"
        width={760}
        highlights={[]}
        style={{
          position: "absolute",
          left: layout.margin,
          bottom: 1920 - 1340,
          opacity: 1 - split,
        }}
        captions={captions}
      />

      {/* Off during a split (it would sit on the speaker's chin) and when the end card comes. */}
      <Signature
        style={{
          opacity: Math.min(
            1 - split,
            interpolate(
              frame,
              [0, 0.4 * fps, endFrom, endFrom + 9],
              [0, 1, 1, 0],
              clamp,
            ),
          ),
        }}
      />

      <Sequence name="End card" from={endFrom} premountFor={fps}>
        {/* The sheet must be opaque and the EndCard must mount at 0 inside it: a
            transparent sheet makes the slide invisible, and a later `from` pops the card
            in about a second late. */}
        <AbsoluteFill
          style={{
            backgroundColor: color.pennBlue,
            translate: `0px ${(1 - slide) * 1920}px`,
          }}
        >
          <EndCard
            name="End card"
            premountFor={fps}
            title="Crecé con la misma estructura que tenés hoy."
            highlight="la misma estructura"
            action="Escribinos por WhatsApp"
          />
        </AbsoluteFill>
        <Audio
          name="SFX: logo"
          src={staticFile("audio/thump.wav")}
          from={0.4 * fps}
          premountFor={fps}
          volume={0.4}
        />
        <Audio
          name="SFX: closing block"
          src={staticFile("audio/tick.wav")}
          from={1.2 * fps}
          premountFor={fps}
          volume={0.3}
        />
      </Sequence>

      {/* Sound: a soft whoosh on each split move; the Panels blocks bring their own tick/rise. */}
      {SPLITS.flatMap(({ from, to }) => [
        <Audio
          key={`in${from}`}
          name="SFX: split in"
          src={staticFile("audio/whoosh-soft.wav")}
          from={at(from) - 8}
          premountFor={fps}
          volume={0.25}
        />,
        <Audio
          key={`out${to}`}
          name="SFX: split out"
          src={staticFile("audio/whoosh-soft.wav")}
          from={at(to) - 8}
          premountFor={fps}
          volume={0.2}
        />,
      ])}
      <Audio
        name="SFX: to end card"
        src={staticFile("audio/whoosh.wav")}
        from={endFrom - 3}
        premountFor={fps}
        volume={0.35}
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
              endFrom,
              endFrom + 0.6 * fps,
              durationInFrames - 0.8 * fps,
              durationInFrames,
            ],
            [0, 0.1, 0.1, 0.3, 0.3, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
