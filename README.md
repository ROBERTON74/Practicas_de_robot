# Robot Mecanico Web Control (DOBOT M1)

Aplicacion web para controlar una simulacion de brazo robotico en tiempo real, con trazabilidad en MySQL y capa MCP.

## Funciones incluidas

- Simulacion 3D en navegador (Three.js)
- Control en tiempo real con teclado
- Broadcast de estado con Socket.IO
- Registro de usuario, sesion y movimientos en MySQL
- Servidor MCP para integracion con herramientas compatibles
- Archivo de claves .mcd

## Controles

- Flecha arriba / abajo: mover eje Y
- Flecha izquierda / derecha: mover eje X
- W / S: subir y bajar eje Z
- Q / E: abrir y cerrar grip

## Estructura

- public/: interfaz y simulador
- server/: API + sockets + acceso DB
- database/schema.sql: modelo de datos
- mcp/server.js: servidor MCP
- keys.mcd: claves y configuracion sensible

## Requisitos

- Node.js 20 o superior
- MySQL 8.0 o superior

## Instalacion

1. Instala Node.js: https://nodejs.org/
2. En la carpeta del proyecto ejecuta:

   npm install

3. Crea tablas en MySQL:

   mysql -u root -p robot_mecanico < database/schema.sql

4. Ejecuta la app:

   npm run dev

5. Abre en navegador:

   http://localhost:3000

## MCP

La configuracion de ejemplo para cliente MCP esta en:

- mcp/mcp-config.json

Para ejecutar el servidor MCP:

npm run mcp

## Seguridad

- No compartas keys.mcd ni .env en repositorios publicos.
