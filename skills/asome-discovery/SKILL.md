---
name: asome-discovery
description: >
  Standardizes ASOME product discovery — the docs/product/ doc set, the 7-block user-story
  template, and the decision/assumption registers — across new products, competitor
  research, and new modules. Never invents an unknown value: every gap becomes a tagged
  M-NN register entry and a batched question back to the user.
  Trigger: "product research", "investigar producto", "nuevo producto", "escribir HUs",
  "planificar módulo", "descubrimiento de producto", "analizar competidor", "investigar
  competencia", "reverse engineer <producto>", or when starting product discovery for a new
  or existing ASOME project.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Product Discovery

Runs the product-discovery method observed across `asome-crm`, `asome-clarity`,
`lannis-clone`, and `de-wall`: a `docs/product/` doc set, `HU-###` user stories in a fixed
7-block template, and two registers (`decisiones.md`, `mediciones-pendientes.md`) that make
every open question and every unconfirmed number explicit instead of silently assumed.

**Executes directly once Fase 0 is answered — no preview step beyond that gate.**

This is the layer **before** SDD. It decides *what* to build and *why* — never technology,
framework, or schema. It never creates a GitHub issue or a spec.

---

## Modes

| Mode | Invocation | Produces |
|---|---|---|
| `nuevo` | `/asome-discovery nuevo <producto>` | full `docs/product/` skeleton, épicas, roadmap, `hu-index.md`, Fase 1 HUs |
| `investigar` | `/asome-discovery investigar <competidor\|dominio>` | `investigacion/<slug>.md` + glossary updates + `M-NN` entries |
| `fase` | `/asome-discovery fase <N>` | writes the `esbozada` rows of phase N as full HU files, flips them to `escrita` |
| `modulo` | `/asome-discovery modulo <nombre>` | new épica + index rows + HUs, folded into an existing doc set |
| `auditar` | `/asome-discovery auditar` | convention/gap report against this skill's templates — read-only, no edits |

If invoked with no mode, infer from context (existing `docs/product/` present → `fase` or
`modulo`; nothing present → `nuevo`) and confirm the inference in Fase 0 rather than guessing
silently.

---

## Phase 0 — kickoff questions (the only blocking gate)

Ask once, batched, before writing anything. Skip a question only if the answer is already
unambiguous from context (e.g. an existing `docs/product/README.md` already states the
language and evidence mode).

1. **Idioma** — español rioplatense/voseo (the default across all four sibling repos) or
   another language?
2. **Modo(s) de investigación** — desk teardown, field research, market/commercial, visual
   teardown, or a combination? (See `references/investigacion-templates.md`.)
