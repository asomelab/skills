import { Audio } from "@remotion/media";
import type { Icon } from "@tabler/icons-react";
import type React from "react";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { color, ease, font, layout, rise } from "./brand";
import { at } from "./cuts";
import { IconCard } from "./IconCard";

// Building blocks for the top half of a split (R3 in references/motion-recipes.md), from the
// accepted Consejo cut: y 280-900, x 96, width 888, on Penn Blue. Every `start` is the SOURCE
// second of the word that brings the item in (read it in transcript.json); each item rises on
// that word, holds until the split closes, and plays its own tick.

const WIDTH = 888;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Sfx: React.FC<{ readonly from: number; readonly volume?: number; readonly file?: string }> = ({
  from,
  volume = 0.22,
  file = "tick",
}) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name={`SFX: ${file}`}
      src={staticFile(`audio/${file}.wav`)}
      from={from}
      premountFor={fps}
      volume={volume}
    />
  );
};

// The one Cornflower highlight of a title.
export const Hi: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: color.cornflower }}>{children}</span>
);

// Title S, the minimum title size: Maax Bold 60/68 White Smoke.
export const PanelTitle: React.FC<{
  readonly start: number;
  readonly top: number;
  readonly children: React.ReactNode;
}> = ({ start, top, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: layout.margin,
        top,
        width: WIDTH,
        fontFamily: font.title,
        fontWeight: 700,
        fontSize: 60,
        lineHeight: "68px",
        color: color.whiteSmoke,
        ...rise(frame, at(start)),
      }}
    >
      {children}
    </div>
  );
};

// One line of the speaker's numbers: value Maax Bold 56/64 (400 wide), label Inter 32/40 at 78%.
// Rows go 96 px apart.
export const Row: React.FC<{
  readonly value: string;
  readonly label: string;
  readonly start: number;
  readonly top: number;
}> = ({ value, label, start, top }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top,
          width: WIDTH,
          display: "flex",
          alignItems: "baseline",
          gap: 28,
          ...rise(frame, at(start)),
        }}
      >
        <div
          style={{
            width: 400,
            flexShrink: 0,
            whiteSpace: "nowrap",
            fontFamily: font.title,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: "64px",
            color: color.whiteSmoke,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: font.text,
            fontSize: 32,
            lineHeight: "40px",
            color: color.whiteSmoke,
            opacity: 0.78,
          }}
        >
          {label}
        </div>
      </div>
      <Sfx from={at(start)} />
    </>
  );
};

// The result under the rows: a 2 px rule draws across, then the total counts up over 0.9 s
// in Maax Bold 88/96 Cornflower, with a rise under it. `step` keeps the count on round
// numbers (counting 20 000 000 by 1 000 000 reads; by 1 it is a blur of digits).
export const Total: React.FC<{
  readonly value: number;
  readonly unit: string;
  readonly start: number;
  readonly top: number;
  readonly step?: number;
  readonly format?: (n: number) => string;
}> = ({ value, unit, start, top, step = 1, format = (n) => n.toLocaleString("es-AR") }) => {
  const frame = useCurrentFrame();
  const t = at(start);
  const counted = interpolate(frame, [t, t + 27], [0, value / step], { ...clamp, easing: ease.out });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top,
          height: 2,
          width: interpolate(frame, [t - 6, t + 12], [0, WIDTH], { ...clamp, easing: ease.inOut }),
          backgroundColor: color.whiteSmoke,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top: top + 18,
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          ...rise(frame, t),
        }}
      >
        <div
          style={{
            fontFamily: font.title,
            fontWeight: 700,
            fontSize: 88,
            lineHeight: "96px",
            color: color.cornflower,
          }}
        >
          {format(Math.round(counted) * step)}
        </div>
        <div style={{ fontFamily: font.text, fontWeight: 600, fontSize: 32, color: color.whiteSmoke }}>
          {unit}
        </div>
      </div>
      <Sfx from={t - 6} file="rise" volume={0.18} />
    </>
  );
};

// What ASOME does, as IconCards two per row (436 wide, 16 apart, rows 156 apart from `top`),
// each landing on its spoken word. Labels are the speaker's words; no support line.
const HALF_CARD = (WIDTH - 16) / 2;
export const ServiceGrid: React.FC<{
  readonly top: number;
  readonly items: ReadonlyArray<{ readonly label: string; readonly icon: Icon; readonly start: number }>;
}> = ({ top, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {items.map(({ label, icon, start }, k) => (
        <IconCard
          key={label}
          name={`Card: ${label}`}
          from={at(start)}
          premountFor={fps}
          icon={icon}
          style={{
            left: layout.margin + (k % 2) * (HALF_CARD + 16),
            top: top + Math.floor(k / 2) * 156,
            minWidth: 0,
            width: HALF_CARD,
            ...rise(frame, at(start)),
          }}
        >
          {label}
        </IconCard>
      ))}
      {items.map(({ label, start }) => (
        <Sfx key={label} from={at(start)} />
      ))}
    </>
  );
};
