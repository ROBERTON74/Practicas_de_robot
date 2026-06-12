# Continuar en casa: DOBOT M1

Este documento deja apuntado el estado exacto del trabajo para poder retomarlo despues.

## Objetivo actual

Como probablemente el robot fisico o el repuesto no lleguen antes de terminar las practicas, el objetivo es entregar una aplicacion preparada para integracion:

- interfaz moderna del DOBOT M1 lista;
- botones y controles preparados para enviar comandos;
- modo mock/simulacion para validar comunicacion sin hardware;
- documentacion clara para que los profesores conecten la Raspberry/robot cuando este disponible.

## Estado dejado hoy

Se ha preparado el DOBOT M1 para funcionar en modo simulado local.

Cuando se inicia la actividad **Robot DOBOT M1**, ReNoLabs arranca un mock del controlador DOBOT en lugar de intentar lanzar el controlador real con `sudo python3`.

Esto evita el error anterior:

```text
Error: spawn sudo ENOENT
```

Tambien se ha protegido la vista para que, si un boton se pulsa sin socket activo, no rompa la pagina con:

```text
Cannot read properties of undefined (reading 'emit')
```

## Validacion realizada el 12/06/2026

Se comprobo que Docker estaba levantado y que todos los contenedores principales estaban activos:

- `proyectorobot_universitario-vrisa-1`
- `proyectorobot_universitario-backend-1`
- `proyectorobot_universitario-rip-server-1`
- `docker-vrlabs_node-1`
- `docker-vrlabs_db-1`
- `proyectorobot_universitario-db-1`

Tambien se comprobo que la actividad **Robot DOBOT M1** estaba en estado `idle`.

Se inicio la actividad por API y ReNoLabs arranco el mock correctamente. En logs aparecio:

```text
Dobot Adapter: Starting local mock controller for DOBOT M1 integration validation...
Dobot mock command received: config=2
```

Ademas se hizo una prueba directa del adapter mock enviando comandos equivalentes a botones:

```text
action=[13,1]
action=[14,1,0]
```

El mock acepto los comandos y devolvio estado simulado (`signals.get` con `evolution`).

Queda pendiente una prueba manual desde navegador pulsando botones en la interfaz para confirmar visualmente que ya no aparece el mensaje rojo de JavaScript.

## Archivos importantes modificados

### Adapter mock DOBOT

```text
ReNoLabs/src/hardware/Dobot/Adapter.js
```

Aqui esta el modo mock. Por defecto se usa mock. Solo intenta modo real si se arranca ReNoLabs con:

```text
DOBOT_MODE=real
```

En modo mock, los comandos se registran en logs:

```text
Dobot mock command received: action=[13,1]
```

### Vista DOBOT M1

```text
dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml
```

Aqui se ha protegido `lab.send(...)` para que no falle si no hay `socket` activo.

Tambien se sincronizaron las copias activas importadas en:

```text
ReNoLabs/public/views/b7d5517b-aca9-4f05-b7b3-59e0e98355ec/DOBOTM1_LaboratorioRemoto_Simulation.xhtml
ReNoLabs/public/views/6a8f4d06-4d65-462d-b321-a79a8e12878c/DOBOTM1_LaboratorioRemoto_Simulation.xhtml
```

### ZIP de importacion

```text
ReNoLabs/fixtures/View_DOBOTM1.zip
```

Se regenero para que, si se reimporta la vista DOBOT M1, incluya la proteccion nueva.

### Documentacion de entrega

```text
documentacion/dobot_m1_entrega_integracion.md
```

Explica el contrato de comandos, como validar sin robot fisico y que queda pendiente para Raspberry/robot real.

## Cambios relacionados con frontend local

Tambien se corrigio el frontend para no depender de la IP remota `147.96.71.236`.

Archivos:

```text
vrisa/src/main.js
vrisa/src/components/RemoteLab.vue
vrisa/nginx.conf
vrisa/Dockerfile
```

Ahora el frontend usa `/api` y Nginx hace proxy a ReNoLabs local. Esto evita muchos `Failed to fetch` cuando se trabaja en local.

## Como arrancar en casa

Abrir PowerShell en la carpeta del proyecto:

```powershell
cd "C:\Users\rober\Desktop\Pracicas WEBS\Proyecto Robot_Universitario"
```

Arrancar Docker Desktop si no esta abierto.

Levantar el stack principal:

```powershell
docker compose up -d
```

Si ReNoLabs no esta levantado, entrar en su carpeta Docker y levantarlo:

```powershell
cd ReNoLabs\docker
docker compose up -d
cd ..\..
```

Abrir:

```text
http://localhost:8082/vr-isa/
```

Credenciales:

```text
admin / admin
```

## Como validar el mock

1. Entrar en la web.
2. Iniciar sesion.
3. Entrar en **Robot DOBOT M1**.
4. Pulsar botones como `X+`, `Y+`, `Z+`, `Encender`, `Cerrar`.
5. Revisar logs de ReNoLabs:

```powershell
docker logs docker-vrlabs_node-1
```

Debe aparecer algo parecido a:

```text
Dobot Adapter: Starting local mock controller for DOBOT M1 integration validation...
Dobot mock command received: action=[13,1]
```

Eso significa que la interfaz esta enviando comandos y que ReNoLabs los recibe.

## Si la actividad queda ocupada

Si aparece como ocupada o no deja entrar, reiniciar ReNoLabs:

```powershell
docker restart docker-vrlabs_node-1
```

Si aun asi queda en `busy`, ponerla en `idle`:

```powershell
docker exec docker-vrlabs_node-1 node -e "const m=require('/home/node/app/src/models'); m.sequelize.authenticate().then(()=>m.Activity.update({state:'idle'},{where:{name:'Robot DOBOT M1'}})).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})"
```

## Pendiente para terminar

- Probar manualmente desde navegador que los botones ya no muestran el error rojo.
- Confirmar desde navegador que cada boton genera un log de comando mock.
- Si hace falta, mejorar el texto de la documentacion final para profesores.
- Preparar una seccion final de memoria: "Trabajo realizado", "Limitaciones por falta de hardware" y "Pasos para integracion futura".
- Cuando haya Raspberry/robot real, arrancar ReNoLabs con `DOBOT_MODE=real` y completar el adapter real.

## Nota importante para la entrega

La frase correcta para explicar el estado es:

```text
La aplicacion queda preparada y validada contra un controlador simulado. La validacion fisica queda pendiente porque el robot/Raspberry no estuvo disponible durante las practicas.
```
