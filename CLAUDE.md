# Proyecto: Simulador Robot DOBOT M1 (SCARA)

Aplicacion web para simular y controlar un robot mecanico tipo DOBOT M1 (SCARA) en tiempo real, con registro de actividad en MySQL y editor de programacion en Python.

## Arrancar el proyecto

```
node server/app.js
```

Luego abrir el navegador en: http://localhost:3000

## Estructura de archivos

```
public/
  index.html       — pagina web principal
  styles.css       — estilos visuales
  app.js           — logica del simulador 3D, teclado, sesion y editor Python

server/
  app.js           — servidor principal, endpoints y Socket.IO
  db.js            — conexion a MySQL
  repository.js    — funciones de base de datos
  robot_api.py     — clase Robot para programar movimientos en Python

database/          — esquema SQL
mcp/               — servidor MCP
documentacion/     — toda la documentacion del proyecto
.env               — credenciales MySQL y configuracion
keys.mcd           — API keys e integraciones externas
```

## Base de datos MySQL

- Nombre: robot_mecanico
- Tablas: users, control_sessions, movement_logs, robot_state, audit_events

## Endpoints del backend

- GET  /api/health
- POST /api/users/login
- POST /api/sessions/:id/heartbeat
- POST /api/sessions/:id/end
- POST /api/movements
- POST /api/python/run
- POST /api/python/stop

## Eventos Socket.IO

- control:update — movimiento enviado desde el frontend
- robot:state — estado del robot enviado a todos los clientes
- robot:python_command — comando de movimiento desde un script Python
- robot:python_log — mensaje o error del script Python
- robot:python_done — script Python finalizado

## Control por teclado

- Flechas izquierda/derecha — eje J1 (-90 a 90 grados)
- Flechas arriba/abajo — eje J2 (-135 a 135 grados)
- W / S — eje Z (0 a 250 mm)
- Q / E — eje R (-180 a 180 grados)
- Espacio — abrir / cerrar pinza

## Control de camara (raton)

- Clic izquierdo + arrastrar — rotar camara
- Rueda del raton — zoom

## Pinza y objetos

- Hay 4 cubos de colores en el suelo dentro del alcance del robot
- Para coger un objeto: posiciona el robot encima, baja Z a 0, pulsa Espacio
- Para soltar: pulsa Espacio de nuevo
- Los objetos soltados caen con gravedad hasta el suelo

## Programacion Python

El usuario puede escribir scripts Python en el panel de la web. Comandos disponibles:

```python
robot.mover_j1(grados)
robot.mover_j2(grados)
robot.mover_z(mm)
robot.mover_r(grados)
robot.esperar(segundos)
robot.velocidad(segundos_entre_pasos)
robot.log("mensaje")
```

## Tecnologias

**Lenguajes:** JavaScript, Python, HTML5, CSS3, SQL

**Frontend:** Three.js (simulacion 3D), Socket.IO cliente

**Backend:** Node.js, Express, Socket.IO servidor, mysql2, cors, dotenv, nodemon

**Protocolos:** API REST, WebSocket, MCP, Fetch API, Beacon API

## Regla principal

Cualquier cambio nuevo debe mantener todo lo existente funcionando. No se elimina ni se rompe nada.

## Documentacion completa

Ver carpeta documentacion/ — especialmente super texto resumen.md para el historial completo.
