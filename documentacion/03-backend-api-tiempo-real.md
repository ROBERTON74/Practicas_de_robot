# 03 - Backend API y Tiempo Real

## Archivo principal

- server/app.js

## Que hace el backend

- Sirve la web estatica desde public/.
- Expone endpoints REST para login, heartbeat y cierre de sesion.
- Recibe movimientos y los persiste en MySQL.
- Sincroniza estado en tiempo real via Socket.IO.

## Endpoints principales

1. GET /api/health
- Sirve para verificar que el servidor esta vivo.

2. POST /api/users/login
- Crea o reutiliza usuario.
- Abre una sesion de control.

3. POST /api/sessions/:id/heartbeat
- Actualiza ultima actividad de la sesion.

4. POST /api/sessions/:id/end
- Cierra sesion y calcula duracion.

5. POST /api/movements
- Guarda cada movimiento realizado.

## Capa de datos

- server/db.js: pool de conexion MySQL.
- server/repository.js: funciones de acceso a datos.

## Endpoints nuevos (programacion Python)

6. POST /api/python/run
- Recibe codigo Python del frontend.
- Lo guarda en un archivo temporal.
- Lanza un proceso Python hijo.
- Emite los movimientos al frontend via Socket.IO.

7. POST /api/python/stop
- Detiene el proceso Python en ejecucion si lo hay.

## Eventos Socket.IO nuevos (programacion Python)

- robot:python_command: comando de movimiento o log enviado al frontend.
- robot:python_log: mensaje de consola o error del script.
- robot:python_done: notifica que el script ha terminado con su codigo de salida.

## Ventajas de este enfoque

- Codigo organizado por responsabilidades.
- Facil de mantener y ampliar.
- Compatible con multicliente en tiempo real.
