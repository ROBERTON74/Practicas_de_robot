# Tecnologias usadas en el proyecto

Este documento resume las tecnologias principales usadas en el proyecto **Robot Universitario** y explica para que sirve cada una dentro de la arquitectura.

## 1. Docker

Usamos **Docker** para contenerizar los servicios del proyecto.

Esto permite ejecutar cada parte en un entorno aislado:

- frontend `vrisa`
- backend auxiliar
- ReNoLabs
- bases de datos
- rip-js-server

Ventaja principal: el proyecto se puede levantar de forma parecida en distintos ordenadores sin instalar todo manualmente en el sistema.

## 2. Docker Compose

Usamos **Docker Compose** para levantar varios contenedores juntos mediante archivos `.yml`.

En el proyecto hay dos composiciones importantes:

- `docker-compose.yml`: levanta nuestro stack principal.
- `ReNoLabs/docker/docker-compose.yml`: levanta ReNoLabs y su base de datos MySQL.

Comando habitual:

```powershell
docker compose up --build -d
```

## 3. Frontend: vrisa y Vue.js

El frontend principal es **vrisa**.

Usa **Vue.js**, que sirve para construir la interfaz web que ve el usuario:

- login
- panel de actividades
- acceso a laboratorios
- vistas de robots
- controles del laboratorio

Importante: Vue.js no ejecuta Python en el navegador. El navegador ejecuta HTML, CSS y JavaScript. Python se ejecuta en el servidor o como proceso controlador.

## 4. Nginx

El contenedor de `vrisa` usa **Nginx** para servir el frontend compilado.

Tambien puede actuar como proxy. En la version moderna se uso para redirigir llamadas `/api` hacia ReNoLabs y evitar problemas de CORS.

URL local del frontend:

```text
http://localhost:8082/vr-isa/
```

## 5. Backend auxiliar: Node.js, Express y PM2

El backend auxiliar del proyecto usa:

- **Node.js**: permite ejecutar JavaScript en el servidor.
- **Express.js**: permite crear endpoints HTTP.
- **PM2**: gestor de procesos para mantener activo el servidor Node.js.

Este backend responde en:

```text
http://localhost:3000/
```

Actualmente es un backend auxiliar. El backend principal del laboratorio remoto es ReNoLabs.

## 6. ReNoLabs

**ReNoLabs** es el backend principal del laboratorio remoto.

Se encarga de:

- autenticar usuarios
- generar tokens JWT
- gestionar actividades
- gestionar sesiones de laboratorio
- servir vistas EjsS
- conectar usuarios con controladores
- coordinar la comunicacion con hardware o simulacion

Rutas importantes:

```text
POST /login
POST /authenticate
GET /request_activity
GET /help
POST /data
POST /admin/q/:model/:action
```

En local se publica en:

```text
http://localhost
```

## 7. Bases de datos: MySQL y MariaDB

El proyecto usa bases de datos SQL.

### MySQL 8.0

Usado por ReNoLabs.

Guarda informacion como:

- usuarios
- actividades
- vistas
- controladores
- sesiones

Puerto local:

```text
3307
```

### MariaDB

Usada por el backend auxiliar del proyecto.

Puerto local:

```text
3308
```

## 8. mysql2

**mysql2** es una libreria de Node.js para conectar un backend Node.js con bases de datos MySQL o MariaDB.

Se usa en el backend auxiliar para conectarse a la base de datos.

## 9. Sequelize

**Sequelize** es un ORM usado por ReNoLabs.

Permite trabajar con la base de datos usando modelos JavaScript en lugar de escribir SQL manual todo el tiempo.

Ejemplos de modelos:

- User
- Activity
- Controller
- View
- Session

## 10. JWT

**JWT** significa JSON Web Token.

Se usa para autenticar usuarios y sesiones.

Flujo basico:

1. El usuario inicia sesion.
2. ReNoLabs valida las credenciales.
3. ReNoLabs devuelve un token JWT.
4. El frontend guarda el token.
5. Las siguientes peticiones incluyen el token para demostrar que el usuario esta autenticado.

