# Deck canon — ASOME kick-off

13 bloques · 15 slides · orden fijo. Esta es la parte que **nunca** cambia entre proyectos.
Lo único variable es el contenido de los slots (`{{...}}`) y los tres bloques marcados
*(varía por variante)*.

---

## Gramática visual (aplica a las 15 slides)

| Elemento | Regla |
|---|---|
| Formato | 16:9 |
| Idioma | español rioplatense, voseo. Segunda persona al hablarle al cliente |
| Eyebrow | toda slide de contenido abre con `B L O Q U E  N N  ·  N O M B R E` en mayúsculas, tamaño chico, letter-spacing amplio |
| Título | una línea, tipografía grande, sin punto final |
| Densidad | máximo 6 filas o 6 bullets por slide. Cero párrafos corridos |
| Tablas | header en mayúsculas chicas; una columna de la tabla es siempre la accionable (responsable o fecha) |
| Símbolos | `✓` incluido · `✕` excluido · `→` derivado a fase futura |
| Paleta | marca del cliente si existe material; si no, fondo oscuro neutro + un único color de acento tomado del logo. **Nunca inventar hex de marca** |
| Números | fechas siempre absolutas (`11 jul 2026`), nunca "en dos semanas" |
| Vacíos | un dato no confirmado se escribe `⟨PENDIENTE: …⟩` visible, jamás se rellena con un supuesto |

---

## B00 · Portada — 1 slide

- Nombre del proyecto, grande.
- Subtítulo: etapa o alcance (`MVP Tier 2`, `Evaluación y Diseño`, `Sistema Operativo`).
- Claim del producto si existe.
- Pie: `KICK-OFF · {{fecha larga}}` · duración · modalidad (Meet / presencial).
- Quién presenta, con rol.

## B01 · Agenda — 1 slide

Lista con **minutos por bloque**. La suma es la duración anunciada. Sin minutos, la sala no
se autorregula y el kick-off se va a dos horas.

```
[5]  Presentación One-Team
[10] Propósito y alcance
[10] Roadmap e hitos
[15] Cómo trabajamos
[10] Canales y reglas
[10] Riesgos
[15] Accesos y próximos pasos
[5]  Cierre
```

## B02 · One-Team — 1 slide

**Un solo organigrama**, cliente y ASOME mezclados. No dos bloques separados: eso dice
"nosotros y ustedes" y el resto de la reunión se comporta así.

- Cada persona: nombre, rol, foto o inicial.
- El **decisor único** del lado cliente va marcado explícitamente (badge o color).
- Columna lateral: **Perfiles OnDemand** — especialistas disponibles y no full-time
  (arquitecto, DevOps, QA, compliance). Sólo los que existen.

## B03 · Propósito — 1 slide

Dos preguntas, en este orden:

1. **¿Por qué estamos haciendo esto?** — el problema del cliente, en su lenguaje, no en features.
2. **¿Qué busca lograr?** — 4 a 6 bullets de resultado de negocio.

Nunca arrancar por los módulos. El dueño quiere oír su propio problema antes que tu backlog.

## B04 · Alcance IN / OUT — 1 slide *(varía por variante)*

Dos columnas, **siempre las dos**:

- Izquierda `✓ IN SCOPE` — módulos / preguntas / pantallas comprometidas.
- Derecha `✕ FUERA DEL SCOPE` — mínimo 3 ítems, con `→ fase futura` donde corresponda.

Un alcance sin columna OUT no es un alcance: es una expectativa abierta. Esta slide es la
que te salva la discusión del sprint 4.

## B05 · Roadmap e hitos — 1 slide *(varía por variante)*

Timeline horizontal: un carril por sprint/etapa, con fechas absolutas, hitos marcados y el
**entregable de cada hito**. Fecha de lanzamiento o de entrega final, destacada.

Una sola slide. Nunca una slide por sprint — nadie lee doce.

