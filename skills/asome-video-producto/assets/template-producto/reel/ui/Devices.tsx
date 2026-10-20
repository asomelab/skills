import type React from "react";
import { font } from "../../brand";
import { p, PRODUCT } from "../theme";

// Neutral device frames for the product screens (ASOME-authored, product-agnostic). Screen
// content is authored at native app size (web 1440x900, phone 390x844) and scaled to the
// requested width. No glow, no colored rim: the screen is the content, the frame stays quiet.
//
//   <Laptop width={880} camera={focusCamera({ x: 240, y: 120, w: 720, h: 450 }, LAPTOP_SCREEN)}
//           overlay={<Cursor x={600} y={300} press={p} />}>
//     <AdminHome />            // a 1440-wide screen component, native px
//   </Laptop>
//
// Camera moves between beats: mixCamera(a, b, interpolate(f, [t0, t1], [0, 1], { easing: ease.inOut })).
// focusCamera always takes the device's screen: a phone region is focusCamera(r, PHONE_SCREEN).
// Fitting a phone rect against the laptop screen over-zooms it ~3x, so there is no default.

export interface Camera {
  /** native screen px of the point shown at the center of the screen */
  readonly x: number;
  readonly y: number;
  /** zoom; 1 = whole screen */
  readonly scale: number;
}

export const LAPTOP_SCREEN = { w: 1440, h: 900 } as const;
export const PHONE_SCREEN = { w: 390, h: 844 } as const;

type Size = { readonly w: number; readonly h: number };
/** A region of a screen in native px (the screen agents export one per beat: <lado>Regions). */
export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

/** Camera that fits a native-px rect inside the screen of the device that shows it (letterboxed). */
export const focusCamera = (rect: Rect, screen: Size): Camera => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
  scale: Math.min(screen.w / rect.w, screen.h / rect.h),
});

/** Blend two cameras (t 0..1, ease it outside). Scale mixes geometrically so zooms feel even. */
export const mixCamera = (a: Camera, b: Camera, t: number): Camera => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  scale: a.scale * Math.pow(b.scale / a.scale, t),
});

const cameraTransform = (cam: Camera | undefined, s: Size) => {
  const c = cam ?? { x: s.w / 2, y: s.h / 2, scale: 1 };
  return `translate(${s.w / 2 - c.x * c.scale}px, ${s.h / 2 - c.y * c.scale}px) scale(${c.scale})`;
};

// Children render at native size inside a clipped viewport; the camera moves them.
const Viewport: React.FC<{
  readonly size: Size;
  readonly camera?: Camera;
  readonly children: React.ReactNode;
}> = ({ size, camera, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size.w,
        transformOrigin: "0 0",
        transform: cameraTransform(camera, size),
      }}
    >
      {children}
    </div>
  </div>
);

interface DeviceProps {
  /** rendered width of the whole device on the canvas */
  readonly width: number;
  readonly children?: React.ReactNode;
  readonly camera?: Camera;
  /** fixed UI above the camera (native screen px, not moved by the camera): tab bars, toasts, cursors */
  readonly overlay?: React.ReactNode;
  /** style for the screen surface (e.g. background) */
  readonly screenStyle?: React.CSSProperties;
  readonly style?: React.CSSProperties;
}

// ---------------------------------------------------------------- Laptop
const L = {
  bezelX: 22,
  bezelTop: 28,
  bezelBottom: 30,
  bar: 44, // browser chrome height above the 1440x900 viewport
  baseOver: 30, // deck overhang each side (kept small: the screen is the content, ~93% of the width)
  baseH: 20,
};

/** Native (unscaled) outer size of the laptop, to plan layouts: height = width * ratio. */
export const laptopRatio = (addressBar = true, base = true) => {
  const w = LAPTOP_SCREEN.w + L.bezelX * 2 + (base ? L.baseOver * 2 : 0);
  const h = LAPTOP_SCREEN.h + (addressBar ? L.bar : 0) + L.bezelTop + L.bezelBottom + (base ? L.baseH : 0);
  return h / w;
};

export const Laptop: React.FC<
  DeviceProps & { readonly addressBar?: boolean; readonly url?: string; readonly base?: boolean }
