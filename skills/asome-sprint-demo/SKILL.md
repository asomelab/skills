---
name: asome-sprint-demo
description: >
  Prepares an ASOME sprint demo (Sprint Review) end to end, from the project root: reads the
  sprint's issues from the GitHub Project board with gh, plus the sprint plan, milestones,
  releases and the docs/product doc set; asks only what GitHub cannot know, in one batched
  message; and emits a ready-to-paste Claude Design prompt that fills the "Sprint Review ASOME"
  template, the demo script and pre-demo checklist, and — after the demo — the same-day summary
  email that opens the validation window. Use it whenever someone is getting ready for a client
  demo or sprint review, even if they only ask "qué mostramos el jueves" or "armame las slides".
  To schedule the calendar event itself, use asome-meeting.
  Trigger: "sprint demo", "demo del sprint", "sprint review", "preparar la demo", "armar la review",
  "deck de la review", "slides del sprint", "qué mostramos en la demo", "prompt para Claude Design
  de la review", "acta de la demo", "mail de resumen de la demo", "/asome-sprint-demo".
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Sprint Demo

Builds everything the team needs to run a sprint demo with the client: the **Claude Design
prompt** that fills the Sprint Review template, the **demo script**, the **pre-demo checklist**,
and after the meeting the **summary email** that the Definition of Done requires the same day.

The deck frames a live demo; it never replaces it. What makes an ASOME review different from a
generic one is that every slide ties the sprint to the client's operation: the indicator agreed
in the relevamiento, what is still open and why, what stays in the client's hands, and an explicit
validation. The canon is in **`references/deck-canon.md`**.

**Executes directly once Fase 0 is answered.** Read-only on GitHub; the only file it writes is
`docs/product/demos/sprint-NN-demo.md`.

> **Prerequisites**: `.asome/config.json` (run `/asome-setup` if missing) · `gh` authenticated with
> the `read:project` scope (`gh auth refresh -s read:project`) · `python3`. Claude Design is where
> the prompt gets pasted — this skill does not render slides.

---

## Modes

| Invocation | Produces |
|---|---|
| `/asome-sprint-demo` | deck for the sprint that contains today |
| `/asome-sprint-demo 5` | deck for Sprint 5 (also `"Sprint 5"` or the exact iteration title) |
| `/asome-sprint-demo +90d` | the comparative-measurement deck (antes / después) |
| `/asome-sprint-demo acta [N]` | post-demo summary email + the `## Acta` section of the demo file |

Run it one or two days before the demo: early enough to close the `⟨PENDIENTE⟩`s, late enough that
the board reflects the sprint.

---

## Fase 0 — relevamiento

### Step A — collect (silent, no questions)

```bash
python3 "<skill-dir>/scripts/collect_sprint_data.py" [--sprint N]
```

`<skill-dir>` is the base directory Claude Code shows when it loads this skill. If it is not
known: `find ~/.claude .claude .agents -path '*asome-sprint-demo/scripts/*' 2>/dev/null | head -1`.

The script prints a digest and writes a JSON bundle (path on the last line). Read the whole bundle
before doing anything else. It contains:

| Key | What it is |
|---|---|
| `sprint`, `prev_sprint`, `next_sprint`, `roadmap` | iterations with dates, hito code and milestone |
| `type_hint` | `modulo` · `cierre-de-hito` · `s1-fundaciones` · `sn-cierre` · `+90d` |
| `items.done` / `open` / `cancelled` / `next` | board items, with kind, track, `needs:*`, a `context` excerpt and an `open_type_hint` |
| `items.needs_client_anywhere` | everything waiting on the client, in any sprint |
| `docs.*` | objective, client dependencies and MoSCoW from `sprint-NN-plan.md`; indicators from `10-metricas.md`; open `M-NN` and `D-NN`; HU → épica map; the glossary's banned words; the previous demo's frontmatter, ficha and acta |
| `dates` | demo day (last day of the sprint), validation deadline, next demo |
| `releases`, `promotions` | versions published in the window; merges per branch |
| `stats_internal`, `warnings` | numbers for the team only — never on a slide |

