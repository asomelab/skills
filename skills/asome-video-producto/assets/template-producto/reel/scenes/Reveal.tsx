import type React from "react";
import { AbsoluteFill } from "remotion";
import { color, font, layout } from "../../brand";
import { PRODUCT } from "../theme";
import { Laptop, laptopRatio, Phone } from "../ui/Devices";
import { Honest, Label, rise, Title, useSceneFrame } from "../ui/Kit";

// Reveal (SCENES.reveal) "Eso es <producto>, … que construimos en ASOME para un cliente …".
// The product enters on its name; the ASOME credit lands on "construimos en ASOME"; the support
// line on "un cliente …"; the honest line under the devices. Its settled frame is the cover.
// STUB: the scene agent replaces the empty screens with the product's home screens. If
// PRODUCT.name is "" (not allowed to name it): no logo or app-icon entrance, the devices enter on
// "plataforma".
const LAPTOP_W = 880;
const LAPTOP = { x: layout.margin - 52 * (LAPTOP_W / 1544), y: 696 }; // screen edge on the 96 margin
const PHONE = { w: 290, x: 984 - 290, y: 892 }; // right edge on 984, bottom ~1498

export const RevealScene: React.FC = () => {
  const f = useSceneFrame("reveal");
  return (
    <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
      <Label style={{ top: 270, ...rise(f, 0) }}>Caso · {PRODUCT.name || PRODUCT.kind}</Label>
      <Title text="Lo construimos en ASOME" highlight="en ASOME" style={{ top: 324, ...rise(f, 15) }} />
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top: 512,
          width: 888,
          fontFamily: font.text,
          fontSize: 34,
          lineHeight: "48px",
          color: color.whiteSmoke,
          ...rise(f, 30),
        }}
      >
        Para un cliente de …
      </div>
      <Laptop width={LAPTOP_W} style={{ position: "absolute", left: LAPTOP.x, top: LAPTOP.y, ...rise(f, 45) }} />
      <Phone width={PHONE.w} style={{ position: "absolute", left: PHONE.x, top: PHONE.y, ...rise(f, 55) }} />
      <Honest style={{ top: LAPTOP.y + LAPTOP_W * laptopRatio() + 24, ...rise(f, 60) }} />
    </AbsoluteFill>
  );
};
