# Canon del deck de Sprint Review

The skeleton is fixed per sprint type; what changes between projects and sprints is the content
of the slots. The Claude Design template **"Sprint Review ASOME"** implements this canon
visually; the prompt this skill emits fills it. If a project's Claude Design workspace does not
have the template yet, the prompt carries enough of the visual system to build the deck anyway.

The deck frames a **live demo**; it never replaces it. Per `asome-sprint/references/sprint-canon.md`
§5 (Nivel 2), a sprint closes with a live demo on an accessible environment, a summary email the
same day and a validation window of N business days — silence means validated.

---

## 1. Secuencia por tipo

`type_hint` comes from the collector; confirm it only when it says "confirmar".

| # | Lámina | `modulo` | `cierre-de-hito` | `s1-fundaciones` | `sn-cierre` |
|---|---|---|---|---|---|
| 1 | Portada | ✓ | ✓ | ✓ ("Sprint 1 · Fundaciones") | ✓ |
| 2 | Objetivo del sprint | ✓ | ✓ | ✓ | ✓ |
| 3 | El indicador | ✓ | ✓ | → reemplazada por **Línea de base** | ✓ |
| 4 | Lo que nos pediste la vez pasada | si aplica | si aplica | ✕ | si aplica |
| — | A quiénes escuchamos · Mapa operativo · Problemas priorizados | ✕ | ✕ | ✓ (antes de Línea de base) | ✕ |
| 5 | Demo en vivo | ✓ | ✓ | ✓ (el esqueleto desplegado: "entrá con tu usuario") | ✓ |
| 6 | ¿Cumplimos el objetivo? | ✓ | ✓ | ✓ | ✓ |
| 7 | Además de lo que viste | ✓ | ✓ | si aplica | ✓ |
| — | Qué corregimos | ✕ | ✓ con 4+ correcciones; si no, tarjeta en 7 | ✕ | ✓ con 4+; si no, tarjeta en 7 |
| 8 | Lo que sigue abierto | si aplica | si aplica | si aplica | si aplica |
| — | Entrega de etapa (checklist) | ✕ | ✓ | ✕ | ✓ (+ traspaso de cuenta y garantía) |
| — | Roadmap | ✕ (va en la barra de la portada) | ✓ | ✓ | ✓ |
| — | Plan de medición a 90 días | ✕ | ✕ | ✕ | ✓ |
| 9 | Conversemos | ✓ | ✓ | ✓ | ✓ |
| 10 | Pedidos nuevos y lo que necesitamos | si aplica | si aplica | si aplica | si aplica |
| 11 | Validación | ✓ | ✓ | ✓ (sobre mapa, línea de base y lo demostrado) | ✓ |
| 12 | Próximo sprint | ✓ | ✓ | ✓ | ✕ → reemplazada por **Qué sigue: la medición** |
| 13 | Cierre | ✓ | ✓ | ✓ | ✓ |

S1 always has a demo: the canon's S1 ships auth deployed in the client's own production. "Sprint
listo" is a URL. Never call it "Sprint 0" in front of the client.

**`+90d` (medición comparativa)** is its own short deck: Portada · Antes y después (per
indicator: antes con fecha, después con fecha, cambio, cómo se midió) · Qué aprendimos · Próximos
pasos · Conversemos · Cierre. Its numbers become a case study only with the client's written
permission.

---

## 2. Qué va en cada lámina y de dónde sale

| Lámina | Contenido | Fuente en el bundle |
|---|---|---|
| Portada | proyecto, descriptor, "Sprint Review N", fechas, equipo ASOME (nombre · rol por resultado), cliente (nombre · rol en el proyecto), barra de avance (sprints, hitos, actual, próximo hito y fecha), "Nuevo en el equipo" si aplica | `sprint`, `roadmap`, `team`, demo anterior |
| Objetivo | una oración, en presente, en términos de la operación del cliente | `docs.objetivo` (sprint-NN-plan §1) |
| El indicador | 1–4 indicadores: Antes (valor · fuente · fecha) · Meta · Ahora (valor medido, o "se mide el ⟨fecha⟩") | `docs.indicadores`, `milestone_90d` |
| Lo que nos pediste | cada pedido de la demo anterior → Hecho / En el próximo sprint / En backlog / Descartado (+ motivo) | `docs.demo_anterior_acta` cruzado con `items` |
| Demo en vivo | 1–3 flujos; por flujo: "Resuelve: ⟨problema del mapa operativo⟩", "Lo maneja: ⟨persona⟩", 3–6 pasos, aviso "No vamos a mostrar …", respaldo en video | `items.done[].context`, respuestas de Fase 0 |
| ¿Cumplimos? | Cumplido / Cumplido en parte / No cumplido + "Falta ⟨x⟩ → pasa al sprint N+1" | MoSCoW del plan vs `items` |
| Además de lo que viste | tarjetas por épica con lo nuevo; tarjeta "Diseño listo" (track:ux); franja "Queda en tus manos: versión · documentación · video" | `items.done`, `docs.hu_a_epica`, `releases` |
| Qué corregimos | qué fallaba → cómo quedó, en términos de negocio | `items.done` con kind Bug |
| Lo que sigue abierto | por ítem: tipo, por qué, cuándo se cierra; marca "Desvío de estimación · lo absorbe ASOME" sólo si el equipo lo confirma | `items.open[].open_type_hint` + respuestas |
| Entrega de etapa | código en el repo del cliente · infraestructura a su nombre · credenciales entregadas · documentación · guía o video de uso — cada uno con fecha y quién lo recibió | respuestas de Fase 0 |
| Roadmap | sprints con fechas absolutas, hito cerrado ✓, próximo hito | `roadmap`, milestones |
| Conversemos | 2–3 preguntas concretas + "¿Cambió algo en tu operación desde la última review?" | propuestas + respuestas |
| Pedidos y lo que necesitamos | pedidos (qué · de quién · dentro/fuera del alcance) · lo que necesitamos (decisión/dato/acceso · de quién · fecha) | respuestas, `items.needs_client_anywhere`, `docs.decisiones_abiertas`, `docs.dependencias_cliente` |
| Validación | "¿Validamos lo que vimos hoy?" (Validado / Con observaciones / No validado) + "Tenés hasta el ⟨fecha⟩ (N días hábiles) para objeciones por escrito; sin objeciones, queda validado" | `dates.validacion_hasta`, `docs.validation_days` |
| Próximo sprint | objetivo como título · Compromiso (≤5) · Si llegamos (≤5) · cada ítem con "para qué" y chip de origen · fechas intermedias | `items.next`, `docs.moscow_siguiente`, `docs.objetivo_siguiente` |
| Cierre | "Próxima review: ⟨fecha⟩" · equipo · hola@asomelab.com · asomelab.com · "Resumen por mail hoy" | `dates.proxima_demo` |

