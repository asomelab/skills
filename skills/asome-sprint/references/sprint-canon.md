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
   ► registro long-lead abierto (§10.2)

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
                ► plantilla de rebanada vertical (§10.4)
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

→ §12 refina qué entrega este carril: patrones + hi-fi de lo complejo + declaración del resto.

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
   3.1 Backlog del sprint      <- tabla de HUs con MoSCoW (§11.1), SP y horas estimadas
   3.2 Tareas técnicas por capa
## 4. Definition of Done       <- por HU y del sprint (cita el canon)
## 5. Plan Día a Día           <- grilla de 10 días, carriles en paralelo
## 6. Dependencias del Cliente <- qué, quién y para cuándo; incluye lo etiquetado needs:client (§10.5)
## 7. Demo & Validación        <- agenda por minutos + post-demo
## 8. Riesgos del Sprint       <- y la fila de decisión de capacidad si el gap ≥1.3× lo amerita (§11.2)
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

**Tres bloques nuevos, obligatorios cuando aplican** (no todos los proyectos los necesitan desde
el día uno, pero el documento nombra explícitamente su ausencia en vez de omitirlos en silencio):

- **La lista de recorte** (§11.1) — `scope:cut-1` vs `scope:out`, escrita antes de empezar.
- **El registro long-lead** (§10.2) — o el pointer a `docs/product/long-lead.md` si vive aparte.
- **La decisión de capacidad**, si el gap SP-planificados/techo-acumulado llega a ≥1.3× (§11.2) —
  fecha, salidas con costo, dueño.

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
6. **Ningún issue se asigna a alguien que no tiene el acceso que el issue requiere** — verificado
   ejecutándolo, no declarándolo (ver `asome-infra-setup/references/access-model.md`).
7. **Ningún sprint por encima del techo contiene trabajo de profundidad 0** (§10.3) — eso es
   exactamente lo que sirve para sacar.

---

## 10. Secuenciación: qué va antes que qué

El orden de un backlog priorizado responde al valor para el cliente. El orden de *construcción*
responde a otra cosa: qué depende de qué. Esta sección fija ese segundo orden — el que un agente
(o un PM) usa para decidir en qué sprint entra cada pieza, independiente de en qué orden el
cliente la pidió.

### 10.1 Lo transversal es fundación, no feature

Roles/permisos, multi-tenancy y auditoría se construyen con la **segunda entidad** del sistema, **y
nunca después de la mitad del proyecto** — no lo ates a "el sprint siguiente a la primera
rebanada", porque en un proyecto de 3 sprints no hay sprint siguiente; la invariante real es "con
la segunda entidad, antes de la mitad". Por qué: retrofitear un permiso sobre N pantallas ya
validadas por el cliente no cuesta N veces construirlo bien — cuesta N veces la revalidación.
Señal de que está mal ubicado: el issue de permisos vive en el mismo sprint que el módulo con más
pantallas.

### 10.2 El trabajo de tercero arranca en el sprint más temprano que pueda probarlo

Esa es la ley — "a más tardar en S2" es el *default*, no una obligación fija; cuando no puede ser
S2, el registro anota por qué y desde cuándo sí es posible. Registro dedicado:
`docs/product/long-lead.md`, columnas `qué · tercero · SLA declarado · qué desbloquea · sprint del
trámite · sprint del consumo · dueño · estado`. Regla dura: el issue del trámite se separa del
feature que lo consume — un issue que mezcla homologación con feature no puede cerrar hasta que
responda el tercero, y arrastra el sprint entero con él. Lista canónica a evaluar uno por uno en
`bootstrap`, "no aplica" es respuesta válida si queda escrita: organismo fiscal (ARCA/AFIP WSFE o
equivalente), pasarela de pago, proveedor de mapas/geocoding, dominio y DNS, correo transaccional
con dominio verificado, firma digital y certificados, archivos de datos que provee el cliente
(padrón, catálogo, tarifario).

### 10.3 El CRUD independiente es lastre

Después de planificar, ordenar el trabajo por profundidad de dependencia — profundidad 0 = no
espera diseño, ni otra entidad, ni un trámite, ni el transversal. **Esto es un reporte, no un
movimiento automático.** Trabajo de profundidad 0 es exactamente el mejor lastre para llenar un
sprint liviano o para que un dev nuevo o alguien bloqueado tenga algo que tomar — automatizar su
movimiento puede vaciar el único sprint donde alguien tenía algo que hacer. El ordenamiento se
niega a correr si menos del 30% de los issues abiertos tienen algún eje `needs:*` declarado — sin
eso, todo es "profundidad 0" y el orden es ruido, no señal.

### 10.4 La plantilla de rebanada vertical se construye una vez

