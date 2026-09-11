# Canon de sprints ASOME

> La forma que tiene un proyecto ASOME desde el kick-off hasta la medición a los 90 días.
> Extraído de `de-wall` (`dewall-docs/team/` y `dewall-docs/roadmap/sprint-NN-plan.md`), que es
> el único proyecto de la organización donde el proceso se ejecutó completo, y del método fijado
> en el Manual de identidad organizacional y ética v1.0.

---

## 1. El método — no es negociable

```
[1] 2 semanas de relevamiento — entrevistas a quienes ejecutan los procesos
      |
      v
[2] Mapa operativo            + primer prototipo en paralelo
      |
      v
[3] 2 a 4 indicadores acordados con el cliente — valor de partida + meta
      |
      v
[4] MVP                       (recién acá se escribe código de producto)
      |
      v
[5] Medición a los 90 días    -> informe comparativo al cliente
```

Del Manual de identidad, bloque 01: *"Esa secuencia no es un agregado del servicio: es la
condición del método."*

Tres reglas del código de ética que este canon aplica:

| Regla | Dónde impacta |
|---|---|
| *"El registro de la cuenta de infraestructura y del repositorio a nombre del cliente se hace **al inicio** del proyecto y no al final"* | S0 — la cuenta cloud y el repo se crean a nombre del cliente antes del primer sprint |
| *"Antes de aprobar una funcionalidad preguntamos qué problema del relevamiento resuelve. Si no hay respuesta, no se construye"* | Todo issue de feature declara su problema del mapa operativo |
| *"Todo costo adicional que no tenga registro escrito se considera error de estimación nuestro y **lo absorbemos**"* | El guardarraíl de capacity. Sobrecomprometer un sprint le cuesta plata a ASOME |

### El malentendido que hay que evitar

`[4] MVP — recién acá se escribe código` habla de **código de producto**: features que trazan a un
problema del mapa operativo. **No** incluye la validación de infraestructura.

Un login/registro desplegado en el entorno productivo del cliente no es producto — es la prueba de
que la cuenta, el repo, el pipeline, el dominio y los accesos nominados funcionan. El propio código
de ética lo exige al inicio. de-wall lo hizo así: la infra cerró 11 días antes del arranque nominal
del sprint 1 y el slice de Auth se entregó end-to-end adentro del sprint 1.

---

## 2. La forma del proyecto

```
S0 · KICK-OFF ─────────────────────────────────────── no es un sprint ────
     contrato firmado · NDA · deck + acta (/asome-kickoff)
   ► cuenta cloud y repositorio A NOMBRE DEL CLIENTE
     accesos nominados por persona en el gestor de contraseñas
     trámites de terceros iniciados (tienen SLA propio y bloquean sprints)

S1 · RELEVAMIENTO + ESQUELETO QUE CAMINA ──────── dos tracks en paralelo ──
     PRODUCTO   entrevistas ≥3 roles -> mapa operativo
                ► 2-4 indicadores con valor de partida y meta
     INFRA/DEV  cuenta + repo + CI/CD + entorno productivo
                ► login/registro DESPLEGADO EN PRODUCCIÓN DEL CLIENTE
     UX         BASES del design system (tokens + componentes de auth)
                inventario de pantallas · navegación
                ► AUTH COMPLETA EN FIGMA: login, registro, recuperacion de clave
                ► hi-fi de lo que construye S2          (reserva reactiva 0)

S2 · PRIMERA REBANADA DE PRODUCTO ────────────────────────────────────────
     DEV        rebanada vertical de la entidad raíz
                SOBRE multi-tenancy + auditoría + permisos
     UX         hi-fi de S3 + reactivo de la demo S1

S3..S(N-1) · MÓDULOS ─────────────────────────────────────────────────────
     una rebanada vertical por módulo · UX diseña siempre N+1

SN · CIERRE ──────────────────────────────────────────────────────────────
     hardening · capacitación · documentación de procesos
   ► traspaso de cuenta y credenciales · arranque de garantía

+90 DÍAS · MEDICIÓN COMPARATIVA ──────────── milestone obligatorio ───────
     se vuelven a medir los indicadores de S1 -> informe comparativo
```

### Sprint goals canónicos de los dos primeros

**S1** — *"El cliente entra a su propio sistema, en su propia nube, con su propio usuario — y
nosotros entendimos su operación."*

Los tres entregables obligatorios de S1, uno por carril. No es una lista deseable: es lo que hace
que S1 cierre con una URL en vez de con una carpeta.

| Carril | Entregable de S1 |
|---|---|
| Producto | mapa operativo + 2-4 indicadores con valor de partida y meta |
| UX | bases del design system + **auth completa en Figma** (login, registro, recuperacion) + hi-fi de S2 |
| Dev | cuenta cloud y repo del cliente + CI/CD + entorno productivo + **auth desplegada en produccion** |

