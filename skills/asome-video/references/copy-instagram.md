# Publish-ready Instagram package (Fase "entrega")

What the delivery writes next to the video: one Markdown file, `<AAAAMMDD>_copy_<tema>.md`, that
someone who is not technical can follow with the phone in hand and publish the reel without
asking anything. Used by `asome-video` (Fase 7) and `asome-video-producto` (Fase 3 + 5).

**Load the `social` skill first when it is available** (Skill tool, `social`): it carries the
platform guidance this file condenses. If it is not installed, the rules below are enough. When
the two disagree, the hard rules here win (ASOME voice, honesty), and anything about Instagram's
own limits is checked in the app on the day of publishing.

## Rules (condensed from `social` + ASOME voice)

**Voice.** Spanish rioplatense with voseo, like the speaker or the voiceover. Plain, concrete,
first person plural for ASOME ("construimos", "te ayudamos"). It sounds like a person from the
team wrote it.

**Honesty.** Every claim comes from what the speaker said (the transcript of the cut) or, for a
product reel, from the script and the platform truth table. No invented numbers, results,
clients, testimonials or timeframes. A client is named only with explicit permission; otherwise
"un cliente". If a sentence needs a fact nobody gave, drop the sentence.

**No AI tells** (from `social`): no "no es X, es Y" reveals, no "sin X, sin Y, sin Z" lists, no
self-answered questions or colon reveals ("¿El resultado? …", "Lo mejor: …"), no stock phrases
("llevá tu negocio al siguiente nivel", "revolucionario", "game changer", "descubrí el poder
de"), no em dashes, no broetry (one short sentence per line for the whole caption), no
engagement bait ("¿Qué opinás?", "Leelo de nuevo"), no emoji as bullets. At most one list of
three per caption. 0–3 emoji in total; prefer none.

**Hook.** The first line is the whole post for most people: it must work alone in the first
**125 characters** (what Instagram shows before "más"). Lead with the viewer's pain or the
reel's strongest line, in their words. Count the characters and say the count.

**Body.** Short paragraphs a person would write, scannable; "→" lines are fine for a list of
features. 600–1200 characters for a product reel, 300–900 for a talking head.

**CTA.** The same action as the reel's end card: "Escribinos por WhatsApp o por mensaje
directo" by default. One CTA, at the end.

**Hashtags.** 8–15, Spanish first, ordered by priority: the niche (the topic, or the client's
industry for a product reel), then business and software (#softwareamedida
#desarrollodesoftware #transformaciondigital #pymesargentinas …). No banned, spammy or
unrelated tags. Instagram has been lowering how many hashtags a post may carry (`social` lists
5 as the current official limit): the checklist tells the person to paste the first 5 and add
the rest only if the app accepts them, so the order matters.

**First comment.** 1–2 lines that add something: a question that is a real question, or the
honesty note ("Las pantallas son del producto, con datos de ejemplo"). Published right after
the reel and pinned.

**Alt text.** 1–2 sentences describing what the video shows, for someone who cannot see it.

## How it is written: 3 angles, then an editor

Three drafts in parallel (background agents with the same CONTEXT block, one angle each), then
one editor. For a product reel the angles and the CONTEXT block are in
`asome-video-producto/references/prompt-copy.md`. For a talking head:

- **dolor**: opens on the problem the speaker describes, in the viewer's words.
- **frase**: opens on the speaker's strongest line, quoted or paraphrased tight.
- **consejo**: opens on the practical takeaway (what to do, what to check).

CONTEXT for a talking head: who ASOME is (Software Factory from Argentina: operational
consultancy plus custom software, promise "escalar la facturación de empresas sin aumentar
proporcionalmente su estructura"), the final cut's transcript (`src/<tema>/captions-raw.json`
with the `FIXES` applied, or the SRT), the end card text, the cover text, and the rules above.

The editor scores each draft (hook in 125 characters, clarity for a scroller, fidelity to the
reel, honesty, ASOME voice, CTA), picks the winner, polishes it with the best lines of the
others, verifies every claim against the transcript or script, counts characters, and returns
the sections below. Without background agents, write the three hooks yourself, pick one and
say why in "Notas".

## The file

Write it in Spanish, ready to paste, with exactly these sections. The person copies each block
as it is, so nothing inside a block that should not be pasted.

```markdown
# <Título del reel> · copy para Instagram

Video: `<AAAAMMDD>_reel_<tema>_vNN.mp4` · Portada: `<AAAAMMDD>_portada-reel_<tema>_vNN.jpg` · Subtítulos: `<…>.srt`

## Caption
<hook ≤125 caracteres>

<cuerpo>

<CTA>

## Hashtags
<8–15, en orden de prioridad, en una línea>

## Primer comentario
<1–2 líneas>

## Texto alternativo
<1–2 oraciones>

## Portada
- Dice: "<texto de la portada>". <Encaja con el hook / qué cambiar.>
- En la grilla (4:5, `portada-feed`) el título se lee entero y no queda cortado: <sí / qué ajustar>.

## Cuándo publicar
<día y hora sugeridos, hora de Argentina, y por qué>

## Configuración en Instagram
<los pasos de abajo, adaptados a este reel>

## Checklist antes de publicar
<la lista de abajo, adaptada>

## Notas
<conteo del hook y del caption, cantidad de hashtags, por qué ganó el ángulo, un hook
alternativo, qué confirmar antes de publicar>
```

### Cuándo publicar

A starting point, not data: `social` puts the best windows for Reels around 9, 12 and 19–21 h
local time. ASOME's buyer is a business owner, so suggest **martes a jueves, 12 a 13 h o 19 a
21 h (hora de Argentina)**, avoid Friday night and weekends for a business reel, keep at least
a day from the previous reel, and say that after a few posts the account's own Insights (Mejor
momento para publicar) replace this. Write it as one concrete suggestion ("Martes 12:30") plus
the reason.

### Configuración en Instagram (step by step in the app)

1. **Nuevo reel**: `+` → Reel → choose the `reel` MP4 (never the 4K master).
2. **Audio**: do not add music from Instagram: the reel brings its own voice and music.
   Optional: rename the original audio to "<tema> · ASOME".
3. **Portada**: "Editar portada" → "Agregar de la galería" → the `portada-reel` JPG. Check the
   profile-grid crop against `portada-feed`.
4. **Caption**: paste "Caption", then a blank line and the hashtags (first 5; more only if the
   app accepts them).
5. **Compartir en el feed / mostrar en la cuadrícula**: on, so the reel shows on the profile.
6. **Subtítulos**: the reel already has them burned in. Leave Instagram's automatic captions
   off so they do not appear twice. The SRT is for where a file can be uploaded (Facebook,
   YouTube, LinkedIn, Meta Business Suite when it offers it).
7. **Texto alternativo**: Configuración avanzada → Accesibilidad, paste "Texto alternativo"
   (if the app offers it for reels).
8. **Ubicación**: the city only when the reel is about it; never the client's place without
   permission.
9. **Etiquetas y colaboración**: tag or invite a collaborator (Colaboración) only with explicit
   permission. A client account is invited only if the client agreed to be named.
10. **Publicar**, then right away the **primer comentario**, and pin it (hold it → Fijar).

### Checklist antes de publicar

- [ ] The file is the 1080 × 1920 `reel` MP4, watched once with sound on the phone.
- [ ] Cover set from the gallery; the grid crop reads well.
- [ ] Caption pasted; the hook shows whole before "más".
- [ ] Hashtags pasted (first 5 at least) at the end of the caption.
- [ ] No Instagram music added; automatic captions off.
- [ ] Alt text, location and tags as above (no client named or tagged without permission).
- [ ] Handle and CTA match the end card; the WhatsApp link is in the bio.
- [ ] After publishing: first comment published and pinned; answer comments in the first hour.
- [ ] The package is in the reel's Drive folder and committed in `docs/<tema>/` of the videos repo.
