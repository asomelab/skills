# The videos repo: where every reel's source lives

Every ASOME reel's source is committed, so anyone can rebuild it or make a variation later.
The standard is the **private** GitHub repo `asomelab/videos`: one Remotion project, one folder
per reel, one shared brand system. Used by `asome-video` and `asome-video-producto`.

## Layout

```
~/Documents/asome-videos/videos/        (or $ASOME_VIDEOS_DIR) — clone of asomelab/videos
  src/Root.tsx                          registers every reel's <Compositions />
  src/brand.tsx, Captions.tsx, EndCard.tsx, IconCard.tsx, GrowthPlate.tsx, ReelCover.tsx
                                        the shared ASOME system
  src/<tema>/                           one reel: Compositions.tsx (ids <tema>, <tema>-portada…),
                                        id.ts, and its code (Reel.tsx + cuts.ts + speech.ts for a
                                        talking head; Promo.tsx + timeline.ts + scenes/ for a product)
  public/fonts/Maax-*.ttf               versioned HERE only, because the repo is private
  public/brand/, public/audio/          shared logo SVGs and sound kit
  public/<tema>/                        the reel's media: cover-frame.jpg, voz.mp3, client assets
  docs/<tema>/                          guion.txt, brief.md, copy and SRT of each delivery
  scripts/                              shared tools (npm run cut, render, drive…)
  .reel                                 the reel the npm scripts work on (local, not in git)
```

`scripts/new-reel.sh <tema>` (asome-video) prepares all of it: it reuses or clones the repo
(falls back to a local `git init` without access), copies whatever shared file is missing,
creates `src/<tema>/` and `public/<tema>/`, registers the reel in `src/Root.tsx` and writes
`.reel`. Every npm script reads `.reel`; `REEL=<tema> npm run …` works on another reel.

## What is committed and what is not

| Committed | Never committed |
|---|---|
| `src/<tema>/` (all the reel's code, `captions-raw.json`, `voz-words.json`) | Raw footage (`public/**/*.mov`, `*.mp4`): backed up in the ASOME Drive, `workspace/resources/crudos/<REEL TEMA>/` |
| `public/<tema>/cover-frame.jpg`, `voz.mp3` (an AI voice cannot be regenerated identically) | Pre-cuts `cut.mp4` / `blend.mp4` (`npm run cut` rebuilds them) |
| Client assets in `public/<tema>/` (logos, open-licence fonts): needed to rebuild, the repo is private | Generated audio (`public/**/*.wav`: `npm run audio`, `make-beat.mjs`), `out/`, `public/qa/` |
| `docs/<tema>/` (script, brief, copy package, SRT) | `.env*`, API keys, tokens, passwords: anywhere, ever |
| Maax in `public/fonts/` (asomelab/videos only) | Maax in any other repo, above all the public `asomelab/skills` |

A client font with a commercial licence goes in `.gitignore` and the README says where it comes
from. Before every commit, run `git status --short` and read the list: nothing from the right
column may appear. If a key or password ever lands in a file or a commit, it is exposed: tell
the user to rotate it the same day, and remove it before pushing.

## The raws

Copy each raw to the ASOME Drive (`workspace/resources/crudos/<REEL TEMA>/`, the Drive for
desktop folder; `<REEL TEMA>` in capitals, e.g. `REEL CONSEJO SOFTWARE`) as soon as you have it.
Without Drive for desktop, ask the user to upload it there. The reel's README section says which
file it is and how it becomes `public/<tema>/clip.mp4`.

## Commits (asome-commit conventions)

Conventional commits, scope = the reel's `tema`, Spanish description, imperative:

| Milestone | Commit |
|---|---|
| Plan approved (Fase 4 / script approved) | `feat(<tema>): plan de edición aprobado` — the folder, `cuts.ts` or `guion.txt`/`brief.md`, the README section draft |
| First full build that lints | `feat(<tema>): primer armado completo` |
| Final delivery | `feat(<tema>): versión final vNN` — final code, `docs/<tema>/` copy + SRT, README section complete |
| A later variation | `feat(<tema>): versión corta de 30 s`, `fix(<tema>): corrige subtítulo` |
| Shared system changes | `refactor(brand): …` or `chore(videos): …`, in their own commit |

Stage paths explicitly (`git add src/<tema> public/<tema> docs/<tema> README.md …`), never
`git add -A`. End every message with the co-author trailer the session gives (asome-commit).
After each commit, `git push` (on `main`, or on the branch the team uses). If the push is
rejected because the remote moved: `git pull --rebase`, then push again. Never force-push.
With a local repo (no access), commit the same way and tell the user the code is only on their
machine until someone with access adds the remote (`git remote add origin …` + `git push`).

## The README section

The repo's `README.md` has one section per reel, newest last, in this shape:

```markdown
### <AAAA-MM-DD> · <Título> — `<tema>`
- Tipo: talking head (asome-video) | producto (asome-video-producto).
- Código: `src/<tema>/` — qué hace cada archivo en una línea.
- Crudo: `<archivo>` (Drive `crudos/<REEL TEMA>`) → `public/<tema>/clip.mp4`: <comando si hubo conversión>.
- Reconstruir: `echo <tema> > .reel` · `npm run cut` · `npm run transcribe -- public/<tema>/cut.mp4 es src/<tema>/captions-raw.json` (si cambian los cortes) · `npm run audio -- <segundos>` · `npm run render -- <tema>`.
- Entregables: Drive `ASOME/marketing/reels/<AAAA-MM-DD> <tema>/` · copy en `docs/<tema>/`.
- Fácil de variar: <lo que se cambia sin rearmar: tomas en cuts.ts, SPLITS, cierre, portada, voz, versión corta…>.
```

For a product reel, "Reconstruir" is `node scripts/make-beat.mjs …` (the flags from
`timeline.ts`) and `bash scripts/render-producto.sh <tema>`; the voice is already committed.

## First reel from the skill in an existing repo

The repo may predate this skill version, so `new-reel.sh` prints `DIFIERE <file>` for shared
files that differ from the template (it never overwrites them). A new reel needs the template's
versions (for example `rise`, `PhotoGradient` and `Signature` in `brand.tsx`, `frame` and
`faceYInFrame` in `ReelCover`, the per-reel bed in `make-audio.mjs`). Merge each one by hand,
keeping what older reels use (their extra sounds, their props), so that `npm run lint` passes
for the whole repo and one still of an older reel renders as before. Commit it alone
(`refactor(brand): sistema compartido de asome-video 1.2`) before the reel's own commits, and
mention it to the user in one line.