**Alcance de la auth en S1 — donde se corta.** Entra: login, registro, recuperacion de clave, alta
de usuarios y estructura de roles. **No** entra la matriz de permisos por accion: eso es transversal
y §2 ya dice que lo transversal se prueba en S2 contra una entidad real. Prometer el modulo de
permisos cerrado en S1 obliga a reabrirlo entero cuando aparece la primera entidad.

**El design system en S1 son bases, no el sistema completo.** Tokens (color, tipografia, spacing,
grid) y los componentes que la auth necesita: input, boton, formulario, estados de error, layout,
navegacion. Crece un sprint por vez. Un design system "terminado" en S1 se rehace en S2, cuando
aparece la primera pantalla de datos reales — y bajo una clausula de correccion sin costo, esa
rehechura la paga ASOME.

**Nomenclatura frente al cliente.** En documentos internos y en el board es S0 (semana previa, sin
sprint) y S1 (fundaciones). En un deck comercial el S0 va dentro de "Proximos pasos" — firma, pago,
cuentas a nombre del cliente, tramites de terceros — y el S1 se presenta como **"Sprint 1 ·
Fundaciones"**. Nunca "Sprint 0" de cara al cliente: se lee como sprint que no cuenta, y es
justamente donde se pide el primer pago. Ademas numerar desde 0 rompe la consistencia con los
niveles de precio, que se venden como "Sprints 1 a N".

**S2** — *"La primera entidad del negocio vive en el sistema, con todo lo transversal probado
encima."*

Lo transversal (multi-tenancy, auditoría, permisos) se prueba en S2 **contra una entidad real**.
Nunca se diseña en abstracto para aplicar después: si el mecanismo está mal, hay que descubrirlo
con una entidad escrita, no con catorce.

### La regla que resume todo

**"Sprint listo" se define como una URL, no como un artefacto.** Si al cierre del sprint no podés
mandar un link y decir "entrá", el sprint no cerró. Y si el contrato pide *"demostración en vivo
con acceso al entorno de prueba"*, un sprint sin software desplegado tampoco cumple el contrato.

---

## 3. Capacity — horas y story points

El problema real de ASOME no es sobreestimar: es que **los SP no están calibrados**. Para el mismo
sprint de de-wall, `sprint-01-plan.md` dice *"S1 = 26 pts / ~80h"* y el board dice 83 SP. Con esa
dispersión un número de SP no es verificable. Por eso el techo es un modelo declarado que se
recalibra, no una constante.

```
jornada          8h, lunes a viernes
sprint           2 semanas = 10 días hábiles
horas brutas     80h por persona por sprint

focus factor     S1-S2: 0.65   (equipo nuevo: ceremonias, setup, cambio de contexto)
                 S3+:   MEDIDO = horas entregadas / horas brutas del sprint anterior

horas por SP     inicial: 5h
                 luego:   MEDIDO = horas del sprint / SP cerrados
```

Escala Fibonacci anclada en horas. Coincide con las descripciones de los labels `effort:*` que
crea `/asome-setup`:

| SP | horas | días | `effort:` |
|---|---|---|---|
| 1 | 5h | 0.5 | `effort:S` |
| 2 | 10h | 1 | `effort:S` |
| 3 | 15h | 2 | `effort:M` |
| 5 | 25h | 3 | `effort:M` |
| 8 | 40h | 5 | `effort:L` |
| 13 | 65h | 8 | `effort:XL` — señal de partir el issue, no de estimarlo |

Techo por carril:

```
horas_netas_persona = 80 × focus
horas_carril        = Σ (horas_netas × dedicación declarada al carril)
techo_SP_carril     = horas_carril / horas_por_SP
```

**Reserva reactiva del carril UX: 40% desde S2.** En de-wall, 55 de 98 issues de UX (56%) fueron
reactivos — ajustes que salieron de una demo o de una review, imposibles de planificar antes de que
la demo ocurriera. En S1 la reserva es 0 porque todavía no hubo demo que los genere.

> El pico está en S2, no repartido parejo. Midiendo el sprint 2 de de-wall: **16 de 20 issues de UX
> fueron reactivos (80%)** — es el sprint inmediatamente posterior a la primera demo, donde entra
> de golpe todo lo que el cliente vio por primera vez. Planificar S2 con sólo 40% de reserva deja
> el carril corto. Para S2 conviene invertir la proporción y reservar ~60%, y volver a 40% desde S3.

La dedicación al carril se declara por persona y por sprint. El FDE típicamente reparte entre
producto e infra en S1 y se corre a dev desde S2.

