import type React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Img, staticFile } from "remotion";
import { color, font } from "../brand";

// QA contact sheet of frames pulled from the RENDERED MP4 by scripts/qa-sheet.sh (no Python, no
// ffmpeg tile filter needed). One Read of the sheet replaces a dozen frame reads.

type Tile = { readonly src: string; readonly label: string };
export type QaSheetProps = { readonly tiles: Tile[]; readonly cols: number };

const W = 1080;
const PAD = 12;
const LABEL = 30;
const tileW = (cols: number) => (W - PAD * (cols + 1)) / cols;
const rowH = (cols: number) => (tileW(cols) * 16) / 9 + LABEL + PAD;

export const qaSheetMetadata: CalculateMetadataFunction<QaSheetProps> = ({ props }) => ({
  height: Math.ceil(PAD + Math.ceil(Math.max(1, props.tiles.length) / props.cols) * rowH(props.cols)),
});

export const QaSheet: React.FC<QaSheetProps> = ({ tiles, cols }) => (
  <AbsoluteFill style={{ backgroundColor: "#202020" }}>
    {tiles.map((t, i) => (
      <div
        key={t.src}
        style={{
          position: "absolute",
          left: PAD + (i % cols) * (tileW(cols) + PAD),
          top: PAD + Math.floor(i / cols) * rowH(cols),
          width: tileW(cols),
        }}
      >
        <Img src={staticFile(t.src)} style={{ width: "100%", display: "block" }} />
        <div style={{ height: LABEL, fontFamily: font.text, fontSize: 20, lineHeight: `${LABEL}px`, color: color.whiteSmoke }}>{t.label}</div>
      </div>
    ))}
  </AbsoluteFill>
);
