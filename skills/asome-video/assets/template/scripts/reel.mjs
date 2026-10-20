// The reel being edited: $REEL, or the name new-reel.sh left in .reel (the repo root, not in git).
// Every reel lives in src/<tema>/ (code) and public/<tema>/ (its media); scripts run from the root.
import { existsSync, readFileSync } from "node:fs";

export const currentReel = () => {
  const r = (process.env.REEL || (existsSync(".reel") ? readFileSync(".reel", "utf8") : "")).trim();
  if (!r || !existsSync(`src/${r}`)) {
    throw new Error(
      `No sé qué reel editar (src/${r || "<tema>"} no existe). Usá REEL=<tema> o bash new-reel.sh <tema>.`,
    );
  }
  return r;
};