> El techo arranca deliberadamente más conservador que lo que de-wall entregó (que fue 80 SP en S1
> con 2 dev + 1 UX). Sube con datos medidos. Arrancar optimista y absorber el desvío es exactamente
> lo que el código de ética obliga a pagar a ASOME.

---

## 4. Dual-track — el diseño va un sprint adelante

```
carril UX   ██████▓▓▓▓   S3 diseña S4      ▓ = reserva reactiva 40%
carril dev       ██████████   S3 construye lo diseñado en S2
            └──── 1 sprint de lead ────┘
```

Regla: **el `track:ux` de un issue cierra en el sprint N-1 respecto del `track:dev` que lo
consume.** Eso le da al cliente una ventana completa para validar el diseño antes de que se
construya.

### Por qué esto se documenta y aun así se incumple

de-wall ya tenía la regla escrita: la descripción del label `track:ux` dice *"UX/UI design track —
leads 1 sprint"*. El lead real medido fue:

| Issue UX | Handoff comprometido | Cierre real | Lead sobre su gemelo dev |
|---|---|---|---|
| #92 `[UX] HU-01` | `Handoff by 2026-06-29` | 2026-07-06 | 7 días tarde |
| #98/#99 `[UX] HU-07/08` | — | 2026-07-23 | 6 días |
| #101 `[UX] HU-10` | — | 2026-07-27 | 2 días |
| #91 wireframes base | — | 2026-07-14 | cerró 1 día antes de terminar el sprint |

