import type React from "react";
import { Composition, Folder, Still } from "remotion";
import { EndCard } from "../EndCard";
import { ReelCover } from "../ReelCover";
import { REEL } from "./id";
import { Reel, REEL_FRAMES } from "./Reel";

// Every composition of this reel, prefixed with its name so reels never collide in the
// shared Root (new-reel.sh registers <Compositions /> there). 1080x1920 @ 30 fps; the reel's
// length follows cuts.ts: the kept frames plus the 3.4 s end card, minus the 0.5 s slide.
//   <tema>              the reel
//   <tema>-cierre       the end card alone
//   <tema>-portada      9:16 cover · <tema>-portada-feed  4:5, how it reads in the grid
export const Compositions: React.FC = () => (
  <Folder name={REEL}>
    <Composition
      id={REEL}
      component={Reel}
      durationInFrames={REEL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id={`${REEL}-cierre`}
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
      id={`${REEL}-portada`}
      component={ReelCover}
      width={1080}
      height={1920}
      defaultProps={{
        title: "Escalá tu facturación,",
        highlight: "no tu estructura.",
        frame: `${REEL}/cover-frame.jpg`,
        faceYInFrame: 1075,
        faceY: 760,
        contentBottom: 1480,
      }}
    />
    <Still
      id={`${REEL}-portada-feed`}
      component={ReelCover}
      width={1080}
      height={1350}
      defaultProps={{
        title: "Escalá tu facturación,",
        highlight: "no tu estructura.",
        frame: `${REEL}/cover-frame.jpg`,
        faceYInFrame: 1075,
        faceY: 520,
        contentBottom: 1254,
      }}
    />
  </Folder>
);
