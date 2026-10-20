import type React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../../brand";
import { rise, Title, useSceneFrame } from "../ui/Kit";

// Hook (SCENES.hook) "<línea 1 del guion>". Pure ASOME canvas: Maax kinetic title + one simple
// geometric metaphor that stops the scroll in the first second. The captions start after this
// scene (CAPTIONS_FROM), so the title carries the words. STUB: the scene agent replaces it.
export const HookScene: React.FC = () => {
  const f = useSceneFrame("hook");
  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <Title size={92} text="Primera línea del guion." highlight="guion." style={{ top: 520, ...rise(f, 0) }} />
    </AbsoluteFill>
  );
};