## B06 · Modalidad de trabajo — 2 slides

**B06a · El ciclo del sprint**

Cuatro pasos, con la duración fija arriba:

1. **Planning** — definición de historias para los próximos {{N}} días.
2. **Build** — desarrollo, diseño e integración continua en staging.
3. **Demo** — demostración en vivo, staging accesible. No un entregable estático.
4. **Validación** — {{N}} días hábiles. Sin objeciones escritas = sprint aceptado.

**B06b · Definition of Done** — tres niveles, tres columnas:

| Por historia | Por sprint | Por hito |
|---|---|---|
| criterios de aceptación verificados | demo en vivo con el cliente | QA cross-device / cross-browser |
| tests verdes | staging funcional post-demo | accesos entregados al cliente |
| staging accesible | email de resumen | validación escrita |
| code review aprobado | ventana de validación abierta | deploy a producción |

Esta es la slide que convierte "está listo" de opinión en criterio.

## B07 · Reglas del juego — 1 slide

Los acuerdos que evitan el 90% de los conflictos. Cuatro filas, sin adornos:

| Regla | Enunciado |
|---|---|
| Quién decide | `{{decisor}}` es el único que aprueba entregables. Las opiniones suman, la aprobación es de una persona |
| Cambios de scope | se conversan con el equipo y se estiman **antes** de arrancar. Nada entra "ya que estamos" |
| Silencio | sin objeciones escritas en `{{N}}` días hábiles, el entregable queda aceptado |
| Urgencias | qué se considera urgente y qué no. Todo lo demás espera al horario laboral |

## B08 · Canales y ritmo de comunicación — 1 slide

**Nunca una fila de logos.** Tabla con cuatro columnas:

| Canal | Para qué | Quién responde | Tiempo de respuesta |
|---|---|---|---|

Debajo, las **reuniones fijas** con día y horario: demo de cierre de sprint, sync semanal
si lo hay, y el horario laboral del equipo con zona horaria.

Regla que se dice en voz alta: **las decisiones se confirman por escrito en el canal
acordado.** Lo hablado por teléfono no existe hasta que alguien lo escribe.

## B09 · Riesgos y mitigación — 1 slide *(varía por variante)*

3 o 4 riesgos, **cada uno con su mitigación**. Formato por riesgo:

```
{icono} {Título del riesgo}
{Una o dos líneas: por qué puede pasar y qué impacta}
🔧 Mitigación: {acción concreta, con dueño si aplica}
```

En proyectos con doc set, los riesgos **son** las decisiones abiertas (`D-NN`) y las
mediciones pendientes (`M-NN`): no inventar riesgos genéricos cuando el proyecto ya tiene
los propios documentados.

Nombrar el riesgo antes de que pase te compra credibilidad ahora y cobertura después.

## B10 · Accesos e insumos — 1 slide

Tabla con deadline en el encabezado. Cuatro columnas:

| Acceso / insumo | Para qué | Responsable | Deadline |
|---|---|---|---|

Al pie, una línea destacando los **bloqueantes**: qué ítems frenan el arranque del primer
sprint si no llegan a tiempo.

Ninguna fila sin nombre propio y sin fecha.

## B11 · Próximos pasos — 1 slide

| Acción | Responsable | Deadline |
|---|---|---|

Incluye siempre: **enviar el acta del kick-off — hoy**. Y la fecha de la primera demo.

## B12 · Contactos y cierre — 2 slides

**B12a · Contactos** — los tres roles, siempre:

- **Técnico** — líder del proyecto.
- **Comercial** — quien maneja la relación.
- **Facturación** — mail de administración. Si falta, la primera factura trabada llega al
  canal técnico y quema el vínculo.

**B12b · Cierre** — claim del proyecto, mail y sitio de ASOME, y **la fecha de la primera
demo** repetida. La reunión termina con una fecha en la cabeza de todos, no con un "gracias".
