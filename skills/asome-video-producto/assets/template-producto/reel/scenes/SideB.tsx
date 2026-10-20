import type React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../../brand";
import { Phone } from "../ui/Devices";
import { rise, Title, useSceneFrame } from "../ui/Kit";

// Side B (SCENES.sideB), the emotional side: "Para el <rol B>: …". Usually the Phone, large
// and central. Features that do not exist on the phone appear as floating product cards, never
// as a fake phone screen. The warmest, most dynamic scene.
// It slides in over the previous scene: useSceneFrame() is negative during the slide.
// STUB: the scene agent replaces it.
export const SideBScene: React.FC = () => {
  const f = useSceneFrame("sideB");
  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <Title text="Para el rol B" highlight="rol B" style={{ top: 300, ...rise(f, 0) }} />
      <Phone width={560} style={{ position: "absolute", left: 260, top: 470, ...rise(f, 15) }} />
    </AbsoluteFill>
  );
};
