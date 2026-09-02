# Doc-set template

Canonical shape of a discovery repo, verified identical (modulo two project-specific slots)
across `asome-crm`, `asome-clarity`, and `lannis-clone`. Use this to scaffold `nuevo`, and to
check drift in `auditar`.

```
<repo>/
  README.md
  docs/product/
    README.md
    00-vision.md
    01-usuarios.md
    02-jtbd.md
    03-principios.md
    04-modelo-de-dominio.md
    05-flujo-de-<jornada>.md
    06-epicas.md
    07-roadmap-y-fases.md
    08-<motor-fase-1>.md
    09-<motor-fase-2>.md
    10-metricas.md
    decisiones.md
    mediciones-pendientes.md
    hu/
      hu-index.md
      HU-###-slug.md   (only the current phase's HUs exist as files)
    investigacion/
      dominio-y-alternativas.md
      <competidor-o-tema>.md
```

`08` and `09` are the only slots that vary by project — they're the deep-dives on whatever
engine defines phase 1/2 of *this* product (e.g. `08-bot-y-n8n.md` + `09-meta-y-atribucion.md`
in asome-crm; `08-sincronizacion-github.md` + `09-informes-automaticos.md` in asome-clarity;
`08-canal-conversacional.md` + `09-integraciones-y-canales-de-venta.md` in lannis-clone). Name
them after the thing they document, not generically.

---

## Root `README.md`

```markdown
# <NOMBRE-DEL-REPO>

<Una frase: qué es, para quién> Herramienta interna: <alcance en una línea>.

> **El norte del proyecto:** <la vara, en una frase>
> Si una funcionalidad no <X> ni <Y>, no entra.

---

## Qué resuelve

<2–3 párrafos con el problema y los números duros>

## Cómo se construye

| Fase | Promesa |
|---|---|
| **1 · <Nombre>** | <promesa en segunda persona del voseo> |
| **2 · <Nombre>** | … |
| **3 · <Nombre>** | … |
| **4 · <Nombre>** | … |

## Documentación

El descubrimiento de producto completo está en **[`docs/product/`](docs/product/)** — empezá
por su [README](docs/product/README.md).

Si vas a leer un solo documento: [`docs/product/03-principios.md`](docs/product/03-principios.md),
que define cómo piensa el producto.

## Estado

<Descubrimiento de producto terminado / en curso. Sin código todavía / etc.>
```

---

## `docs/product/README.md` — the real conventions file

```markdown
# Descubrimiento de producto · <repo>

Acá vive el diseño de producto de <repo>: qué problema resuelve, para quién, con qué modelo
mental, y en qué orden se construye.

**No** es documentación técnica. Nada de lo que está acá elige tecnologías, frameworks ni
esquemas de datos: eso se decide en SDD, después, y con este material como insumo.

---

## Si leés un solo documento

[`03-principios.md`](03-principios.md). Es la espina dorsal: …

## Orden de lectura

| # | Documento | Qué contesta |
|---|---|---|
| 00 | [`00-vision.md`](00-vision.md) | Qué problema resuelve y por qué construirlo |
| 01 | [`01-usuarios.md`](01-usuarios.md) | Quién lo usa, incluido cualquier actor no humano |
| 02 | [`02-jtbd.md`](02-jtbd.md) | Para qué lo va a "contratar" cada usuario |
| 03 | [`03-principios.md`](03-principios.md) | **Cómo piensa el producto** |
| 04 | [`04-modelo-de-dominio.md`](04-modelo-de-dominio.md) | Qué cosas existen y en qué estados |
| 05 | [`05-flujo-de-*.md`](05-flujo-de-*.md) | El recorrido completo, de punta a punta |
| 06 | [`06-epicas.md`](06-epicas.md) | Las épicas y sus HUs |
| 07 | [`07-roadmap-y-fases.md`](07-roadmap-y-fases.md) | En qué orden se construye y por qué |
| 08 | [`08-*.md`](08-*.md) | El motor de fase 1, en detalle |
| 09 | [`09-*.md`](09-*.md) | El motor de fase 2, en detalle |
| 10 | [`10-metricas.md`](10-metricas.md) | Cómo sabemos si funcionó |

Además: [`decisiones.md`](decisiones.md) (qué está decidido y qué falta decidir) ·
[`mediciones-pendientes.md`](mediciones-pendientes.md) (qué se supuso y no está confirmado) ·
[`hu/hu-index.md`](hu/hu-index.md) (todas las historias de usuario) ·
[`investigacion/`](investigacion/) (el teardown y el glosario del dominio).

---

## En una frase

> <la propuesta de valor completa, en una oración>

## El norte

<la vara que decide qué entra y qué no>

## Las cuatro fases

1. **<Nombre>** — <promesa en primera persona>.
2. **<Nombre>** — …
3. **<Nombre>** — …
4. **<Nombre>** — …

---

## Convenciones

**Idioma.** <español rioplatense, voseo — o lo que se haya decidido en Fase 0>. Sobrio: sin
marketing, sin superlativos, sin emojis.

**Vocabulario.** Una palabra por concepto, definidas en
[`04-modelo-de-dominio.md`](04-modelo-de-dominio.md) §1: *<lista de términos canónicos>*.
El glosario de dominio (si el producto tiene uno propio, p. ej. impositivo, salud, legal) vive
en [`investigacion/dominio-y-alternativas.md`](investigacion/dominio-y-alternativas.md) §1.
Las palabras prohibidas están listadas junto a cada glosario.

**Evidencia.** <adaptar según el modo: reverse-engineering de un producto ajeno / discovery
propio sin línea de base / mezcla de ambos>. Todo número o regla citado sin fuente propia está
etiquetado `(observado en <fuente> — M-NN)` o, cuando no está confirmado, registrado en
[`mediciones-pendientes.md`](mediciones-pendientes.md). Un número sin etiqueta y sin `M-NN`
es un defecto del documento.

**Historias de usuario.** ID global `HU-###`, estable: si una HU cambia de épica o de fase,
conserva su número. La épica es una columna del índice, no una carpeta. Formato
`Como <rol>, quiero <acción>, para <beneficio>`, con criterios de aceptación en
Dado/Cuando/Entonces y observables.