> = ({ width, children, camera, overlay, screenStyle, style, addressBar = true, url = PRODUCT.name ? PRODUCT.url : "", base = true }) => {
  const lidW = LAPTOP_SCREEN.w + L.bezelX * 2;
  const screenH = LAPTOP_SCREEN.h + (addressBar ? L.bar : 0);
  const lidH = screenH + L.bezelTop + L.bezelBottom;
  const totalW = lidW + (base ? L.baseOver * 2 : 0);
  const totalH = lidH + (base ? L.baseH : 0);
  const s = width / totalW;
  return (
    <div style={{ width, height: totalH * s, position: "relative", ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: totalW, height: totalH, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {/* lid */}
        <div
          style={{
            position: "absolute",
            left: base ? L.baseOver : 0,
            top: 0,
            width: lidW,
            height: lidH,
            borderRadius: "30px 30px 8px 8px",
            background: "#0c0c0d",
            boxShadow: "inset 0 0 0 2px #2c2c2e",
          }}
        >
          <div style={{ position: "absolute", left: lidW / 2 - 4, top: 11, width: 8, height: 8, borderRadius: 4, background: "#1d1d20" }} />
          <div
            style={{
              position: "absolute",
              left: L.bezelX,
              top: L.bezelTop,
              width: LAPTOP_SCREEN.w,
              height: screenH,
              borderRadius: 8,
              overflow: "hidden",
              background: p.surface,
            }}
          >
            {addressBar ? <BrowserBar url={url} /> : null}
            <div style={{ position: "absolute", left: 0, top: addressBar ? L.bar : 0, width: LAPTOP_SCREEN.w, height: LAPTOP_SCREEN.h, background: p.surface, ...screenStyle }}>
              <Viewport size={LAPTOP_SCREEN} camera={camera}>
                {children}
              </Viewport>
              {overlay}
            </div>
          </div>
        </div>
        {/* deck: thin base with the opening notch */}
        {base ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: lidH - 2,
              width: totalW,
              height: L.baseH,
              borderRadius: "4px 4px 26px 26px",
              background: "linear-gradient(to bottom, #3a3a3d 0%, #2a2a2c 45%, #161618 100%)",
            }}
          >
            <div style={{ position: "absolute", left: totalW / 2 - 110, top: 0, width: 220, height: 8, borderRadius: "0 0 10px 10px", background: "#1b1b1d" }} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BrowserBar: React.FC<{ readonly url: string }> = ({ url }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: LAPTOP_SCREEN.w,
      height: L.bar,
      background: "#1c1c1e",
      borderBottom: "1px solid #2c2c2e",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
      padding: "0 16px",
    }}
  >
    <div style={{ display: "flex", gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "#4a4a4d" }} />
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        left: LAPTOP_SCREEN.w / 2 - 210,
        top: 8,
        width: 420,
        height: 28,
        borderRadius: 8,
        background: "#2c2c2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontFamily: font.text,
        fontSize: 14,
        fontWeight: 500,
        color: "#d2d2d2",
      }}
    >
      {url ? (
        <>
          <svg width="10" height="12" viewBox="0 0 10 12">
            <rect x="0.5" y="5" width="9" height="6.5" rx="1.5" fill="#a3a3a3" />
            <path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#a3a3a3" strokeWidth="1.4" fill="none" />
          </svg>
          {url}
        </>
      ) : null}
    </div>
  </div>
);

// ---------------------------------------------------------------- Phone
const P = { bezel: 13, radius: 56, island: { w: 124, h: 36, top: 11 } };

/** Native outer size ratio of the phone (height / width). */
export const phoneRatio = () => (PHONE_SCREEN.h + P.bezel * 2) / (PHONE_SCREEN.w + P.bezel * 2);

export const Phone: React.FC<
  DeviceProps & {
    readonly statusBar?: boolean;
    readonly homeIndicator?: boolean;
    readonly time?: string;
    /** status bar + home indicator color: white on dark apps, near-black on light ones */
    readonly ink?: string;
  }
