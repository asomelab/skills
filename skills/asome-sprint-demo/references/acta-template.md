# Acta de la demo — plantilla

The DoD (sprint-canon §5, Nivel 2) requires a summary email **the same day** as the demo; it is
what opens the validation window. Two artifacts come out of mode `acta`: the email, and the
`## Acta` section appended to `docs/product/demos/sprint-NN-demo.md`. The next run of this skill
reads that section to build "Lo que nos pediste la vez pasada" — skip it and the next deck loses
its feedback loop.

---

## 1. Mail de resumen

```
Asunto: {{proyecto}} · Resumen de la demo del Sprint {{n}} · {{fecha_corta}}

Hola {{nombres}},

Gracias por el tiempo de hoy. Te dejo el resumen de la demo del Sprint {{n}}.

1. LO QUE VIMOS
{{flujos demostrados, uno por línea, en lenguaje de negocio}}
Además quedó listo: {{resto de lo entregado, resumido}}
Queda en tus manos: versión {{versión}} · {{link al entorno de prueba}} · documentación {{link}}

2. EL OBJETIVO DEL SPRINT
{{objetivo}} — {{Cumplido | Cumplido en parte: falta <x>, que pasa al sprint <n+1>}}

3. LO QUE SIGUE ABIERTO
{{ítem — por qué — cuándo se cierra}}

4. LO QUE NOS PEDISTE HOY
{{pedido — de quién — dentro del alcance (entra en el sprint <n>) | fuera del alcance (te mandamos
la cotización antes del <fecha>)}}

5. LO QUE NECESITAMOS DE USTEDES
{{qué — quién — para cuándo}}

6. VALIDACIÓN
{{Validado en la reunión | Validado con estas observaciones: <…> | Pendiente}}.
Tenés hasta el {{fecha_validacion}} ({{N}} días hábiles) para objeciones por escrito respondiendo
este mail. Sin objeciones en ese plazo, lo entregado en el Sprint {{n}} queda validado.

7. PRÓXIMO SPRINT
Sprint {{n+1}}: {{objetivo del siguiente}}. Próxima demo: {{fecha y hora}}.

Abrazo,
{{presentador}}
{{rol}} · ASOME
hola@asomelab.com
```

---

## 2. Sección `## Acta` del archivo de la demo

Append it; never overwrite an existing one (a re-run adds `## Acta (actualización YYYY-MM-DD)`).
Keep this exact shape: the next sprint's run parses `### Pedidos del cliente`.

```markdown
## Acta

Fecha: {{fecha}} · Asistentes: {{nombre (rol), …}} · Mail de resumen enviado: {{fecha}}

### Validación
{{Validado | Validado con observaciones | No validado | Pendiente}} · ventana hasta {{fecha_validacion}}
Observaciones: {{…}}

### Pedidos del cliente
- {{persona (rol)}}: {{pedido}} → {{dentro del alcance → #issue | fuera del alcance → cotizar}}

### Decisiones tomadas
- {{decisión}} — {{quién}} ({{si corresponde: registrar como D-NN en decisiones.md}})

### Lo que necesitamos de ellos
- {{qué}} — {{quién}} — {{fecha}}
```

---

## 3. Checklist antes de enviar

- [ ] Sale **hoy**. Sin mail no arranca la ventana de validación.
- [ ] Cada pedido está clasificado dentro / fuera del alcance. Los de afuera tienen fecha de
      cotización: el Código de Ética pide que todo lo que exceda lo pactado se cotice explícitamente.
- [ ] Los pedidos dentro del alcance tienen issue (`/asome-create-issue`) o fecha para crearlo.
- [ ] La fecha de validación es absoluta y descuenta feriados.
- [ ] Nada de horas, puntos, tareas ni jerga técnica en el cuerpo.
- [ ] Mismo día: `/asome-sprint close` (rollover, horas, retro).
