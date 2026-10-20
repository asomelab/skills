# Cómo hacer un reel de producto de ASOME con Claude

Guía para quien pide el video. No hace falta saber programar: vos aprobás el guion, elegís la
voz y mirás el resultado; Claude arma todo lo demás.

## Qué vas a lograr

Un reel vertical de unos 50 segundos que presenta un software que ASOME construyó para un
cliente, con la marca de ASOME:

- Un gancho al principio, la presentación del producto ("lo construimos en ASOME para un
  cliente…"), lo que gana el negocio, lo que vive el usuario final y el cierre de ASOME.
- Las pantallas reales del producto, rehechas a partir de su código y con datos de ejemplo,
  animadas al ritmo de la voz.
- Voz en off con inteligencia artificial, subtítulos de marca, música y efectos suaves.
- La portada del reel.
- El paquete para publicar: caption, hashtags, primer comentario, texto alternativo, cuándo
  publicar, qué tocar en Instagram paso a paso y una lista final para tildar.
- El archivo de subtítulos (SRT), el guion y la voz por separado.

Todo queda en tu carpeta Descargas y, si querés, en el Drive de ASOME
(ASOME/marketing/reels/<fecha> <tema>/). El código del video se guarda en el repositorio
privado de videos de ASOME en GitHub, para rehacerlo o sacar otra versión.

## Qué necesitás

- Lo mismo que para editar un reel con la skill asome-video (Mac, Claude Code, GitHub con
  acceso a `asomelab/videos`, Google Drive para escritorio). Si nunca la usaste, Claude la
  prepara primero: 15 a 30 minutos la primera vez.
- **El código del producto en esta compu** (la carpeta del repositorio). Las pantallas salen de
  ahí.
- **Una cuenta de ElevenLabs** con una clave de API (permisos «Text to Speech» y «Voices:
  Read»), para la voz. El plan gratis sirve para probar, pero no incluye licencia comercial;
  para publicar conviene el plan Starter.
- Saber si se puede nombrar el producto y si se puede nombrar al cliente. Si el producto no se
  nombra, tampoco aparecen su logo, su ícono ni su dirección web: también identifican al cliente.

## Cómo es el proceso y cuánto tarda

| Paso | Qué pasa | Tu parte | Tiempo |
|---|---|---|---|
| 0 | Te explico y te hago 4 preguntas | Contestar en un mensaje | 5 min |
| 1 | Escribo el guion y generamos la voz | Aprobar el guion y elegir entre 3 voces | 20 min |
| 2 | Rehago las pantallas desde el código | Nada | 20 min (en paralelo con el paso 1) |
| 3 | Armo las escenas, la música, la portada y el texto | Mirar las imágenes que te mando | 40 min |
| 4 | Reviso el video cuadro por cuadro | Nada | 10 min |
| 5 | Exporto y entrego todo | Ver el video y decir si lo subo a Drive | 10 min |

En total, **alrededor de una hora y tres cuartos**. Lo que más acelera: contestar las preguntas
del paso 0 de una vez y cerrar el guion antes de generar la voz (cambiarlo después obliga a
rehacer las escenas).

## Seguridad: tres reglas

1. **Nunca pegues claves ni contraseñas en el chat.** La clave de ElevenLabs la cargás vos en la
   app Terminal de la Mac: Claude te pasa una línea para pegar, vos pegás la clave (no se ve
   mientras la escribís) y queda guardada solo en tu compu. Si alguna vez pegaste una clave o una
   contraseña en un chat o en un archivo, se considera expuesta: cambiala ese mismo día.
2. **Claude no entra a los sistemas del cliente.** No usa sus usuarios, no abre su versión de
   prueba ni la de producción. Las pantallas se reconstruyen desde el código, con nombres y
   números inventados, y el video lo aclara: "Interfaz de <producto> · datos de ejemplo".
3. **Nada inventado.** El guion y el texto solo dicen lo que el producto hace de verdad. Sin
   métricas, resultados ni testimonios inventados, y sin nombrar al cliente si no hay permiso.

## Cómo subirlo a Instagram

Abrí el archivo `…_copy_….md` de la carpeta: tiene todo en orden y listo para pegar. Seguí su
sección "Configuración en Instagram" (es la misma que en la guía de asome-video):

- Subí el video `…_reel_…` y poné la portada desde la galería.
- No agregues música de Instagram: el video ya trae voz y música.
- Pegá el caption y, al final, los hashtags.
- Los subtítulos ya están en el video: dejá apagados los automáticos de Instagram.
- Pegá el texto alternativo en la configuración avanzada, si la app te lo ofrece.
- Apenas sale el reel, publicá el primer comentario y fijalo.
- No etiquetes ni invites como colaborador al cliente si no dio permiso para nombrarlo.
- El archivo SRT sirve para YouTube, LinkedIn o Facebook.