## 11. CORS

**CORS** permite que frontend y backend se comuniquen aunque esten en puertos u origenes distintos.

Ejemplo:

```text
Frontend: http://localhost:8082
Backend:  http://localhost
```

En la version moderna se redujo este problema usando Nginx como proxy.

## 12. Socket.IO

**Socket.IO** permite comunicacion en tiempo real entre la web y ReNoLabs.

Sirve para:

- enviar ordenes al laboratorio
- recibir estados
- actualizar graficas
- recibir senales del experimento

Es importante para que la interfaz del laboratorio no dependa solo de peticiones HTTP sueltas.

## 13. ZeroMQ

**ZeroMQ** se usa en la comunicacion interna entre ReNoLabs y algunos controladores Python.

Por ejemplo:

```text
ReNoLabs -> ZeroMQ -> controlador Python
controlador Python -> ZeroMQ -> ReNoLabs
```

En el DOBOT real, esta capa puede servir para enviar comandos y recibir datos del controlador.

## 14. Python

Python se usa para controladores de laboratorio.

En el caso del DOBOT, existen archivos como:

- `dobot_server.py`
- `orden.py`

Estos scripts no se ejecutan en el navegador. Se ejecutan como procesos del servidor o del equipo que tenga acceso al robot.

## 15. rip-js-server

**rip-js-server** implementa un servidor relacionado con el protocolo RIP.

En el proyecto local se usa con:

- `DummyServer`
- `TestBoard`

Puerto local:

```text
2055
```

Sirve para pruebas, simulacion o futura integracion con laboratorios remotos.

## 16. EjsS

**EjsS** significa Easy JavaScript Simulations.

Se usa para las vistas de los laboratorios y robots.

Genera archivos `.xhtml` que incluyen:

- interfaz visual
- controles
- graficas
- logica de simulacion
- conexion con ReNoLabs

Ejemplos:

- DOBOT M1
- DOBOT Magician
- Air Flow Levitation
- Sistemas Lineales

## 17. Bootstrap

**Bootstrap** se usa para estilos y componentes visuales:

- botones
- tabs
- formularios
- distribucion de columnas
- estilos responsivos

## 18. Git y ramas del frontend

Usamos Git para controlar versiones.

Hay dos ramas importantes para ensenar la interfaz:

| Rama | Interfaz |
|---|---|
| `main` | frontend clasico |
| `frontend-modernizacion` | frontend moderno |

Para cambiar entre ellas se usan scripts:

```powershell
.\scripts\usar-frontend-clasico.ps1
.\scripts\usar-frontend-moderno.ps1
```

## 19. Estado actual del DOBOT

Actualmente el DOBOT funciona en modo local/simulado.

Esto permite probar:

- login
- panel de actividades
- entrada a la actividad
- comunicacion de la web con ReNoLabs
- interfaz del laboratorio

Todavia no es control del robot fisico real.

Para conectar el DOBOT real faltan:

- credenciales de la Raspberry Pi
- acceso SSH/red
- SDK o biblioteca oficial del DOBOT M1
- confirmacion de conexion fisica: USB, serie o Ethernet
- configuracion de seguridad: paro de emergencia, limites y permisos

## 20. Resumen rapido

```text
Usuario
  -> vrisa / Vue.js / Nginx
  -> ReNoLabs / Node.js / Express
  -> MySQL / Sequelize
  -> Socket.IO / ZeroMQ
  -> Controlador Python o simulacion
  -> DOBOT real en el futuro
```

## 21. URLs locales utiles

```text
Frontend:
http://localhost:8082/vr-isa/

Backend auxiliar:
http://localhost:3000/

ReNoLabs:
http://localhost

rip-js-server:
http://localhost:2055/
```

## 22. Credenciales locales de prueba

```text
usuario: admin
contrasena: admin
```

## 23. Fecha de actualizacion

Ultima actualizacion: junio de 2026.
