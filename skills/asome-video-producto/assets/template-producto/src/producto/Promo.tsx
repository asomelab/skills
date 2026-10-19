import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import type React from "react";
import { AbsoluteFill, Img, interpolate, Interactive, Sequence, staticFile, useCurrentFrame } from "remotion";
import { color, ease, Handle, layout } from "../brand";
import { Captions } from "../Captions";
import { EndCard } from "../EndCard";
import { CloseScene } from "./scenes/Close";
import { HookScene } from "./scenes/Hook";
import { RevealScene } from "./scenes/Reveal";
import { SideAScene } from "./scenes/SideA";
import { SideBScene } from "./scenes/SideB";
import "./theme";
import { CAPTIONS_FROM, END_CARD, ENTRANCE, FPS, lead, MOVE, SCENES, type SceneId, sceneFrames, TOTAL_FRAMES, WORDS } from "./timeline";

// ASOME reel presenting a product ASOME built for a client. The shell owns voice, music,
// captions, signature, the scene-to-scene slides and the end card; each scene (./scenes)
// owns what happens inside its window. Scene agents never edit this file.

// Caption words in Cornflower: product name, ASOME, the 1-4 key ideas of each side, the CTA.
const HIGHLIGHTS: string[] = ["ASOME", "a medida", "Escribinos"];
const END_CARD_TEXT = {
  title: "Escalá tu facturación, no tu estructura.",
  highlight: "no tu estructura.",
  action: "Escribinos por WhatsApp",
};
const VOICE = "producto/voz.mp3";
const MUSIC = "audio/promo-beat.wav"; // scripts/make-beat.mjs

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  reveal: RevealScene,
  sideA: SideAScene,
  sideB: SideBScene,
  close: CloseScene,
};

// Voice word timings -> Remotion captions. A phrase breaks on punctuation, after 4 words or on
// a pause > 0.35 s.
const captions: Caption[] = (() => {
  let run = 0;
  const spoken = WORDS.filter((w) => w.start >= CAPTIONS_FROM);
  return spoken.map((w, i) => {
    run++;
    const next = spoken[i + 1];
    const pageBreakAfter = !next || /[.,:;?!]$/.test(w.text) || run >= 4 || next.start - w.end > 0.35;
    if (pageBreakAfter) run = 0;
    return {
      text: ` ${w.text}`,
      startMs: w.start * 1000,
      endMs: w.end * 1000,
      timestampMs: w.start * 1000,
      confidence: null,
      pageBreakAfter,
    };
  });
})();

const SceneSlot: React.FC<{ readonly id: SceneId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const Scene = SCENE_COMPONENTS[id];
  const t = interpolate(frame, [0, MOVE], [0, 1], { ...clamp, easing: ease.inOut });
  const kind = ENTRANCE[id];
  const translate = kind === "up" ? `0px ${(1 - t) * 1920}px` : kind === "left" ? `${(1 - t) * 1080}px 0px` : "0px 0px";
  return (
    <AbsoluteFill style={{ translate, overflow: "hidden" }}>
      <Scene />
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  // Never useVideoConfig().durationInFrames: the P-<scene> windows mount this with a shorter one.
  const total = TOTAL_FRAMES;
  const endFrom = Math.round(END_CARD.from * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      {(Object.keys(SCENES) as SceneId[]).map((id) => {
        const from = Math.round(SCENES[id].from * FPS);
        return (
          <Sequence
            key={id}
            name={`Scene: ${id}`}
            from={from - lead(id)}
            // The next scene's slide covers this one's LAST MOVE frames (it ends on `to`). The extra
            // MOVE frames past `to` only show for the close, under the rising end-card sheet.
            durationInFrames={sceneFrames(id) + lead(id) + MOVE}
            premountFor={FPS}
          >
            <SceneSlot id={id} />
          </Sequence>
        );
      })}

      <Captions
        name="Captions"
        width={820}
        highlights={HIGHLIGHTS}
        style={{
          position: "absolute",
          left: layout.margin,
          bottom: 198, // y ~1590-1722, under the 1540 content line
          opacity: interpolate(frame, [endFrom - 6, endFrom], [1, 0], clamp),
        }}
        captions={captions}
      />

      <Interactive.Div
        name="Signature"
        style={{
          position: "absolute",
          left: layout.margin,
          right: layout.margin,
          top: 1768,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: interpolate(frame, [0, 12, endFrom, endFrom + 9], [0, 1, 1, 0], clamp),
        }}
      >
        <Img src={staticFile("brand/wordmark-white-smoke.svg")} style={{ width: 168 }} />
        <Handle />
      </Interactive.Div>

      <Sequence name="End card" from={endFrom} premountFor={FPS}>
        <AbsoluteFill
          style={{
            // Opaque: the sheet itself carries the slide. EndCard mounts with it (from 0) so its
            // entrances play while it rises; a transparent sheet makes the card pop in ~1 s late.
            backgroundColor: color.pennBlue,
            translate: `0px ${(1 - interpolate(frame, [endFrom, endFrom + 15], [0, 1], { ...clamp, easing: ease.inOut })) * 1920}px`,
          }}
        >
          <EndCard name="End card" premountFor={FPS} {...END_CARD_TEXT} />
        </AbsoluteFill>
      </Sequence>

      <Audio name="Voice" src={staticFile(VOICE)} />
      <Audio
        name="Music"
        src={staticFile(MUSIC)}
        // 0.16 under the voice, 0.34 on the end card, fade out on the last 20 frames
        volume={(f) => interpolate(f, [0, 10, endFrom - 10, endFrom + 10, total - 20, total], [0, 0.16, 0.16, 0.34, 0.34, 0], clamp)}
      />
      <Audio name="SFX: to end card" src={staticFile("audio/whoosh.wav")} from={endFrom - 3} volume={0.35} />
      <Audio name="SFX: logo" src={staticFile("audio/thump.wav")} from={endFrom + 27} volume={0.4} />
    </AbsoluteFill>
  );
};
