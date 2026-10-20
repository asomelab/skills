import type React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { color, font, layout } from "./brand";

// Reel cover (Portada de reel) from a real frame of the take: photo full-bleed,
// Penn Blue gradient rising from the bottom, title in Maax with the closing
// phrase in bold Cornflower, logotype under it. Same layout for 9:16 and 4:5.

type ReelCoverProps = {
  readonly title: string;
  readonly highlight: string;
  readonly frame?: string; // 1080x1920 still in public/, e.g. "<tema>/cover-frame.jpg"
  readonly faceYInFrame: number; // face center in that still, measured on a 1080x1920 canvas
  readonly faceY: number; // where the face lands on the cover canvas
  readonly contentBottom: number; // y of the logotype's bottom edge
};

export const ReelCover: React.FC<ReelCoverProps> = ({
  title,
  highlight,
  frame = "cover-frame.jpg",
  faceYInFrame,
  faceY,
  contentBottom,
}) => {
  const { height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ backgroundColor: color.pennBlue, overflow: "hidden" }}
    >
      <Img
        src={staticFile(frame)}
        style={{
          position: "absolute",
          left: 0,
          top: faceY - faceYInFrame,
          width: 1080,
          height: 1920,
          objectFit: "cover",
        }}
      />
      <AbsoluteFill
        style={{
          // Anchored to the text, not the canvas, so it is solid before the photo ends in 9:16.
          background: `linear-gradient(to bottom, rgba(1,31,91,0) ${contentBottom - 700}px, rgba(1,31,91,0.55) ${contentBottom - 460}px, rgba(1,31,91,0.9) ${contentBottom - 200}px, ${color.pennBlue} ${contentBottom + 40}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          width: 888,
          bottom: height - contentBottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 48,
        }}
      >
        <div
          style={{
            fontFamily: font.title,
            fontWeight: 400,
            fontSize: 80,
            lineHeight: "88px",
            letterSpacing: "-0.01em",
            color: color.whiteSmoke,
          }}
        >
          {title}
          <span
            style={{
              display: "block",
              fontWeight: 700,
              color: color.cornflower,
            }}
          >
            {highlight}
          </span>
        </div>
        <Img
          src={staticFile("brand/wordmark-white-smoke.svg")}
          style={{ width: 230 }}
        />
      </div>
    </AbsoluteFill>
  );
};
