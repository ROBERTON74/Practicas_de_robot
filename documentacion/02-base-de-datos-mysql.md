# 02 - Base de Datos MySQL

## Base de datos

Nombre: robot_mecanico

## Script principal

Archivo: database/schema.sql

## Tablas creadas

1. users
- Guarda usuarios de la plataforma.
- Campos principales: id, username, created_at.

2. control_sessions
- Guarda cada sesion de control del robot.
- Campos principales: user_id, started_at, last_active, ended_at, duration_seconds.

3. movement_logs
- Guarda cada movimiento hecho por un operador.
- Campos principales: session_id, axis_x, axis_y, axis_z, grip, key_pressed, speed, source, created_at.

4. robot_state
- Guarda el ultimo estado global del robot.
- Campos principales: axis_x, axis_y, axis_z, grip, updated_at.

5. audit_events
- Reserva para eventos de auditoria/diagnostico.

## Por que esta estructura es profesional

- Separa usuarios, sesiones y movimientos (normalizacion basica).
- Permite trazabilidad completa: quien movio, cuando y como.
- Incluye relaciones y llaves foraneas para integridad.
- Agrega indices para consultas mas rapidas por sesion/fecha.

## Comando usado para crear tablas

En PowerShell:

Get-Content -Raw "database/schema.sql" | & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pTU_PASSWORD robot_mecanico
