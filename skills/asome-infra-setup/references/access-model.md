# El modelo de acceso — tres perfiles, verificados el día 1

> Regla: *todo desarrollador tiene, antes de que se le asigne el primer issue, el acceso que ese
> issue requiere — y el acceso se verifica **ejecutándolo**, no declarándolo.* Un ticket de acceso
> abierto el día que hace falta es tiempo perdido que un comando de dos segundos evitaba.

## Tres perfiles

Tres perfiles fijos, para que pedir acceso sea una línea y no una negociación caso por caso:

| Perfil | Quién | Puede | No puede |
|---|---|---|---|
| `asome-dev` | dev de producto | dev: Cognito (crear/confirmar usuarios de prueba), S3 del proyecto, CloudWatch Logs, invocar Lambda / ECS exec, leer Secrets de dev | staging/prod, IAM, billing, estado de Terraform |
| `asome-infra` | quien corre Terraform | apply en dev, plan en staging/prod, backend de estado, IAM del proyecto | billing, borrar el bucket de estado |
| `asome-readonly` | cliente, auditoría | `ReadOnlyAccess` | todo lo demás |

**`asome-readonly` no es un perfil de trabajo.** Un dev con sólo lectura no puede cerrar ningún
issue que toque la nube. Asignárselo no es prudencia: es garantizar días perdidos. El caso típico —
un dev con AWS de sólo lectura y un issue de "autenticate contra el Cognito de dev" produce cero
mientras dura el ticket de acceso, y nadie lo nota hasta que el sprint ya está encima.

## Verificación del día 1

El dev corre el bloque de su perfil y pega el output antes de que se le asigne el primer issue que
toque la nube. Un `AccessDenied` en cualquiera de estos comandos es un bloqueo que se resuelve
**antes** de asignar el issue, no una molestia a tolerar:

**`asome-dev`:**
```bash
aws sts get-caller-identity
aws cognito-idp list-user-pools --max-results 5
aws cognito-idp admin-get-user --user-pool-id <id> --username <usuario semilla>
aws logs describe-log-groups --limit 1
aws s3 ls s3://<bucket-del-proyecto>
```

**`asome-infra`:** todo lo de arriba, más:
```bash
terraform plan
```

**`asome-readonly`:**
```bash
aws sts get-caller-identity
```
(si esto es lo único que corre y el perfil es `asome-readonly`, no es un dev activo en el proyecto —
ver la regla de arriba).

## Registro — `docs/ACCESOS.md`

Columnas: persona, perfil, cuenta, alta, quién verificó, última verificación.

**Perfiles y roles, nunca credenciales ni ARNs de usuario ni IDs de cuenta.** Este archivo puede
terminar en manos del cliente al traspaso (SN) — es un requisito de protección de datos, no sólo
prolijidad. Un acceso sin dueño y sin fecha de verificación se descubre roto el día que hace falta.

## Cómo se pide

El acceso se pide **por nombre de perfil** (`asome-dev`, `asome-infra`, `asome-readonly`), nunca
describiendo permisos sueltos — describirlos produce un perfil distinto por persona, que es
exactamente el problema que estos tres perfiles fijos evitan.

## Traspaso

En SN (el sprint de cierre), los perfiles se recrean a nombre del cliente y los de ASOME se revocan
con fecha — mismo código de ética ya citado en `asome-sprint/references/sprint-canon.md` §1: la
cuenta y el repositorio son del cliente desde el arranque, no sólo al final.
