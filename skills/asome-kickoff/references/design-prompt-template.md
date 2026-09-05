# Claude Design prompt — plantilla

Reemplazar cada `{{placeholder}}` y entregar el resultado al usuario **en un único bloque
de código**, sin parafrasear ni resumir. Los 15 slides van siempre detallados, siempre en
el mismo orden. Un slot que no se pudo resolver se deja como `⟨PENDIENTE: …⟩` dentro del
prompt — visible, nunca inventado.

---

```
Necesito un deck de kick-off de proyecto, formato 16:9, en español rioplatense (voseo).

CONTEXTO
Cliente: {{cliente}}
Proyecto: {{proyecto}} — {{etapa_o_alcance}}
Tipo de kick-off: {{variante: desarrollo | discovery/evaluación | diseño}}
Fecha de la reunión: {{fecha_larga}} · {{duracion}} · {{modalidad}}
Presenta: {{presentador}}, {{rol_presentador}} · ASOME

IDENTIDAD VISUAL
{{paleta: marca del cliente (colores/logo/tipografía) — o, si no hay material:
"fondo oscuro neutro con un único color de acento; sin degradados decorativos"}}

REGLAS DE FORMATO — aplican a las 15 slides, sin excepción
- Exactamente 15 slides, en el orden de abajo. No agregues, no reordenes, no fusiones.
- Cada slide de contenido abre con un eyebrow en mayúsculas con letter-spacing amplio:
  "B L O Q U E  N N  ·  N O M B R E".
- Título de una línea, tipografía grande, sin punto final.
- Máximo 6 filas o 6 bullets por slide. Cero párrafos corridos.
- Tablas con header en mayúsculas chicas. Fechas siempre absolutas.
- Símbolos: ✓ incluido · ✕ excluido · → derivado a fase futura.
- Todo texto entre ⟨⟩ va tal cual, visible: es un dato pendiente, no lo completes vos.

────────────────────────────────────────────────────────

SLIDE 1 — PORTADA
Título: {{proyecto}}
Subtítulo: {{etapa_o_alcance}}
Claim: {{claim_del_producto}}
Pie: KICK-OFF · {{fecha_larga}} · {{duracion}} · {{modalidad}}
Presenta: {{presentador}} — {{rol_presentador}}, ASOME

SLIDE 2 — BLOQUE 01 · AGENDA
Lista con minutos por bloque (la suma da {{duracion}}):
{{agenda_con_minutos}}

SLIDE 3 — BLOQUE 02 · ONE-TEAM
Un solo organigrama con cliente y ASOME mezclados — NO dos grupos separados.
Personas: {{lista_personas: nombre — rol — lado}}
Marcá visualmente al decisor único: {{decisor}}
Columna lateral "Perfiles OnDemand": {{perfiles_ondemand}}

SLIDE 4 — BLOQUE 03 · PROPÓSITO
Pregunta 1 — "¿Por qué estamos haciendo esto?": {{problema_en_palabras_del_cliente}}
Pregunta 2 — "¿Qué busca lograr?": {{objetivos_de_negocio (4 a 6 bullets)}}

SLIDE 5 — BLOQUE 04 · ALCANCE
Dos columnas, las dos obligatorias.
✓ IN SCOPE: {{items_in_scope}}
✕ FUERA DEL SCOPE: {{items_out_of_scope (mínimo 3, con → fase futura donde aplique)}}

SLIDE 6 — BLOQUE 05 · ROADMAP E HITOS
Timeline horizontal con fechas absolutas.
Sprints/etapas: {{sprints_con_fechas_y_foco}}
Hitos y su entregable: {{hitos_con_entregable}}
Fecha de entrega/lanzamiento, destacada: {{fecha_final}}

SLIDE 7 — BLOQUE 06 · MODALIDAD DE TRABAJO — EL CICLO DEL SPRINT
Duración fija del sprint, arriba: {{duracion_sprint}}
Cuatro pasos numerados:
01 Planning — definición de historias para los próximos {{duracion_sprint}}
02 Build — desarrollo, diseño e integración continua en staging
03 Demo — demostración en vivo, staging accesible. No un entregable estático
04 Validación — {{dias_validacion}} días hábiles. Sin objeciones escritas = aceptado

SLIDE 8 — BLOQUE 06 · DEFINITION OF DONE
Tres columnas:
Por historia de usuario: criterios de aceptación verificados · tests verdes · staging
  accesible · code review aprobado
Por sprint: demo en vivo · staging funcional post-demo · email de resumen · ventana de
  validación de {{dias_validacion}} días hábiles
Por hito: {{qa_por_hito}} · accesos entregados · validación escrita del cliente · deploy
  a producción

SLIDE 9 — BLOQUE 07 · REGLAS DEL JUEGO
Tabla de 4 filas — Regla / Enunciado:
Quién decide | {{decisor}} es el único que aprueba entregables
Cambios de scope | {{regla_cambios_scope}}
Silencio | sin objeciones escritas en {{dias_validacion}} días hábiles, queda aceptado
Urgencias | {{definicion_de_urgencia}} — el resto espera al horario laboral

SLIDE 10 — BLOQUE 08 · CANALES Y RITMO
Tabla de 4 columnas — Canal / Para qué / Quién responde / Tiempo de respuesta:
{{tabla_canales}}
Debajo: reuniones fijas — {{reuniones_fijas_con_dia_y_hora}}
Horario laboral del equipo: {{horario_laboral}} ({{zona_horaria}})
Línea destacada al pie: "Las decisiones se confirman por escrito en {{canal_oficial}}."

SLIDE 11 — BLOQUE 09 · RIESGOS Y MITIGACIÓN
{{n_riesgos}} riesgos en tarjetas. Cada tarjeta: ícono, título, una o dos líneas de por
qué puede pasar, y una línea "🔧 Mitigación: …" con acción concreta.
{{riesgos_con_mitigacion}}

SLIDE 12 — BLOQUE 10 · ACCESOS E INSUMOS
Deadline general en el encabezado: {{deadline_general}}
Tabla de 4 columnas — Acceso o insumo / Para qué / Responsable / Deadline:
{{tabla_accesos}}
Línea destacada al pie con los bloqueantes: {{items_bloqueantes}}

SLIDE 13 — BLOQUE 11 · PRÓXIMOS PASOS
Tabla de 3 columnas — Acción / Responsable / Deadline:
{{tabla_proximos_pasos}}
Incluir siempre la fila: "Enviar el acta del kick-off | {{presentador}} | Hoy"
Incluir siempre la fila de la primera demo: {{fecha_primera_demo}}

SLIDE 14 — BLOQUE 12 · CONTACTOS
Tres contactos, con nombre, rol, teléfono y mail:
Técnico: {{contacto_tecnico}}
Comercial: {{contacto_comercial}}
Facturación: {{contacto_facturacion}}

SLIDE 15 — CIERRE
Frase de cierre: {{frase_de_cierre}}
Claim del proyecto: {{claim_del_producto}}
Contacto ASOME: {{mail_asome}} · asomelab.com
Destacado: Primera demo — {{fecha_primera_demo}}
Pie chico: {{proyecto}} · Kick-off {{fecha_corta}}
```

---

## Después de emitir el prompt

Fuera del bloque de código, listar los `⟨PENDIENTE⟩` que quedaron, con **quién los
responde y para cuándo**. Esos son los huecos a cerrar antes de la reunión, no después.
