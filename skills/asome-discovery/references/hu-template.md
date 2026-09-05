# HU template — the 7-block canon

Adopted from `asome-clarity`, confirmed as the standing convention by `lannis-clone`'s `D-04`
("Se adopta la plantilla de HU de `asome-clarity`, no la de `asome-crm`"). `asome-crm`'s
9-section template (adds standalone `## Actor principal` and `## Flujos alternativos`, splits
`## Reglas de negocio`/`## Criterios de aceptación`, no `Fuente del dato`) is legacy — read it
when auditing an asome-crm-era repo, never emit it for new work.

**Filename:** `HU-###-slug-en-espanol.md` — 3-digit zero-padded, kebab slug (accents/ñ
stripped: *pestañas* → `pestanas`, *señal* → `senal`). No epic or phase in the filename.

**No YAML frontmatter.** The file starts at the H1.

```markdown
# HU-### · <Título>

| | |
|---|---|
| **Épica** | E# · <Nombre de la épica> |
| **Fase** | <entero> |
| **Estado** | <esbozada \| escrita \| en desarrollo \| terminada> |
| **Fuente del dato** | <de dónde sale este dato — ver vocabulario abajo> |
| **Depende de** | <— o HU-###, HU-###> |

## Historia

Como <rol>, quiero <acción>, para <beneficio>.

## Descripción funcional

**Actor principal:** <quién ejecuta esta capacidad>.

<Párrafo 1: por qué existe esta HU / qué sostiene, con evidencia si aplica.>
<Párrafo 2: "Hoy … A partir de esta historia, …" — el antes y el después.>
<Párrafo 3+ opcional: matices, regla dura en negrita, cross-refs a mediciones-pendientes.md
o investigacion/*.md §N.N cuando el dato viene de ahí.>

## Flujo

1. <paso 1 del camino feliz>
2. <paso 2>
3. …

- **<Condición de caso borde>:** <qué pasa>.
- **<Otra condición>:** <qué pasa>.

## Reglas y criterios

- RN-1: <regla de negocio>.
- RN-2: <regla de negocio>.

- [ ] **CA-1** — Dado <contexto>, cuando <acción>, entonces <observable>.
- [ ] **CA-2** — Dado <contexto>, cuando <acción>, entonces <observable>.

## Fuera de alcance

- <ítem excluido> (<por qué, o a qué HU se difiere>).
- <ítem excluido>.

## Principio

Principio N · <Nombre del principio> — <cómo esta HU lo encarna o lo extiende>.
```

## Field semantics

| Field | Format | Notes |
|---|---|---|
| H1 separator | `·` (U+00B7 middle dot), never `-` or `:` | |
| **Épica** | `E# · Nombre` | |
| **Fase** | bare integer | |
| **Estado** | `esbozada` \| `escrita` \| `en desarrollo` \| `terminada` | see hu-index states below |
| **Fuente del dato** | `<Producto> (UI observada)`, `<Producto> (UI observada, <pantalla/elemento>)`, `<Producto> (API confirmada: \`tool_name\`)`, `GitHub`, `derivado`, `carga manual`, or a `+`-joined combination | omit the row only if the project's evidence base is pure internal discovery with no external source — state that explicitly in Fase 0, don't default to omitting |
| **Depende de** | `—` or comma-separated `HU-###` | |
| RN-N | `- RN-N: <regla>.` | HU-local, restarts at 1 per file |
| CA-N | `- [ ] **CA-N** — Dado <x>, cuando <y>, entonces <z>.` | HU-local, unchecked by default, always Dado/cuando/entonces lowercase after the first word |

**No story points, no assignee, no sprint field, no priority** in this template — that's the
`de-wall` client-deliverable variant (MoSCoW + Fibonacci + `Trazabilidad`), not the default.
Only add estimation fields if Fase 0 confirmed this is a contracted/client deliverable that
needs them.

---

## `hu/hu-index.md` — the master register

```markdown
# Índice de historias de usuario

> Registro maestro. Toda HU del proyecto figura acá, exista o no su archivo.
> El ID es global y estable: si una HU cambia de épica o de fase, conserva su número. La
> épica es un dato, no una carpeta.
> Los números tienen huecos a propósito: cada fase arranca en una decena distinta para poder
> intercalar sin renumerar.

## Estados

| Estado | Significa |
|---|---|
| `esbozada` | Existe como fila en este índice. Todavía no tiene archivo. |
| `escrita` | Tiene archivo `HU-###-slug.md` con criterios de aceptación. |
| `en desarrollo` | Está siendo implementada. |
| `terminada` | Implementada y verificada contra sus criterios. |

Se escriben completas **sólo las HUs de la fase en curso**. El resto vive como fila hasta que
le toque: no se pre-crean archivos que van a envejecer sin usarse.

---

## Fase 1 · <Nombre>

| ID | Título | Épica | Estado | Depende de |
|---|---|---|---|---|
| HU-001 | [<Título>](HU-001-slug.md) | E1 | escrita | — |
| HU-002 | <Título, sin link — todavía esbozada> | E2 | esbozada | HU-001 |

---

## Resumen

| Fase | HUs | Épicas involucradas |
|---|---|---|
| 1 · <Nombre> | N | E1, E2, … |
| **Total** | **N** | |

## Cómo agregar una HU

Agregás la fila en la fase que corresponda con el siguiente número libre de esa decena y
estado `esbozada`. Cuando le toque, escribís `HU-###-slug.md` siguiendo la plantilla de las
existentes y le cambiás el estado a `escrita`.
```

**Linking rule:** title is a markdown link to the file only when `Estado` is `escrita`;
plain text otherwise. Numbering: reserve a decade per phase (F1 = 001–0NN, F2 starts at the
next decade, etc.) so a later HU can be intercalated into an earlier phase without a global
renumber — gaps are deliberate, not a bug.

---

## The gold-standard unknown-handling example

`lannis-clone/docs/product/hu/HU-016-alerta-de-tope-de-categoria.md` is the reference
implementation for how a HU handles a value that isn't confirmed:

1. `Fuente del dato` states the mixed provenance: API-confirmed core + UI-observed detail.
2. `Descripción funcional` names the assumption in prose and cites the `M-NN` register entry
   instead of stating a number as fact.
3. The unknown becomes a business rule instead of a guess:
   `RN-4: el umbral de alerta se define como configuración explícita del producto (no un
   valor copiado sin confirmar — ver mediciones-pendientes.md M-02), y se puede ajustar sin
   cambiar el resto de la lógica.`
4. Acceptance criteria are written against the placeholder, never the guessed number:
   `CA-1 — Dado que mi facturación acumulada cruza el umbral de alerta, cuando entro al
   dashboard, entonces veo la acción requerida con el monto exacto y el porcentaje usado.`

Reproduce this shape whenever a HU depends on a number or rule that isn't confirmed — never
pick a plausible-looking value and move on.
