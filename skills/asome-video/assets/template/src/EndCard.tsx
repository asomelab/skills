import { IconMessage } from "@tabler/icons-react";
import type React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Interactive,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { color, ease, font, Handle, IsoMark, layout, radius } from "./brand";

// "Cierre visual" (Sistema visual, p.18) + "Bloque de cierre" (p.19):
// Penn Blue, complete logo in White Smoke, title with one Cornflower highlight,
// @ pill, closing block at the foot. Everything enters rising, then holds still.
// Its animation starts at its own frame 0: when it slides in on a sheet, mount it at 0
// inside an opaque Penn Blue sheet (Reel.tsx), never with a later `from`.

type EndCardProps = {
  readonly title: string;
  readonly highlight: string;
  readonly action: string;
};

const EndCardInner: React.FC<EndCardProps> = ({ title, highlight, action }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  const at = highlight ? title.indexOf(highlight) : -1;
  const before = at === -1 ? title : title.slice(0, at);
  const after = at === -1 ? "" : title.slice(at + highlight.length);

  return (
    <AbsoluteFill
      style={{ backgroundColor: color.pennBlue, overflow: "hidden" }}
    >
      <IsoMark
        fill="rgba(245, 245, 245, 0.06)"
        style={{
          position: "absolute",
          left: 470,
          top: 760,
          width: 1140,
          transformOrigin: "100% 100%",
          opacity: interpolate(frame, [0.2 * fps, 1 * fps], [0, 1], clamp),
          scale: interpolate(frame, [0.2 * fps, 2 * fps], [1.08, 1], {
            ...clamp,
            easing: ease.out,
          }),
        }}
      />
      <Img
        src={staticFile("brand/completo-white-smoke.svg")}
        style={{
          position: "absolute",
          left: layout.margin,
          top: 380,
          width: 150,
          opacity: interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0.4 * fps, 1 * fps],
            ["0px 28px", "0px 0px"],
            {
              ...clamp,
              easing: ease.out,
            },
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top: 572,
          width: 888,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 32,
        }}
      >
        <div
          style={{
            fontFamily: font.title,
            fontWeight: 700,
            fontSize: 76,
            lineHeight: "82px",
            color: color.whiteSmoke,
            textWrap: "balance",
            opacity: interpolate(frame, [0.6 * fps, 1 * fps], [0, 1], clamp),
            translate: interpolate(
              frame,
              [0.6 * fps, 1.2 * fps],
              ["0px 36px", "0px 0px"],
              {
                ...clamp,
                easing: ease.out,
              },
            ),
          }}
        >
          {before}
          {/* The highlight gets its own line so the accent never splits mid-phrase. */}
          {at === -1 ? null : (
            <span style={{ display: "block", color: color.cornflower }}>
              {highlight}
            </span>
          )}
          {after}
        </div>
        <Handle
          style={{
            opacity: interpolate(frame, [0.9 * fps, 1.2 * fps], [0, 1], clamp),
            translate: interpolate(
              frame,
              [0.9 * fps, 1.4 * fps],
              ["0px 20px", "0px 0px"],
              {
                ...clamp,
                easing: ease.out,
              },
            ),
          }}
        />
      </div>
      <Interactive.Div
        name="Closing block"
        style={{
          position: "absolute",
          left: layout.margin,
          top: 1300,
          width: 888,
          boxSizing: "border-box",
          padding: "40px 44px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          borderRadius: radius.card,
          backgroundColor: color.whiteSmoke,
          opacity: interpolate(frame, [1.2 * fps, 1.5 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [1.2 * fps, 1.8 * fps],
            ["0px 40px", "0px 0px"],
            {
              ...clamp,
              easing: ease.out,
            },
          ),
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            flexShrink: 0,
            borderRadius: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color.pennBlue,
          }}
        >
          <IconMessage size={48} stroke={2} color={color.whiteSmoke} />
        </div>
        <div
          style={{
            fontFamily: font.title,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: "50px",
            color: color.pennBlue,
          }}
        >
          {action}
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const endCardSchema = {
  title: { type: "string", default: "", description: "Title" },
  highlight: { type: "string", default: "", description: "Highlighted words" },
  action: { type: "string", default: "", description: "Closing action" },
} as const satisfies InteractivitySchema;

export const EndCard = Interactive.withSchema({
  Component: EndCardInner,
  componentName: "EndCard",
  schema: endCardSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