**Cuándo se escribe una HU completa.** Sólo las de la fase en curso. El resto vive como fila
en el índice. No se pre-crean archivos que van a envejecer sin usarse.

**Plantilla de HU.** Siete bloques: metadatos (con `Fuente del dato`) · Historia · Descripción
funcional · Flujo · Reglas y criterios · Fuera de alcance · Principio. Ver
[`hu-template.md`](hu-template.md).

**Regla de oro.** Toda épica y toda HU tiene que poder señalar el principio del `03` que la
justifica. Si algo sólo se explica con "el competidor lo tiene" o "sería lindo tenerlo", se
corta o se re-deriva desde el problema real.

---

## Estado del descubrimiento

<qué está completo, qué falta, y qué D-NN/M-NN hay que cerrar antes de la fase 1>
```

---

## Numbered-doc skeletons (`00`–`10`)

Every numbered doc: `# NN · Título`, a `>` blockquote under the H1 stating derivation
(`> Deriva de […]`) and/or explicit non-scope, `---`, then `## N. Sección` headings. Close
with `Ver también: [a] · [b] · [c]`.

- **`00-vision.md`** — 1. El problema, hoy · 2. La visión, en una frase · 3. El dream outcome
  · 4. Por qué construirlo en vez de <alternativa> · 5. No-objetivos · 6. Qué hay que
  confirmar/medir antes de escribir código (a gap table keyed by `M-NN`, mirrors
  `mediciones-pendientes.md` — keep the two in sync, this is a real drift risk seen in
  lannis-clone).
- **`01-usuarios.md`** — one section per persona, **always including a non-human actor**
  when one exists (a bot, a synchronizer, an AI assistant) as "actor de primera clase" — plus
  a closing `## Matriz de roles (conceptual)`.
- **`02-jtbd.md`** — numbered `## N. <job en primera persona>`, then
  `## Momentos de fricción priorizados` and `## Anti-backlog`.
- **`03-principios.md`** — the spine. 1. El dato que cambia todo · 2. El modelo conceptual: un
  solo objeto central (`### Los objetos`, `### Lo que a propósito no existe`) · 3. Los N
  principios (`### 1..N`) · 4. Las superficies · 5. No-objetivos · 6. Cómo se usa este
  documento.
- **`04-modelo-de-dominio.md`** — 1. Glosario canónico · 2. Entidades y relaciones (mermaid
  `erDiagram` — the only diagram type used, only here) · 3. El objeto central: un solo tipo,
  varias variantes · 4. Máquinas de estado (`### 4.1`…) · 5. Reglas de identidad · 6. Qué NO
  existe en el modelo · 7. La clausula de alcance (single-tenant, etc.), a propósito.
- **`05-flujo-de-*.md`** — 1. El recorrido completo · 2. Tramo por tramo (`### 1..N`) · 3. Los
  puntos de fuga · 4. Qué sigue.
- **`06-epicas.md`** — see épica block below.
- **`07-roadmap-y-fases.md`** — Por qué este orden · one `## Fase N · <Nombre>` per phase (see
  fase block below) · Qué no se construye, en ninguna fase · Cómo se mide el proyecto.
- **`08`/`09`** — deep-dive on the phase-defining engine: 1. Qué problema resuelve, con
  números · 2. Las reglas que lo definen · 3. Configuración/mecánica (numbered subsections) ·
  4–N. detail sections specific to the engine · Fuera de alcance en esta fase · Cómo sabemos
  que funcionó.
- **`10-metricas.md`** — see metric block below, plus `## 3. Antimétricas` and
  `## 4. Métricas de honestidad` (a paragraph admitting no cited figure is a real measurement
  until confirmed).

### Épica block (`06-epicas.md`)

```markdown
## E1 · <Nombre>

**Objetivo.** …
**Principios que la gobiernan.** 1 (…) · 4 (…).
**Capacidades.** … · … · ….
**Fuera de alcance.** … · … · ….

| HU | Título | Fase |
|---|---|---|
| HU-001 | … | 1 |
```

Close the file with `## Mapa épica × recorrido` (maps the `05` journey stages to épicas) and
`## Dependencias duras`.

### Fase block (`07-roadmap-y-fases.md`)

```markdown
## Fase 1 · <Nombre>

**Promesa:** *<primera persona, en cursiva>*

| Épica | Qué entra | Qué queda afuera |
|---|---|---|
| **E1 <Nombre>** | … | … |

**Qué no es esta fase.** …
**Dependencia que hay que decir en voz alta.** …
**Criterio de salida.** <condición observable, con ventana temporal explícita>
```

### Metric block (`10-metricas.md`)

```markdown
### N.M <Nombre>

**Qué mide:** …
**Fórmula:** …
**Ventana:** …
**De dónde sale el dato:** …
**Objetivo:** …
**Qué decisión cambia:** …
```

### Glossary table (`04-modelo-de-dominio.md` §1 and `investigacion/dominio-y-alternativas.md` §1)

```markdown
| Término | Significa | No confundir con |
|---|---|---|
| **<Término>** | <una oración> | <el vecino confundible, y por qué> |
```

Immediately after the table, a bold-led paragraph naming banned words and their approved
replacement: `**Palabras prohibidas** en la documentación de <repo>: *<palabra>* (usar
*<reemplazo>*), …`.
