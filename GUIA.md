# Guía de uso de las skills de ASOME

Una **skill** es una receta escrita que Claude Code lee para hacer una tarea como la hace ASOME: con los mismos pasos, los mismos nombres y las mismas reglas cada vez. Vos pedís lo que necesitás ("poneme al día con este proyecto", "armame las slides de la demo") y Claude sigue la receta que corresponde.

Esta guía es para todas las personas de ASOME que usan Claude Code, desde la terminal o desde la app de escritorio de Claude, sepan programar o no. Explica las 22 skills del repositorio [asomelab/skills](https://github.com/asomelab/skills): para qué sirve cada una, cuándo usarla, cómo pedirla, qué necesitás antes y qué cambia cuando termina. Está escrita a partir de las instrucciones de cada skill, tal como estaban en octubre de 2026. Si una skill se comporta distinto de lo que dice acá, mandan las instrucciones de la skill: avisale al equipo para corregir la guía.

¿Venís a hacer tu primer reel? Empezá por [`TUTORIAL-VIDEO.md`](TUTORIAL-VIDEO.md): es un paso a paso desde cero hasta publicarlo.

## En esta guía

- [Cómo instalarlas](#cómo-instalarlas)
- [Cómo se usan](#cómo-se-usan)
- [Mapa rápido](#mapa-rápido)
- Las skills, grupo por grupo:
  - [Grupo 1: Setup, preparar el proyecto](#grupo-1-setup-preparar-el-proyecto)
  - [Grupo 2: Descubrimiento de producto](#grupo-2-descubrimiento-de-producto)
  - [Grupo 3: Especificación con SDD](#grupo-3-especificación-con-sdd)
  - [Grupo 4: Desarrollo del día a día](#grupo-4-desarrollo-del-día-a-día)
  - [Grupo 5: Infraestructura](#grupo-5-infraestructura)
  - [Grupo 6: Sprint y tablero](#grupo-6-sprint-y-tablero)
  - [Grupo 7: Sistema de diseño](#grupo-7-sistema-de-diseño)
  - [Grupo 8: Calendario y reuniones](#grupo-8-calendario-y-reuniones)
  - [Grupo 9: Contenido](#grupo-9-contenido)
- [Flujos típicos](#flujos-típicos)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Cómo instalarlas

Las skills viven en un repositorio de GitHub y se instalan con un solo comando. Alcanza con hacerlo una vez por compu.

### Antes de empezar

| Herramienta | Para qué sirve | Quién la necesita |
|---|---|---|
| Claude Code | Es donde corrés las skills (terminal o app de escritorio) | Todas |
| Node.js (trae `npx`) | Instalar las skills y OpenSpec. Se descarga de nodejs.org; conviene la versión 20.19 o más nueva, que es la que pide OpenSpec | Instalación, `asome-setup`, `asome-sdd`. `asome-video` y `asome-video-producto` la instalan solas si falta |
| Git y GitHub CLI (`gh`) | Trabajar con repositorios, issues, PRs y el tablero | Las skills que hablan con GitHub (ver más abajo) |
| `jq` y `python3` | Leer `.asome/config.json` y armar resúmenes | `asome-create-issue`, `asome-sprint`, `asome-standup`, `asome-sprint-demo` y otras |
| Terraform y AWS CLI | Infraestructura en la nube | `asome-infra-setup` y `asome-infra-plan` (las dos); `asome-infra-costs` (solo AWS) |
| Conector de Google Calendar (y Gmail) | Agendar reuniones y encontrar mails de invitados | `asome-meeting`, `asome-kickoff agenda` |
| Claude Design | Armar presentaciones a partir del texto que te dan las skills | `asome-kickoff`, `asome-sprint-demo` |

Un **conector** (también se lo llama MCP) es una conexión de Claude con otra herramienta, como Google Calendar o Gmail.

### Instalar todas las skills

1. Abrí la terminal: la ventana donde se escriben comandos (en Mac se llama Terminal). Si preferís, pedile a Claude Code: "instalá las skills de ASOME con `npx skills add asomelab/skills`".
2. Corré este comando:

```bash
npx skills add asomelab/skills
```

3. El instalador te hace algunas preguntas, en inglés. Si te pregunta para qué herramienta, marcá Claude Code. Si te pregunta si es para un proyecto o de forma global, elegí global, así las tenés en todos tus proyectos.

### Instalar una sola skill

```bash
npx skills add asomelab/skills@asome-standup
```

Cambiá `asome-standup` por el nombre de la skill que quieras (los nombres están en el [mapa rápido](#mapa-rápido)).

### Dónde quedan

Se guardan en la carpeta `~/.agents/skills/` de tu usuario, con un acceso directo en `~/.claude/skills/`, que es de donde las lee Claude Code. Para verificar:

```bash
ls ~/.agents/skills | grep -E '^(asome-|design-system-)'
```

Deberías ver una carpeta por cada skill instalada.

### Cómo actualizarlas

```bash
npx skills update
```

Las skills cambian seguido: se corrigen pasos y se suman modos. Actualizá cada tanto, y siempre que una skill se comporte raro o te pida algo que esta guía no menciona.

### Chequear tu compu

Parado en la carpeta de un proyecto, pedí `/asome-setup doctor`. Revisa Node.js, pnpm, `gh`, OpenSpec, Claude Code, Codex y las skills `asome-*` instaladas, te dice qué falta y qué se rompe por cada faltante, y no cambia nada hasta que le digas que lo arregle.

---

## Cómo se usan

### Abrí Claude Code en la carpeta del proyecto

Casi todas las skills leen archivos de la carpeta donde estás parado: `.asome/config.json`, `docs/`, `infra/`. Abrí Claude Code apuntando a la carpeta del proyecto (la raíz del repositorio, o **repo**: la carpeta del proyecto con todo su historial, guardada en GitHub). Las excepciones son `asome-meeting`, `asome-video`, `asome-video-producto` y `design-system-asome-lab`, que no dependen de un proyecto (las de video trabajan en su propio repositorio, `asomelab/videos`), y `asome-create-skill`, que se corre parado en el repo de skills.

### Dos formas de pedir una skill

1. **Con barra.** Escribí `/` y empezá a tipear el nombre: `/asome-standup`. Algunas aceptan un **modo** a continuación: `/asome-setup doctor`, `/asome-sprint close`, `/asome-deploy staging`, `/asome-kickoff acta`.
2. **Con tus palabras.** "Poneme al día con este proyecto", "agendá una reunión con Acme el jueves a las 15", "qué mostramos en la demo". Cada skill tiene frases gatillo en su descripción (las de cada una están en su apartado, en "Cómo se invoca"). Si Claude no elige la skill por su cuenta, nombrala: "usá asome-onboard".

### Qué esperar cuando corrés una skill

- **Algunas ejecutan directo, sin vista previa** (por ejemplo `asome-commit`, `asome-branch-pr` o `asome-meeting`), así que revisá bien tu pedido antes de mandarlo.
- **Otras frenan y te piden confirmar** antes de cambiar algo importante: `asome-infra-plan apply`, `asome-sprint resequence --apply`, `asome-deploy main`, o `/opsx:propose`, que espera la aprobación de una persona.
- **Las que necesitan datos preguntan todo junto**, en un solo mensaje, y cuando pueden traen una propuesta armada (en `asome-sprint-demo`, un "ok" confirma todas). Respondé de una vez.
- **Lo que no saben no lo inventan.** Lo dejan marcado como un hueco para que alguien lo responda (ver [las preguntas frecuentes](#preguntas-frecuentes)).
- **Cuidá los datos.** No pegues en el chat credenciales ni datos reales de clientes (por ejemplo, en el log de un bug).

### Qué skills necesitan `.asome/config.json`

Es el archivo con los datos del tablero del proyecto (número del GitHub Project, campos, sprints, ramas de despliegue). Lo crea `/asome-setup`, que se corre **una vez por proyecto**. El archivo queda guardado en git, así que lo comparte todo el equipo.

- **Lo necesitan:** `asome-create-issue`, `asome-branch-pr`, `asome-deploy`, `asome-standup`, `asome-sprint`, `asome-sprint-demo` y `asome-infra-setup`.
- **Lo aprovechan si está:** `asome-onboard` (con el archivo muestra el tablero completo), `asome-review` y `asome-infra-costs` (para saber de qué repo se trata) y `asome-kickoff` (solo en el modo `agenda`).
- **No lo usan:** `asome-commit`, `asome-discovery`, `asome-sdd`, `asome-infra-audit`, `asome-infra-plan`, `asome-meeting`, `design-system-asome-lab`, `asome-video`, `asome-video-producto` y `asome-create-skill`.

Si falta, la skill te avisa y te manda a `/asome-setup`.

### Qué skills necesitan `gh` autenticado

`gh` es la herramienta de línea de comandos de GitHub. Para ver si estás conectado: `gh auth status`. Si no, `gh auth login` (en Claude Code podés escribir `! gh auth login` para correrlo sin salir de la sesión).

- **Lo necesitan:** `asome-setup`, `asome-create-issue`, `asome-branch-pr`, `asome-deploy`, `asome-sprint`, `asome-standup`, `asome-sprint-demo` e `asome-infra-setup` (clona el repo de infraestructura de ASOME, así que también necesitás acceso a la organización).
- **Lo usan para guardar cada video:** `asome-video` y `asome-video-producto` clonan el repo privado `asomelab/videos` y suben ahí cada reel. Sin acceso trabajan en un repositorio local, solo en tu compu.
- **`asome-sprint-demo`** pide además el permiso `read:project`: `gh auth refresh -s read:project`.
- **Según el caso:** `asome-review` lo usa para revisar un PR por número, y `asome-onboard` lo usa para leer los issues (si no lo encuentra, intenta instalarlo con Homebrew).

### Qué skills solo miran y cuáles cambian cosas

**Solo leen y te informan**
- `asome-onboard`, `asome-standup`, `asome-review`, `asome-infra-audit`, `asome-infra-costs`.
- Y estos modos: `/asome-setup doctor`, `/asome-sprint report`, `/asome-sprint resequence --suggest`, `/asome-discovery auditar`, `/asome-infra-plan` (el plan, que no cambia la nube).
- `asome-sdd` es una guía: los archivos los crean los comandos `/opsx:*`.
- `asome-kickoff` y `design-system-asome-lab` te entregan texto en el chat (el modo `agenda` de `asome-kickoff` es la excepción: crea eventos).

**Escriben archivos en tu compu o en tu proyecto**
- `asome-setup`, `asome-discovery` (documentos en `docs/product/`), `asome-commit` (commits locales), `asome-create-skill`, `asome-infra-setup`.
- `asome-sprint` (`bootstrap` y `close` escriben documentos), `asome-sprint-demo` (un archivo de la demo), `asome-video` y `asome-video-producto` (instalan programas, crean una carpeta por reel en el repo de videos y dejan los archivos finales en Descargas).

**Cambian algo afuera (GitHub, calendario, nube)**
- `asome-create-issue`, `asome-branch-pr`, `asome-deploy`, `asome-setup` (etiquetas del repo), `asome-sprint` (tablero e issues).
- `asome-meeting` y `asome-kickoff agenda` (crean eventos y mandan invitaciones).
- `asome-video` y `asome-video-producto` (suben commits a `asomelab/videos` y copian las entregas al Drive de ASOME).
- `asome-infra-plan apply` y `destroy` (la nube, solo con tu confirmación).

### Palabras que vas a ver

| Palabra | Qué significa |
|---|---|
| Terminal | La ventana donde se escriben comandos. Claude Code corre ahí o en la app de escritorio de Claude |
| Repo (repositorio) | La carpeta de un proyecto con todo su historial, guardada en GitHub |
| Rama (branch) | Una copia de trabajo paralela, para cambiar cosas sin tocar la versión principal |
| Commit | Un punto guardado en el historial del proyecto, con un mensaje que explica el cambio |
| PR (pull request) | El pedido para que otra persona revise tus cambios y los sume a la rama principal |
| Issue | Una tarea, un bug o un pedido, anotado en GitHub |
| Tablero (board) | El GitHub Project: una tabla donde cada issue tiene etapa, prioridad, tipo, área, puntos, fechas y sprint |
| Etapa (Stage o Status) | Dónde está un issue: Backlog, To Do, In Progress, In Review, Blocked, Done, Cancelled |
| Sprint | Un ciclo de trabajo del equipo, normalmente de dos semanas de lunes a viernes |
| Hito (milestone) | Una entrega comprometida con el cliente. No se mueve sin acuerdo escrito, a diferencia del sprint, que lo ajusta el equipo |
| Story Points (SP) | La unidad con la que se estima el esfuerzo: al principio, 1 SP son unas 5 horas, y después se mide |
| HU | Historia de usuario: una necesidad escrita desde el punto de vista de quien la usa |
| SDD | Desarrollo guiado por especificación: se escribe y se aprueba qué se va a hacer antes de programar |
| OpenSpec | La herramienta que guarda esas especificaciones como archivos del proyecto (son los comandos `/opsx:*`) |
| Relevamiento | La primera etapa con el cliente: entrevistas a quienes ejecutan los procesos. De ahí sale el mapa operativo y entre 2 y 4 indicadores para medir |
| Staging y producción | Staging es el ambiente de prueba, previo a producción. Producción es el que usan las personas finales |
| Claude Design | Donde se arman las presentaciones: las skills te dan el texto para pegar ahí |
| `<<HUECO M-NN>>`, `⟨PENDIENTE⟩`, `D-NN`, `M-NN` | Marcas de "falta un dato" que la skill no quiso inventar. `M-NN` es un valor sin confirmar y `D-NN` una decisión abierta |

---

## Mapa rápido

| Skill | Para qué sirve | Cuándo usarla | Ejemplo de pedido |
|---|---|---|---|
| **Setup** | | | |
| `asome-setup` | Conecta el proyecto con su tablero y lo deja listo según el Manual de Ingeniería de ASOME | Una vez por proyecto; `doctor` para chequear | "configurá este proyecto para ASOME" |
| `asome-onboard` | Te da una foto completa de un proyecto: qué se construye, qué hay en curso, por dónde empezar | Primer día o al volver a un proyecto | "poneme al día con este proyecto" |
| `asome-create-skill` | Crea una skill nueva y la registra en el repo | Cuando un flujo se repite y querés dejarlo escrito | "quiero convertir este flujo en una skill" |
| **Descubrimiento de producto** | | | |
| `asome-discovery` | Ordena el descubrimiento: documentos de producto, historias de usuario y registros de dudas | Producto, módulo o competidor nuevo | "investigá este producto y escribí las historias de la fase 1" |
| **Especificación (SDD)** | | | |
| `asome-sdd` | Guía el método de especificar antes de programar | Antes de una feature de 3 puntos o más | "qué comandos uso para implementar esta feature" |
| **Desarrollo del día a día** | | | |
| `asome-create-issue` | Crea issues completos y los carga en el tablero | Cuando aparece trabajo nuevo | "creá un issue para el listado de clientes con filtros" |
| `asome-commit` | Guarda tus cambios en commits ordenados y con formato estándar | Al terminar una tarea | "commiteá mis cambios" |
| `asome-branch-pr` | Abre la rama y un PR bien armado, y mueve el issue a In Review | Cuando el trabajo está listo para revisión | "abrí el PR del issue 42" |
| `asome-review` | Revisa código contra la especificación, buenas prácticas y el sistema de diseño | Antes del PR, o al revisar el de otra persona | "revisá el PR 57" |
| `asome-deploy` | Lleva el código de dev a staging y de staging a producción, y publica la versión | Al promover cambios de ambiente | `/asome-deploy staging` |
| **Infraestructura** | | | |
| `asome-infra-setup` | Arma la infraestructura de un proyecto desde las arquitecturas de ASOME | Al empezar la nube de un proyecto | `/asome-infra-setup serverless` |
| `asome-infra-audit` | Audita Terraform y GitHub Actions contra buenas prácticas | Antes de aplicar cambios o ir a producción | "auditá la infraestructura" |
| `asome-infra-costs` | Revisa el gasto en AWS y propone ahorros | Para entender o bajar costos | "cuánto gastamos en AWS" |
| `asome-infra-plan` | Muestra qué cambiaría en la nube y aplica solo si confirmás | Antes de cualquier cambio de infraestructura | `/asome-infra-plan drift` |
| **Sprint y tablero** | | | |
| `asome-sprint` | Maneja el ciclo de sprints: armarlos, planificarlos, mover issues, cerrarlos y reportar | Durante todo el proyecto | "cerrá el sprint 3" |
| `asome-standup` | Resumen diario del tablero | Antes de la daily | "standup" |
| **Sistema de diseño** | | | |
| `design-system-asome-lab` | Guía para escribir tokens, reglas de componentes y accesibilidad | Al crear o actualizar documentación de diseño | "documentá las reglas del componente botón" |
| **Calendario y reuniones** | | | |
| `asome-meeting` | Agenda reuniones en el calendario de ASOME con sus convenciones | Cualquier reunión | "agendá una reunión con Acme el jueves a las 15" |
| `asome-kickoff` | Prepara el kick-off: texto para la presentación, acta y eventos | Al arrancar un proyecto con un cliente | "armá el kickoff del proyecto Acme" |
| `asome-sprint-demo` | Prepara la demo de fin de sprint y el mail posterior | Uno o dos días antes de la demo, y el día de la demo | "qué mostramos en la demo del jueves" |
| **Contenido** | | | |
| `asome-video` | Edita reels verticales de marca desde cero y arma el paquete para publicar | Cuando tenés un video grabado en vertical | "editá este reel" |
| `asome-video-producto` | Reel de un software que ASOME hizo para un cliente, con voz IA | Cuando querés mostrar una app o plataforma | "hagamos un reel de producto de la app" |

---

## Grupo 1: Setup, preparar el proyecto

*En `skills.sh.json`: Setup.* Estas tres skills preparan el terreno: el proyecto, tu compu y las propias skills.

### `/asome-setup`

**Para qué sirve.** Deja un proyecto listo para trabajar a la manera de ASOME. Primero lo conecta con su tablero: descubre el GitHub Project, guarda sus datos en `.asome/config.json` (lo leen casi todas las demás skills) y crea las etiquetas que usan los issues. Después instala lo que pide el Manual de Ingeniería de ASOME: OpenSpec, el archivo `AGENTS.md` con el contexto para los agentes, la lista de conectores permitidos (con reglas que bloquean los que pueden mandar mails, mensajes o gastar plata), el escaneo de secretos y los registros de la carpeta `docs/` (decisiones, deuda, excepciones, runbook). También revisa si el producto ya tiene login, roles y permisos bien armados.

**Cuándo usarla.** Una vez por proyecto, al arrancar. Volvé a correr `board` cuando se suma un sprint o una opción al tablero. `doctor` sirve cuando alguien entra al proyecto (antes de su primer PR), cuando pasó mucho tiempo sin chequear el repo contra el manual, o cuando otra skill falla porque falta algo.

**Cómo se invoca.**
- `/asome-setup`: el arranque completo (tablero y manual).
- `/asome-setup board`: solo la parte del tablero.
- `/asome-setup doctor`: audita tu compu y el repo, y no cambia nada.
- "configurá este proyecto para ASOME", "¿cumplo el manual?", "falta algo del manual".

**Qué necesitás antes.** Estar en la carpeta del repo, con `gh` autenticado y con acceso a los GitHub Projects de la organización. Si hay varios tableros, te pregunta cuál usar. Para la parte del manual hace falta Node.js; si falta OpenSpec, lo instala en tu compu. Como también agrega paquetes al proyecto, conviene que lo corra alguien del equipo de desarrollo.

**Qué te devuelve / qué cambia.** Crea `.asome/config.json` (queda en git y no tiene secretos) y las etiquetas del repo en GitHub. En el modo completo suma `openspec/`, `AGENTS.md`, reglas en `.claude/settings.json`, escaneo de secretos y los registros en `docs/`. Todo eso tiene que entrar en un solo PR contra la rama de desarrollo, con commits separados por tema. El modo `doctor` solo imprime un informe con tres niveles: CRITICAL (se incumple una regla obligatoria), WARNING (un estándar) y TARGET (está bien, pero depende de algo externo, como el plan de GitHub), y pregunta antes de arreglar nada.

**Cuidado con.**
- Nunca inventa datos: lo que no puede deducir queda como `<<HUECO M-NN>>` en `AGENTS.md`, para preguntárselo al cliente.
- Un archivo que existe no alcanza para dar algo por cumplido: `doctor` marca como crítico, por ejemplo, una protección automática (un hook) que está instalada pero inactiva.
- Si no hay módulo de login en el producto, lo deja como candidato de issue y no escribe código de auth por su cuenta.
- Volver a correrlo es seguro: reescribe el archivo de config con los datos actuales del tablero.

### `/asome-onboard`

**Para qué sirve.** Es el "poneme al día". Te da una foto del proyecto: qué se está construyendo, con qué tecnología, en qué sprint están, qué está en curso, bloqueado, en revisión y pendiente, qué se terminó en los últimos 7 días, por dónde conviene empezar y qué convenciones seguir.

**Cuándo usarla.** El primer día en un proyecto, al volver de unas vacaciones o cuando te pasan a otro proyecto.

**Cómo se invoca.**
- `/asome-onboard`
- "poneme al día", "qué es este proyecto", "por dónde empiezo", "qué hay que hacer".

**Qué necesitás antes.** Nada obligatorio. Con `.asome/config.json` muestra el tablero completo (etapas, puntos, sprint). Sin él, muestra la lista de issues abiertos y lo que hay en el repo (README, estructura de carpetas, últimos commits). Para leer GitHub usa `gh`.

**Qué te devuelve / qué cambia.** Un resumen en el chat, con una recomendación de primer issue y un siguiente paso concreto. No cambia nada en el proyecto ni en GitHub, salvo que le falte `gh` y intente instalarlo con Homebrew.

**Cuidado con.**
- Si te dice que no estás autenticado, corré `gh auth login` (en Claude Code, `! gh auth login`).
- Si el resumen del sprint parece viejo, es probable que el config esté desactualizado: volvé a correr `/asome-setup`.
- Si el proyecto no tiene issues, arma la foto con el README y los commits recientes y te propone la primera acción.

### `/asome-create-skill`

**Para qué sirve.** Crea una skill nueva para este repositorio: genera el `SKILL.md` (las instrucciones, con sus frases gatillo), el `metadata.json` y la anota en `skills.sh.json`, en el grupo que corresponde.

**Cuándo usarla.** Cuando un flujo de trabajo se repite y querés dejarlo escrito para todo el equipo. La usa quien mantiene el repo de skills.

**Cómo se invoca.**
- `/asome-create-skill`
- "nueva skill", "agregar skill", "tengo un flujo que quiero convertir en skill".

**Qué necesitás antes.** Abrir Claude Code en la raíz del repo de skills. Tené a mano el nombre (`asome-<verbo>` o `asome-<sustantivo>`), una descripción de una línea con las frases gatillo, el grupo y un resumen de dos o tres oraciones. Lo que falte, lo infiere del contexto o te lo pregunta.

**Qué te devuelve / qué cambia.** Archivos nuevos `skills/<nombre>/SKILL.md` y `metadata.json`, y una línea en `skills.sh.json`. Al final imprime lo que creó. Ejecuta directo, sin vista previa.

**Cuidado con.**
- Si no queda registrada en `skills.sh.json`, la skill no aparece en el autocompletado.
- Las skills no llevan nombres de repos ni IDs fijos: esos datos salen de `.asome/config.json` de cada proyecto.
- Según el `AGENTS.md` del repo, el README es el registro de skills y hay que mantenerlo al día. Esta skill no lo toca, así que sumá la fila a mano.

---

## Grupo 2: Descubrimiento de producto

*En `skills.sh.json`: Product Discovery.* Define qué construir y por qué. Corre antes del SDD y nunca decide tecnología.

### `/asome-discovery`

**Para qué sirve.** Ordena el descubrimiento de producto: investigar un producto, un competidor o un módulo antes de pensar en cómo se construye. Genera la carpeta `docs/product/` con un set fijo de documentos (visión, usuarios, principios, épicas, roadmap, métricas), las historias de usuario (HU) con una plantilla de siete bloques y dos registros: `decisiones.md` (preguntas abiertas que tiene que resolver una persona, `D-NN`) y `mediciones-pendientes.md` (valores sin confirmar, `M-NN`). Nunca inventa un dato: cada hueco queda registrado y se pregunta.

**Cuándo usarla.** Con un producto nuevo, para analizar a un competidor, para planificar un módulo o una fase nueva, o para auditar un set de documentos existente.

**Cómo se invoca.**
- `/asome-discovery nuevo <producto>`: esqueleto completo, épicas, roadmap y las HU de la fase 1.
- `/asome-discovery investigar <competidor o dominio>`: nota de investigación, glosario y entradas `M-NN`.
- `/asome-discovery fase <N>` y `/asome-discovery modulo <nombre>`: escriben las HU de una fase o de un módulo nuevo.
- `/asome-discovery auditar`: informe de diferencias contra la plantilla, sin editar nada.
- "investigar producto", "escribir HUs", "analizar competidor", "planificar módulo". Si no decís el modo, lo deduce y te lo confirma.

**Qué necesitás antes.** Nada técnico. Antes de escribir te hace seis preguntas juntas: idioma, tipo de investigación, si ya existe `docs/product/`, si hay un actor que no es una persona (un bot, por ejemplo), qué evidencia hay y si es un entregable interno o de cliente. Tené las respuestas pensadas, porque no adivina ninguna.

**Qué te devuelve / qué cambia.** Archivos Markdown dentro de `docs/product/`: documentos numerados, `hu/hu-index.md`, una HU por archivo e `investigacion/`. No crea issues ni especificaciones. Las preguntas abiertas te las hace todas juntas al final de cada tanda. `auditar` devuelve un informe CRITICAL, WARNING y SUGGESTION.

**Cuidado con.**
- Un número sin etiqueta ni `M-NN` es un defecto del documento. Un `M-NN` abierto es un valor sin confirmar y un `D-NN` abierto es una decisión que tiene que tomar una persona: alguien tiene que responderlos.
- Solo se escriben las HU de la fase actual; las de fases futuras no se adelantan.
- El paso siguiente es de otra skill: los issues con `/asome-create-issue`, y la especificación con `/opsx:propose`.

---

## Grupo 3: Especificación con SDD

*En `skills.sh.json`: SDD Workflow.*

### `/asome-sdd`

**Para qué sirve.** Es la guía del método "primero se especifica y después se programa" (SDD). Dice cuándo es obligatorio, qué comandos se usan en cada etapa y en qué etapa del tablero está cada trabajo. Se apoya en OpenSpec: cada cambio tiene su carpeta `openspec/changes/<nombre>/` con propuesta, diseño, especificación y lista de tareas, y viaja en el mismo PR que el código.

**Cuándo usarla.** Antes de empezar una Feature o una Mejora de 3 puntos o más, o cualquier Setup. En la duda, si toca lógica de producto, usá SDD.

| Tipo de issue | Puntos | ¿SDD? |
|---|---|---|
| Feature o Improvement | 3 o más | Obligatorio |
| Setup | cualquiera | Obligatorio |
| Feature o Improvement | 1 o 2 | Recomendado |
| Research o Spike | cualquiera | Opcional (`/opsx:explore`) |
| Bug con causa conocida, Docs, Chore | cualquiera | No |

**Cómo se invoca.**
- `/asome-sdd`, "empezar feature", "qué comandos uso para implementar", "openspec".
- Los comandos del método los instala OpenSpec en cada proyecto (no son de este repo): `/opsx:explore <tema>` para pensar sin tocar código, `/opsx:propose <nombre-del-cambio>`, `/opsx:update`, `/opsx:apply` y `/opsx:archive <nombre-del-cambio>`.

**Qué necesitás antes.** Que el proyecto tenga OpenSpec inicializado (lo hace `/asome-setup`; sin eso, los `/opsx:*` no existen en ese repo) y que el issue ya exista y esté listo para trabajar.

**Qué te devuelve / qué cambia.** La skill en sí guía; los archivos los crean los comandos. `/opsx:propose` genera `proposal.md`, `design.md`, `specs/` y `tasks.md` y se detiene: una persona tiene que leerlos y aprobarlos antes de que se escriba código. Al terminar, `/opsx:archive` mueve el cambio a `openspec/changes/archive/`. La skill también explica cómo se corresponden las etapas del tablero con cada fase.

**Cuidado con.**
- `/opsx:propose` no implementa, a propósito. Para empezar a programar, mandá un mensaje nuevo con `/opsx:apply`.
- Si la especificación quedó floja, se corrige con `/opsx:update`, nunca "arreglándola" mientras se implementa.
- El nombre del cambio no se renombra después: es el nombre de la carpeta y el PR lo cita.
- Las decisiones caras de revertir van como ADR en `docs/adr/`, no en `openspec/`, porque lo de `openspec/` se archiva.
- Las skills viejas `sdd-*` (por ejemplo `/sdd-new`) fueron retiradas: usá los `/opsx:*`.

---

## Grupo 4: Desarrollo del día a día

*En `skills.sh.json`: Dev Workflow.* Issues, commits, ramas, PRs, revisión de código y paso entre ambientes.

### `/asome-create-issue`

**Para qué sirve.** Crea issues (tareas en GitHub) completos y los carga en el tablero con todos los campos: etapa, prioridad, tipo, puntos, área, fechas, sprint, hito, etiquetas y responsable. Funciona con uno solo o con varios a la vez (modo lote). La skill recomienda sprint, prioridad y responsable según la carga de cada sprint, y decidís vos.

**Cuándo usarla.** Cuando aparece trabajo nuevo: una historia de usuario, un bug, una investigación. También para cargar de una vez un grupo de HU.

**Cómo se invoca.**
- `/asome-create-issue` y describís lo que hace falta.
- "creá un issue para...", "agregar issue", "crear estos 5 issues" (lote, pegando la lista).

**Qué necesitás antes.** `.asome/config.json`, `gh` autenticado, las etiquetas del repo (las crea `/asome-setup`) y al menos un sprint abierto. Si no hay sprint, se detiene y te pide `/asome-sprint bootstrap`: no crea issues sin sprint.

**Qué te devuelve / qué cambia.** Primero busca duplicados (también entre los cerrados). Después te muestra una tabla de carga por sprint con su recomendación y te pregunta, con opciones, el sprint, la prioridad, el responsable y, si corresponde, si querés el **gemelo UX** (un issue de diseño que va un sprint antes que el de desarrollo). En lote, arma un plan con una sola aprobación (Crear así, Ajustar o Cancelar). Recién ahí crea los issues en GitHub, los agrega al tablero y verifica leyendo los campos de vuelta. Termina con una tabla resumen.

**Cuidado con.**
- Un issue es una rebanada vertical: algo que se puede mostrar al cerrarlo. No se parte en "backend" y "frontend".
- Toda feature tiene que nombrar el problema del **mapa operativo** (lo relevado con el cliente) que resuelve. Si no hay respuesta, no se crea.
- Si el sprint elegido se pasa del techo de capacidad, tu elección vale, pero tiene que ser explícita.
- Las líneas del principio del texto ("Bloqueado por UX:", "Depende de:") las leen otras skills tal cual: no las reescribas.
- El título lleva la referencia (por ejemplo `HU-001`) y lo que va a poder hacer la persona usuaria, sin el hito ni el área.

### `/asome-commit`

**Para qué sirve.** Guarda tus cambios en commits ordenados. Mira lo que cambió, lo separa por tema (un commit es un cambio lógico), escribe el mensaje con el formato estándar `tipo(alcance): descripción` y agrega la línea de coautor.

**Cuándo usarla.** Cada vez que terminás una tarea y querés guardar el avance. Con SDD, un commit por cada tarea de la lista.

**Cómo se invoca.**
- `/asome-commit`
- "commitear", "hacer commit", "commits atómicos", "qué tipo de commit va".

**Qué necesitás antes.** Un proyecto con git y cambios hechos (si no hay nada preparado, trabaja con lo que cambió). No necesita config ni GitHub.

**Qué te devuelve / qué cambia.** Uno o más commits en tu compu. No sube nada a GitHub (eso lo hace `/asome-branch-pr`). Ejecuta directo y al final revisa que no queden cambios sueltos.

**Cuidado con.**
- No acepta mensajes como "changes" o "WIP".
- Si falla el chequeo previo del proyecto (lint, tipos), lo corrige y reintenta. Nunca se saltea con `--no-verify`.
- Los tipos válidos son `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci` y `revert`.

### `/asome-branch-pr`

**Para qué sirve.** Crea la rama de trabajo, valida los commits y abre el PR (el pedido para que otra persona revise y sume tus cambios) contra la rama de desarrollo, con resumen, tabla de cambios, plan de pruebas y checklist. Además mueve el issue a In Review en el tablero.

**Cuándo usarla.** Cuando la implementación está terminada y lista para revisión.

**Cómo se invoca.**
- `/asome-branch-pr`
- "abrir PR", "crear PR", "ready for review", "push and PR". Si no le das el número de issue, lo pregunta.

**Qué necesitás antes.** `.asome/config.json`, `gh` autenticado, el número del issue, tests y lint en verde y, para Feature, Improvement y Setup, un `/asome-review` pasado sin CRITICAL.

**Qué te devuelve / qué cambia.** Sube la rama a GitHub (`feat/...`, `fix/...`), abre el PR con `Closes #N` y la referencia al cambio SDD, le pone la etiqueta de tipo y pasa el issue a In Review. Cuando el PR se mergea, falta pasar el issue a Done (a mano o con `/asome-sprint move <N> done`), archivar el cambio y borrar la rama local.

**Cuidado con.**
- Las ramas de trabajo salen de la rama de desarrollo y apuntan a ella, nunca a `main` ni a `staging`: eso es de `/asome-deploy`.
- Si no encuentra la rama de desarrollo, te pregunta cuál es. No usa `main` por defecto.
- Los nombres de rama son `tipo/slug-corto`, en minúsculas y con guiones.

### `/asome-review`

**Para qué sirve.** Revisión de código en capas: que el código cumpla la especificación del cambio, antipatrones generales, reutilización de componentes compartidos y tokens del sistema de diseño en vez de valores sueltos, y listas específicas de backend (NestJS) y frontend (React) cuando aplican. Clasifica lo que encuentra en CRITICAL (frena el merge), WARNING (conviene arreglar) y SUGGESTION (opcional).

**Cuándo usarla.** Antes de abrir el PR (es la fase "verify" del SDD) y, como segunda pasada, al revisar el PR de otra persona.

**Cómo se invoca.**
- `/asome-review`
- "revisá el PR 57" (por número), "revisar código", "check design system", "validar PR". Sin número, revisa tus cambios locales o un archivo que le indiques.

**Qué necesitás antes.** `gh` para revisar un PR por número y OpenSpec en el repo para chequear contra la especificación. Si el PR no cita un cambio SDD y es de producto, lo marca como CRITICAL.

**Qué te devuelve / qué cambia.** Un informe en el chat con las secciones SDD COMPLIANCE, CRITICAL, WARNING y SUGGESTION, o un PASSED si no hay nada. No corrige el código.

**Cuidado con.**
- No reemplaza la revisión de una persona que lea el diff completo, ni la revisión cruzada con la otra herramienta de IA (Codex): es un paso, no la aprobación final.
- Si el proyecto no tiene librería de componentes ni skill de sistema de diseño, saltea esa parte y lo avisa.
- Si el repo no tiene `openspec/`, lo marca como CRITICAL.

### `/asome-deploy`

**Para qué sirve.** Lleva el código de un ambiente al siguiente, en una cadena fija: `dev` a `staging` y de `staging` a `main` (producción). Abre un PR de promoción, espera que pasen los chequeos y, cuando `staging` se promueve a `main` y se mergea, crea la versión (un tag con número, `vMAYOR.MENOR.PARCHE`) y la publica como Release en GitHub con notas automáticas.

**Cuándo usarla.** Cuando lo que está en `dev` hay que probarlo en staging, o cuando staging ya está validado y toca producción.

**Cómo se invoca.**
- `/asome-deploy staging` y `/asome-deploy main`.
- "desplegar a staging", "promote", "crear release", "versionar".

**Qué necesitás antes.** `.asome/config.json`, `gh` autenticado y que las tres ramas existan en GitHub (acepta los alias dev o development, staging o stg, main o master). Para producción pide una confirmación extra.

**Qué te devuelve / qué cambia.** Abre el PR `deploy: origen a destino` (o te muestra el que ya está abierto), con la lista de commits, la verificación previa y el plan de vuelta atrás. Espera los chequeos automáticos y, si alguno falla, se detiene. El merge lo hace una persona. Después de mergear a `main` y de que el deploy salga bien, te pregunta si es major, minor o patch, crea el tag y el Release.

**Cuidado con.**
- `main` solo recibe de `staging`, y `staging` solo de `dev`: no se saltea ningún ambiente ni se hace push directo.
- Un chequeo rojo es un freno, no un aviso: no se mergea, taguea ni publica nada por encima de uno.
- La versión no se deduce: siempre te pregunta major, minor o patch. Solo `staging` a `main` lleva tag y Release.
- Si el destino tiene commits que el origen no tiene, primero hay que sincronizar con un PR en sentido inverso.

---

## Grupo 5: Infraestructura

*En `skills.sh.json`: Infrastructure.* La infraestructura son los servidores y servicios en la nube (AWS) que hacen funcionar el producto, descritos como código con Terraform. Estas cuatro skills asumen un proyecto con Terraform y una cuenta de AWS.

### `/asome-infra-setup`

**Para qué sirve.** Arma la infraestructura de un proyecto nuevo copiando las arquitecturas canónicas del repo `asomelab/infrastructure` (por ejemplo serverless, ecs, ec2, static-site, rds y base). Copia los módulos de Terraform y las automatizaciones de GitHub Actions al proyecto, reemplaza los nombres, corre `terraform init` y define el acceso del equipo a la nube con tres perfiles fijos.

**Cuándo usarla.** Al empezar la infraestructura de un proyecto.

**Cómo se invoca.**
- `/asome-infra-setup` (te muestra las arquitecturas y elegís) o `/asome-infra-setup serverless`.
- "setup infra", "bootstrap infrastructure", "configurar infra", "scaffold terraform".

**Qué necesitás antes.** Las CLI `gh`, `terraform` y `aws` instaladas y autenticadas, `.asome/config.json`, y permiso para clonar `asomelab/infrastructure`.

**Qué te devuelve / qué cambia.** Las carpetas `infra/` y `.github/workflows/` con lo copiado, entradas de Terraform en `.gitignore`, una lista de pendientes para completar (estado remoto, variables, región, secretos de GitHub) y `docs/ACCESOS.md`. Para cada persona del equipo asigna un perfil (`asome-dev`, `asome-infra` o `asome-readonly`) e imprime los comandos para verificar el acceso el primer día.

**Cuidado con.**
- Revisá lo copiado antes de commitear. No copia archivos de estado ni `*.tfvars`, y no pisa un `infra/` existente sin tu confirmación.
- `base` se aplica primero: las otras arquitecturas dependen de su red.
- Nunca crea usuarios ni permisos en la nube en silencio: imprime el cambio y espera tu confirmación.
- `asome-readonly` no sirve para trabajar: con solo lectura no se puede cerrar un issue que toque la nube. El acceso se verifica antes de asignar el primer issue y se pide por nombre de perfil. `docs/ACCESOS.md` lleva perfiles y roles, nunca credenciales.

### `/asome-infra-audit`

**Para qué sirve.** Revisa la infraestructura contra buenas prácticas de Terraform, de AWS (Well-Architected) y de GitHub Actions. Clasifica cada hallazgo en CRITICAL, WARNING o SUGGESTION, con una tabla resumen y un veredicto: PASS, NEEDS ATTENTION o BLOCKED.

**Cuándo usarla.** Después de `/asome-infra-setup`, antes de cada `terraform apply` y antes de cada PR a `main`.

**Cómo se invoca.**
- `/asome-infra-audit`
- "auditar infraestructura", "check terraform", "review infra", "check best practices".

**Qué necesitás antes.** Que el proyecto tenga una carpeta `infra/` o `.github/workflows/`.

**Qué te devuelve / qué cambia.** Un informe en el chat con cada hallazgo (archivo, línea y por qué importa) y el veredicto. Solo lee, no cambia nada. BLOCKED significa que hay al menos un CRITICAL: no corras `/asome-infra-plan apply` hasta resolverlo.

**Cuidado con.**
- Es una revisión por patrones, no un análisis completo. Para cobertura total, se complementa con herramientas como tfsec, checkov o terrascan en CI.
- Puede haber falsos positivos (por ejemplo, claves de ejemplo en archivos de documentación): mirá el contexto antes de actuar.

### `/asome-infra-costs`

**Para qué sirve.** Revisa cuánto se gasta en AWS y por qué: gasto por servicio, instancias paradas o sobredimensionadas, discos sin usar, copias viejas, IP sin usar, NAT Gateways, bases de datos y buckets sin reglas de ciclo de vida. Termina con una lista priorizada de recomendaciones con ahorro estimado.

**Cuándo usarla.** Para revisar el gasto en la nube o para reducirlo.

**Cómo se invoca.**
- `/asome-infra-costs`
- "cuánto gastamos", "costos aws", "reduce costs", "optimize spend".

**Qué necesitás antes.** La CLI de AWS con credenciales configuradas (si no las tenés, te guía con `aws configure`, con SSO o con un perfil con nombre) y Cost Explorer habilitado en la cuenta (los primeros datos pueden tardar hasta 24 horas).

**Qué te devuelve / qué cambia.** Un informe en el chat. Solo lee y sugiere: los cambios se aplican después con `/asome-infra-plan`.

**Cuidado con.**
- Nunca pegues credenciales en el chat ni en archivos que se suban a git.
- Los datos de costo llegan con unas 8 horas de atraso, y cada consulta a Cost Explorer cuesta alrededor de un centavo de dólar.
- Respeta el perfil de AWS que tengas configurado (`AWS_PROFILE`).

### `/asome-infra-plan`

**Para qué sirve.** Es un envoltorio seguro de Terraform: valida, arma el **plan** (qué se va a crear, cambiar o destruir en la nube), te lo resume y solo aplica con tu confirmación explícita. También detecta el **drift**: cuando lo que hay en la nube ya no coincide con el código.

**Cuándo usarla.** Antes de aplicar cualquier cambio de infraestructura, y con `drift` para chequear diferencias.

**Cómo se invoca.**
- `/asome-infra-plan`: solo el plan, que es seguro y se puede correr cuando quieras.
- `/asome-infra-plan apply`: plan y después aplicar, con confirmación.
- `/asome-infra-plan drift` y `/asome-infra-plan destroy` (este último es destructivo y pide confirmación extra).
- "terraform plan", "planear infra", "check drift".

**Qué necesitás antes.** `terraform` y `aws` instalados y autenticados, y un estado remoto configurado (`backend.tf`). Conviene haber corrido `/asome-infra-audit` antes.

**Qué te devuelve / qué cambia.** Un resumen "agrega N, cambia N, destruye N". Si hay destrucciones, las lista una por una y resalta las que tienen datos (bases, buckets, discos). El plan no cambia nada. `apply` modifica la nube solo si respondés que sí; si hay destrucciones, tenés que escribir `yes, destroy` y confirmar que hay backup. Al final borra los archivos temporales del plan.

**Cuidado con.**
- Un reemplazo de un recurso con datos se trata igual que una destrucción.
- No se usa `-auto-approve`, salvo en automatizaciones con aprobaciones.
- No commitees el archivo `tfplan`. Sí conviene commitear `.terraform.lock.hcl` después de actualizar.

---

## Grupo 6: Sprint y tablero

*En `skills.sh.json`: Sprint & Board.* Un **sprint** es el ciclo de trabajo del equipo, de dos semanas. El **hito** es lo que se le prometió al cliente.

### `/asome-sprint`

**Para qué sirve.** Maneja el ciclo de sprints de un proyecto con siete subcomandos: arma la estructura de sprints, planifica cada uno bajo un techo de capacidad, mueve issues de etapa, cierra el sprint con una retro, reporta la velocidad por carril (dev y diseño) y mantiene el emparejamiento entre diseño y desarrollo.

**Cuándo usarla.** A lo largo de todo el proyecto, según el subcomando.

| Subcomando | Qué hace | Cuándo |
|---|---|---|
| `bootstrap` | Arma todos los sprints, hitos y documentos del plan | Una vez por proyecto, después de `/asome-setup` |
| `plan` | Asigna issues a un sprint (quedan en To Do) | Al planificar cada sprint |
| `move` | Cambia un issue de etapa | Cuando cambia su estado |
| `report` | Muestra la velocidad por carril y los bloqueos | A mitad o al final del sprint |
| `ux-link` | Audita y repara las parejas diseño y desarrollo | Con trabajo de diseño y de código en paralelo |
| `resequence` | Reordena trabajo entre sprints | Cuando un sprint está desbordado |
| `close` | Cierra el sprint: pendientes, horas y retro | El día de la demo, después de la demo |

**Cómo se invoca.**
- `/asome-sprint bootstrap`, `/asome-sprint plan`, `/asome-sprint move <N> in-progress`, `/asome-sprint report`, `/asome-sprint ux-link`, `/asome-sprint close`.
- `/asome-sprint resequence --suggest` (solo propone) o `--apply` (ensaya, pide confirmación y ejecuta).
- "plan sprint 3", "mover el #12 a Done", "cuántos puntos hicimos", "cerrar sprint", "armar los sprints".

**Qué necesitás antes.** `.asome/config.json` y `gh` autenticado con acceso al proyecto (y `python3`). Para `bootstrap`, los datos del contrato: cantidad de sprints y fecha de inicio, equipo, hitos y días de validación; los pide juntos. Para `close`, las horas realmente trabajadas.

**Qué te devuelve / qué cambia.**
- `bootstrap`: las iteraciones del campo Sprint, un hito por sprint (más el hito de medición comparativa a los 90 días), `docs/product/11-plan-de-sprints.md`, un `sprint-NN-plan.md` por sprint y los valores iniciales de capacidad en el config. Antes verifica el plan contra el método y te avisa cada desvío, sin corregirlo en silencio.
- `plan`: pasa tres controles (capacidad, diseño antes que desarrollo, dependencias) y te pide confirmación si hay un conflicto.
- `move`: cambia la etapa. Si cerrás un issue de diseño, saca el bloqueo `needs:ux` de los issues que dependían de él y les deja un comentario.
- `ux-link`: propone las parejas diseño y desarrollo en una tabla y espera tu sí antes de editar nada. A cada issue de desarrollo le agrega el aviso "Bloqueado por UX" y la etiqueta `needs:ux`. Reporta, sin bloquear, los diseños que no llegan con un sprint de ventaja y los que quedaron sin pareja.
- `resequence`: primero revisa que el config coincida con el tablero real (si no, se detiene y te manda a `/asome-setup`), guarda una copia del tablero, te muestra la carga por sprint antes y después, y recién con tu confirmación ejecuta.
- `close`: lista lo que no se terminó (cada ítem pide justificación escrita y re-estimación), mide con tus horas reales cuánto rinde el equipo, escribe `docs/product/retros/sprint-NN-retro.md` (con al menos una acción de mejora con responsable) y revisa el Definition of Done del sprint. Si falta algo, no lo da por cerrado.
- `report`: solo lee y devuelve un texto que podés pegar en Slack o Notion.

**Cuidado con.**
- "Sprint listo" es una URL, no un documento: un sprint que no desplegó nada no cumple su Definition of Done (los criterios para dar algo por terminado, en tres niveles: por historia, por sprint y por hito).
- El sprint se mueve solo, el hito no se mueve sin papel: sacar un issue de un hito que lo nombra requiere conformidad escrita del cliente.
- Si la carga pasa el techo de capacidad, no asigna sin tu confirmación explícita.
- `bootstrap` se detiene si el tablero ya tiene sprints cargados, para no dejar issues huérfanos. Para sumar sprints, hacelo desde el tablero en GitHub y corré `/asome-setup`.
- `resequence --apply` no cancela nada: lo que sale del alcance va a Backlog con la etiqueta `scope:cut-1`. El tablero no tiene "deshacer", por eso la skill guarda una copia antes de empezar.

### `/asome-standup`

**Para qué sirve.** Arma en segundos el resumen diario del tablero: qué está en curso, bloqueado y en revisión, qué se terminó hace poco y qué falta del sprint, con puntos y velocidad.

**Cuándo usarla.** Antes de la daily, o cuando quieras saber cómo viene el proyecto.

**Cómo se invoca.**
- `/asome-standup`
- "standup", "daily", "qué está pasando", "resumen del board", "qué se cerró". Podés pedir que filtre por área (por ejemplo, solo Backend), con alguno de los valores del campo Área del tablero.

**Qué necesitás antes.** `.asome/config.json`, `gh` autenticado y `python3`.

**Qué te devuelve / qué cambia.** Un resumen en Markdown en el chat. Solo lee. Lo copiás y lo pegás donde lo necesites: Slack, Notion, un comentario de GitHub o un mail.

**Cuidado con.**
- Muestra lo que dice el tablero: si los issues no se mueven de etapa, el resumen no los refleja.
- Si se sumó un sprint o un campo al tablero, volvé a correr `/asome-setup board` para que el resumen use los datos nuevos.

---

## Grupo 7: Sistema de diseño

*En `skills.sh.json`: Design System.*

### `/design-system-asome-lab`

**Para qué sirve.** Guía a Claude para escribir documentación de sistema de diseño que se pueda implementar directo: tokens (colores, tipografía, espaciados, radios, sombras, movimiento), comportamiento de los componentes y estándares de accesibilidad. Parte de la marca ASOME Lab: tipografía Maax, base de 16 px y accesibilidad WCAG 2.2 AA.

**Cuándo usarla.** Al crear o actualizar reglas de interfaz, especificaciones de componentes o documentación del sistema de diseño.

**Cómo se invoca.**
- `/design-system-asome-lab` (ojo: este nombre no lleva el prefijo `asome-`).
- "armá la guía de diseño para...", "definí las reglas del componente botón", "documentá los tokens".

**Qué necesitás antes.** Nada especial. Contale qué componente, pantalla o familia querés documentar.

**Qué te devuelve / qué cambia.** Un documento con estructura fija: contexto y objetivos, tokens y fundamentos, reglas por componente (anatomía, variantes, estados, comportamiento responsive), requisitos de accesibilidad con criterios verificables, tono y contenido, anti-patrones y checklist de QA. La skill no define dónde se guarda: pedile a Claude el lugar que prefieras.

**Cuidado con.**
- Usa tokens con nombre, no colores sueltos, y no admite excepciones de espaciado ni de tipografía.
- Cada componente tiene que definir sus estados: default, hover, focus-visible, active, disabled, loading y error.
- `/asome-review` puede apoyarse en una skill de sistema de diseño como esta para detectar valores sueltos y componentes duplicados en el código.

---

## Grupo 8: Calendario y reuniones

*En `skills.sh.json`: Calendar & Meetings.* Reuniones con clientes: agendarlas, arrancar el proyecto y preparar cada demo.

### `/asome-meeting`

**Para qué sirve.** Agenda reuniones en el calendario de ASOME (`hola@asomelab.com`) con las convenciones del estudio: formato de título, recordatorios fijos, link de Google Meet y zona horaria de Tucumán.

**Cuándo usarla.** Para cualquier reunión: con clientes (sprint review, daily, kick-off), internas, uno a uno, o un bloque de foco personal sin invitados.

**Cómo se invoca.**
- `/asome-meeting`
- "agendá una reunión con Acme el jueves a las 15", "schedule a meeting", "poné una reunión", "sprint review con Acme todos los jueves" (recurrente), "bloqueame 2 horas de foco el lunes" (sin invitados).

**Qué necesitás antes.** El conector de Google Calendar conectado en Claude. No necesita proyecto ni config. Para encontrar mails de invitados, puede buscar en el historial del calendario y de Gmail. Pasale la fecha, la hora y con quién; si falta la fecha, hace una sola pregunta.

**Qué te devuelve / qué cambia.** Crea el evento en el calendario de ASOME y manda las invitaciones de verdad: los invitados reciben el mail. Te informa título, fecha y hora local, invitados, link de Meet, recordatorios (mail 60 minutos antes y avisos a los 30 y a los 5) y si hay choques o reuniones pegadas ese día. Sin duración, dura 30 minutos.

**Cuidado con.**
- Ejecuta directo, sin vista previa: revisá fecha, hora e invitados antes de mandar el pedido.
- Nunca adivina un mail externo: lo busca en el historial y, si no lo encuentra, te lo pide. Las cuentas `@asomelab.com` de ex integrantes del equipo ya no existen y rebotan: usá un mail personal.
- Los títulos siguen un formato: `ASOME <> Acme | Sprint Review` para clientes, `ASOME | Sprint Planning` para reuniones internas.
- En un proyecto preparado con `/asome-setup`, el repo puede bloquear los conectores que escriben, como el calendario. Si pasa, agendá desde una sesión abierta fuera de ese repo.

### `/asome-kickoff`

**Para qué sirve.** Prepara la reunión de inicio de un proyecto para que todas se vean igual y cierren los mismos acuerdos: cómo trabajamos, quién decide, cómo se piden cambios, qué canal para qué, y qué le toca al cliente y para cuándo. Arma un texto (un *prompt*) que pegás en Claude Design para que genere la presentación de 15 diapositivas, y también el acta posterior y los eventos del calendario.

**Cuándo usarla.** Cuando arranca un proyecto con un cliente. No confundir con el relevamiento (las entrevistas): ese va en una sesión aparte.

**Cómo se invoca.**
- `/asome-kickoff` o `/asome-kickoff deck`: el texto para la presentación.
- `/asome-kickoff acta`: el acta de después de la reunión.
- `/asome-kickoff agenda`: los eventos de calendario (kick-off, demos y relevamiento), a través de `/asome-meeting`.
- `/asome-kickoff full`: las tres cosas, en ese orden.
- "armar el kickoff", "deck de kickoff", "acta de kickoff", "reunión de inicio".

**Qué necesitás antes.** Nada obligatorio. Si existen, lee el contrato firmado y `docs/product/` para completar casi todo, y después te pregunta en un solo mensaje lo que falta: cliente y nombre del proyecto, fecha, asistentes y quién decide, qué queda fuera del alcance, canales, accesos, riesgos y contactos (técnico, comercial y de facturación). Para el roadmap necesita el plan de sprints (`docs/product/11-plan-de-sprints.md`); si falta, corré antes `/asome-sprint bootstrap`. El modo `agenda` pide `.asome/config.json`. La skill no dibuja las diapositivas: eso lo hace Claude Design con el texto que te da.

**Qué te devuelve / qué cambia.** Un único bloque de código listo para copiar y pegar en Claude Design, y aparte la lista de datos `⟨PENDIENTE⟩` con quién tiene que responder cada uno. En `acta`, el texto del mail para enviar el mismo día (lo enviás vos). En `agenda`, los eventos creados.

**Cuidado con.**
- Lo que no sabe no lo inventa: aparece en la presentación como `⟨PENDIENTE: lo que falta y quién lo responde⟩`, para completarlo antes de la reunión.
- El entregable real es el acuerdo: el acta sale el mismo día, con responsable (nombre propio) y fecha concreta en cada compromiso.
- Las 15 diapositivas son fijas, y el alcance siempre muestra dos columnas: lo que entra y lo que no.
- No prometas alcance en la sala: lo que no está en la columna "entra" se pide por la regla de cambios.

### `/asome-sprint-demo`

**Para qué sirve.** Prepara la demo de fin de sprint con el cliente (la Sprint Review). Lee el tablero y los documentos del proyecto, te pregunta solo lo que GitHub no puede saber, y te entrega el texto para Claude Design que arma la presentación, el guion de la demo, una checklist previa y, después de la demo, el mail de resumen del mismo día que abre la ventana de validación del cliente.

**Cuándo usarla.** Uno o dos días antes de la demo: lo bastante temprano para cerrar los pendientes, lo bastante tarde para que el tablero refleje el sprint. Y el día de la demo, después, para el mail.

**Cómo se invoca.**
- `/asome-sprint-demo` (el sprint de hoy), `/asome-sprint-demo 5` (el sprint 5), `/asome-sprint-demo +90d` (la medición comparativa, antes y después).
- `/asome-sprint-demo acta` (con número opcional): el resumen posterior a la demo.
- "qué mostramos en la demo del jueves", "armame las slides de la review", "preparar la demo", "mail de resumen de la demo".

**Qué necesitás antes.** `.asome/config.json`, `gh` con el permiso `read:project` (`gh auth refresh -s read:project`), `python3` y Claude Design para pegar el texto. Si el sprint no existe, te lista los que hay.

**Qué te devuelve / qué cambia.** En el chat, en orden: el texto para Claude Design (un bloque), los `⟨PENDIENTE⟩`, el guion de la demo, la checklist del día anterior y notas internas que no van a la presentación. Escribe un solo archivo, `docs/product/demos/sprint-NN-demo.md` (`medicion-90d.md` en la medición a 90 días). En `acta` te pregunta cómo salió la validación, quiénes asistieron, qué pidió el cliente y qué se decidió; clasifica cada pedido como dentro o fuera del alcance; te da el mail en un bloque (no lo manda, lo enviás vos) y suma la sección `## Acta` al archivo. Solo lee de GitHub.

**Cuidado con.**
- Los números de actividad (puntos, horas, cantidad de tareas) no van nunca en una diapositiva: se quedan en las notas internas.
- La fecha límite de validación se cuenta en días hábiles: revisá los feriados antes de que llegue al mail.
- Al cliente nunca se le habla de "Sprint 0": el primero es "Sprint 1 · Fundaciones".
- Lo que se entrega es el avance validado, no las slides: antes de la demo, staging tiene que tener todo (`/asome-deploy staging`).
- El repo de skills es público: no pegues datos de clientes en la skill, esos datos viven en cada proyecto.

---

## Grupo 9: Contenido

*En `skills.sh.json`: Content.*

### `/asome-video`

**Para qué sirve.** Edita videos verticales (reels) de marca de ASOME desde cero con Remotion, pensado para personas no técnicas. Remotion es el editor con el que se arma el video; no hace falta que lo conozcas. Primero te explica todo en español; después revisa tu compu e instala lo que falte (Node.js, Python con Pillow, git y `gh`, la skill de Remotion) y prepara el repositorio privado de videos `asomelab/videos`, donde vive cada reel en su propia carpeta, con el sistema de marca compartido y la tipografía Maax. Transcribe tu video, mide cada corte (arranques en falso, silencios, respiraciones y hacia dónde mirás) y propone un plan de edición: qué tomas quedan, subtítulos corregidos, uno o dos momentos con pantalla dividida (arriba el gráfico, abajo vos), cierre y seis opciones de portada. Espera tu OK. Recién ahí arma el video con el sistema visual de ASOME (Maax e Inter, Penn Blue, White Smoke, Persian y Cornflower, subtítulos de marca, cierre con logo, música y efectos suaves) y te lo muestra en Remotion Studio para que pidas cambios con tus palabras.

**Cuándo usarla.** Cuando tenés un video grabado en vertical y querés convertirlo en un reel de marca listo para Instagram.

**Cómo se invoca.**
- `/asome-video`
- "editame este video", "editar reel", "armar un reel", "hacer un reel con este video", "subtítulos para el video", "video para Instagram", "exportar el reel", "portada del reel".

**Qué necesitás antes.**
- Una Mac (mejor con procesador Apple; en Windows también se puede, con algunos pasos extra), internet y unos 5 GB libres.
- El video grabado en vertical.
- Una cuenta de GitHub con acceso a `asomelab/videos` y la sesión iniciada (`gh auth login`, lo hacés vos). Sin acceso, la skill trabaja en un repositorio local y toma Maax del Drive (`brand > Tipografia > Maax`).
- Google Drive para escritorio con el Drive de ASOME: ahí van el video original (`workspace/resources/crudos/<TEMA>/`) y las entregas.
- Tiempo: la primera vez, la preparación tarda entre 15 y 30 minutos y la hace Claude. Las siguientes se va directo a editar.
- Al empezar te pide, en un solo mensaje: el video (arrastralo al chat o decile dónde está), el tema en pocas palabras (da nombre a la carpeta y a los archivos), el llamado a la acción si tenés uno (por ejemplo, WhatsApp) y una frase para la portada si ya la pensaste. Lo único que la frena es el video: lo demás lo propone ella.

**Qué te devuelve / qué cambia.** Crea la carpeta del reel en `Documentos/asome-videos/videos` (el repositorio de videos) y guarda el código con un commit en tres momentos: plan aprobado, primer armado completo y versión final, con una sección en el README del repo que explica cómo rehacerlo y qué variar. Al exportar, deja en Descargas, dentro de una carpeta con la fecha y el tema, el archivo para Instagram (1080 x 1920), un máster en 4K, las portadas 9:16 y 4:5, los subtítulos (SRT) y el **paquete para publicar** `<fecha>_copy_<tema>.md`: caption con gancho de hasta 125 caracteres, 8 a 15 hashtags en orden de importancia, primer comentario, texto alternativo, chequeo de la portada, día y hora sugeridos, la configuración de Instagram paso a paso (portada, compartir en el feed, subtítulos, sin música de Instagram) y una lista final. La misma carpeta se copia al Drive en `ASOME/marketing/reels/<fecha> <tema>/`.

**Cuidado con.**
- Nada se arma sin tu OK al plan de edición: leelo, sobre todo los subtítulos corregidos (la transcripción automática se equivoca con nombres de marca, por ejemplo escribe "Asom" por ASOME), y pedí cambios antes de aprobar.
- Si algún paso pide la contraseña de tu Mac, la escribís vos: la skill te dice exactamente qué hacer y nunca la pide ni la escribe. Lo mismo con el inicio de sesión en GitHub.
- La primera vez baja el modelo de transcripción y tarda unos minutos. Si el video no es vertical, te pregunta si lo recorta al centro o lo deja enmarcado sobre fondo Penn Blue.
- El texto en pantalla y el caption parafrasean lo que dijiste: no inventan números, clientes ni promesas.
- Maax tiene licencia de ASOME: vive solo en el repo privado `asomelab/videos`. No la compartas ni la subas a otro repo.
- Los videos originales y los archivos pesados nunca van a GitHub: quedan en el Drive.
- Para exportar, pedile a Claude que lo haga: la skill usa su propio comando. En la app de escritorio de Claude, el botón Render de Remotion Studio suele fallar.
- Para que quede bien al grabar: en vertical, con aire arriba de la cabeza, luz de frente, y si te equivocás, frená dos segundos y repetí la frase entera. Quedate un par de segundos quieto mirando a cámara: de ahí sale la portada.

### `/asome-video-producto`

**Para qué sirve.** Arma un reel de unos 50 segundos que presenta un software que ASOME construyó para un cliente: un gancho, la presentación del producto, lo que gana el negocio, lo que vive el usuario final y el cierre de ASOME. La voz en off se hace con IA (ElevenLabs) y las pantallas se rehacen desde el código del producto, con datos de ejemplo, dentro de un celular o una laptop. Escribe el guion con vos, genera la voz, arma las escenas con varios agentes en paralelo (cada una con una revisión), la música, la portada y el mismo paquete para publicar que `asome-video`. Depende de `asome-video` (usa su preparación, su repositorio de videos y su sistema de marca).

**Cuándo usarla.** Cuando querés mostrar una app o plataforma que hizo ASOME, como caso de éxito o presentación.

**Cómo se invoca.**
- `/asome-video-producto`
- "reel de producto", "video de presentación de app", "mostrar la app que hicimos", "caso de éxito en video", "presentar la plataforma en un reel".

**Qué necesitás antes.**
- Todo lo de `asome-video` (Mac, GitHub con acceso a `asomelab/videos`, Drive para escritorio).
- **El código del producto en tu compu**: la carpeta del repositorio de la app del cliente.
- Una cuenta de ElevenLabs con una clave de API (permisos «Text to Speech» y «Voices: Read») que guardás vos en `~/.zshenv`, con la línea que te pasa Claude (o la del [tutorial](TUTORIAL-VIDEO.md#elevenlabs-solo-para-voz-con-ia)). El plan gratis no incluye licencia comercial: para publicar, el plan Starter.
- Saber si se puede nombrar el producto y al cliente.
- Al empezar te pide, en un solo mensaje: el producto y dónde está su código, los dos lados que se venden (quién lo maneja y quién lo vive), el permiso de nombres y el formato (voz IA o la tuya, y el llamado a la acción).

**Qué te devuelve / qué cambia.** Una carpeta del reel en `asomelab/videos`, con commits al aprobar el guion, en el primer armado y en la versión final. En Descargas (y en el Drive, si decís que sí): el reel 1080 x 1920, la portada, el paquete para publicar `<fecha>_copy_<tema>.md`, los subtítulos, el guion y la voz. Tarda alrededor de una hora y tres cuartos (más 15 a 30 minutos la primera vez). Tus paradas: aprobar el guion, elegir la voz entre tres muestras y mirar el resultado final.

**Cuidado con.**
- Claude nunca entra a los sistemas del cliente ni usa sus usuarios: solo lee el código. No le pases accesos.
- La clave de ElevenLabs no va en el chat. Si se pegó en algún lado, borrala y creá otra ese mismo día.
- Cerrá el guion antes de generar la voz: cambiarlo después obliga a rehacer la voz y las escenas.
- Sin permiso, el cliente no se nombra ni se etiqueta, y no aparecen el logo, el ícono ni la dirección del producto.

---

## Flujos típicos

Cada flujo usa varias skills en orden. Las que se repiten (como `/asome-sprint move`) aparecen en el momento en que conviene usarlas.

### Proyecto nuevo

Orden sugerido: cada paso usa lo que dejó el anterior.

1. `/asome-setup`: config del tablero, etiquetas y los requisitos del manual (en un PR).
2. `/asome-discovery nuevo <producto>`: documentos de producto y HU de la fase 1. Respondé las preguntas abiertas.
3. `/asome-sprint bootstrap`: sprints, hitos y plan de sprints (el kick-off lo necesita).
4. `/asome-kickoff full`: texto de la presentación, acta y eventos del calendario.
5. Si el proyecto necesita nube: `/asome-infra-setup <arquitectura>`, después `/asome-infra-audit` y `/asome-infra-plan`.
6. `/asome-create-issue` con las HU aprobadas, en lote.
7. Cada persona que se suma: `/asome-setup doctor` antes de su primer PR y `/asome-onboard`.

### Una feature con SDD

1. `/asome-create-issue`: crea el issue y lo carga en el tablero.
2. `/asome-sdd` para tener la guía a mano y, si el enfoque no está claro, `/opsx:explore <tema>`.
3. `/opsx:propose <nombre-del-cambio>`: genera propuesta, diseño, especificación y tareas, y frena. Una persona lee los cuatro archivos y aprueba. Si hay que corregir, `/opsx:update`. Después, `/asome-sprint move <N> in-progress`.
4. `/opsx:apply` implementa un grupo de tareas y `/asome-commit` guarda un commit por tarea. Repetir hasta terminar.
5. `/asome-review`: chequea contra la especificación. Arreglá los CRITICAL y volvé a correrlo.
6. `/asome-branch-pr`: abre el PR contra la rama de desarrollo y pasa el issue a In Review.
7. Una persona lee el diff completo y aprueba: esa revisión no se delega. Se mergea.
8. `/asome-sprint move <N> done` y `/opsx:archive <nombre-del-cambio>`.

### Un bug

1. `/asome-create-issue`: contá qué se rompió, cómo reproducirlo, qué esperabas y qué pasó, sin pegar datos reales de clientes. Un bug de prioridad alta va al sprint actual aunque se pase del techo, y la skill lo avisa.
2. Corregilo y guardalo con `/asome-commit` (el arreglo y su prueba).
3. `/asome-branch-pr`.
4. Cuando se mergea, `/asome-sprint move <N> done`.

Los bugs con causa conocida no llevan SDD. Si la causa no está clara, primero investigá: en SDD eso se hace con `/opsx:explore`, que piensa y compara sin tocar código.

### El día a día

1. Al empezar: `/asome-standup` para ver qué hay en curso, bloqueado y en revisión.
2. Cuando tomás un issue: `/asome-sprint move <N> in-progress`.
3. Mientras trabajás: `/asome-commit` por cada tarea terminada.
4. Cuando terminás: `/asome-review` (si es una feature) y `/asome-branch-pr`.
5. Si algo se traba: `/asome-sprint move <N> blocked` y dejá el motivo escrito en el issue.
6. A mitad de sprint: `/asome-sprint report`. Al volver a un proyecto: `/asome-onboard`.

### Pasar a staging y a producción

1. `/asome-deploy staging`: abre el PR de promoción y espera los chequeos. Una persona lo revisa y lo mergea.
2. Con staging validado, `/asome-deploy main`: pide una confirmación extra, abre el PR y espera los chequeos. Una persona lo revisa y lo mergea.
3. Cuando el deploy sale bien, la skill te pregunta si la versión es major, minor o patch, crea el tag y publica el Release.

### Cambios y costos de infraestructura

1. `/asome-infra-audit`: resolvé los CRITICAL antes de seguir.
2. `/asome-infra-plan`: mirá el plan, sobre todo lo que se destruye.
3. `/asome-infra-plan apply`: aplica solo si confirmás.
4. De vez en cuando, `/asome-infra-costs` para revisar el gasto. Los ahorros se aplican con el mismo flujo de arriba.

### Cierre de sprint

1. Uno o dos días antes de la demo: `/asome-sprint-demo`. Cerrá los `⟨PENDIENTE⟩` y pegá el texto en Claude Design.
2. `/asome-meeting`: si falta, agendá el evento de la review (`ASOME <> Cliente | Sprint Review`).
3. Día anterior: staging al día (`/asome-deploy staging`). Si el sprint cierra un hito, `/asome-deploy main`, o decí en la reunión qué falta.
4. La demo, en vivo y con el entorno accesible.
5. El mismo día: `/asome-sprint-demo acta`. Enviás el mail vos: abre la ventana de validación del cliente. Los pedidos que entran en el alcance se cargan con `/asome-create-issue`, y a los que no, se les manda cotización.
6. `/asome-sprint close`: pendientes con justificación, horas y retro.

### Reuniones con clientes

- **Arranque del proyecto:** `/asome-kickoff full`.
- **Una reunión puntual:** `/asome-meeting`.
- **Cada demo de sprint:** `/asome-sprint-demo`, y `/asome-meeting` para el evento.
- **A los 90 días:** `/asome-sprint-demo +90d`, la medición comparativa, antes y después.
- **Después de cada reunión:** un acta o un mail de resumen el mismo día. Sin eso, lo hablado no queda escrito.

### Hacer un reel

El paso a paso completo, con frases de ejemplo, está en [`TUTORIAL-VIDEO.md`](TUTORIAL-VIDEO.md).

1. Pedí `/asome-video` (o decí "editame este video"). Te explica el proceso en español y te pide el video, el tema, el llamado a la acción y, si la tenés, una frase para la portada.
2. Dejá que revise tu compu e instale lo que falte. Si pide la contraseña de tu Mac o iniciar sesión en GitHub (`gh auth login`), lo hacés vos.
3. Prepara la carpeta del reel en el repositorio de videos, sube tu video original al Drive y transcribe lo que decís (la primera vez tarda unos minutos).
4. Revisá el plan de edición: tomas, subtítulos corregidos, momentos con gráficos, cierre y portada. Respondé "dale" o pedí cambios: no se arma nada sin tu OK. Con el OK se guarda el primer commit.
5. Mirá el video armado en Remotion Studio y pedí los ajustes con tus palabras, las veces que haga falta.
6. Pedí la exportación: los archivos quedan en Descargas y en el Drive (reel, máster 4K, portadas, subtítulos y el paquete para publicar), y el código de la versión final queda en `asomelab/videos`.
7. Publicá siguiendo el paquete: portada desde la galería, caption y hashtags, sin música de Instagram, primer comentario fijado, el día y la hora sugeridos.

### Hacer un reel de producto

1. Tené a mano el código del producto en tu compu y la clave de ElevenLabs guardada por vos.
2. Pedí `/asome-video-producto` y contestá sus cuatro preguntas en un solo mensaje.
3. Aprobá el guion y elegí la voz entre tres muestras.
4. Mirá las imágenes de cada escena que te va mandando y pedí cambios si hace falta.
5. Mirá el video final, decí si lo sube al Drive y publicalo con el paquete, como un reel normal.

---

## Preguntas frecuentes

### No me aparece la skill, o `/asome-...` no existe

Primero verificá que esté instalada: `ls ~/.agents/skills | grep asome-`. Si falta, reinstalá con `npx skills add asomelab/skills`. Si está y no la ves, abrí una sesión nueva de Claude Code. Si te aparece una skill vieja `sdd-*`, está retirada: usá `asome-sdd` y los `/opsx:*`.

### Me dice que falta `.asome/config.json`

Es el archivo con los datos del tablero del proyecto. Chequeá que estés parado en la carpeta del proyecto. Si el proyecto ya lo tenía, el archivo viaja con el repo: traé lo último de la rama de desarrollo (`git pull`). Si no, corré `/asome-setup` (o `/asome-setup board`, que hace solo la parte del tablero). Alcanza con hacerlo una vez por proyecto.

### `gh` dice que no estoy autenticado o me da un error de permisos

Corré `gh auth status` para ver el estado y `gh auth login` para conectarte (en Claude Code, con `! gh auth login`). Para leer el tablero hace falta el permiso `read:project`, y para escribir en él, `project`: `gh auth refresh -s read:project` o `gh auth refresh -s project`. `asome-infra-setup` clona un repo privado de la organización, así que necesita que tu cuenta tenga acceso. Si no lo tenés, pedilo al equipo.

### ¿Cómo actualizo las skills?

Con `npx skills update`. Si después de actualizar cambió algo en el tablero del proyecto (se sumó un sprint o un campo), corré también `/asome-setup board` para regenerar el config.

### Veo `<<HUECO M-NN>>`, `⟨PENDIENTE⟩`, `M-NN` o `D-NN`. ¿Qué hago?

Son marcas de "falta un dato" que la skill no quiso inventar. `⟨PENDIENTE: ...⟩` aparece en los textos para presentaciones, con quién tiene que responder. `<<HUECO M-NN>>` aparece en documentos del proyecto, como `AGENTS.md`. `M-NN` es un valor sin confirmar y `D-NN` es una decisión abierta que tiene que resolver una persona. Completalos antes de la reunión o del cierre: un dato inventado se descubre delante del cliente.

### ¿Una skill puede mandar mails o publicar cosas sin avisarme?

Las que preparan comunicación con clientes (`asome-kickoff` y `asome-sprint-demo`) solo escriben el texto: el mail lo enviás vos. `asome-meeting` sí manda invitaciones reales, y `asome-deploy` abre PRs y, después de que alguien los mergea, publica la versión. `asome-infra-plan` no aplica nada sin tu confirmación, y `/opsx:propose` espera la aprobación de una persona antes de que se escriba código. En todos los casos, revisá lo que te muestra antes de confirmar.

### No soy del equipo técnico, ¿puedo usarlas?

Sí. Las más pensadas para trabajo de producto, reuniones y contenido son `asome-onboard`, `asome-standup`, `asome-discovery`, `asome-meeting`, `asome-kickoff`, `asome-sprint-demo`, `asome-video` y `asome-video-producto`. Las de desarrollo e infraestructura (`asome-commit`, `asome-branch-pr`, `asome-review`, `asome-deploy` y las `asome-infra-*`) cambian código, ramas y servicios en la nube: conviene usarlas junto con alguien del equipo técnico.

### ¿A quién le pregunto, o cómo propongo una mejora?

Al equipo de ASOME. Si una skill te pareció confusa, falla o le falta algo, avisale al equipo: las skills viven en el repo [asomelab/skills](https://github.com/asomelab/skills), y quien lo mantiene puede corregirlas o sumar una nueva con `/asome-create-skill`.
