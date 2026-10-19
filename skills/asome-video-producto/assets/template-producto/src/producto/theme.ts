import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// The CLIENT product's look. It lives only inside device screens; the reel canvas around it
// is ASOME (../brand.tsx). Fill it in Fase 2 from the client repo: design tokens file, CSS
// variables, Tailwind config. Copy hex values, never guess them.

// Fase 0 naming permission. name "" = the product may not be named: then its name, logo, app
// icon and URL appear nowhere (they identify the client too), the reveal label reads
// "CASO · <kind>" and the honest line "Interfaz del producto · datos de ejemplo".
export const PRODUCT: { readonly name: string; readonly kind: string; readonly url: string } = {
  name: "Producto", // as it may appear on screen
  kind: "Plataforma de pedidos", // generic description, used when name is ""
  url: "app.producto.com", // laptop address bar; "" hides it (always hidden when name is "")
};

export const p = {
  brand: "#3B82F6", // primary
  surface: "#FFFFFF", // app background
  raised: "#F4F4F5", // cards
  border: "#E4E4E7",
  text: "#18181B",
  textMuted: "#71717A",
  success: "#16A34A",
  warning: "#EAB308",
  error: "#DC2626",
} as const;

// Separate family names so the client's faces never collide with ASOME's Maax/Inter, even
// when the client also uses Inter. The fallback stack renders until the files are added.
export const pFont = {
  heading: "Producto Heading, system-ui, sans-serif",
  body: "Producto Body, system-ui, sans-serif",
} as const;

// Font files copied from the client repo into public/producto/fonts/ (never into the skills
// repo). Example: ["700", "Brand-Bold.ttf"]. Empty = system fallback.
const HEADING_FILES: ReadonlyArray<readonly [string, string]> = [];
const BODY_FILES: ReadonlyArray<readonly [string, string]> = [];

for (const [weight, file] of HEADING_FILES) {
  loadFont({ family: "Producto Heading", url: staticFile(`producto/fonts/${file}`), weight });
}
for (const [weight, file] of BODY_FILES) {
  loadFont({ family: "Producto Body", url: staticFile(`producto/fonts/${file}`), weight });
}

// Type scale (px) and radii from the client's tokens, at native app size.
export const pType = {
  h1: [32, 40],
  h2: [24, 32],
  body: [16, 24],
  sm: [14, 20],
  caption: [12, 16],
} as const;

export const pRadius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

// Logos and icons copied from the client repo into public/producto/ (staticFile paths).
export const pAsset = {
  logo: "producto/logo.png",
  appIcon: "producto/icon.png",
} as const;
