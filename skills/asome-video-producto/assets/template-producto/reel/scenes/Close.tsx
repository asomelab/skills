import type React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../../brand";
import { rise, Title, useSceneFrame } from "../ui/Kit";

// Close (SCENES.close) "Lo construimos a medida en ASOME para que nuestro cliente … ¿Tenés un
// proyecto así? Escribinos." Pure ASOME canvas, no product UI: the business result as an ASOME
// graphic (GrowthPlate-style lines, cards; no invented numbers), then the question and an
// IconCard CTA held until the shell's end card slides up at END_CARD.from.
// STUB: the scene agent replaces it.
export const CloseScene: React.FC = () => {
  const f = useSceneFrame("close");
  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <Title size={92} text="Hecho a medida por ASOME" highlight="a medida" style={{ top: 560, ...rise(f, 0) }} />
    </AbsoluteFill>
  );
};
