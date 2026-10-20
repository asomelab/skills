import type React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../../brand";
import { Laptop } from "../ui/Devices";
import { rise, Title, useSceneFrame } from "../ui/Kit";

// Side A (SCENES.sideA), the business side: "Para el <rol A>: <qué hace> …". One Laptop (or
// Phone) whose camera moves to the region each phrase names (focusCamera/mixCamera, ease.inOut),
// one UI state change per beat, then a pull-back to the whole screen at the summary line.
// It slides in over the previous scene: useSceneFrame() is negative during the slide.
// STUB: the scene agent replaces it.
export const SideAScene: React.FC = () => {
  const f = useSceneFrame("sideA");
  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <Title text="Para el rol A" highlight="rol A" style={{ top: 300, ...rise(f, 0) }} />
      <Laptop width={888} style={{ position: "absolute", left: 96, top: 560, ...rise(f, 15) }} />
    </AbsoluteFill>
  );
};
