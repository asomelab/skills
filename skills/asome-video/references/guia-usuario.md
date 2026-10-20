# Cómo editar un reel de ASOME con Claude

Guía para quien graba el video. No hace falta saber programar: vos grabás y decidís,
Claude instala, edita, te muestra el resultado y exporta.

## Qué vas a lograr

Un reel vertical con la marca de ASOME, listo para Instagram:

- Las mejores tomas de tu video, sin errores, sin silencios largos y sin los momentos en que
  mirás para otro lado. Entre toma y toma, un fundido suave en vez de un salto.
- Subtítulos con la tipografía y los colores de la marca, sincronizados con tu voz.
- Uno o dos momentos con gráficos animados (motion graphics), solo donde suman: la pantalla se
  divide, arriba el gráfico y abajo vos. Nunca un recuadro alrededor de tu cara.
- Música de fondo suave y efectos de sonido discretos.
- Un cierre con el logo, una frase y tu llamada a la acción.
- La portada del reel hecha con una imagen real de tu video.

Recibís el archivo para subir a Instagram, una copia en 4K para guardar, las portadas, los
subtítulos en un archivo aparte y el paquete para publicar (texto, hashtags, primer comentario,
cuándo publicar y qué tocar en Instagram, paso a paso). Todo queda también en el Drive de ASOME,
y el "código" del video se guarda en GitHub, para poder rehacerlo o sacar otra versión cuando
quieras.

## Qué necesitás

- Una Mac (mejor con procesador Apple, M1 o posterior). En Windows también se puede, con
  algunos pasos extra.
- Claude Code: en la app de Claude (pestaña Code) o en la Terminal.
- Tu video grabado en vertical.
- Una cuenta de GitHub con acceso al repositorio privado `asomelab/videos` (pedíselo al equipo
  de ASOME). Ahí se guarda cada video y viene Maax, la tipografía de la marca. Sin acceso
  también se puede: Claude trabaja en tu compu y toma Maax del Drive de ASOME
  (brand > Tipografia > Maax).
- Google Drive para escritorio con el Drive de ASOME, para guardar los crudos y las entregas.
- Internet y unos 3 GB libres en la compu.
- Python con Pillow (lo instala Claude si falta) y, si podés, Google Chrome: con Chrome el
  video se exporta más rápido.
- Tiempo: la primera vez, entre 15 y 30 minutos de instalación (la hace Claude).
  Las siguientes veces se va directo a editar.

## Cómo grabar para que quede bien

- **Vertical**, con la cámara a la altura de los ojos.
- **Dejá aire arriba de la cabeza**: ahí aparecen las tarjetas y los gráficos.
- **Luz de frente** (una ventana delante tuyo) y un fondo ordenado.
- **Micrófono corbatero** si tenés, y sin ruido de fondo.
- **Si te equivocás, frená dos segundos y repetí la frase entera**, desde el principio.
  Claude encuentra las tomas buenas y descarta las otras; no hace falta cortar la grabación.
- **Mirá a la lente mientras hablás.** Si mirás para otro lado, esa parte se corta.
- Frases cortas y una llamada a la acción clara al final, por ejemplo
  "escribinos por WhatsApp".
- Quedate un par de segundos quieto mirando a cámara, con la boca cerrada y relajado
  (una sonrisa leve queda bien), al principio o al final: de ahí sale la portada.

## Cómo es el proceso

1. **Te explico** todo esto.
2. **Reviso tu compu e instalo lo que falte.** Por ejemplo Node.js (el programa que hace
   funcionar el editor) y la tipografía. Te aviso cada cosa antes de hacerla. Si algún paso
   pide la contraseña de tu Mac, te digo exactamente qué hacer: la escribís vos, Claude
   nunca la ve.
3. **Preparo la carpeta del video** dentro del repositorio de videos de ASOME
   (Documentos > asome-videos > videos). La primera vez lo descargo de GitHub; para eso
   iniciás sesión vos en GitHub con `gh auth login`, en la Terminal, y te digo cada paso.
   Tu video original se guarda en el Drive de ASOME (workspace > resources > crudos).
4. **Me pasás el video**: arrastralo al chat o decime dónde está. Lo transcribo para saber
   qué decís y en qué segundo, y reviso cada corte: los arranques en falso, los silencios y
   dónde mirás. La primera vez tarda unos minutos porque se descarga el modelo de
   transcripción, y esta parte lleva su tiempo porque se mira toma por toma.
5. **Te propongo un plan de edición**: qué partes quedan y cuáles se cortan (y por qué), el
   texto de los subtítulos corregido, los momentos con gráficos, el cierre y seis opciones de
   portada para que elijas una. Vos decís "dale" o pedís cambios. **Nada se arma sin tu OK.**
   Con tu OK guardo el plan en GitHub (un "commit"), y vuelvo a guardar en el primer armado y
   en la versión final.
6. **Armo el video y te lo muestro** en Remotion Studio.
7. **Pedís cambios con tus palabras** y los aplico. Repetimos hasta que te guste.
8. **Exporto** los archivos finales, armo el paquete para publicar y te dejo todo en la
   carpeta Descargas y en el Drive de ASOME (marketing > reels).

## Remotion Studio en un minuto

