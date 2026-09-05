# Research modes — `investigacion/`

Four shapes, selected per project in Fase 0 (one project can use more than one). All four
share the load-bearing device: a **mandatory-note blockquote right under the H1** stating the
evidence basis (source, date, method) and forbidding literal copying —
"ninguna decisión se justifica con 'el competidor lo tiene': se justifica con el principio
que resuelve." Every file closes with `Ver también: [a] · [b] · [c]`.

---

## 1. Desk teardown (`investigacion/<competidor>.md`)

Reverse-engineering a live competitor from its own product, no interviews. Reference:
`lannis-clone/docs/product/investigacion/lannis-analisis.md`.

```markdown
# Análisis de <Competidor> (investigación de campo)

> **Nota obligatoria:** este documento registra lo que se observó navegando <sitio> y
> <app/dashboard> <con/sin cuenta real>, el YYYY-MM-DD<, más las herramientas MCP/API
> conectadas a esa cuenta, si aplica>. No es un inventario para copiar literalmente sin
> criterio: cada capacidad listada acá se traduce a una decisión propia en
> [`../06-epicas.md`] y a un principio en [`../03-principios.md`]. Lo que no se pudo
> confirmar en vivo queda anotado como supuesto en [`../mediciones-pendientes.md`].

## 1. Qué es <Competidor>, en una frase

## 2. Sitio de marketing (`<dominio>`)

Organized **by route/URL**. Each subsection heading carries the literal path in backticks
plus a one-word role label: `### 2.3 \`/empresas\` — línea B2B`. Bullet each UI element with
a **bolded name** and the literal copy quoted: `**Hero:** "<texto exacto observado>"`.

## 3. Pricing (`<ruta de precios>`)

**Not a comparison table** — a nested bullet list per plan:
```markdown
**Plan <Nombre>**
- Precio: **<precio, en negrita>**
- Incluye al arrancar: …
- Incluye todos los meses: …
- Exclusiones explícitas: …

**Patrón de precios:** <la inferencia que se saca de comparar los planes>
```

## 4. Producto autenticado (dashboard/app)

One `### N.M <Sección>` per screen/route, same bolded-element convention as §2. Each
subsection ends with an interpretive bolded lead-in that converts observation into product
implication: `**Patrón de diseño:**`, `**Lectura de producto:**`, `**Lectura de
arquitectura:**`, `**Mecánica:**`. State counts explicitly: "9 ítems, la lista más
exhaustiva del sitio".

## N. Superficie de API confirmada (si hay herramientas MCP/API conectadas)

The only proper table in the doc:

| Herramienta | Qué hace / devuelve |
|---|---|
| `tool_name` | … |

Group CRUD families into one row. Close with a bolded inference paragraph:
`**Lectura de arquitectura:** …`.

## N. Señales de negocio a tener en cuenta

Flat bullet list of business inferences (traction claims, guarantees, currency anchoring,
pricing model shape, distribution strategy) — mark every borrowed number with `(observado en
<Competidor> — M-NN)`.
```

**No screenshots in this mode** — evidence is textual quotation of observed copy and numbers.
Use mode 4 (visual teardown) when screenshots are wanted.

---

## 2. Domain & alternatives (`investigacion/dominio-y-alternativas.md`)

The vocabulary source of truth plus a survey of how other approaches solve the same problem.
One file per project, referenced by `docs/product/README.md` §Convenciones.

```markdown
# Investigación de dominio y alternativas

> **Nota obligatoria:** este documento fija el vocabulario de dominio que todo el resto de la
> documentación usa sin volver a explicar, y registra por qué el enfoque de <competidor
> principal> le gana a la alternativa genérica. Ninguna decisión se justifica con "<X> lo
> tiene": se justifica con el principio que resuelve (ver [`../03-principios.md`]).

## 1. Glosario del dominio

| Término | Significa | No confundir con |
|---|---|---|

**Palabras a evitar** en la documentación de <repo>: *<palabra>* (usar *<reemplazo>*), …

## 2. Alternativas en foco

One bolded-lead paragraph per alternative, always in the shape:
`**<Alternativa>**, <rol/categoría>: Resuelve bien: … Le falta: …` (or `Les sobra:` for
over-engineered ones). The main competitor is the last entry, framed as the direct reference.

