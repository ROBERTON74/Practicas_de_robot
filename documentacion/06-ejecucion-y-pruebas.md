# 06 - Ejecucion y Pruebas

## Requisitos

- Node.js LTS instalado.
- MySQL activo.

## 1) Instalar dependencias

npm install

## 2) Verificar base de datos

- Revisar que existe la base robot_mecanico.
- Revisar tablas con:

& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pTU_PASSWORD -e "USE robot_mecanico; SHOW TABLES;"

## 3) Ejecutar servidor

Abrir una terminal, navegar al proyecto y ejecutar:

node server/app.js

Cuando aparezca el mensaje "Robot web app listening on http://localhost:3000" el servidor esta listo.

La terminal debe quedarse abierta mientras se usa la aplicacion. Es normal que parezca "colgada": Node.js mantiene el proceso activo esperando peticiones. El servidor esta procesando eventos en segundo plano aunque no se vea actividad en pantalla.

Para desarrollo con reinicio automatico al guardar cambios:

npx nodemon server/app.js

Si el PATH de node no funciona, usar ruta absoluta:

& "C:\Program Files\nodejs\node.exe" "server/app.js"

## 4) Cerrar el servidor correctamente

1. Ir a la terminal donde corre node server/app.js.
2. Pulsar Ctrl+C para parar el servidor.
3. Despues cerrar el navegador.

IMPORTANTE: si se cierra la terminal sin pulsar Ctrl+C el proceso puede quedarse ocupando el puerto 3000. La proxima vez que se intente arrancar dara el error EADDRINUSE. Ver problema 6 en 07-problemas-comunes.md para solucionarlo.

## 5) Abrir web

http://localhost:3000

## 6) Prueba funcional minima

1. Iniciar sesion con un usuario.
2. Mover J1/J2/Z/R con teclado.
3. Confirmar que la UI cambia en tiempo real.
4. Cerrar sesion.
5. Verificar datos en MySQL.

## Consulta SQL de verificacion

- Ultimas sesiones:

SELECT id, user_id, started_at, ended_at, duration_seconds FROM control_sessions ORDER BY id DESC LIMIT 10;

- Ultimos movimientos:

SELECT id, session_id, axis_x, axis_y, axis_z, grip, key_pressed, created_at FROM movement_logs ORDER BY id DESC LIMIT 20;