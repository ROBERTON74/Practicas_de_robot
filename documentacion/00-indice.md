# Documentacion del Proyecto: Robot Mecanico DOBOT M1 (SCARA)

Esta carpeta explica, paso por paso y de forma sencilla, todo lo que se construyo en el proyecto.

## Orden recomendado de lectura

0. [00-tecnologias-y-stack.md](00-tecnologias-y-stack.md)
1. [01-vision-general.md](01-vision-general.md)
2. [02-base-de-datos-mysql.md](02-base-de-datos-mysql.md)
3. [03-backend-api-tiempo-real.md](03-backend-api-tiempo-real.md)
4. [04-frontend-simulador-scara.md](04-frontend-simulador-scara.md)
5. [05-mcp-integracion.md](05-mcp-integracion.md)
6. [06-ejecucion-y-pruebas.md](06-ejecucion-y-pruebas.md)
7. [07-problemas-comunes.md](07-problemas-comunes.md)
8. [08-programacion-python.md](08-programacion-python.md)

## Objetivo final del sistema

- Controlar una simulacion del robot desde navegador.
- Mover el robot en tiempo real con teclado.
- Guardar usuarios, sesiones y movimientos en MySQL.
- Exponer herramientas MCP para integraciones externas.
- Programar secuencias de movimientos desde la web usando Python.

## Resumen rapido de lo que ya esta hecho

- Backend Node.js + Express + Socket.IO.
- Simulador web 3D con logica SCARA realista.
- Base de datos MySQL creada y tablas listas.
- Registro de actividad por usuario/sesion/movimiento.
- Servidor MCP funcional con herramientas de consulta y registro.
- Editor Python integrado en la web para programar movimientos con pila de ejecucion.