Exit codes: `2` no config → `/asome-setup` · `3` sprint not found (the script lists the
iterations) · `4` board unreadable (it prints the fix, usually the missing `read:project` scope).

### Step B — ask only the gaps, batched, in ONE message

Asking for what the board already says is the fastest way to make this skill stop being used.
So every question comes with a **proposal built from the bundle**, and "ok" confirms all of them.
Skip any question the bundle already answers.

1. **Demo** — fecha, hora y modalidad. Propuesta: `dates.demo`.
2. **Cliente y asistentes** — el nombre del cliente como va en la portada, los asistentes con
   nombre y rol, y quién valida. Propuesta: el frontmatter y el acta de la demo anterior, o
   `01-usuarios.md`.
3. **Flujos de la demo** (1 a 3) y **quién los maneja** — ideally a client user driving, not us:
   it doubles as a usability test. Propuesta: recorridos de punta a punta armados con lo hecho.
4. **Objetivo del sprint** — only if `docs.objetivo` is empty.
5. **Veredicto** — Propuesta: Must del plan todas hechas → Cumplido; alguna abierta → En parte.
6. **Cada ítem abierto**: por qué sigue abierto y cuándo se cierra, y si alguno es **desvío de
   estimación** (the Código de Ética makes that an ASOME cost; the slide says so only if confirmed).
   Also each client dependency listed in the sprint plan: did it arrive?
7. **Qué no se va a mostrar** y por qué (known defects). Propuesta: nada.
8. **Indicadores** — valores actuales si ya hay uso real; para los que no tienen línea de base,
   fecha y responsable de la medición. For `+90d`: each measured value, with date and method.
9. **Pedidos del cliente que no están en el board** (WhatsApp, mail) desde la última demo.
10. **Preguntas para el cliente** — Propuesta: 2 o 3 concretas sobre lo que van a ver.
11. **Próximo sprint** — objetivo (only if there is no plan for it yet) and compromiso vs "si
    llegamos". Propuesta: MoSCoW del plan siguiente o `priority:high`, within the real velocity.
12. **Video de respaldo** — link, o quién lo graba y cuándo.
13. **Novedades del equipo** — only if `team` differs from the previous demo file.
14. **Pedidos de la demo anterior sin estado claro** — e.g. a quote that was sent: fecha y respuesta.
15. **Según el tipo** — `cierre-de-hito` / `sn-cierre`: estado de la entrega de etapa (código,
    infraestructura, credenciales, documentación, guía de uso), con fecha y quién recibió cada
    cosa · `sn-cierre`: inicio de la garantía · `s1-fundaciones`: entrevistas hechas (roles y
    cantidad) and the mapa operativo, only if the doc set does not have them · `+90d`: qué
    aprendimos y próximos pasos.

**Never invent a value.** Whatever is still unresolved goes into the prompt as
`⟨PENDIENTE: qué falta y quién lo responde⟩`.

---

## Step C — build the ficha

Map the bundle plus the answers onto the slides of the sprint type, following
`references/deck-canon.md`: §1 for which slides, §2 for what goes in each, §3 for where every board
item lands, §4 for how to write it, §5 for the indicator. The translation from issue to slide is the
real work of this skill, so do it item by item:

- Rewrite each item as a change for the user, in the client's vocabulary (respect
  `docs.palabras_prohibidas`), with a number when there is one. Issue titles are written for
  developers; slide lines are read by the business owner.
- Group what was delivered by épica (`docs.hu_a_epica`), not by technical area.
- Keep the trazabilidad (slide line → `#issue`) for the demo file, never for the prompt.

---

## Step D — deliver

In this order, in the chat:

1. **The prompt** — take `references/design-prompt-template.md`, fill it, and hand it over in a
   **single code block**, ready to paste into Claude Design. Only the slides of this sprint type.
