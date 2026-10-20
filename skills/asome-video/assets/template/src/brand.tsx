import { loadFont } from "@remotion/fonts";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
} from "remotion";

// ASOME brandbook (agosto 2025) + Sistema visual de marketing v2.0.
// Every value below comes from those two documents; change them there first.

export const color = {
  pennBlue: "#011F5B", // flat dark background; titles on White Smoke
  whiteSmoke: "#F5F5F5", // flat light background; text on Penn Blue
  persianBlue: "#1C39BB", // the @, icons, highlights on light
  cornflower: "#6495ED", // highlights and details on dark, never a background
  black: "#000000", // body text and the photo gradient, never a background
  cardBorder: "#D2D7F1", // 2px card border on light
  iconTint: "#E8ECFA", // icon box on a light card
  textMuted: "#484848",
};

// Maax is licensed to ASOME: scripts copy it from the ASOME Drive into public/fonts.
// Inter is open source, so it comes from Google Fonts and needs no file.
const inter = loadInter("normal", {
  weights: ["400", "600"],
  subsets: ["latin", "latin-ext"],
});

export const font = { title: "Maax", text: inter.fontFamily };

// Reel canvas 1080 x 1920: 96px side margin, IG chrome above y=250 and below y=1500.
export const layout = { margin: 96, safeTop: 250, safeBottom: 1500 };

export const radius = { card: 28, iconBox: 20 };

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // things arriving
  in: Easing.bezier(0.7, 0, 0.84, 0), // things leaving
  inOut: Easing.bezier(0.76, 0, 0.24, 1), // camera-like moves
};

// The standard arrival at frame `start`: fade in 0.3 s while rising 28 px over ~0.5 s.
export const rise = (frame: number, start: number): React.CSSProperties => ({
  opacity: interpolate(frame, [start, start + 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  translate: interpolate(frame, [start, start + 16], ["0px 28px", "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.out,
  }),
});

// Maax from ASOME/brand/Tipografia. loadFont() holds the render until each is ready.
loadFont({
  family: font.title,
  url: staticFile("fonts/Maax-Bold.ttf"),
  weight: "700",
});
loadFont({
  family: font.title,
  url: staticFile("fonts/Maax-Medium.ttf"),
  weight: "500",
});
loadFont({
  family: font.title,
  url: staticFile("fonts/Maax-Regular.ttf"),
  weight: "400",
});

// The isologo "A", inlined so it can be recolored (end-card watermark).
export const IsoMark: React.FC<{
  readonly fill: string;
  readonly style?: React.CSSProperties;
}> = ({ fill, style }) => (
  <svg viewBox="0 0 67.56 71.26" style={style}>
    <path
      fill={fill}
      d="M62.4,47.71h2.9c.22,0,.43-.12.54-.31l1.16-2.04c.11-.19.11-.43,0-.62L41.07,1.54c-.57-.96-1.61-1.54-2.72-1.54h-9.13c-1.11,0-2.14.58-2.71,1.54L.58,44.73c-.11.19-.12.43,0,.62l1.17,2.06c.1.18.3.3.51.3h2.91c1.52,0,2.56,1.54,2,2.95L.04,68.45c-.1.26-.01.56.22.71l3.04,2.01c.23.15.54.12.74-.07l23.01-23c5.25,0,8.2,0,13.45,0l23.01,23c.2.2.51.23.74.07l3.04-2.01c.23-.15.33-.45.22-.71l-7.12-17.79c-.56-1.41.47-2.95,2-2.95ZM25.71,29.35l6.68-11.13c.63-1.05,2.15-1.05,2.78,0l6.68,11.13c.65,1.08-.13,2.46-1.39,2.46h-13.36c-1.26,0-2.04-1.37-1.39-2.46Z"
    />
  </svg>
);

// Brand signature: logotype bottom-left, @ in Persian Blue on a White Smoke pill bottom-right.
export const Handle: React.FC<{ readonly style?: React.CSSProperties }> = ({
  style,
}) => (
  <div
    style={{
      padding: "8px 20px",
      borderRadius: 999,
      backgroundColor: color.whiteSmoke,
      color: color.persianBlue,
      fontFamily: font.text,
      fontWeight: 600,
      fontSize: 26,
      lineHeight: "30px",
      ...style,
    }}
  >
    @asome.ar
  </div>
);

// Signature on every footage frame: logotype bottom-left, @ bottom-right, above the reel UI.
export const Signature: React.FC<{ readonly style?: React.CSSProperties }> = ({
  style,
}) => (
  <Interactive.Div
    name="Signature"
    style={{
      position: "absolute",
      left: layout.margin,
      right: layout.margin,
      top: 1404,
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      ...style,
    }}
  >
    <Img
      src={staticFile("brand/wordmark-white-smoke.svg")}
      style={{ width: 168 }}
    />
    <Handle />
  </Interactive.Div>
);

// Black gradient over the bottom of any footage, 86% to 0% upward with no hard edge
// (Sistema visual p.15). Captions and the signature only live where it gives contrast.
export const PhotoGradient: React.FC<{
  readonly style?: React.CSSProperties;
}> = ({ style }) => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.4) 36%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0) 62%)",
      ...style,
    }}
  />
);
