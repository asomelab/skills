import { Composition, Still } from "remotion";
import { EndCard } from "./EndCard";
import { Reel, REEL_FRAMES } from "./Reel";
import { ReelCover } from "./ReelCover";

// Reel: 1080x1920 @ 30 fps. Its length follows src/cuts.ts: the kept frames plus the
// 3.4 s end card, minus the 0.5 s slide that overlaps the last take.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={REEL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EndCard"
        component={EndCard}
        durationInFrames={102}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Crecé con la misma estructura que tenés hoy.",
          highlight: "la misma estructura",
          action: "Escribinos por WhatsApp",
        }}
      />
      <Still
        id="ReelCover"
        component={ReelCover}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Escalá tu facturación,",
          highlight: "no tu estructura.",
          faceYInFrame: 1075,
          faceY: 760,
          contentBottom: 1480,
        }}
      />
      <Still
        id="ReelCoverFeed"
        component={ReelCover}
        width={1080}
        height={1350}
        defaultProps={{
          title: "Escalá tu facturación,",
          highlight: "no tu estructura.",
          faceYInFrame: 1075,
          faceY: 520,
          contentBottom: 1254,
        }}
      />
    </>
  );
};
