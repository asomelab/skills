import type React from "react";
import { Composition, Folder, Sequence, Still } from "remotion";
import { PromoCover } from "./Cover";
import { REEL } from "./id";
import { Promo } from "./Promo";
import { QaSheet, qaSheetMetadata } from "./QaSheet";
import { FPS, SCENES, type SceneId, sceneFrames, TOTAL_FRAMES } from "./timeline";

// Every composition of the product reel, prefixed with its name so reels never collide in the
// shared Root (new-reel.sh registers <Compositions /> there). Ids:
//   <tema>           the reel, 1080x1920
//   <tema>-<scene>   one window of the WHOLE promo per scene (frame 0 = SCENES[scene].from), so a
//                    scene agent previews its scene with captions, signature and transitions
//   <tema>-portada   9:16 cover Still
//   <tema>-qa        contact sheet of frames from the rendered MP4 (scripts/qa-sheet.mjs)

const PromoWindow: React.FC<{ readonly scene: SceneId }> = ({ scene }) => (
  <Sequence from={-Math.round(SCENES[scene].from * FPS)}>
    <Promo />
  </Sequence>
);

export const Compositions: React.FC = () => (
  <Folder name={REEL}>
    <Composition id={REEL} component={Promo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    {(Object.keys(SCENES) as SceneId[]).map((scene) => (
      <Composition
        key={scene}
        id={`${REEL}-${scene}`}
        component={PromoWindow}
        durationInFrames={sceneFrames(scene)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ scene }}
      />
    ))}
    <Still id={`${REEL}-portada`} component={PromoCover} width={1080} height={1920} />
    <Still
      id={`${REEL}-qa`}
      component={QaSheet}
      calculateMetadata={qaSheetMetadata}
      width={1080}
      height={1920}
      defaultProps={{ tiles: [], cols: 6 }}
    />
  </Folder>
);