> = ({ width, children, camera, overlay, screenStyle, style, statusBar = true, homeIndicator = true, time = "9:41", ink = "#ffffff" }) => {
  const bodyW = PHONE_SCREEN.w + P.bezel * 2;
  const bodyH = PHONE_SCREEN.h + P.bezel * 2;
  const s = width / bodyW;
  const btn = (side: "l" | "r", top: number, h: number) => (
    <div style={{ position: "absolute", [side === "l" ? "left" : "right"]: -3, top, width: 4, height: h, borderRadius: 2, background: "#2a2a2c" }} />
  );
  return (
    <div style={{ width, height: bodyH * s, position: "relative", ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: bodyW, height: bodyH, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {btn("l", 150, 30)}
        {btn("l", 205, 56)}
        {btn("l", 275, 56)}
        {btn("r", 230, 88)}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: P.radius + P.bezel,
            background: "#0b0b0c",
            boxShadow: "inset 0 0 0 2.5px #3a3a3d, inset 0 0 0 5px #121214",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: P.bezel,
            top: P.bezel,
            width: PHONE_SCREEN.w,
            height: PHONE_SCREEN.h,
            borderRadius: P.radius,
            overflow: "hidden",
            background: p.surface,
            ...screenStyle,
          }}
        >
          <Viewport size={PHONE_SCREEN} camera={camera}>
            {children}
          </Viewport>
          {overlay}
          {statusBar ? <StatusBar time={time} ink={ink} /> : null}
          <div
            style={{
              position: "absolute",
              left: PHONE_SCREEN.w / 2 - P.island.w / 2,
              top: P.island.top,
              width: P.island.w,
              height: P.island.h,
              borderRadius: P.island.h / 2,
              background: "#000",
            }}
          />
          {homeIndicator ? (
            <div style={{ position: "absolute", left: PHONE_SCREEN.w / 2 - 67, top: PHONE_SCREEN.h - 13, width: 134, height: 5, borderRadius: 3, background: ink }} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const StatusBar: React.FC<{ readonly time: string; readonly ink: string }> = ({ time, ink }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_SCREEN.w, height: 47, color: ink }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 128,
        top: 15,
        textAlign: "center",
        fontFamily: font.text,
        fontWeight: 600,
        fontSize: 17,
        lineHeight: "22px",
        letterSpacing: -0.3,
      }}
    >
      {time}
    </div>
    <svg style={{ position: "absolute", left: 290, top: 19 }} width="76" height="13" viewBox="0 0 76 13">
      {/* cellular */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 4.6} y={9 - i * 2.6} width="3.2" height={3.4 + i * 2.6} rx="0.9" fill={ink} />
      ))}
      {/* wifi */}
      <g transform="translate(25 0.6)" fill={ink}>
        <path d="M7.7 2.2a9.6 9.6 0 0 1 6.6 2.6l1.1-1.1A11.1 11.1 0 0 0 7.7 .6 11.1 11.1 0 0 0 0 3.7l1.1 1.1a9.6 9.6 0 0 1 6.6-2.6z" />
        <path d="M7.7 5.3a6.5 6.5 0 0 1 4.4 1.7l1.1-1.1a8 8 0 0 0-5.5-2.2 8 8 0 0 0-5.5 2.2L3.3 7a6.5 6.5 0 0 1 4.4-1.7z" />
        <path d="M7.7 8.4c.9 0 1.6.3 2.2.9L7.7 11.5 5.5 9.3c.6-.6 1.4-.9 2.2-.9z" />
      </g>
      {/* battery */}
      <rect x="47.5" y="1" width="24" height="11.4" rx="3.4" fill="none" stroke={ink} strokeOpacity="0.4" strokeWidth="1" />
      <rect x="49.4" y="2.9" width="19.5" height="7.6" rx="2" fill={ink} />
      <rect x="73" y="4.6" width="1.6" height="4.2" rx="0.8" fill={ink} fillOpacity="0.45" />
    </svg>
  </div>
);

// ---------------------------------------------------------------- pointers (put them in `overlay`)
/** macOS-style arrow at native screen px (tip = x,y). `press` 0..1 dips it for a click. */
export const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly press?: number; readonly size?: number; readonly opacity?: number }> = ({ x, y, press = 0, size = 26, opacity = 1 }) => (
  <svg
    width={size}
    height={size * 1.4}
    viewBox="0 0 20 28"
    style={{ position: "absolute", left: x - size * 0.1, top: y - size * 0.07, transform: `scale(${1 - 0.12 * press})`, transformOrigin: "10% 7%", opacity }}
  >
    <path d="M2 1.5v20.2l5-4.6 3.3 7.6 3.4-1.5-3.3-7.4h6.9z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/** Phone touch point: soft white disc. `press` 0..1 (fade it in/out around a tap). */
export const Touch: React.FC<{ readonly x: number; readonly y: number; readonly press?: number; readonly size?: number }> = ({ x, y, press = 1, size = 44 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: size / 2,
      background: "rgba(255,255,255,.28)",
      border: "1.5px solid rgba(255,255,255,.55)",
      boxSizing: "border-box",
      opacity: press,
      transform: `scale(${0.85 + 0.15 * press})`,
    }}
  />
);
