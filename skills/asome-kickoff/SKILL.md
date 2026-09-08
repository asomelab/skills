---
name: asome-kickoff
description: >
  Builds the ASOME project kick-off: runs a batched relevamiento, then emits a
  ready-to-paste Claude Design prompt that produces the deck with a fixed 13-block /
  15-slide structure — so every ASOME kick-off looks the same and closes the same
  agreements (modalidad de trabajo, canales de comunicación, accesos, riesgos, owners y
  deadlines). Also produces the post-meeting acta and the calendar events.
  Trigger: "kickoff", "kick-off", "reunión de inicio", "arranque de proyecto",
  "deck de kickoff", "presentación de kickoff", "armar el kickoff", "empezar proyecto
  con cliente", "primera reunión del proyecto", "acta de kickoff".
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Kick-Off

Produces the ASOME kick-off deck via **Claude Design**, plus the acta and the calendar
events. The deck structure is **fixed and non-negotiable** — 13 blocks / 15 slides,
defined in `references/deck-canon.md`. What changes between projects is the content of
the slots, never the skeleton, never the order, never the visual grammar.

The kick-off has one job beyond looking good: **leave the room with a shared, written
understanding of how we work together** — sprint cycle, Definition of Done, who decides,
how scope changes, which channel for what, response times, what the client owes us and by
when. A kick-off that ends without an owner and a date on every commitment has failed,
regardless of how the deck looked.

**Executes directly once Fase 0 is answered — no preview step beyond that gate.**

> **Prerequisites**: none hard. Reads `docs/product/` and the signed contract when they
> exist (they fill most slots automatically). `.asome/config.json` only needed for mode
> `agenda`. Claude Design is where the emitted prompt gets pasted — this skill does not
> render slides itself.

---

## Modes

| Mode | Invocation | Produces |
|---|---|---|
| `deck` *(default)* | `/asome-kickoff` or `/asome-kickoff deck` | the Claude Design prompt, fenced and ready to paste |
| `acta` | `/asome-kickoff acta` | post-meeting acta filled from the deck + what was actually agreed |
| `agenda` | `/asome-kickoff agenda` | calendar events (kick-off + demos + relevamiento) via `asome-meeting` |
| `full` | `/asome-kickoff full` | all three, in that order |

If invoked with no mode, run `deck`.

---

## Fase 0 — relevamiento (the only blocking gate)

Two steps. **Never skip step A** — asking the user for something the repo already states
is the fastest way to make this skill annoying enough to stop being used.

### Step A — auto-extract (silent, no questions)

Read, in this order, whatever exists:

| Source | Fills |
|---|---|
| the signed contract (PDF/doc — `pdftotext -layout`; if no text layer, `pdftoppm -png -r 150` and read the images) | plazos, hitos, entregables, reglas de validación, obligaciones del cliente, referente único |
| `docs/product/00-vision.md` | B03 Propósito |
| `docs/product/06-epicas.md`, `07-roadmap-y-fases.md` | B04 Alcance IN |
| `docs/product/11-plan-de-sprints.md` | B05 Roadmap, fechas de demo — lo produce `/asome-sprint bootstrap`, no `/asome-discovery` (su canon llega hasta `10-metricas.md`). Si falta, corré `bootstrap` antes del deck. |
| `docs/product/decisiones.md`, `mediciones-pendientes.md` | B09 Riesgos (open `D-NN`/`M-NN` are the real risks) |
| `docs/product/01-usuarios.md` | B02 One-Team (client side) |
| `.asome/config.json` + board | B12 Próximos pasos |
| previous ASOME kick-off decks | tone calibration only — never copy content |

### Step B — ask only the gaps, batched, in ONE message

Ask as a numbered list. Every question below carries its fallback. Never ask a question
step A already answered.

1. **Cliente y nombre del proyecto** — exact wording for the cover.
2. **Fecha, hora y duración** del kick-off (default 90 min) + presencial o Meet.
3. **Variante** — `desarrollo`, `discovery/evaluación`, o `diseño`. (Changes only B04, B05, B09.)
4. **Asistentes por lado**, con nombre y rol — cliente y ASOME. Marcar quién es el
   **decisor único**.
5. **Perfiles OnDemand** a mostrar (arquitecto, DevOps, QA, compliance…) — los que
   existen de verdad, no los que suenan bien.
6. **Propósito en palabras del cliente** — si no está en `00-vision.md`, la frase textual
   que dijo el cliente cuando compró el proyecto.
7. **Qué queda FUERA del scope** — mínimo 3 ítems. Si el contrato no lo dice, es la
   pregunta más importante de todo el relevamiento.
8. **Canales**: qué herramienta para qué uso, quién responde en cada una, y el tiempo de
   respuesta comprometido en horario laboral.
9. **Horario de trabajo y zona horaria** del equipo, y qué se considera urgente.
10. **Regla de validación** — días hábiles para objeciones y qué pasa con el silencio
    (sale del contrato; si no hay contrato, se acuerda acá).
11. **Regla de cambios de scope** — cómo se pide un cambio y qué pasa después.
12. **Accesos e insumos** que necesita ASOME, con responsable del lado del cliente y
    deadline. Marcar cuáles son **bloqueantes** del primer sprint.