---

## 3. Del board a la lámina

| En el board | En el deck |
|---|---|
| Done · Feature / Improvement · track:dev | "Además de lo que viste", agrupado por épica (`hu_a_epica`; si no hay, por el módulo del título) |
| Done · track:ux (`[UX] HU-NN`) | tarjeta "Diseño listo para ⟨lo que habilita⟩" — sólo si su gemelo de desarrollo es de un sprint futuro; si se construyó en este mismo sprint, ya está en la demo |
| Done · Bug | tarjeta "Correcciones" (o lámina "Qué corregimos" en cierre de hito) |
| Done · Setup / Research / Docs / Infra | fuera del deck, **salvo** que el cliente lo pueda ver, usar o dar por garantizado ("La app ya está en Play Store", "Tu información se respalda todos los días") |
| Abierto con `needs:client` | "Lo que sigue abierto" como *Depende de ustedes* **y** fila en "Lo que necesitamos" |
| Abierto con `needs:third-party` | *Depende de terceros* (tiendas, proveedores) — con fecha estimada si existe |
| Abierto · In Progress / In Review | *En curso* |
| Abierto · Bug | *Corrección pendiente* |
| Cancelled | fuera del deck; si lo había pedido el cliente, va en "Lo que nos pediste" como *Descartado* con motivo |
| D-NN abierta que bloquea algo del sprint siguiente | fila en "Lo que necesitamos": la decisión, formulada como pregunta, con fecha |
| Siguiente sprint · MoSCoW Must/Should (o priority:high si no hay plan) | Compromiso |
| Siguiente sprint · Could / resto | Si llegamos |

Chip de origen de cada ítem del próximo sprint: **Pedido de ⟨persona⟩** (aparece en el acta de la
demo anterior) · **Mapa operativo** (su Context cita un problema del mapa) · **Corrección** (Bug) ·
**Del sprint N** (quedó abierto y pasa: decirlo es más honesto que esconderlo). Sin evidencia de
origen, el ítem va sin chip.

---

## 4. Reglas de contenido

- **Audiencia:** el dueño o gerente del cliente, no técnico, y quienes van a usar el sistema.
  Español rioplatense con voseo, lenguaje de negocio. Respetá las palabras prohibidas del
  glosario del proyecto (`docs.palabras_prohibidas`).
- **Nunca en una lámina:** cantidad de tareas o issues, story points, horas, velocidad, commits,
  PRs, deploys, ramas, números de issue (#123), códigos HU, nombres de tecnologías. Todo eso vive
  en el archivo de la demo (trazabilidad interna) y en `/asome-sprint report`.
- **Cada ítem es un cambio para el usuario**, sujeto + verbo + resultado, con número cuando existe.
  - ✓ "Administración ve el saldo de cada comercio sin abrir la planilla"
  - ✓ "Cargar un pedido lleva 1 minuto (antes 5)"
  - ✗ "Endpoint de cuenta corriente" · "Refactor del módulo de pedidos" · "Carga más rápida"
- **Correcciones** en formato *qué fallaba → cómo quedó*: "Los pedidos editados de noche
  aparecían dos veces → ahora aparecen una sola vez".
- **Límites:** título ≤ 60 caracteres · viñeta ≤ 90 · ≤ 6 viñetas por tarjeta · ≤ 3 tarjetas por
  lámina · si se supera, se pagina (1/2, 2/2). Fechas siempre absolutas.
- **Nombres de sprint frente al cliente:** "Sprint N", más " · ⟨hito⟩" si el milestone lo nombra.
  Sin códigos internos como "(M1)".
- **Roles por resultado:** Product Engineer, Product Designer — nunca "Software Developer".
- **Nunca inventar.** Un dato que falta va como `⟨PENDIENTE: qué falta y quién lo responde⟩`,
  visible. Un hueco visible se cierra antes de la demo; un valor adivinado se descubre delante del
  cliente.

---

## 5. El indicador: tres reglas

1. **"Ahora" es un número medido o una fecha de medición.** Mientras el sistema no está en uso
   real, se muestra el compromiso ("se mide el ⟨fecha del milestone +90d⟩"), no un impacto.
2. **Sin línea de base, la lámina lo dice en grande:** "Línea de base pendiente: se mide el
   ⟨fecha⟩ con ⟨persona⟩". El hueco tiene que verse.
3. **Si el próximo sprint lanza algo que mueve un indicador sin línea de base, esa línea de base
   se mide antes del lanzamiento** — después no hay "antes". Es una alerta interna para el equipo
   y una fila en "Lo que necesitamos" (quién aporta el dato y para cuándo).
