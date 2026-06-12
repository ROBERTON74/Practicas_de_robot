# Arquitectura de microservicios

Este documento explica la arquitectura del proyecto **Robot Universitario** y el flujo de comunicacion entre sus servicios.

## 1. Vision general

El proyecto esta dividido en varios servicios ejecutados con Docker.

La idea general es:

```text
Navegador del usuario
   |
   v
vrisa / frontend Vue.js
   |
   v
ReNoLabs / backend del laboratorio
   |
   v
Base de datos MySQL
   |
   v
Controladores / simulacion / robot real futuro
```

En local, el DOBOT M1 funciona en modo simulado.

En el futuro, cuando tengamos acceso a la Raspberry Pi y al SDK del DOBOT M1, el flujo podra llegar hasta el robot fisico.

## 2. Servicios principales

| Servicio | Tecnologia | Funcion |
|---|---|---|
| `vrisa` | Vue.js + Nginx | Interfaz web del usuario |
| `ReNoLabs` | Node.js + Express + Sequelize | Backend principal del laboratorio remoto |
| `MySQL` | MySQL 8.0 | Base de datos de ReNoLabs |
| `backend` | Node.js + Express + PM2 | Backend auxiliar del proyecto |
| `MariaDB` | MariaDB | Base de datos del backend auxiliar |
| `rip-js-server` | Node.js | Servidor RIP de pruebas/simulacion |
| Controladores | Python / JavaScript | Logica de control de laboratorios |

## 3. Flujo de autenticacion

Cuando un usuario entra en la plataforma:

1. Abre el frontend en el navegador.
2. Introduce usuario y contrasena.
3. El frontend envia una peticion a ReNoLabs.
4. ReNoLabs valida las credenciales contra MySQL.
5. Si son correctas, ReNoLabs devuelve un JWT.
6. El frontend usa ese token para las siguientes peticiones.

Flujo:

```text
Usuario
   |
   v
vrisa
   |
   | POST /login
   v
ReNoLabs
   |
   v
MySQL
   |
   v
JWT devuelto al frontend
```

## 4. Flujo para abrir una actividad

Cuando el usuario selecciona una actividad:

1. El frontend pide iniciar la actividad.
2. ReNoLabs comprueba el token JWT.
3. ReNoLabs busca la actividad, vista y controlador en MySQL.
4. ReNoLabs crea una sesion de laboratorio.
5. El frontend carga la vista EjsS correspondiente.
6. La vista se comunica en tiempo real mediante Socket.IO.

Flujo:

```text
vrisa
   |
   | GET /request_activity
   v
ReNoLabs
   |
   v
MySQL
   |
   v
Vista EjsS + sesion de laboratorio
```

## 5. Comunicacion en tiempo real

Para las actividades no basta con HTTP normal, porque hay que enviar y recibir datos continuamente.

Por eso se usa **Socket.IO**.

Sirve para:

- mandar ordenes desde la interfaz
- recibir valores del laboratorio
- actualizar graficas
- mostrar estados de conexion

Flujo:

```text
Vista del laboratorio
   |
   | Socket.IO
   v
ReNoLabs
   |
   v
Controlador o simulacion
```

## 6. Comunicacion interna con controladores

Algunos controladores se comunican con ReNoLabs mediante **ZeroMQ**.

Ejemplo:

```text
ReNoLabs
   |
   | ZeroMQ
   v
Controlador Python
```

En un laboratorio real, el controlador Python podria comunicarse con el hardware.

En local, para el DOBOT M1 se usa modo simulado hasta tener acceso al robot real.

## 7. DOBOT M1 en local

Estado actual:

```text
DOBOT M1 = modo simulado local
```

Esto permite probar:

- login
- carga de actividades
- entrada a la actividad DOBOT M1
- interfaz web
- comunicacion con ReNoLabs

No permite todavia mover el robot fisico real.

Para robot real faltan:

- acceso a Raspberry Pi
- credenciales SSH
- red/VPN
- SDK oficial DOBOT M1
- drivers
- confirmacion de conexion USB/serie/Ethernet
- seguridad del laboratorio

## 8. Futuro flujo con Raspberry Pi

Cuando tengamos acceso a la Raspberry, el flujo esperado sera:

```text
vrisa frontend
   |
   v
ReNoLabs backend
   |
   v
adaptador / controlador DOBOT
   |
   v
Raspberry Pi
   |
   v
DOBOT M1 real
```

La Raspberry actuara como puente entre el software y el robot fisico.

## 9. Docker y puertos locales

| Servicio | Contenedor | Puerto local |
|---|---|---|
| Frontend vrisa | `proyectorobot_universitario-vrisa-1` | `8082` |
| Backend auxiliar | `proyectorobot_universitario-backend-1` | `3000` |
| MariaDB auxiliar | `proyectorobot_universitario-db-1` | `3308` |
| rip-js-server | `proyectorobot_universitario-rip-server-1` | `2055` |
| ReNoLabs | `docker-vrlabs_node-1` | `80` |
| MySQL ReNoLabs | `docker-vrlabs_db-1` | `3307` |

## 10. URLs utiles

Frontend:

```text
http://localhost:8082/vr-isa/
```

Backend auxiliar:

```text
http://localhost:3000/
```

ReNoLabs:

```text
http://localhost
```

rip-js-server:

```text
http://localhost:2055/
```

## 11. Ramas del frontend

Hay dos versiones de interfaz:

| Rama | Interfaz |
|---|---|
| `main` | interfaz clasica |
| `frontend-modernizacion` | interfaz moderna |

Scripts:

```powershell
.\scripts\usar-frontend-clasico.ps1
.\scripts\usar-frontend-moderno.ps1
```

## 12. Diagrama general

```text
                   +----------------------+
                   | Usuario / navegador  |
                   +----------+-----------+
                              |
                              v
                   +----------------------+
                   | vrisa / Vue.js       |
                   | Nginx / puerto 8082  |
                   +----------+-----------+
                              |
                              v
                   +----------------------+
                   | ReNoLabs             |
                   | Node.js / Express    |
                   | puerto 80            |
                   +----------+-----------+
                              |
                +-------------+-------------+
                |                           |
                v                           v
       +------------------+        +----------------------+
       | MySQL            |        | Socket.IO / ZeroMQ   |
       | puerto 3307      |        | Controladores        |
       +------------------+        +----------+-----------+
                                             |
                                             v
                                  +----------------------+
                                  | Simulacion local     |
                                  | DOBOT real futuro    |
                                  +----------------------+
```

## 13. Estado actual

Actualmente el sistema funciona en local para demostracion:

- frontend accesible
- login funcionando
- actividades visibles
- ReNoLabs activo
- MySQL activo
- DOBOT M1 en modo simulado
- cambio entre interfaz clasica y moderna mediante scripts

Pendiente para hardware real:

- Raspberry Pi
- SDK DOBOT M1
- drivers
- pruebas de seguridad
- conexion real con el robot

## 14. Fecha de actualizacion

Ultima actualizacion: junio de 2026.
