# DOBOT M1: entrega preparada para integracion

Este documento resume que queda preparado en la aplicacion para que el DOBOT M1 pueda conectarse cuando el robot fisico o la Raspberry Pi esten disponibles.

## Objetivo

La entrega no depende de tener el robot fisico operativo durante las practicas. El objetivo es dejar:

- la interfaz moderna del DOBOT M1 cargando correctamente;
- los botones y controles preparados para enviar comandos;
- un modo simulado local para validar la comunicacion;
- un punto claro donde sustituir el mock por el adaptador real.

## Estado actual

La actividad **Robot DOBOT M1** funciona en modo local/simulado. Cuando se inicia la actividad, ReNoLabs arranca el adaptador `Dobot` en modo mock por defecto.

Archivo principal:

```text
ReNoLabs/src/hardware/Dobot/Adapter.js
```

Mientras no se configure otra cosa, el adaptador no intenta hablar con hardware real. Recibe los comandos de la interfaz, los registra en logs y devuelve estado simulado para que la vista no se rompa.

## Como activar modo real

Cuando exista Raspberry Pi o robot fisico, arrancar ReNoLabs con:

```powershell
DOBOT_MODE=real
```

En modo real, el adaptador vuelve al camino de comunicacion con el controlador Python/ZMQ. Ahi sera necesario ajustar:

- IP o ruta de la Raspberry;
- comando de arranque del controlador;
- permisos del proceso;
- SDK/libreria oficial del DOBOT M1;
- limites y seguridad fisica.

## Contrato de comandos

La vista DOBOT M1 envia comandos mediante la variable `action`. El primer numero identifica la accion.

| Accion | Codigo | Argumentos | Uso esperado |
|---|---:|---|---|
| HOME | 1 | ninguno | llevar robot a posicion inicial |
| POSITION | 2 | ninguno | pedir posicion actual |
| SPEED | 3 | ninguno | pedir velocidad actual |
| SPEED_JOG | 4 | `[velocidad, aceleracion]` | configurar velocidad de movimiento incremental |
| SPEED_PTP | 5 | `[velocidad, aceleracion]` | configurar velocidad punto a punto |
| MOVE_ANGLE | 6 | `[angulo, articulacion]` | mover una articulacion |
| MOVE_POINT_ANGLE | 7 | `[j1, j2, j3, j4, modo]` | mover a posicion articular |
| MOVE_POINT_XYZ | 8 | `[x, y, z, r, modo]` | mover a posicion cartesiana |
| INCREASE_ANGLE | 9 | `[j1, j2, j3, j4]` | incremento articular |
| INCREASE_XYZ | 10 | `[x, y, z, r, modo]` | incremento cartesiano |
| WAIT | 11 | `[ms]` | esperar |
| MOVE_JOINT | 12 | `[joint]` | movimiento incremental por articulacion |
| MOVE_COORDINATE | 13 | `[axis]` | movimiento incremental por coordenada |
| GRIP | 14 | `[enable, open_close]` | controlar efector final |
| STOP | 15 | ninguno | parada normal |
| ABORT | 16 | ninguno | parada inmediata |
| GET_EIO | 17 | `[address, value]` | leer E/S |
| SET_EIO | 18 | `[address, value]` | escribir E/S |

## Validacion sin robot fisico

Para validar la aplicacion antes de conectar hardware:

1. Levantar Docker.
2. Abrir:

```text
http://localhost:8082/vr-isa/
```

3. Iniciar sesion con `admin / admin`.
4. Entrar en **Robot DOBOT M1**.
5. Pulsar controles como `X+`, `Y+`, `Z+`, `MOVL`, `Encender`, `Cerrar`.
6. Revisar logs:

```powershell
docker logs docker-vrlabs_node-1
```

Debe aparecer algo similar a:

```text
Dobot mock command received: action=[13,1]
```

Eso confirma que la interfaz esta enviando comandos y que ReNoLabs los recibe. Lo que queda pendiente para el futuro es comprobar el movimiento fisico real.

## Validacion ya realizada

El 12/06/2026 se valido desde API que la actividad **Robot DOBOT M1** arranca el adaptador mock:

```text
Dobot Adapter: Starting local mock controller for DOBOT M1 integration validation...
Dobot mock command received: config=2
```

Tambien se valido directamente el adapter mock con comandos equivalentes a botones:

```text
action=[13,1]
action=[14,1,0]
```

El mock recibio los comandos y devolvio estado simulado. La validacion fisica queda pendiente por falta de robot/Raspberry.

## Pendiente con hardware real

- Confirmar conexion Raspberry Pi/DOBOT M1.
- Sustituir o completar el bloque real del adapter `Dobot`.
- Mapear codigos a llamadas del SDK oficial.
- Verificar limites de X/Y/Z/R y articulaciones.
- Probar parada, home y efector final con seguridad.