Es la ventana donde ves el video mientras lo editamos.

- Funciona como un reproductor: botón Play (o la barra espaciadora) y una línea de tiempo
  abajo para ir a cualquier momento.
- No hace falta tocar nada. Si arrastrás algo dentro del video, cambia de lugar en el
  proyecto: contale a Claude si fue a propósito.
- En la app de Claude se abre en el panel del navegador. En la Terminal, en tu navegador,
  en una dirección del tipo `http://localhost:3000`.

## Cómo pedir cambios

Decilo como se lo dirías a una persona. Por ejemplo:

- "En el subtítulo dice 'hallamos' y es 'ayudamos'."
- "Sacá la parte donde digo 'eh, perdón'."
- "Que el gráfico de la cuenta aparezca un segundo antes."
- "Ese corte se nota, suavizalo."
- "Bajá la música" o "sin música".
- "El cierre que diga: 'Ordená tu operación antes de crecer'."
- "Usá otra imagen para la portada, la número 4."
- "Hacé una versión más corta, de 30 segundos."

## Qué archivos recibís

Quedan en Descargas, en una carpeta con la fecha y el tema del video. El nombre sigue la
regla de marca: fecha, formato, tema y versión.

| Archivo | Para qué sirve |
|---|---|
| `…_reel_…_v01.mp4` | El que subís a Instagram (1080 × 1920) |
| `…_reel-4k_…_v01.mp4` | La copia en 4K para guardar |
| `…_portada-reel_…_v01.jpg` | La portada, que se sube junto con el reel |
| `…_portada-feed_…_v01.jpg` | Te muestra cómo queda la portada en la grilla del perfil |
| `…_subtitulos_…_v01.srt` | Los subtítulos en un archivo aparte, por si la red los pide |
| `…_copy_….md` | El paquete para publicar: caption, hashtags, primer comentario, texto alternativo, portada, cuándo publicar, qué tocar en Instagram y la lista final |

La misma carpeta se sube al Drive de ASOME, en marketing > reels, con la fecha y el tema. Si
tu compu no tiene Google Drive para escritorio, Claude te avisa y la subís vos.

## Cómo subirlo a Instagram

Abrí el archivo `…_copy_….md`: tiene todo en orden, listo para copiar y pegar.

1. Pasate al celular el video `…_reel_…` y la portada `…_portada-reel_…` (AirDrop o Drive).
2. En Instagram: **+** → **Reel** → elegís el video.
3. No agregues música de Instagram: el video ya trae su sonido.
4. **Editar portada** → **Agregar de la galería** → la portada. Mirá la versión "feed": así se
   ve en la grilla de tu perfil.
5. Pegá el **Caption** y, al final, los **Hashtags**.
6. Dejá activado **Compartir en el feed**. Los subtítulos ya están en el video: dejá apagados
   los subtítulos automáticos de Instagram para que no aparezcan dos veces.
7. En **Configuración avanzada**, pegá el **Texto alternativo** si la app te lo ofrece.
8. **Compartir**. Apenas sale, publicá el **Primer comentario** y fijalo.
9. Respondé los comentarios de la primera hora.

El archivo también te sugiere el día y la hora para publicar, y trae una lista final para
tildar. Desde la compu es igual, en instagram.com o Meta Business Suite.

## Si algo sale mal

- **"No encuentro la tipografía Maax":** viene con el repositorio de videos. Si todavía no
  tenés acceso, entrá al Drive de ASOME, descargá la carpeta brand > Tipografia > Maax a tu
  carpeta Descargas y avisale a Claude.
- **"Sin acceso a asomelab/videos":** pedíselo al equipo de ASOME con tu usuario de GitHub.
  Mientras, el video se guarda solo en tu compu.
- **"Aparece una ventana que pide contraseña":** es la de tu Mac. La escribís vos.
- **Nunca pegues contraseñas ni claves en el chat.** Si pasó, cambiala ese mismo día.
- **"La transcripción no funciona":** pasa en algunas compus sin una placa de video
  compatible. Claude te propone otra forma de sacar los subtítulos.
- **Cualquier otro error:** copiá el mensaje y pegáselo a Claude, o consultá al equipo
  de ASOME.

## Palabras que vas a escuchar

- **Terminal:** la ventana donde se escriben comandos. La usa Claude, no vos.
- **Node.js:** el programa que hace funcionar el editor de video.
- **Remotion:** el editor de video que usamos: arma el video con código.
- **Studio:** la vista previa de Remotion, donde mirás el video.
- **Exportar (render):** convertir el proyecto en el archivo de video final.
- **Toma:** cada vez que dijiste una frase; si la repetiste, hay varias tomas.
- **Arranque en falso:** cuando empezás una frase, frenás y la volvés a decir.
- **Pantalla dividida:** arriba el gráfico, abajo vos, por unos segundos.
- **Fundido:** la transición suave de una toma a la siguiente.
- **Motion graphics:** textos, tarjetas y gráficos animados.
- **Máster 4K:** la copia en máxima calidad, para archivo.
- **GitHub / repositorio:** donde se guarda el "código" de cada video, con su historial.
- **Commit:** cada vez que se guarda una versión en el repositorio.
- **Crudo:** el video original, tal como salió de la cámara.
