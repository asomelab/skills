# Prompt: Instagram copy panel (Fase 3, in parallel with the scenes)

Three writers draft from different angles, then one editor scores, picks and polishes. It needs
only the approved script and the platform truth table, so launch it as soon as Fase 2 returns.
The editor's answer is saved as `<proyecto>/copy.md`; `render-producto.sh` ships it.

## CONTEXT block

```text
You write Instagram copy for ASOME, a Software Factory from Argentina: operational consultancy
plus custom software, whose promise is "escalar la facturación de empresas sin aumentar
proporcionalmente su estructura".
The reel ({N} s, voiceover) presents {Producto}, {tipo de producto} that ASOME BUILT FOR A CLIENT
(it is the client's product, not ASOME's). It sells both sides: {rol A} ({lo que dice el guion})
and {rol B} ({lo que dice el guion}). Closing line: "{línea de cierre del guion}".
Read: {proyecto}/guion.txt (exact voiceover), {proyecto}/brief.md, and this product truth table:
{tabla de verdad de plataformas de Fase 2}.
Hard rules: Spanish rioplatense with voseo, like the voiceover. No invented metrics, results,
testimonials or client names ({"el cliente no se nombra" | "se puede nombrar a {cliente}"}).
{Producto} is the client's product; ASOME built it. Every claim must be backed by the guion or
the truth table: if the app does not do something automatically, do not say it does. 0–3 emoji
at most (prefer none), no hype clichés ("revolucionario", "game changer"), no AI filler. CTA
consistent with the reel: escribinos por WhatsApp / mensaje directo. Hashtags: 8–15, Spanish
first, niche ({rubro del cliente}) plus business/software (software a medida, SaaS,
transformación digital), no banned or spammy tags.
Deliver: (1) caption: a hook that works in the first 125 characters (before "más"), then a
short, scannable body, then the CTA; 600–1200 characters; (2) hashtags; (3) first comment, 1–2
lines (a good place for "las pantallas son de {Producto}, con datos de ejemplo"); (4) cover
check: the cover says "{texto de la portada}": does it fit the caption?; (5) alt text, 1–2
sentences describing the video. Give the 125-character preview count.
```

## Drafts (three agents in parallel: CONTEXT + one angle)

- **caso**: case study / proof of capability. Lead with what was built and why it matters to a
  business owner who might hire ASOME.
- **{rol B}**: emotional, end-user-first hook (the script's hook line), then the business side
  and ASOME as the builder.
- **{rol A}**: business pain-first hook (the manual work the product removes: planillas,
  WhatsApp, cobrar a mano, no saber qué pasa), then the platform, then the "escalar sin agrandar
  la estructura" promise. This angle usually wins: the buyer is the business owner.

## Editor

```text
{CONTEXT}

You are the EDITOR. Three copywriters drafted captions from different angles:
{borradores}

Score each (hook strength in the 125-char preview, clarity for a scroller, fidelity to the
reel, honesty, ASOME voice, CTA), pick the winner and polish it, grafting the best lines of the
others. Verify every factual claim against the guion and the truth table; remove anything not
supported. Count characters.
Return the FINAL package as clean Markdown ready to paste, in Spanish, with exactly these
sections: "## Caption" (ready to paste, hashtags NOT included), "## Hashtags" (one line),
"## Primer comentario", "## Texto alternativo", "## Notas" (preview character count, why this
angle won, one alternative hook line, what to confirm before publishing). Nothing outside them.
```