13. **Riesgos** que ya se ven (3–4, no más), cada uno con su mitigación.
14. **Contactos de cierre**: técnico, comercial y **facturación** (los tres, siempre).
15. **Paleta** — usar la marca del cliente si ya existe material; si no, fondo oscuro
    neutro con un único color de acento tomado del logo. Nunca inventar hex de marca.

**Never invent a value.** Any field still unresolved after step B goes into the prompt
literally as `⟨PENDIENTE: qué falta y quién lo responde⟩`. A visible hole in the deck gets
fixed before the meeting; a guessed value gets discovered in front of the client.

---

## Variantes

Skeleton, order and visual grammar are identical in the three. Only three blocks change
what they carry:

| Bloque | `desarrollo` | `discovery / evaluación` | `diseño` |
|---|---|---|---|
| B04 Alcance | módulos IN / OUT | preguntas que el trabajo responde / las que no | pantallas y piezas IN / OUT |
| B05 Roadmap | sprints → producción | etapas → informe / entregable | ciclos de diseño → handoff |
| B09 Riesgos | integraciones, app stores, feedback de UX | disponibilidad de gente y de datos del cliente | insumos de marca, ciclos de aprobación |

The other ten blocks are the same in every ASOME kick-off, forever.

---

## The deck canon

13 blocks, 15 slides, fixed order. Full slide-by-slide spec — content, layout, límites de
densidad, tono — in **`references/deck-canon.md`**. Summary:

| # | Bloque | Slides | Cierra |
|---|---|---|---|
| B00 | Portada | 1 | — |
| B01 | Agenda con minutos | 1 | expectativa de duración |
| B02 | One-Team | 1 | quién es quién y **quién decide** |
| B03 | Propósito | 1 | por qué existe el proyecto |
| B04 | Alcance IN / OUT | 1 | **qué no entra** |
| B05 | Roadmap e hitos | 1 | cuándo ve qué |
| B06 | Modalidad de trabajo | 2 | ciclo de sprint + Definition of Done |
| B07 | Reglas del juego | 1 | decisor, cambios de scope, silencio, urgencias |
| B08 | Canales y ritmo | 1 | qué canal para qué, quién responde, en cuánto |
| B09 | Riesgos y mitigación | 1 | lo que puede salir mal, dicho antes |
| B10 | Accesos e insumos | 1 | responsable + deadline por ítem |
| B11 | Próximos pasos | 1 | acción / responsable / deadline |
| B12 | Contactos y cierre | 2 | técnico, comercial, facturación |

**Reglas duras del formato** (invariantes — si una se rompe, el deck no es un kick-off ASOME):

- 15 slides. Nunca más. Un bloque que no entra en su slide se recorta, no se parte.
- Toda slide de compromiso (B10, B11) lleva **responsable con nombre y fecha concreta**.
- B04 siempre muestra las dos columnas. Un alcance sin OUT no es un alcance.
- B08 nunca es una fila de logos: es una tabla con uso, dueño y tiempo de respuesta.
- Máximo 6 filas o 6 bullets por slide. Cero párrafos.
- Español rioplatense, voseo. Segunda persona cuando se le habla al cliente.

---

## Steps

1. **Fase 0** — step A (auto-extract), then step B (one batched message). Wait for answers.
2. **Elegir variante** y armar el mapa slot → valor. Marcar los `⟨PENDIENTE⟩`.
3. **Emitir el prompt de Claude Design** — tomar `references/design-prompt-template.md`,
   reemplazar cada `{{placeholder}}`, y devolverlo al usuario en **un único bloque de
   código**, listo para copiar y pegar. No parafrasear la plantilla: los 15 slides van
   siempre detallados, siempre en el mismo orden, con las mismas reglas de formato.
4. **Listar aparte los `⟨PENDIENTE⟩`** que quedaron, con quién los responde — fuera del
   bloque de código, para que el usuario los cierre antes de la reunión.
5. Si el modo es `acta` o `full` — emitir `references/acta-template.md` relleno.
6. Si el modo es `agenda` o `full` — invocar `asome-meeting` para crear kick-off, las demos
   de cierre de sprint y las sesiones de relevamiento, en un solo lote.

---

## Known gotchas

- **El deck no es el entregable — el acuerdo lo es.** El acta sale el mismo día. Sin acta,
  nada de lo hablado existe cuando aparezca la primera discusión de scope.
- La slide de canales con logos sueltos no garantiza nada. Sin dueño y sin tiempo de
  respuesta, el cliente termina escribiéndole al dev por WhatsApp un domingo.
- No abrir arquitectura ni stack delante de gerentes: los perdés y gastás una slide. Si el
  cliente trae un CTO, eso es una reunión técnica aparte, después.
- El relevamiento **no** es el kick-off. Las entrevistas por área van en su propia sesión;
  mezclarlas convierte el kick-off en una reunión de tres horas que nadie recuerda.
- Nunca prometer alcance en la sala por entusiasmo. Todo lo que no está en B04 IN entra por
  la regla de cambios de B07.
- Las decisiones abiertas (`D-NN`) y mediciones pendientes (`M-NN`) del doc set **son** los
  riesgos de B09 — no inventar riesgos genéricos cuando el proyecto ya tiene los suyos
  documentados.
- Los contactos de facturación van sí o sí. Si falta, la primera factura trabada llega al
  canal técnico.
