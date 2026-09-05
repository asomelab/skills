# Acta de kick-off — plantilla

Se envía **el mismo día**, por el canal oficial, con el deck adjunto. Sin acta, lo acordado
no existe cuando aparezca la primera discusión de scope.

Regla de cierre: el acta repite la regla de validación. Si nadie objeta por escrito en el
plazo acordado, lo que dice el acta es lo acordado.

---

```
Asunto: Acta de kick-off — {{proyecto}} · {{fecha_corta}}

Hola {{nombres}},

Gracias por el tiempo de hoy. Resumen de lo acordado en el kick-off de {{proyecto}}.

1. QUÉ CONSTRUIMOS
{{alcance_in_resumido}}

Queda fuera de este alcance: {{alcance_out_resumido}}.
Todo lo que no esté en la lista de arriba entra por la regla de cambios del punto 4.

2. CUÁNDO
{{hitos_con_fecha_y_entregable}}
Entrega objetivo: {{fecha_final}}.
Primera demo: {{fecha_primera_demo}}.

3. CÓMO TRABAJAMOS
Sprints de {{duracion_sprint}}. Cada sprint cierra con demostración en vivo sobre el
entorno de prueba. Desde la demo, {{cliente}} tiene {{dias_validacion}} días hábiles para
documentar objeciones por escrito; sin objeciones en ese plazo el entregable queda validado.

4. REGLAS ACORDADAS
- Decisor único: {{decisor}}. Es quien aprueba entregables.
- Cambios de scope: {{regla_cambios_scope}}.
- Las decisiones se confirman por escrito en {{canal_oficial}}.
- Horario del equipo: {{horario_laboral}} ({{zona_horaria}}). Urgencias: {{definicion_de_urgencia}}.

5. CANALES
{{tabla_canales_en_texto: canal — para qué — quién responde — tiempo de respuesta}}

6. LO QUE NECESITAMOS DE USTEDES
{{tabla_accesos_en_texto: ítem — responsable — deadline}}
Bloqueantes del arranque: {{items_bloqueantes}}.

7. PRÓXIMOS PASOS
{{tabla_proximos_pasos_en_texto: acción — responsable — deadline}}

8. RIESGOS QUE YA IDENTIFICAMOS
{{riesgos_con_mitigacion_en_texto}}

9. PENDIENTES DE ESTA REUNIÓN
{{lista_de_pendientes_con_responsable_y_fecha}}

Si algo de lo anterior no refleja lo conversado, respondé este mail antes del
{{fecha_limite_objeciones}}. Si no hay observaciones en ese plazo, tomamos esta acta como
la base acordada del proyecto.

Abrazo,
{{presentador}}
{{rol_presentador}} · ASOME
{{mail_asome}}
```

---

## Checklist antes de enviar

- [ ] Toda fila de compromiso tiene **nombre propio y fecha**, sin "el equipo" ni "la semana que viene"
- [ ] El alcance OUT está escrito, no implícito
- [ ] La regla de validación y su plazo están en el cuerpo, no sólo en el deck
- [ ] Los bloqueantes del primer sprint están marcados como tales
- [ ] Los pendientes de la reunión tienen dueño — si nadie los toma, no se cierran
- [ ] Deck adjunto y evento de la primera demo ya en el calendario de todos
