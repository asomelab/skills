import { Audio } from "@remotion/media";
import type React from "react";
import { interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { color, ease, font, layout } from "../../brand";
import { PRODUCT } from "../theme";
import { lead, type SceneId } from "../timeline";

// ASOME pieces every scene shares, so five agents in parallel produce one film.

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Frame on the rel(BEATS.x, scene) clock: 0 = SCENES[scene].from, negative during the slide-in. */
export const useSceneFrame = (scene: SceneId) => useCurrentFrame() - lead(scene);

/** Keyframe track on the useSceneFrame clock: [frame, value] pairs in frame order. Holds the first
 *  value before the first key and the last after the last; eases between keys (ease.inOut).
 *    const cam = track(f, [[0, focusCamera(sideARegions.screen, LAPTOP_SCREEN)], [30, focusCamera(sideARegions.kpis, LAPTOP_SCREEN)]], mixCamera);
 *  Same helper for cursor paths (lerpPt), scroll offsets and nav state (lerp). */
export type Key<V> = readonly [number, V];
export const track = <V,>(f: number, keys: readonly Key<V>[], mix: (a: V, b: V, t: number) => V, easing = ease.inOut): V => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, a] = keys[i - 1];
    const [t1, b] = keys[i];
    if (f <= t1) return mix(a, b, interpolate(f, [t0, t1], [0, 1], { ...clamp, easing }));
  }
  return keys[keys.length - 1][1];
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type Pt = { readonly x: number; readonly y: number };
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** ASOME arrival: fade 9 f + rise `dist` px over 16 f on ease.out, then hold. Optional exit at `outAt`. */
export const rise = (frame: number, at: number, outAt = Infinity, dist = 28): React.CSSProperties => {
  const out = outAt === Infinity ? 0 : interpolate(frame, [outAt, outAt + 10], [0, 1], { ...clamp, easing: ease.in });
  return {
    opacity: interpolate(frame, [at, at + 9], [0, 1], clamp) * (1 - out),
    translate: `0px ${interpolate(frame, [at, at + 16], [dist, 0], { ...clamp, easing: ease.out }) - 20 * out}px`,
  };
};

/** Label: Inter SemiBold 24 caps, White Smoke on the Penn Blue canvas (e.g. "CASO · PRODUCTO"). */
export const Label: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: layout.margin,
      fontFamily: font.text,
      fontWeight: 600,
      fontSize: 24,
      lineHeight: "30px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: color.whiteSmoke,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Title: Maax Bold, White Smoke, left at x 96, 888 wide, `highlight` (1-4 words) in Cornflower. */
export const Title: React.FC<{
  readonly text: string;
  readonly highlight?: string;
  readonly size?: 92 | 76 | 60; // Title XL / Title / Title S, never smaller
  readonly style?: React.CSSProperties;
}> = ({ text, highlight = "", size = 76, style }) => {
  const at = highlight ? text.indexOf(highlight) : -1;
  const line = { 92: 96, 76: 82, 60: 68 }[size];
  return (
    <div
      style={{
        position: "absolute",
        left: layout.margin,
        width: 888,
        fontFamily: font.title,
        fontWeight: 700,
        fontSize: size,
        lineHeight: `${line}px`,
        letterSpacing: "-0.01em",
        color: color.whiteSmoke,
        ...style,
      }}
    >
      {at === -1 ? (
        text
      ) : (
        <>
          {text.slice(0, at)}
          <span style={{ color: color.cornflower }}>{highlight}</span>
          {text.slice(at + highlight.length)}
        </>
      )}
    </div>
  );
};

/** The honest line under the product: "Interfaz de <producto> · datos de ejemplo" ("del producto" when unnamed). */
export const Honest: React.FC<{ readonly style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      left: layout.margin,
      fontFamily: font.text,
      fontWeight: 400,
      fontSize: 24,
      lineHeight: "30px",
      color: "rgba(245, 245, 245, 0.66)",
      ...style,
    }}
  >
    Interfaz {PRODUCT.name ? `de ${PRODUCT.name}` : "del producto"} · datos de ejemplo
  </div>
);

/** Soft SFX at a frame on the useSceneFrame clock: tick 0.18-0.22 when a card lands, whoosh-soft ~0.22 on moves. */
export const Sfx: React.FC<{ readonly scene: SceneId; readonly at: number; readonly src: string; readonly volume: number }> = ({
  scene,
  at,
  src,
  volume,
}) => (
  <Sequence from={at + lead(scene)} durationInFrames={24} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);