2. **`⟨PENDIENTE⟩`s** — outside the code block, each with who answers it and by when (before the
   demo).
3. **Guion de la demo** — per flow: who drives, who accompanies, the steps, the data that must be
   loaded in staging beforehand, what not to click, and the fallback video.
4. **Checklist T-1**:
   - staging has everything: if `warnings` reports merges in dev after the last promotion, run
     `/asome-deploy staging` before the demo, because "sprint listo" is a URL;
   - if the sprint closes a hito and `warnings` reports no promotion to main, the hito DoD
     (Nivel 3) asks for production: `/asome-deploy main`, or say in the meeting what is missing;
   - realistic data loaded, the video recorded, the ficha with no `⟨PENDIENTE⟩`;
   - the event exists (`/asome-meeting` → `ASOME <> {Cliente} | Sprint Review`);
   - who presents each block: each person presents what they built.
5. **Notas internas — no van al deck**: SP hechos vs comprometidos, rollover that still needs its
   written justification (DoD Nivel 2), the next sprint against real velocity, `needs:client`
   still open, open `D-NN` blocking the next sprint, and any indicator without a baseline that the
   next sprint would move. That last one is urgent: once the feature ships, the "antes" is lost.

Then write `docs/product/demos/sprint-NN-demo.md` (`medicion-90d.md` for `+90d`):

```markdown
---
sprint: N
proyecto: <nombre>
cliente: <nombre como va en la portada>
tipo: <type>
demo: YYYY-MM-DD HH:MM
validacion_hasta: YYYY-MM-DD
estado: preparada
---
# Demo Sprint N — <Proyecto>

## Ficha              <- every slot, with its ⟨PENDIENTE⟩s
## Trazabilidad       <- slide line → #issue (internal)
## Prompt             <- the same code block delivered in chat
## Preparación        <- guion + checklist
```

If the file already exists, regenerate everything **except** an existing `## Acta` section.

---

## Mode `acta` — after the demo, the same day

1. Read the demo file — without `N`, the latest `docs/product/demos/sprint-NN-demo.md` with
   `estado: preparada` (the day after the demo, "today" already belongs to the next sprint). Run
   the collector only if that file does not exist. Then ask, in one message: validation result and
   observations, who attended, new requests (with the requester), decisions taken, anything the
   client committed to deliver. If the user pastes notes
   or a transcript, extract from it first and ask only the gaps.
2. Classify each new request **dentro / fuera del alcance** against the milestone's deliverable and
   `docs/product/`. Out-of-scope requests get a quote date, never a silent yes.
3. Emit the email from `references/acta-template.md` §1 in a single code block.
4. Append the `## Acta` section (§2) to the demo file and set `estado: presentada`.
5. Close with the next moves: `/asome-create-issue` for in-scope requests, the quote for
   out-of-scope ones, and `/asome-sprint close` today (rollover, hours, retro).

---

## Known gotchas

- **The deck is not the deliverable — the validated increment is.** A sprint that deployed nothing
  cannot pass its DoD no matter how good the slides look.
- **Activity numbers never reach a slide.** A "N tareas completadas" slide invites the client to judge
  the project by effort — and the first lighter sprint then reads as slowing down. ASOME sells results;
  SP, hours and task counts stay in the internal notes.
- **Sprint vs Milestone.** The milestone is the commitment to the client; the sprint is the team's.
  If an open item leaves its milestone, that needs written client conformity before the deck
  shows it as moved (sprint-canon §11.3).
- **The validation deadline counts weekends only.** Check holidays before the date reaches the
  slide and the email.
- **Never "Sprint 0" in front of the client.** S1 is "Sprint 1 · Fundaciones", and it has a demo:
  the walking skeleton deployed in the client's own cloud.
- **The template may not be in the Claude Design workspace yet.** The prompt carries the visual
  system so the deck still comes out right; building the template once makes every deck identical.
- **This repo is public.** Examples inside the skill are fictitious; client data lives only in each
  project's `docs/product/demos/`.
