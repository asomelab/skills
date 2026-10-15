import type { Icon } from "@tabler/icons-react";
import type React from "react";
import { Interactive, type InteractivitySchema } from "remotion";
import { color, font, radius } from "./brand";

// "Una tarjeta, una idea" (Sistema visual, p.13), horizontal variant for light
// surfaces: white fill, 2px #D2D7F1 border, radius 28, Persian icon in a tinted box.
// Tabler icons share the brand's construction: 24-unit grid, stroke 2, round caps.

type IconCardProps = {
  readonly children: React.ReactNode;
  readonly support?: string;
  readonly icon: Icon;
  readonly style?: React.CSSProperties;
};

const IconCardInner: React.FC<IconCardProps> = ({
  children,
  support,
  icon: IconGlyph,
  style,
}) => (
  <Interactive.Div
    style={{
      position: "absolute",
      minWidth: 640,
      display: "flex",
      alignItems: "center",
      gap: 28,
      padding: 24,
      boxSizing: "border-box",
      borderRadius: radius.card,
      backgroundColor: "#FFFFFF",
      border: `2px solid ${color.cardBorder}`,
      boxShadow: "0 12px 32px rgba(1, 31, 91, 0.16)",
      ...style,
    }}
  >
    <div
      style={{
        width: 88,
        height: 88,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.iconBox,
        backgroundColor: color.iconTint,
      }}
    >
      <IconGlyph size={48} stroke={2} color={color.persianBlue} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: font.title,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: "46px",
          color: color.pennBlue,
        }}
      >
        {children}
      </div>
      {support ? (
        <div
          style={{
            fontFamily: font.text,
            fontWeight: 400,
            fontSize: 30,
            lineHeight: "38px",
            color: color.textMuted,
          }}
        >
          {support}
        </div>
      ) : null}
    </div>
  </Interactive.Div>
);

const iconCardSchema = {
  ...Interactive.childrenSchema,
  support: {
    type: "string",
    default: "",
    description: "Support line",
  },
} as const satisfies InteractivitySchema;

export const IconCard = Interactive.withSchema({
  Component: IconCardInner,
  componentName: "IconCard",
  schema: iconCardSchema,
  wrapInSequence: true,
});
