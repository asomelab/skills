# El estándar de auth / roles / permisos / tenancy

> Norma que `SKILL.md` Step 15 cita para auditar (nunca para construir sola). Complementa
> `asome-sprint/references/sprint-canon.md` — el *cuándo* de estas piezas vive ahí (§2, §10.1); el
> *qué exactamente* vive acá.

---

## Qué entrega S1, y dónde se corta

S1 entrega login, registro, recuperación de clave, alta de usuarios y **estructura** de roles,
desplegado en producción del cliente. La forma completa de S1 — los tres entregables por carril,
la nomenclatura frente al cliente — está en `asome-sprint/references/sprint-canon.md` §2; no se
duplica acá.

S1 **no** entrega la matriz de permisos por acción — se prueba en S2 contra la primera entidad y
cierra con la segunda (`asome-sprint` canon §10.1). Prometer el módulo de permisos cerrado en S1
obliga a reabrirlo entero cuando aparece la primera entidad real: sin una entidad contra la que
probarlo, cualquier matriz de permisos es una hipótesis, no un mecanismo verificado.

---

## El modelo: rol → permiso → acción, con un único punto de evaluación

Rol → permiso → acción sobre recurso, con **un único punto de evaluación** que recibe `(actor,
acción, recurso)` y responde sí/no, más una tabla de permisos legible sin leer código — **nunca**
`if (user.role === 'admin')` repartido por el código.

Si un permiso no se puede contestar consultando datos, es lógica repartida y no se puede auditar.
Un punto único de evaluación es lo que hace posible probar los cuatro invariantes de abajo con una
prueba, en vez de con una revisión manual de cada endpoint.

---

## Tenancy

La columna de tenant entra en la **primera migración**, filtro obligatorio a nivel
repositorio/ORM, nunca por disciplina de quien escribe la query. Un filtro que depende de que
cada desarrollador se acuerde de agregarlo es un filtro que eventualmente falta en un endpoint,
y en producción eso es un tenant leyendo datos de otro.

---

## Auditoría

Quién, qué, cuándo, sobre qué recurso, valor anterior y nuevo, instrumentada en el **mismo punto
único de evaluación** que resuelve permisos — nace con la primera entidad, no se agrega después.
Igual que la matriz de permisos, un mecanismo de auditoría diseñado en abstracto y aplicado
después tiende a tener huecos exactamente donde nadie miró.

---

## Prueba de aceptación verificable

Sin esta prueba, el transversal **no está hecho** — es una promesa con forma de feature:

- Dos usuarios de dos tenants distintos, tres roles.
- El usuario de menor rol recibe **403** en la acción prohibida.
- El usuario de menor rol **no ve el recurso del otro tenant** en el listado.
- El evento de auditoría queda registrado.

Los cuatro invariantes que `SKILL.md` Step 15 audita son exactamente estos cuatro puntos: punto
único de evaluación · tenant filtrado desde la primera migración · auditoría en el mismo punto ·
esta prueba pasando.

---

## Lo que no se promete salvo que el contrato lo nombre explícitamente

SSO, 2FA, permisos por campo, delegación temporal → se listan bajo `scope:out`
(`asome-sprint/references/sprint-canon.md` §11.1) hasta que el contrato los nombre. Prometerlos
por default es exactamente el tipo de alcance no pactado que §11 existe para evitar.
