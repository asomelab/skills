# Tu primer video con IA

Tutorial paso a paso para hacer un reel de ASOME con Claude, desde cero hasta publicarlo en
Instagram. Está pensado para personas que **no programan**: vos grabás, aprobás y elegís;
Claude instala, edita, exporta y guarda todo.

Hay dos tipos de reel:

- **Reel con vos hablando a cámara** (talking head), con la skill `asome-video`. Es el que
  explica este tutorial de punta a punta.
- **Reel de producto**, que muestra un software que ASOME construyó para un cliente, con voz en
  off hecha con IA, con la skill `asome-video-producto`. Está en la [parte 7](#7-reel-de-producto).

> Tiempo: la primera vez, unos 30 a 45 minutos de preparación (la mayor parte la hace Claude).
> Después, cada reel lleva lo que tarde la edición: vos solo intervenís para aprobar y pedir
> cambios.

## Índice

1. [Lo que vas a necesitar](#1-lo-que-vas-a-necesitar)
2. [Instalar Claude Code](#2-instalar-claude-code)
3. [Instalar las skills de ASOME](#3-instalar-las-skills-de-asome)
4. [Cuentas y accesos](#4-cuentas-y-accesos)
5. [Lo que Claude instala por vos](#5-lo-que-claude-instala-por-vos)
6. [Tu primer reel, paso a paso](#6-tu-primer-reel-paso-a-paso)
7. [Reel de producto](#7-reel-de-producto)
8. [Reglas de seguridad](#8-reglas-de-seguridad)
9. [Si algo sale mal](#9-si-algo-sale-mal)

---

## 1. Lo que vas a necesitar

- Una **Mac**, mejor con procesador Apple (M1 o posterior), internet y unos 5 GB libres.
- Una **cuenta de Claude** con acceso a Claude Code.
- Una **cuenta de GitHub** con acceso al repositorio privado `asomelab/videos` (ver
  [parte 4](#4-cuentas-y-accesos)). Ahí se guarda el "código" de cada video.
- **Google Drive para escritorio** con el Drive de ASOME: ahí van tu video original y los
  archivos finales.
- Solo para reels con voz de IA (los de producto): una **cuenta de ElevenLabs**.
- Tu video, **grabado en vertical**.

## 2. Instalar Claude Code

Elegí una de las dos formas. Si no sabés cuál, usá la app.

**Opción A: la app de escritorio (recomendada)**

1. Entrá a [claude.ai/download](https://claude.ai/download), bajá la app para Mac e
   instalala (arrastrala a Aplicaciones).
2. Abrila e iniciá sesión con tu cuenta de Claude.
3. Arriba vas a ver la pestaña **Code**: ahí se usa Claude Code. Te pide elegir una carpeta
   para trabajar: elegí **Documentos**.

**Opción B: la Terminal**

1. Abrí la app **Terminal** (Cmd + espacio, escribí "Terminal", Enter).
2. Pegá esta línea y apretá Enter:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. Cuando termine, escribí `claude` y Enter. La primera vez te pide iniciar sesión en el
   navegador.

## 3. Instalar las skills de ASOME

Una **skill** es una receta que Claude sigue para hacer una tarea como la hace ASOME. Se
instalan una sola vez.

1. En Claude Code, escribí:
   > Instalá las skills de ASOME con `npx skills add asomelab/skills`, de forma global y para
   > Claude Code.
2. Si te dice que falta Node.js, pedile: "instalá Node.js". Te avisa antes de cada paso.
3. Cerrá y volvé a abrir Claude Code (en la app: una sesión nueva) para que las cargue.

Si preferís hacerlo vos en la Terminal: `npx skills add asomelab/skills`. Si te pregunta para
qué herramienta, marcá Claude Code; si te pregunta proyecto o global, elegí global.

## 4. Cuentas y accesos

### GitHub (para guardar cada video)

1. Si no tenés cuenta, creala en [github.com](https://github.com) (gratis).
2. Pasale tu usuario de GitHub al equipo de ASOME y pedí acceso al repositorio privado
   **`asomelab/videos`**. Te llega una invitación por mail: aceptala.
3. Iniciá sesión en tu compu. Claude instala la herramienta `gh` si falta; el inicio de sesión
   lo hacés vos:
   - Abrí la Terminal, escribí `gh auth login` y Enter (en Claude Code también podés escribir
     `! gh auth login`).
   - Elegí con las flechas y Enter: **GitHub.com** → **HTTPS** → **Yes** (autenticar Git) →
     **Login with a web browser**.
   - Copiá el código de 8 letras que aparece, apretá Enter, pegalo en la página que se abre y
     tocá **Authorize**.
4. Para comprobarlo, decile a Claude: "¿tengo acceso a asomelab/videos?".

Sin acceso todavía también se puede trabajar: Claude guarda el video en un repositorio local,
solo en tu compu, y toma la tipografía Maax del Drive. Cuando te den acceso, pedile que lo suba.

### Google Drive para escritorio (crudos y entregas)

1. Bajá **Google Drive para escritorio** de [google.com/drive/download](https://www.google.com/drive/download/)
   e instalalo.
2. Iniciá sesión con tu cuenta de ASOME.
3. En el Finder tiene que aparecer **Google Drive** con la carpeta **ASOME** (en "Mi unidad" o
   en "Unidades compartidas"). Si te la compartieron y no aparece: en drive.google.com, clic
   derecho sobre la carpeta → **Organizar** → **Agregar acceso directo** a Mi unidad.

Claude usa dos carpetas de ese Drive:

- `workspace/resources/crudos/<TEMA DEL REEL>/`: tu video original, tal como salió de la
  cámara. Los crudos son pesados y nunca van a GitHub.
- `ASOME/marketing/reels/<fecha> <tema>/`: los archivos finales para publicar.

### ElevenLabs (solo para voz con IA)

1. Creá una cuenta en [elevenlabs.io](https://elevenlabs.io). El plan gratis sirve para probar,
   pero **no incluye licencia comercial**: para publicar, el plan Starter.
2. Creá una clave de API: tu perfil → **API Keys** → **Create API Key**. Dale los permisos
   **Text to Speech** y **Voices: Read** (lo demás, sin acceso). Copiala.
3. **Guardala vos, en tu compu.** Abrí la Terminal y pegá esta línea, Enter:
   ```bash
   read -rs "k?Clave de ElevenLabs: " && echo && touch ~/.zshenv && sed -i '' '/ELEVENLABS_API_KEY/d' ~/.zshenv && print -r -- "export ELEVENLABS_API_KEY='$k'" >> ~/.zshenv && chmod 600 ~/.zshenv && unset k && echo listo
   ```
   Pegá la clave (no se ve mientras la pegás, es normal) y Enter. Tiene que decir `listo`.
   Esto deja en el archivo `~/.zshenv` la línea `export ELEVENLABS_API_KEY=...`, que solo vos
   podés leer. Para cambiar la clave, repetí lo mismo con la nueva.
4. **Nunca pegues la clave en el chat.** Si alguna vez la pegaste en un chat, un mail o un
   archivo, se considera expuesta: borrala en ElevenLabs y creá otra **ese mismo día**.

## 5. Lo que Claude instala por vos

La primera vez, Claude revisa tu compu y te avisa antes de instalar cada cosa:

| Qué | Para qué |
|---|---|
| Node.js | El programa que hace funcionar el editor de video (Remotion) |
| Python con Pillow | Mide silencios y arma las hojas de caras y de portadas |
| Git y GitHub CLI (`gh`) | Bajan y guardan el repositorio de videos |
| Google Chrome | Exporta el video más rápido (si no lo tenés, te pasa cómo instalarlo) |
| La skill de Remotion y el modelo de transcripción | Saber de video y entender lo que decís |
| El repositorio de videos | Se baja una vez a Documentos > asome-videos > videos |

Si en algún momento aparece una ventana que **pide la contraseña de tu Mac**, la escribís vos.
Claude nunca la pide ni la ve.

## 6. Tu primer reel, paso a paso

### 6.1 Grabá

- En vertical, con la cámara a la altura de los ojos y **aire arriba de la cabeza**.
- Luz de frente y, si podés, micrófono corbatero.
- Si te equivocás, **frená dos segundos y repetí la frase entera**: no hace falta cortar.
- Mirá a la lente. Al final quedate dos segundos quieto, mirando a cámara y relajado: de ahí
  sale la portada.
- Cerrá con una llamada a la acción clara, por ejemplo "escribinos por WhatsApp".

### 6.2 Pedile el reel a Claude

Abrí Claude Code y escribí, por ejemplo:

> /asome-video

o simplemente:

> Editame este video para un reel de ASOME.

### 6.3 Mandale el video

**Arrastrá el archivo al chat** (desde el Finder o desde Fotos, exportado a una carpeta). Si
es muy pesado o está en otro lado, decile dónde está:

> El video está en Descargas, se llama IMG_7263.MOV.

### 6.4 Lo que te va a preguntar

En un solo mensaje te pide:

1. El video (si no lo mandaste).
2. **El tema** en pocas palabras: le da nombre a todo. Ejemplo: "consejo para elegir software".
3. **La llamada a la acción**: WhatsApp, link en la bio, mensaje directo…
4. **Una frase para la portada**, si ya la tenés.

Podés contestar así:

> Tema: crecer sin estructura. CTA: escribinos por WhatsApp. Portada: "Escalá tu facturación,
> no tu estructura".

Solo el video es obligatorio: lo demás lo propone Claude.

### 6.5 Esperá la preparación

Claude instala lo que falte (la primera vez), prepara la carpeta del video, **sube tu video
original al Drive** (crudos) y lo transcribe. Después revisa toma por toma: los arranques en
falso, los silencios y dónde mirás. Esta parte es lenta a propósito.

### 6.6 Aprobá el plan de edición

Te muestra un plan: qué partes quedan y cuáles se cortan (y por qué), los subtítulos corregidos,
uno o dos momentos con gráficos, el cierre y **seis opciones de portada**. Leelo con calma,
sobre todo los subtítulos. **Nada se arma sin tu OK.**

> Dale, avanzá así. Para la portada, la 4.

> Sacá la parte donde digo "eh, perdón" y el gráfico que aparezca cuando digo "la misma
> estructura".

Con tu OK, Claude guarda el plan en GitHub (un **commit**). Vuelve a guardar en el primer
armado y en la versión final, así el video se puede rehacer o variar cuando quieras.

### 6.7 Mirá el video en Remotion Studio

Remotion Studio es la vista previa. En la app de Claude se abre en el panel del navegador; en
la Terminal, en tu navegador (una dirección tipo `http://localhost:3000`).

- Barra espaciadora para reproducir, y la línea de tiempo abajo para ir a cualquier momento.
- A la izquierda aparecen los reels del repositorio: el tuyo está en la carpeta con su tema.
- No hace falta tocar nada. Si movés algo dentro del video, cambia de lugar: contale a Claude.

### 6.8 Pedí cambios con tus palabras

Como se lo dirías a una persona:

> En el subtítulo dice "hallamos" y es "ayudamos".

> Ese corte se nota, suavizalo.

> Bajá la música.

> El cierre que diga "Ordená tu operación antes de crecer".

> Hacé una versión más corta, de 30 segundos.

Repetí hasta que te guste.

### 6.9 Exportá

> Exportalo.

Claude genera el archivo para Instagram, un máster en 4K, las portadas, los subtítulos y el
**paquete para publicar**. El paquete tiene el caption (con el gancho en los primeros 125
caracteres), los hashtags, el primer comentario, el texto alternativo, el chequeo de la
portada, **el día y la hora sugeridos** y **qué tocar en Instagram, paso a paso**, con una lista
final para tildar. Te lo muestra y podés pedirle cambios:

> El caption arrancalo con la frase de la cuenta, y sacá el último hashtag.

### 6.10 Dónde quedan los archivos

| Dónde | Qué hay |
|---|---|
| **Descargas** > `<fecha>_<tema>` | El reel, el máster 4K, las portadas, los subtítulos y el paquete `…_copy_<tema>.md` |
| **Drive** > `ASOME/marketing/reels/<fecha> <tema>/` | La misma carpeta, para el equipo |
| **Drive** > `workspace/resources/crudos/<TEMA>/` | Tu video original |
| **GitHub** > `asomelab/videos` | El código del reel (`src/<tema>/`), el paquete y una sección en el README que explica cómo rehacerlo y qué se puede variar |

Los nombres siguen la regla de marca: fecha, formato, tema y versión
(`20261015_reel_crecer-sin-estructura_v01.mp4`).

### 6.11 Publicalo en Instagram

Abrí el archivo `…_copy_….md` (en la compu o desde el Drive en el celular) y seguilo en orden:

1. Pasate al celular el video `…_reel_…` y la portada `…_portada-reel_…` (AirDrop o Drive).
2. En Instagram, tocá **+** → **Reel** y elegí el video. Usá el `reel`, nunca el 4K.
3. **No agregues música de Instagram**: el video ya trae su sonido.
4. **Editar portada** → **Agregar de la galería** → la portada. Comparala con la versión
   `portada-feed`: así se ve en la grilla de tu perfil.
5. Pegá el **Caption** del paquete. Dejá una línea en blanco y pegá los **Hashtags** (si
   Instagram no acepta tantos, dejá los primeros 5: están en orden de importancia).
6. Dejá activado **Compartir en el feed**.
7. **Subtítulos**: el video ya los trae. Dejá apagados los subtítulos automáticos de Instagram
   para que no aparezcan dos veces.
8. En **Configuración avanzada**, pegá el **Texto alternativo** si la app te lo ofrece.
9. Ubicación y etiquetas, solo si el paquete lo dice.
10. Publicalo el día y a la hora que sugiere el paquete. Apenas sale, publicá el **Primer
    comentario** y fijalo (mantenelo apretado → Fijar).
11. Respondé los comentarios de la primera hora y tildá la lista final del paquete.

## 7. Reel de producto

Para mostrar una app o plataforma que ASOME construyó para un cliente, con voz en off de IA.
Las pantallas se rehacen **desde el código del producto, con datos de ejemplo**: Claude nunca
entra a los sistemas del cliente ni usa sus usuarios.

**Qué le tenés que dar**

1. **El código del producto en tu compu**: la carpeta del repositorio de la app del cliente.
   Si no la tenés, pedí acceso al equipo y decile a Claude "cloná el repo de <producto>".
2. **Los dos lados que vendemos**: quién lo maneja (por ejemplo, el equipo de ventas) y quién
   lo vive (el cliente final). Si no sabés, Claude los propone leyendo el código.
3. **Permiso de nombres**: ¿se puede mostrar el nombre del producto? ¿y nombrar al cliente? Si
   no hay permiso, el reel dice "un cliente" y no muestra logo, ícono ni dirección web.
4. **El formato y la llamada a la acción** (por defecto, reel de unos 50 segundos con voz IA y
   "Escribinos por WhatsApp").
5. La **clave de ElevenLabs guardada por vos** ([parte 4](#elevenlabs-solo-para-voz-con-ia)).

**Cómo pedirlo**

> /asome-video-producto

> Hagamos un reel de producto de la plataforma de pedidos que hicimos. El código está en
> Documentos/code/plataforma-pedidos. No nombramos al cliente.

**Cuánto tarda**: alrededor de **una hora y tres cuartos** (más 15 a 30 minutos la primera
vez). Tus tres paradas:

1. **Aprobar el guion** (cinco frases, unos 45 segundos de voz). Cerralo bien antes de seguir:
   cambiarlo después obliga a rehacer la voz y las escenas.
2. **Elegir la voz** entre tres muestras que te manda.
3. **Mirar el resultado final** y decir si lo sube al Drive.

En el medio te va mandando imágenes de cada escena: si algo no te gusta, decilo
("en la pantalla del celular, que el botón diga Confirmar pedido"). Al final recibís lo mismo
que en un reel normal, más el guion y la voz, y el paquete para publicar. Se publica igual que
en la [parte 6.11](#611-publicalo-en-instagram); no etiquetes al cliente sin su permiso.

## 8. Reglas de seguridad

1. **Nunca pegues contraseñas, claves ni tokens en el chat.** Si pasó, cambiá esa clave el
   mismo día.
2. **La contraseña de tu Mac la escribís vos**, en la ventana que la pide.
3. **Datos reales de clientes no entran al chat**: ni planillas, ni capturas con datos, ni
   accesos a sus sistemas.
4. **Nada inventado**: el texto en pantalla y el caption dicen lo que vos dijiste o lo que el
   producto hace de verdad. Sin métricas, resultados ni testimonios inventados.
5. **Maax es de ASOME**: vive solo en el repositorio privado de videos. No la compartas ni la
   subas a otro lado.

## 9. Si algo sale mal

- **"No sé qué reel editar"**: decile a Claude "seguimos con el reel <tema>".
- **"Sin acceso a asomelab/videos"**: pedí acceso al equipo; mientras, se trabaja en tu compu.
- **"No encuentro la tipografía Maax"**: viene con el repositorio. Sin acceso, bajá del Drive
  `brand > Tipografia > Maax` a Descargas y avisale a Claude.
- **"No encuentro la carpeta del Drive"**: abrí Google Drive para escritorio y revisá que la
  carpeta ASOME aparezca en el Finder. Si no, Claude te dice qué subir a mano.
- **La transcripción no funciona**: pasa en algunas compus. Claude te propone otra forma.
- **Cualquier otro error**: copiá el mensaje y pegáselo a Claude (sin claves), o consultá al
  equipo de ASOME.

Más detalle de cada skill en la [guía de uso](GUIA.md) y en las guías de las skills:
[`asome-video`](skills/asome-video/references/guia-usuario.md) y
[`asome-video-producto`](skills/asome-video-producto/references/guia-usuario.md).
