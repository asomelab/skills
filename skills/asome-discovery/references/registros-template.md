# Registers — `decisiones.md` and `mediciones-pendientes.md`

Both files share one architecture: purpose blockquote → resolved bucket → open bucket →
`## Cómo se usa este archivo` lifecycle rule that **forbids deletion**. An entry moves from
open to resolved by growing a value/date, never by being erased — the open register is the
project's honesty ledger, and a gap that silently disappears is worse than one left open.

Standardize the filename on `decisiones.md` — `asome-crm`'s `decisiones-abiertas.md` is
legacy naming, don't reproduce it in new work.

---

## `decisiones.md`

```markdown
# Decisiones

> Las decisiones de producto viven acá, con fecha y estado. Las que se toman en una
> conversación y no se escriben, se vuelven a discutir en tres semanas.
> Las decisiones **técnicas** de implementación (stack, despliegue, esquemas) se documentan
> en SDD cuando arranque la construcción. Acá sólo se registra el marco que las condiciona.

## Tomadas

| # | Decisión | Qué se decidió | Por qué | Fecha |
|---|---|---|---|---|
| D-01 | <Tema> | <qué se decidió, en 1-2 oraciones> | <por qué> | YYYY-MM-DD |

## Abiertas

### D-NN · ¿<la decisión, formulada como pregunta>?

**Por qué importa.** <qué depende de esto, qué se gana o pierde por cada lado>
**Recomendación:** <lo que se sugiere — nunca se adopta en silencio>
**Estado:** abierta. **Bloquea:** <épica/HU/fase que no puede avanzar sin esto, o "nada">

## Cómo se usa este archivo

Una decisión pasa de **abierta** a **tomada** cuando alguien escribe qué se decidió y por
qué. No se borran las abiertas: se mueven a la tabla de arriba con su fecha.
```

ID format `D-NN`, zero-padded two digits, never reused. Dates ISO `YYYY-MM-DD`. An amended
decision keeps its `D-NN` and appends `(enmendada)` to the Fecha cell rather than opening a
new row.

---

## `mediciones-pendientes.md`

The gap/assumption register. Exists in `asome-clarity` and `lannis-clone`; absent in
`asome-crm` (its absence there is a gap in the convention, not a deliberate choice — always
create it for new work regardless of which HU-era repo you're extending).

```markdown
# Mediciones pendientes

> <Adaptar según el modo de evidencia del proyecto — dos variantes observadas:>
> — Discovery propio: "ASOME no tiene línea de base. Toda cifra sin medir va etiquetada
>   `(estimado, sin medir — M-NN)` y tiene su entrada acá."
> — Reverse-engineering: "En vez de registrar qué falta medir de nuestra propia operación,
>   registra qué supuestos sobre el funcionamiento real de <competidor> se tomaron de la
>   observación y no de una fuente confirmada. Ningún número o regla listado acá debería
>   copiarse a una HU como si fuera un hecho verificado."

---

## Confirmadas por API/UI en vivo (no son supuestos)

<Lo que SÍ se leyó de una fuente confirmada y no lleva etiqueta de supuesto en el resto de
la documentación — nómbralo explícitamente, con su referencia a investigacion/*.md §N.>

---

## Pendientes

### M-NN · <título del supuesto o de la medición pendiente>

**Qué se supuso.** <el valor o regla asumida>
**Por qué es un supuesto.** <por qué no está confirmado — fuente débil, muestra de 1, sin
metodología publicada, etc.>
**Qué afirmación sostiene.** <qué doc/HU/principio depende de este número — el radio de
impacto si resulta falso>
**Qué cambia si es falso.** <la consecuencia concreta>

---

## Cómo se usa este archivo

Un ítem pasa de **pendiente** a **confirmado** cuando se verifica contra una fuente primaria.
No se borran los pendientes al confirmarse: se mueven a la sección de "Confirmadas" de arriba
con la fuente que lo confirmó.
```

ID format `M-NN`, zero-padded two digits. The inline citation tag used everywhere else in the
doc set is always backticked and always carries the ID:
`` `(observado en <fuente> — M-NN)` `` or `` `(estimado, sin medir — M-NN)` ``. **A number
cited without this tag and without an `M-NN` is a defect in the document** — this is the
single rule that makes the whole gap policy enforceable; state it explicitly in
`docs/product/README.md` §Convenciones (see `doc-set-template.md`).

Two extra conventions worth reusing when the omitted field matters:
- `00-vision.md` §6 keeps a second, forward-looking gap table (`| # | Qué hay que
  confirmar | Cómo |`) keyed by the same `M-NN` IDs — **keep it in sync with
  `mediciones-pendientes.md` by hand**; this drifted in `lannis-clone` (its §6 cites `M-02`/
  `M-03` swapped against the register) and is exactly the kind of defect `auditar` mode should
  catch.
- A doc whose figures are entirely borrowed gets a disclaimer blockquote near the top, e.g.:
  `> Ninguna cifra de este documento es una medición propia todavía — todas están tomadas de
  lo observado en <competidor> y etiquetadas como tal.`