3. **¿Ya existe un `docs/product/`?** — extend it (read its actual conventions first — they
   may already have drifted from this skill's canon, see Known gotchas) or start fresh.
4. **Actor no humano** — is there a bot/synchronizer/AI agent that deserves its own persona
   in `01-usuarios.md`, the way every sibling repo has one?
5. **Base de evidencia** — internal discovery with no baseline, reverse-engineering a live
   competitor, primary field research, or a mix? This decides the wording of the `Evidencia`
   clause in `docs/product/README.md` and which `investigacion/` templates apply.
6. **¿Entregable interno o de cliente?** — internal discovery uses the default HU template
   (no estimation fields); a contracted/client deliverable may need the MoSCoW + Fibonacci +
   `Trazabilidad` variant (`de-wall`'s pattern) — confirm before adding fields the canon
   doesn't have.

Never guess these six. Everything else — file names, section structure, ID schemes — is
already fixed by the templates below.

---

## The doc set

Fixed skeleton: root `README.md` → `docs/product/README.md` (the real conventions file) →
`00`…`10` numbered docs → `decisiones.md` + `mediciones-pendientes.md` → `hu/hu-index.md` +
`hu/HU-###-slug.md` → `investigacion/`. Full templates, section-by-section, in
`references/doc-set-template.md` — use it verbatim for `nuevo`, and as the checklist for
`auditar`.

---

## HUs

The 7-block template (metadata table + Historia · Descripción funcional · Flujo · Reglas y
criterios · Fuera de alcance · Principio), the `HU-###` global-and-stable ID rule, decade-per-
phase numbering with deliberate gaps, and the write-only-the-current-phase rule. Full
template and the `hu-index.md` skeleton in `references/hu-template.md`.

---

## Research modes

Four shapes — desk teardown, domain & alternatives, field research, visual teardown — chosen
per project in Fase 0. Full templates in `references/investigacion-templates.md`.

---

## Gap policy — never invent

This is the rule that makes the whole method trustworthy. Five layers, all lifted from
`lannis-clone`, the strictest sibling:

1. **Constitution.** State it in `docs/product/README.md` §Convenciones: *"Un número sin
   etiqueta y sin `M-NN` es un defecto del documento."*
2. **Inline tag**, always backticked, always carrying the ID:
   `` `(observado en <fuente> — M-NN)` `` or `` `(estimado, sin medir — M-NN)` ``.
3. **Doc-level disclaimer** blockquote when every figure in a doc is borrowed, near the top
   of that doc.
4. **`M-NN` register entry** in `mediciones-pendientes.md` with its four fixed labels,
   including the blast radius (`Qué afirmación sostiene.` — what breaks if this is wrong).
5. **Refusal to invent, pushed into the spec itself.** When a HU depends on an unconfirmed
   value: don't pick a plausible number. Name the assumption in prose citing `M-NN`, convert
   it into a configurable `RN-N` ("se define como configuración explícita, no un valor
   copiado sin confirmar"), and write the acceptance criteria against the placeholder, not
   the guess. `lannis-clone/docs/product/hu/HU-016-alerta-de-tope-de-categoria.md` is the
   reference implementation — read it before writing a HU with any unconfirmed number.

**Decisions that need the user, not a made-up number,** go to `decisiones.md` `## Abiertas`
as `D-NN`: `**Por qué importa.**` / `**Recomendación:**` (offered, never silently adopted) /
`**Estado:**` / `**Bloquea:**`.

**When to ask:** accumulate every open `D-NN`/`M-NN` raised while writing a batch of work,
then ask them **all at once at the phase boundary** — end of the doc set, end of each phase's
HU batch, end of a research pass. Don't interrupt mid-file for a single gap; don't silently
resolve a product-level decision either. The one exception is Fase 0 itself, which blocks
before any writing starts.

---

## Registers

`decisiones.md` (`D-NN`, open questions the user must resolve) and `mediciones-pendientes.md`
(`M-NN`, unconfirmed values/rules). Both share one architecture: purpose blockquote →
resolved bucket → open bucket → a `## Cómo se usa este archivo` rule that **forbids
deletion** — an entry graduates by growing a value and a date, never by disappearing. Full
templates in `references/registros-template.md`. Standardize the filename on
`decisiones.md` — `asome-crm`'s `decisiones-abiertas.md` is legacy, don't reproduce it.

---

## Writing rules

Twelve invariants verified identical across all four sibling repos:

- `·` (U+00B7 middle dot) as the separator everywhere — H1s, épica names, phase names, inline
  lists, footers. Never a hyphen or colon for this role.
- `---` horizontal rules between every top-level block in index/decision/epic/roadmap files.
- A `>` blockquote directly under every H1 stating derivation and/or non-scope.
- Relative markdown links with backticked filenames: `` [`04-modelo-de-dominio.md`](04-modelo-de-dominio.md) ``.
- Bold-label fields: period after the label when it's followed by prose (`**Objetivo.**`),
  colon when followed by an inline value (`**Promesa:**`).
- **No emojis, no marketing language, no superlatives** — sobrio, en voseo si el idioma es
  español. This is an explicit, enforced rule in every sibling repo's README.
- Mermaid `erDiagram` is the only diagram type, and only in `04-modelo-de-dominio.md`.
- Every doc set has a "si leés un solo documento" pointer to `03-principios.md`.
- Every phase in `07-roadmap-y-fases.md` has a `Criterio de salida` written as an observable
  condition with an explicit time window.
- **The golden rule.** Every épica and every HU must be able to name the principle from `03`
  that justifies it. If the only justification is "the competitor has it" or "it'd be nice",
  cut it or re-derive it from the actual problem.
- Numbers without an `M-NN` tag are defects (see Gap policy above).
- HU IDs are global and stable — a HU moving between épicas or phases keeps its number.

---

## Handoff

Discovery ends where the next skill begins:

- **Technology, framework, schema decisions** → `/asome-sdd` (`sdd-ff`), never this skill.
- **GitHub issues** → `/asome-create-issue`, once a phase's HUs are written and approved.
- **Formal specs/acceptance contracts for implementation** → `/sdd-spec`, `/sdd-design`,
  `/sdd-tasks`.

State this handoff explicitly in the `Estado del descubrimiento` section of
`docs/product/README.md` when a phase's discovery is complete.

---

## Known gotchas

- `asome-crm` uses the legacy 9-section HU template (standalone `Actor principal` and
  `Flujos alternativos` sections, no `Fuente del dato`). Read it when auditing that repo;
  never emit it for new work — the canon is the 7-block template.
- Don't pre-write HUs for future phases — "no se pre-crean archivos que van a envejecer sin
  usarse" is enforced in every sibling repo. Only the current phase gets full files.
- Épica is a column in `hu-index.md`, never a folder.
- `de-wall` mixes concrete technology (AWS Cognito, SES) into acceptance criteria and puts
  all HUs in one file with MoSCoW/story points — that's its client-contract exception, not
  the default. Only follow it when Fase 0 confirms a client-deliverable context.
- `00-vision.md` §6 and `mediciones-pendientes.md` cite the same `M-NN` IDs — keep them in
  sync by hand; `lannis-clone` has a real drift here (its §6 swaps `M-02`/`M-03`) that
  `auditar` mode should catch, not repeat.
- A YAML-frontmatter, Obsidian-wikilink style (as in `de-wall/dewall-docs/`) is a valid
  variant for an Obsidian-vault-based project, but is not the default — this skill's
  templates use plain relative markdown links and no frontmatter unless Fase 0 says the
  target is an Obsidian vault.
