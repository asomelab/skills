import type React from "react";
import { Composition, Folder, Sequence, Still } from "remotion";
import { PromoCover } from "./Cover";
import { Promo } from "./Promo";
import { QaSheet, qaSheetMetadata } from "./QaSheet";
import { FPS, SCENES, type SceneId, sceneFrames, TOTAL_FRAMES } from "./timeline";

// Every composition of the product reel. Root.tsx renders <ProductoCompositions /> once
// (scripts/add-producto.sh adds it). Ids:
//   Promo          the reel, 1080x1920
//   P-<scene>      one window of the WHOLE promo per scene (frame 0 = SCENES[scene].from), so a
//                  scene agent previews its scene with captions, signature and transitions
//   PromoCover     9:16 cover Still
//   P-qa           contact sheet of frames from the rendered MP4 (scripts/qa-sheet.sh)

const PromoWindow: React.FC<{ readonly scene: SceneId }> = ({ scene }) => (
  <Sequence from={-Math.round(SCENES[scene].from * FPS)}>
    <Promo />
  </Sequence>
);

export const ProductoCompositions: React.FC = () => (
  <Folder name="Producto">
    <Composition id="Promo" component={Promo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    {(Object.keys(SCENES) as SceneId[]).map((scene) => (
      <Composition
        key={scene}
        id={`P-${scene}`}
        component={PromoWindow}
        durationInFrames={sceneFrames(scene)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ scene }}
      />
    ))}
    <Still id="PromoCover" component={PromoCover} width={1080} height={1920} />
    <Still
      id="P-qa"
      component={QaSheet}
      calculateMetadata={qaSheetMetadata}
      width={1080}
      height={1920}
      defaultProps={{ tiles: [], cols: 6 }}
    />
  </Folder>
);
