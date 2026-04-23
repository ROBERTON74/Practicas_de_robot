# 08 - Programacion Python

## Que es

Un editor de codigo Python integrado dentro de la propia web que permite programar secuencias de movimientos del robot. El usuario escribe un script, pulsa Ejecutar, y el robot realiza los movimientos uno por uno de forma automatica.

Todo lo anterior (control por teclado, sesiones, MySQL, simulador 3D) sigue funcionando exactamente igual.

## Como funciona por dentro

1. El usuario escribe codigo Python en el editor de la web.
2. Al pulsar Ejecutar, el frontend envia el codigo al servidor via POST /api/python/run.
3. Node.js guarda el codigo en un archivo temporal y lo ejecuta con Python.
4. Cada vez que el script llama a robot.mover_j1() u otro metodo, Python imprime un JSON por stdout.
5. Node.js lee ese JSON y lo emite a todos los clientes via Socket.IO (evento robot:python_command).
6. El frontend recibe el comando y actualiza el target del robot, igual que hace el teclado.
7. Si hay sesion activa, el movimiento se registra en MySQL automaticamente.

## Flujo resumido

```
Usuario escribe Python
    -> POST /api/python/run
    -> Node ejecuta proceso Python hijo
    -> Python imprime JSON por stdout
    -> Node emite robot:python_command por Socket.IO
    -> Frontend mueve el robot en pantalla
    -> (Si hay sesion) movimiento guardado en MySQL
```

## Archivos modificados o creados

| Archivo | Cambio |
|---|---|
| server/robot_api.py | NUEVO - clase Robot con todos los metodos |
| server/app.js | NUEVO - endpoints /api/python/run y /api/python/stop |
| public/index.html | NUEVO - panel plegable con editor y consola |
| public/app.js | NUEVO - logica del editor y listeners Socket.IO |
| public/styles.css | NUEVO - estilos del panel Python |

## Comandos disponibles en Python

```python
robot.mover_j1(grados)      # Eje J1: -90 a 90
robot.mover_j2(grados)      # Eje J2: -135 a 135
robot.mover_z(mm)           # Eje Z: 0 a 250 mm
robot.mover_r(grados)       # Rotacion herramienta: -180 a 180
robot.esperar(segundos)     # Pausa sin mover
robot.velocidad(v)          # Cambia el delay entre pasos (segundos, minimo 0.1)
robot.log("mensaje")        # Muestra texto en la consola de la web
```

## Ejemplo de script

```python
robot.log("Iniciando secuencia...")

robot.mover_z(200)
robot.mover_j1(60)
robot.mover_j2(-80)
robot.mover_r(90)

robot.log("Volviendo al centro...")

robot.esperar(1)
robot.mover_r(0)
robot.mover_j2(0)
robot.mover_j1(0)
robot.mover_z(120)

robot.log("Secuencia completada.")
```

## Endpoints nuevos en el backend

### POST /api/python/run
Recibe el codigo Python, crea un archivo temporal y lanza el proceso.

Body:
```json
{ "code": "robot.mover_z(150)\nrobot.mover_j1(45)" }
```

Respuestas:
- 200: script iniciado correctamente
- 409: ya hay un script en ejecucion
- 400: codigo invalido
- 500: no se pudo preparar el script

### POST /api/python/stop
Detiene el proceso Python en ejecucion si lo hay.

## Eventos Socket.IO nuevos

| Evento | Direccion | Descripcion |
|---|---|---|
| robot:python_command | servidor -> cliente | comando de movimiento o log |
| robot:python_log | servidor -> cliente | mensaje de consola o error |
| robot:python_done | servidor -> cliente | script finalizado con codigo de salida |

## Requisitos

- Python instalado en el sistema y disponible en el PATH como comando `python`.
- No se necesita instalar ninguna dependencia nueva de Node.js.

## Notas importantes

- El teclado no mueve el robot mientras el cursor esta dentro del editor Python.
- Si se cierra el navegador con un script en ejecucion, el proceso Python sigue corriendo en el servidor hasta que termine o se detenga.
- El archivo temporal del script se elimina automaticamente al terminar la ejecucion.
