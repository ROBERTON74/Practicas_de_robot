# 01 - Vision General

## Que problema resuelve este proyecto

Este proyecto crea una plataforma web para simular y controlar un robot tipo SCARA (estilo DOBOT M1), registrando toda la actividad del operador.

## Arquitectura simple

- Frontend: interfaz web + simulacion 3D + control por teclado.
- Backend: API REST + Socket.IO para tiempo real.
- Base de datos: MySQL para guardar trazabilidad.
- MCP: servidor de herramientas para conectar otras apps o agentes.

## Flujo de uso normal

1. El operador abre la web en localhost.
2. Inicia sesion con su nombre.
3. Mueve el robot con teclado.
4. El backend guarda cada movimiento y actualiza estado.
5. Al cerrar sesion, se guarda duracion total.

## Ejes y control implementados

- J1: giro principal horizontal (aprox +-90 grados).
- J2: giro secundario del brazo (aprox +-135 grados).
- Z: desplazamiento vertical (0 a 250 mm).
- R: rotacion de herramienta (360 grados total representados en +-180).

## Resultado conseguido

Se obtuvo una simulacion mas realista del movimiento SCARA, con limites y dinamica de ejes mas cercanos al comportamiento del DOBOT M1 mostrado por el usuario.