Y se pagó: `[UX] HU-03` (#94) cerró el 2026-07-06; el 2026-07-17 el cliente cambió de idea en la
Sprint Review y #259 quedó registrado diciendo *"Esto reemplaza el diseño de #94, que queda
obsoleto"*.

Escribir la regla no la sostiene. Lo que la sostiene es **medir el lead time real cada sprint y
exponerlo en el report**, para que la erosión sea visible en vez de silenciosa.

---

## 5. Definition of Done — tres niveles

Generalizada de `de-wall/dewall-docs/team/definition-of-done.md` v1.0. Reemplaza y reconcilia las
definiciones sueltas que vivían en `asome-create-issue` (checklist por issue) y en
`asome-kickoff/references/deck-canon.md` B06b (matriz del deck).

**Un entregable que no pasa todos los criterios de su nivel no está Done.** No moverlo a Done en el
board hasta verificar cada punto.

### Nivel 1 — por historia

*Funcional* — criterios de aceptación del issue verificados en el entorno desplegado · flujo feliz
sin errores reproducibles · casos de borde cubiertos, o diferidos con ticket y justificación
escrita · sin regresiones en lo ya mergeado.

*Código* — PR con contexto, cambios y cómo testear · mínimo 1 review aprobado sin comentarios
bloqueantes · lint en 0 errores · tests verdes incluidos los nuevos · cobertura ≥70% en módulos
nuevos o modificados · sin `console.log` de debug ni código comentado · variables de entorno nuevas
en `.env.example` · tipos compartidos actualizados si aplica.

*Deploy* — mergeado sin conflictos · CI/CD verde de punta a punta · funcionalidad accesible y
verificable en el entorno desplegado · sin errores nuevos en el monitoreo post-deploy.

*Documentación* — README actualizado si cambió arquitectura o setup · decisión de diseño no trivial
documentada en el código o como ADR breve.

### Nivel 2 — por sprint

*Completitud* — todas las historias comprometidas alcanzan el Nivel 1 · las no completadas tienen
justificación escrita y re-estimación · backlog del sprint siguiente refinado ≥80%.

*Calidad técnica* — rama de integración sin tests en rojo al cierre · sin deuda técnica crítica sin
ticket · sin errores sin asignar en el monitoreo · sin endpoints por encima del umbral de latencia
acordado.

*Demo y validación* — **demo en vivo con el cliente** (o video grabado enviado ese día) · entorno
accesible al cliente para pruebas propias post-demo · email de resumen enviado ese día · ventana de
validación abierta: N días hábiles para objeciones por escrito, sin objeciones = validado.

*Proceso* — **retrospectiva completada con al menos una acción de mejora identificada y asignada** ·
**horas del sprint registradas** · estado de todas las tareas actualizado en el board.

### Nivel 3 — por hito

QA cross-device y cross-browser · accesos entregados al cliente · validación escrita del cliente ·
deploy a producción.

> Cambios al DoD requieren acuerdo en retrospectiva y quedan versionados con fecha y responsable.

### La retro es el criterio que más se incumple

En de-wall la retrospectiva está mandada por la DoD **y** por el team-charter, y no existe **ni un
solo artefacto de retro** en el repositorio. Proceso documentado, nunca ejecutado. Por eso
`/asome-sprint close` escribe el archivo: un criterio de DoD que no produce artefacto no se puede
verificar.

---

## 6. Reglas de slicing

**Un issue = una rebanada vertical demostrable.** Si al cerrarlo no podés mostrarle algo a alguien,
no es un issue: es una subtarea y va como checkbox adentro de otro.

El modelo correcto es el de de-wall: **un issue de dev por historia, fullstack, con subsecciones por
capa adentro, más un gemelo `[UX] HU-NN`**.

```
✓  HU-001 — Padrón de soportes: alta, edición, baja y listado con filtros   track:dev
   ## Scope
   ### Datos     ### API     ### Pantalla
   ─────────────────────────────────────────────────────────────────
   [UX] HU-001 — Padrón de soportes: listado, filtros y ficha           track:ux

✗  HU-001: endpoints de soporte                                    area:backend
   Padrón: listado con filtros                                     area:frontend
```

Partir por capa produce dos issues donde ninguno es demostrable solo, un Done que miente, SP
contados dos veces y una dependencia que nadie trackea.

Excepciones legítimas — trabajo sin superficie de usuario:

- infra, pipeline, hosting
- esquema de datos transversal a N features
- spike o research time-boxed
- trabajo de UX (carril propio, `track:ux`)

---

## 7. Template — `sprint-NN-plan.md`

Estructura de nueve secciones, tomada de `de-wall/dewall-docs/roadmap/sprint-01-plan.md`:

```markdown
---
titulo: "Sprint N — <nombre>"
sprint: "SN — Semanas X–Y"
responsable: <nombre>
estado: draft-v1
fuentes: [<docs de los que deriva>]
---

# Sprint N — <nombre>

> Kickoff: <fecha>. Demo: <fecha>. Validación: N días hábiles (Cláusula <n>).

## 1. Objetivo del Sprint      <- una frase, en presente, verificable
## 2. Track <A>                <- por carril: infra · producto · UX
   2.1 <subsección>            <- con trámites de terceros si los hay
## 3. Track <B>
   3.1 Backlog del sprint      <- tabla de HUs con MoSCoW, SP y horas estimadas
   3.2 Tareas técnicas por capa
## 4. Definition of Done       <- por HU y del sprint (cita el canon)
## 5. Plan Día a Día           <- grilla de 10 días, carriles en paralelo
## 6. Dependencias del Cliente <- qué, quién y para cuándo
## 7. Demo & Validación        <- agenda por minutos + post-demo
## 8. Riesgos del Sprint
## 9. Documentos Relacionados
```

Dos detalles que de-wall aprendió y conviene copiar:

- **Los trámites de terceros arrancan en los primeros 3 días** del proyecto. Tienen SLA propio y
  bloquean sprints posteriores; si empiezan tarde, el retraso no se recupera.
- Desde el sprint 2, una sección **§0 Track Setup** al principio: paquetes nuevos, variables de
  entorno nuevas, deltas de infraestructura y acciones en portales externos, ejecutada **antes** de
  cualquier tarea de build.

---

## 8. Template — `docs/product/11-plan-de-sprints.md`

Es el documento que `/asome-kickoff` lee. Contiene: el calendario con fechas absolutas y el hito
contractual de cada sprint, la forma de los dos primeros sprints con sus carriles, los entregables
por hito, las reglas de cierre de sprint (demo, ventana de validación, corrección sin costo), la
política de cambios de alcance, y los riesgos de cronograma ya identificados.

**Milestone y Sprint dicen cosas distintas y hay que mantenerlas separadas:** milestone es el
compromiso con el cliente y no se mueve; sprint es el compromiso del equipo. Cuando un issue se
corre de sprint pero el hito no, eso *tiene que* ser visible.

---

## 9. Reglas de compromiso

1. **Milestone siempre. Sprint solo si está comprometido** para el sprint actual o el siguiente. Más
   allá de eso: Sprint vacío, Status Backlog. Pre-asignar seis sprints es waterfall con nombre de
   scrum.
2. **No comprometas S3+ hasta tener la velocity real de S1.** Las estimaciones de los módulos
   posteriores dependen de un relevamiento que todavía no ocurrió.
3. **Ningún carril entrega sólo documentos en S1.** Un carril que cierra el sprint con un PDF no fue
   verificado.
4. **Las ceremonias no son issues.** Una demo de hito va con SP 0 o vive como fecha del milestone;
   si suma puntos, infla la velocity y el burndown miente.
5. **Los ADRs describen lo que corre**, no lo que se planea. Un ADR escrito antes de la primera
   línea es una hipótesis con formato de decisión.
