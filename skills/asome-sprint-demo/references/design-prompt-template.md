# Claude Design prompt — plantilla

Reemplazar cada `{{placeholder}}` y entregar el resultado **en un único bloque de código**, listo
para pegar, sin parafrasear. Incluir sólo las láminas que corresponden al tipo de sprint
(`references/deck-canon.md` §1), en ese orden, numeradas de corrido. Una lámina "si aplica" sin
contenido se omite entera: no se deja vacía ni con "N/A". Un dato no resuelto va como
`⟨PENDIENTE: …⟩` dentro del prompt — visible, nunca inventado.

---

```
Armá la Sprint Review de {{proyecto}} — Sprint {{n}} usando el template "Sprint Review ASOME" de
este proyecto. Si el template no está, construí el deck con el sistema visual de abajo.

REGLAS
- 16:9, español rioplatense con voseo, lenguaje de negocio: lo ve un cliente que no es técnico.
- Exactamente las láminas de abajo, en este orden. No agregues ni fusiones.
- Todo texto entre ⟨⟩ va tal cual, visible: es un dato pendiente, no lo completes vos.
- No agregues números que no estén acá. Nunca tareas, horas, story points, commits ni deploys.
- Título ≤ 60 caracteres, viñeta ≤ 90, ≤ 6 viñetas por tarjeta, ≤ 3 tarjetas por lámina. Si algo
  no entra, paginá (1/2, 2/2) con el mismo diseño; nunca achiques la letra.
- Texto editable, nada convertido a curvas ni a imagen: se presenta en Google Slides.

SISTEMA VISUAL (sólo si no usás el template)
Penn Blue #011F5B · Persian Blue #1C39BB · Cornflower Blue #6495ED · White Smoke #F5F5F5 · blanco y
negro. Títulos en Maax (en Google Slides, Inter), textos en Inter. Etiqueta en mayúsculas espaciadas
sobre cada título. Portada, próximo sprint y cierre en fondo oscuro con el isotipo de ASOME como
marca de agua. Estados siempre con texto: Hecho/Cumplido Persian Blue · En curso Cornflower Blue ·
Pendiente ámbar · Alerta/No cumplido rojo.

────────────────────────────────────────────────────────

LÁMINA {{i}} — PORTADA
Descriptor: {{descriptor_del_proyecto}}
Título: {{proyecto}} — Sprint Review {{n}}
Fechas: Sprint {{n}}{{ · nombre_del_hito}} · {{inicio_largo}} → {{fin_largo}}
Equipo ASOME: {{equipo: nombre — rol}}
Cliente: {{cliente}} — {{asistentes: nombre (rol en el proyecto)}}
Barra de avance: {{sprints con hitos marcados}} · actual: Sprint {{n}} · Próximo hito: {{hito}} · {{fecha}}
{{si aplica → Nuevo en el equipo: nombre — rol}}

LÁMINA {{i}} — OBJETIVO DEL SPRINT
"{{objetivo}}"

LÁMINA {{i}} — EL INDICADOR
{{por indicador (1 a 4), formato de números grandes:
  Nombre · Antes: valor (fuente, fecha) · Meta: valor · Ahora: valor medido | "se mide el <fecha>"
  Sin línea de base → en grande: "Línea de base pendiente: se mide el <fecha> con <persona>"}}

LÁMINA {{i}} — LO QUE NOS PEDISTE LA VEZ PASADA          [omitir si no hubo pedidos]
{{por pedido: qué — de quién — Hecho | En el próximo sprint | En backlog | Descartado (motivo)}}

LÁMINA {{i}} — DEMO EN VIVO · ENTORNO DE PRUEBA           [una lámina por flujo, máximo 3]
Flujo: {{nombre del recorrido}}
Resuelve: {{problema del mapa operativo, en palabras del cliente}}
Lo maneja: {{persona del cliente}} · Acompaña: {{persona de ASOME}}
Pasos: {{3 a 6 pasos numerados: acción — detalle opcional}}
{{si aplica → Aviso: "No vamos a mostrar <x>: <motivo>"}}
Pie: Respaldo en video: {{link | ⟨PENDIENTE: grabar el recorrido antes de la demo — responsable⟩}}

LÁMINA {{i}} — ¿CUMPLIMOS EL OBJETIVO?
Espejo visual de la lámina del objetivo.
Estado: {{Cumplido | Cumplido en parte | No cumplido}}
{{si no es Cumplido → "Falta <x> → pasa al sprint <n+1>"}}

LÁMINA {{i}} — ADEMÁS DE LO QUE VISTE                     [paginable]
{{tarjetas por épica o módulo: título de la tarjeta + viñetas de cambios para el usuario}}
{{si aplica → tarjeta "Diseño listo": para qué quedó diseñado}}
{{si aplica → tarjeta "Correcciones": qué fallaba → cómo quedó}}
Franja al pie — Queda en tus manos: versión {{versión}} · documentación {{link}} · video {{link}}

LÁMINA {{i}} — LO QUE SIGUE ABIERTO                       [omitir si no queda nada abierto]
Leyenda visible: En curso · Corrección pendiente · Depende de ustedes · Depende de terceros
{{por ítem: título — tipo — por qué sigue abierto — cuándo se cierra
  si el equipo lo confirmó → marca "Desvío de estimación · lo absorbe ASOME"}}

LÁMINA {{i}} — CONVERSEMOS
Preguntas para hoy:
{{2 o 3 preguntas concretas sobre lo que vieron}}
Y siempre: "¿Cambió algo en tu operación desde la última review?"

LÁMINA {{i}} — PEDIDOS NUEVOS Y LO QUE NECESITAMOS        [omitir si las dos columnas están vacías]
Pedidos: {{qué — de quién — Dentro del alcance | Fuera del alcance: se cotiza aparte}}
Lo que necesitamos de ustedes: {{qué (decisión, dato o acceso) — de quién — para cuándo}}

LÁMINA {{i}} — VALIDACIÓN
"¿Validamos lo que vimos hoy?" — Validado · Validado con observaciones · No validado
Valida: {{nombre y rol del decisor del cliente}}
Nota: "Tenés hasta el {{fecha_validacion}} ({{N}} días hábiles) para objeciones por escrito. Sin
objeciones, queda validado. Te mandamos el resumen por mail hoy."

LÁMINA {{i}} — PRÓXIMO SPRINT                             [fondo oscuro]
Etiqueta: PRÓXIMO SPRINT · SPRINT {{n+1}} · {{fechas}}
Título: {{objetivo del sprint siguiente}}
Compromiso: {{hasta 5 ítems: qué — para qué — chip de origen}}
Si llegamos: {{hasta 5 ítems, estilo más liviano}}
Pie: {{fechas intermedias, ej. "Demo parcial con <usuario> el <fecha>"}}

LÁMINA {{i}} — CIERRE                                     [fondo oscuro]
Próxima review: {{fecha y hora}}
Equipo: {{nombre — rol}} · hola@asomelab.com · asomelab.com
Pie: Resumen por mail hoy · validación hasta el {{fecha_validacion}}
```

