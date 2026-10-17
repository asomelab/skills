import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import type React from "react";
import {
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { color, ease, font, layout } from "./brand";

// Penn Blue plate content for any "more X with the same Y" message: a two-line
// title (second line in Cornflower) and a diagram where one line rises and a neutral
// reference stays flat. Direct labels in text color, no axes, no invented numbers.
// Lines are 6px on the 1080 canvas so they still read at 33% size (brand legibility rule).
// Timing is local: it starts drawing as soon as the plate mounts (see motion-recipes.md).

type GrowthPlateProps = {
  readonly title: string; // first line, White Smoke
  readonly highlight: string; // second line, Cornflower (1-4 words)
  readonly risingLabel: string; // what grows, e.g. "Facturación"
  readonly flatLabel: string; // what stays the same, e.g. "Estructura"
  readonly style?: React.CSSProperties;
};

const CHART_W = 888;
const CHART_H = 300;
const BASE_Y = 270;
const REVENUE = `M 0 ${BASE_Y} C 300 262, 560 200, ${CHART_W} 24`;
const STRUCTURE = `M 0 ${BASE_Y} L ${CHART_W} ${BASE_Y}`;
const REVENUE_LENGTH = getLength(REVENUE);

const GrowthPlateInner: React.FC<GrowthPlateProps> = ({
  title,
  highlight,
  risingLabel,
  flatLabel,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const revenue = interpolate(frame, [0.25 * fps, 1.45 * fps], [0, 1], {
    ...clamp,
    easing: ease.inOut,
  });
  const structure = interpolate(frame, [1.3 * fps, 2.4 * fps], [0, 1], {
    ...clamp,
    easing: ease.inOut,
  });
  const head = getPointAtLength(REVENUE, REVENUE_LENGTH * revenue);

  return (
    <Interactive.Div
      style={{
        position: "absolute",
        left: layout.margin,
        top: 838,
        width: CHART_W,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: font.title,
          fontWeight: 700,
          fontSize: 72,
          lineHeight: "78px",
          color: color.whiteSmoke,
        }}
      >
        <div
          style={{
            opacity: interpolate(
              frame,
              [0.05 * fps, 0.45 * fps],
              [0, 1],
              clamp,
            ),
            translate: interpolate(
              frame,
              [0.05 * fps, 0.65 * fps],
              ["0px 36px", "0px 0px"],
              {
                ...clamp,
                easing: ease.out,
              },
            ),
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: color.cornflower,
            opacity: interpolate(
              frame,
              [0.15 * fps, 0.55 * fps],
              [0, 1],
              clamp,
            ),
            translate: interpolate(
              frame,
              [0.15 * fps, 0.75 * fps],
              ["0px 36px", "0px 0px"],
              {
                ...clamp,
                easing: ease.out,
              },
            ),
          }}
        >
          {highlight}
        </div>
      </div>
      <svg
        width={CHART_W}
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        style={{ marginTop: 48, overflow: "visible" }}
      >
        <path
          d={STRUCTURE}
          stroke={color.whiteSmoke}
          strokeOpacity={0.45}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          {...evolvePath(structure, STRUCTURE)}
        />
        <path
          d={REVENUE}
          stroke={color.cornflower}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          {...evolvePath(revenue, REVENUE)}
        />
        {head && revenue > 0 ? (
          <circle
            cx={head.x}
            cy={head.y}
            r={12}
            fill={color.cornflower}
            stroke={color.pennBlue}
            strokeWidth={4}
          />
        ) : null}
        <text
          x={CHART_W - 40}
          y={34}
          textAnchor="end"
          fill={color.whiteSmoke}
          fontFamily={font.text}
          fontWeight={600}
          fontSize={34}
          opacity={interpolate(frame, [1.3 * fps, 1.6 * fps], [0, 1], clamp)}
        >
          {risingLabel}
        </text>
        <text
          x={CHART_W}
          y={BASE_Y - 24}
          textAnchor="end"
          fill={color.whiteSmoke}
          fillOpacity={0.72}
          fontFamily={font.text}
          fontWeight={600}
          fontSize={34}
          opacity={interpolate(frame, [2.3 * fps, 2.6 * fps], [0, 1], clamp)}
        >
          {flatLabel}
        </text>
      </svg>
    </Interactive.Div>
  );
};

const growthPlateSchema = {
  title: { type: "string", default: "", description: "Title, first line" },
  highlight: {
    type: "string",
    default: "",
    description: "Title, Cornflower line",
  },
  risingLabel: {
    type: "string",
    default: "",
    description: "Rising line label",
  },
  flatLabel: { type: "string", default: "", description: "Flat line label" },
} as const satisfies InteractivitySchema;

export const GrowthPlate = Interactive.withSchema({
  Component: GrowthPlateInner,
  componentName: "GrowthPlate",
  schema: growthPlateSchema,
  wrapInSequence: true,
});
