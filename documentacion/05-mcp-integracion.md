# 05 - Integracion MCP

## Archivos

- mcp/server.js
- mcp/mcp-config.json

## Para que sirve MCP aqui

Permite que otras herramientas compatibles con Model Context Protocol llamen acciones del robot y consulten estado, sin acoplarse al frontend.

## Herramientas MCP implementadas

1. query_robot_state
- Lee el estado actual desde MySQL.

2. create_user_session
- Crea/reutiliza usuario y abre sesion.

3. log_robot_movement
- Registra movimientos por sesion.

## Ventajas

- Integracion estandar con clientes MCP.
- Facil de automatizar pruebas o flujos externos.
- Mantiene consistencia con los datos de la aplicacion.