---

## Láminas por tipo — insertar en el lugar que marca `deck-canon.md` §1

```
LÁMINA {{i}} — A QUIÉNES ESCUCHAMOS                       [s1-fundaciones]
{{roles entrevistados y cantidad de entrevistas}}

LÁMINA {{i}} — MAPA OPERATIVO                             [s1-fundaciones]
{{pasos del proceso · puntos de fricción · herramientas que se usan hoy}}

LÁMINA {{i}} — PROBLEMAS PRIORIZADOS                      [s1-fundaciones]
{{problema — a quién afecta — cuánto cuesta hoy — ¿lo resuelve el software? sí | en parte | no}}

LÁMINA {{i}} — LÍNEA DE BASE                              [s1-fundaciones, reemplaza EL INDICADOR]
Tabla: indicador — cómo se mide — valor hoy — meta — fecha de remedición — fuente
{{2 a 4 indicadores}}

LÁMINA {{i}} — QUÉ CORREGIMOS                             [cierre-de-hito, sn-cierre]
{{por flujo: qué fallaba → cómo quedó}}

LÁMINA {{i}} — ENTREGA DE ETAPA                           [cierre-de-hito, sn-cierre]
Checklist, cada ítem con fecha y quién lo recibió:
código en el repositorio de {{cliente}} · infraestructura a nombre de {{cliente}} · credenciales
entregadas · documentación técnica · guía o video de uso
{{sn-cierre → además: traspaso de cuenta y credenciales · arranque de la garantía (fecha)}}

LÁMINA {{i}} — ROADMAP                                    [cierre-de-hito, s1-fundaciones, sn-cierre]
{{sprints con fechas absolutas · hito cerrado ✓ · próximo hito y su entregable}}

LÁMINA {{i}} — PLAN DE MEDICIÓN A 90 DÍAS                 [sn-cierre]
{{por indicador: qué se mide — cómo — quién aporta el dato — fecha (milestone +90d)}}

LÁMINA {{i}} — QUÉ SIGUE: LA MEDICIÓN                     [sn-cierre, reemplaza PRÓXIMO SPRINT]
{{fecha de la medición comparativa · qué tiene que pasar hasta entonces · garantía}}
```

---

## Después de emitir el prompt

Fuera del bloque de código, listar los `⟨PENDIENTE⟩` que quedaron, con **quién los responde y para
cuándo** (siempre antes de la demo).