## 3. Los problemas que resuelve, con evidencia y postura propia

### N. <El problema, formulado en una frase>

**Evidencia.** <qué se observó en el competidor/mercado>
**Cómo lo resuelven las alternativas.** <cómo lo resuelven otras herramientas>
**Qué decidiríamos distinto.** <la postura propia>
```

The 3-beat sub-template (`Evidencia.` / `Cómo lo resuelven las alternativas.` / `Qué
decidiríamos distinto.`) is fixed — always these three labels, always this order, one block
per problem.

---

## 3. Field research (`investigacion/entrevistas/`, `investigacion/personas/`)

Primary research with real people. Use when Fase 0 confirms the evidence base includes
interviews, not just desk observation. Reference: `de-wall/dewall-docs/discovery/entrevistas/`.

### Interview note template

```markdown
## Metadata
| Campo | Valor |
|---|---|
| Perfil | ☐ … |
| Canal | ☐ … |
| Consentimiento | ☐ … |

## Perfil rápido del entrevistado

## Notas crudas por bloque
[Notas libres durante la entrevista]

## Quotes textuales destacados

## Señales de validación / refutación de hipótesis

| Hipótesis | Señal observada | ✅ Valida | ❌ Refuta | ❓ Ambigua |
|---|---|---|---|---|

## Nivel de ajuste al perfil hipotético
☐ Calza bien · ☐ Calza parcialmente · ☐ Perfil distinto

## Discoveries inesperados

## Action items post-entrevista
| Tarea | Responsable | Fecha límite |
|---|---|---|

## Asignación a buyer persona

## Síntesis (post-entrevista — completar en <2 horas)
```

Naming: `notas-YYYY-MM-DD-<nombre-perfil>.md`, copied from the template before the interview
and filled during/after. `❓ Ambigua` is the one place a bare question mark is a formal marker
— everywhere else in the doc set, an unknown gets an `M-NN` tag instead.

### Problem-solution-fit canvas (assumption register with field grading)

Complements `mediciones-pendientes.md` when there's interview evidence to grade:

```markdown
**Convenciones de estado:**
- ✅ Validado en campo (entrevistas)
- ⚠️ Parcialmente validado
- 🟡 Hipótesis sin validar — requiere validación en fase posterior

### Segmento <X> — <PSF CONFIRMADO ✅ | PSF INDICATIVO ⚠️ | PSF SIN EVIDENCIA 🟡>

> **Condición para <el veredicto>:** <qué tendría que ser cierto>

## Supuestos sin validar — Tabla consolidada

| # | Supuesto | Segmento | Por qué sin validar | Plan de validación | Cuándo |
|---|---|---|---|---|---|
| A1 | … | … | … | … | … |
```

State evidence weight numerically wherever a claim rests on interviews: `3/3 coaches`,
`4/5 entrevistados`, never "most people said". Attribute quotes by name:
`Leo: *"<cita textual>"*`. Rank problems with an explicit, stated formula (e.g.
`Score = Frecuencia × Impacto`, each 1–5) rather than an unstated gut ranking.

---

## 4. Visual teardown (`investigacion/assets/<competidor>/`)

Screenshot-based evidence, additive to mode 1. Reference:
`de-wall/dewall-docs/assets/competitivo/`.

**Before capturing:** write the shot list first, as a `README.md` in the competitor's asset
folder:

```markdown
# Screenshots pendientes — <Competidor>

Guardar aquí las capturas para el análisis competitivo.

| Archivo esperado | Qué capturar |
|---|---|
| `01-onboarding-paso1-signup.png` | Pantalla de sign up |
| `02-<pantalla>.png` | <qué mostrar> |

**Tip:** <notas operativas — cuenta free vs. premium, plataforma web vs. móvil, etc.>
```

Filename convention: `NN-slug-descriptivo.png`, sequential per competitor. After capture,
surface the screenshots inside the teardown doc (mode 1) as a table, never inline without
context:

```markdown
## Screenshots

| # | Descripción | Imagen |
|---|---|---|
| 1 | <qué muestra> | ![](../../assets/<competidor>/01-slug.png) |
```

Reconcile the shot list against what actually got captured before publishing — a stale
planned-vs-captured mismatch (seen in `de-wall`) is a real drift the `auditar` mode should
flag.
