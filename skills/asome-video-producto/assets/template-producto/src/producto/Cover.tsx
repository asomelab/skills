import type React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { color, Handle, layout } from "../brand";
import { RevealScene } from "./scenes/Reveal";
import "./theme";

// Reel cover (9:16): the reveal's settled frame ("CASO · <PRODUCTO> / Lo construimos en ASOME",
// devices, support line) without captions, plus the ASOME signature. Set SETTLED to the reveal
// frame where every element has landed and before anything leaves; check it in P-reveal.
// The 4:5 profile grid crops y 285-1635: keep the title inside it.
const SETTLED = 170;

export const PromoCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.pennBlue }}>
    <Sequence from={-SETTLED}>
      <RevealScene />
    </Sequence>
    <div
      style={{
        position: "absolute",
        left: layout.margin,
        right: layout.margin,
        top: 1768,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Img src={staticFile("brand/wordmark-white-smoke.svg")} style={{ width: 168 }} />
      <Handle />
    </div>
  </AbsoluteFill>
);