Como issue `type:setup` explícito en el sprint que construye la **segunda** entidad — con la
primera no hay patrón que extraer, con la tercera ya hay tres formas distintas y ninguna es "la"
plantilla. Contenido esperado: modelo + migración con columna de tenant + repositorio con filtro
de tenant obligatorio + endpoints CRUD + tabla con filtros y paginación + formulario de
alta/edición + estados vacío/carga/error + una prueba de la rebanada. Criterio de aceptación
verificable, no declarativo: **la siguiente entidad CRUD entra en 2-3 SP en vez de ~5, y el PR que
la construye lo demuestra.** Si el costo de la siguiente entidad no baja, lo que se construyó fue
un documento, no una plantilla.

### 10.5 Taxonomía de dependencias — cuatro ejes

| Eje | Significa | Se expresa en el board |
|---|---|---|
| `needs:ux` | espera diseño | label existente + `⛔ **Bloqueado por UX:** #N` en el cuerpo |
| `needs:dep` | espera otro issue de dev | label nueva + `⛔ **Depende de:** #N — *título*.` en el cuerpo |
| `needs:third-party` | espera un tercero con SLA | label nueva + fila en `long-lead.md` |
| `needs:client` | espera dato, archivo o decisión del cliente | label nueva + fila en §6 (Dependencias del Cliente) del sprint-plan |

Cierre: un issue sin ninguno de los cuatro es profundidad 0 por definición — si eso es falso para
un caso concreto, lo que falta es declarar la dependencia, no discutir el orden.

---

## 11. El compromiso frente a un contrato de alcance fijo

### 11.1 La lista de recorte se pacta en la planificación

No se descubre en el deadline — escrita en `11-plan-de-sprints.md` antes de empezar, visible para
el cliente, en dos bloques que **no se mezclan**: `scope:cut-1` (contratado, de menor valor —
sacarlo requiere conformidad escrita del cliente) y `scope:out` (ya excluido del contrato — se
lista para que nadie lo dé por incluido a mitad de proyecto). Define MoSCoW (hoy el canon lo
menciona una vez sin definirlo): **Must** = sin esto el hito no cumple el contrato · **Should** =
el hito cumple degradado, entra si hay capacidad · **Could** = primera línea de la lista de
recorte · **Won't** = fuera de contrato, declarado. Regla dura: **Must ≤ 60% de los SP del
sprint** — un sprint 100% Must no tiene lista de recorte, tiene una sola salida y es correr la
fecha.

### 11.2 Un gap de capacidad es una decisión con fecha, no una nota

Cuando los SP planificados superan el techo acumulado por más de **1.3×**, el plan no cierra sin
nombrar: (1) fecha de decisión — default el cierre del primer sprint, primer momento con velocity
medida; (2) dos o tres salidas concretas con su costo — sumar capacidad (cuántas personas, desde
qué sprint, quién la paga) · renegociar alcance (qué bloque exacto sale, contra qué cláusula) ·
aceptar y absorber (cuántas horas, y que el código de ética las convierte en costo de quien
construye, no del cliente); (3) un dueño de la decisión. Aclaración explícita para que esto no se
lea como una tolerancia: **1.0× ya es el techo — 1.3× es donde el plan deja de ser un plan y pasa
a ser una apuesta.** Un gap de 3× no es "un gap que se gestiona": es otro proyecto, y se nombra
así.

### 11.3 Resecuenciar contra un contrato

La regla que un agente chequea **antes** de tocar el board:

| Movimiento | Requiere |
|---|---|
| A un hito **anterior** | nada — interno |
| **Dentro** del mismo hito | nada — interno |
| **Fuera** de un hito cuyo entregable lo nombra | conformidad escrita del cliente, **antes** de tocar el board |

§8 ya distingue milestone de sprint; ésta es la consecuencia operativa: **"El Sprint se mueve
solo; el Milestone no se mueve sin papel."** Cambiar el board no cambia el compromiso — sólo
esconde que se rompió.

---

## 12. El carril de diseño entrega patrones, no pantallas

Refina §4 (dual-track), no lo reemplaza. Tres capas: **patrones** (biblioteca que crece un sprint
por vez: tabla con filtros y paginación, formulario de alta/edición, ficha con pestañas,
confirmación destructiva, estados vacío/carga/error, navegación y layout) · **hi-fi** sólo para lo
que no se deriva de un patrón (calendarios y grillas de ocupación, mapas, tableros, flujos
multipaso, cualquier pantalla con una regla de negocio visual propia) · **declaración** para el
resto, una fila por pantalla: `patrón: tabla+filtros · campos: nombre, tipo, zona, estado ·
acciones: alta, edición, baja`. Dos reglas que lo mantienen honesto: (1) una pantalla "declarada"
cuenta como diseñada para el DoD Nivel 2 **sólo si** su patrón ya está construido en código — si
no, es una promesa; (2) **si el contrato enumera pantallas explícitamente, pasar a esta forma es
una propuesta al cliente acordada por escrito, no una reinterpretación unilateral** — misma
disciplina que §11.3. Sin este segundo punto, el patrón se convierte en la forma de reducir el
alcance sin avisar, que es justo lo que §11 existe para prevenir.
