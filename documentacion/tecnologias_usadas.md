# Tecnologías Utilizadas

Documento técnico que describe el stack tecnológico empleado en el desarrollo del proyecto **Robot Universitario**, incluyendo el propósito de cada tecnología dentro de la arquitectura del sistema.

---

## Infraestructura y Contenedores

### Docker
- **Versión:** 29.4.1
- **Rol:** Plataforma de contenedización que permite empaquetar cada servicio de la aplicación en un entorno aislado, garantizando que el proyecto funcione de forma idéntica en cualquier máquina.

### Docker Compose
- **Versión:** v5.1.3
- **Rol:** Herramienta de orquestación que define y gestiona los múltiples contenedores del proyecto (base de datos, backend y frontend) a través de un único archivo de configuración (`docker-compose.yml`).

---

## Base de Datos

### MySQL 8.0 (proyecto del profesor)
- **Rol:** Base de datos del backend ReNoLabs. Almacena usuarios, actividades, controladores, vistas y sesiones del laboratorio remoto.
- **Credenciales:** root/admin — base de datos `renolabs` — puerto host 3307
- **Nota:** Originalmente el profesor usaba MariaDB, pero se migró a MySQL 8.0 porque el profesor no recordaba las credenciales de MariaDB y prefirió usar MySQL con credenciales conocidas.

### MariaDB (nuestro proyecto)
- **Rol:** Base de datos de nuestro backend auxiliar (Node.js + PM2). Corre en contenedor propio en puerto 3308.
- **Acceso:** Únicamente desde el backend a través de la red interna de Docker.

---

## Backend

### Node.js
- **Rol:** Entorno de ejecución que permite correr JavaScript en el servidor. Actúa como capa intermedia entre el frontend y la base de datos, exponiendo una **API REST** que gestiona todas las operaciones de la aplicación.
- **Por qué Node.js:** Alto rendimiento en operaciones de entrada/salida, ecosistema npm muy amplio y el mismo lenguaje (JavaScript) tanto en frontend como en backend.

### Express.js
- **Rol:** Framework minimalista sobre Node.js. Es el **gestor de peticiones HTTP** del backend — define las puertas de entrada (rutas) de la API REST a las que el frontend puede llamar.
- **Por qué Express:** Sin Express habría que programar toda la gestión de peticiones HTTP desde cero con Node.js puro, lo que sería mucho más complejo. Express lo simplifica enormemente.
- **Ejemplo de rutas:**
  - `POST /login` — puerta de entrada para autenticarse
  - `GET /usuarios` — puerta para obtener usuarios
  - `GET /robot` — puerta para controlar el robot
- **Relación con la API REST:** Node.js + Express = API REST. Express es lo que convierte el servidor en una API que cualquier aplicación (navegador, móvil, otro servidor) puede consumir mediante HTTP.

---

## Frontend

### Vue.js
- **Rol:** Framework progresivo de JavaScript para construir interfaces de usuario. Permite dividir la interfaz en **componentes reutilizables**, sincronizar automáticamente los datos con la vista y actualizar la pantalla sin recargar la página completa.
- **Por qué Vue.js:** Curva de aprendizaje suave, arquitectura basada en componentes, y excelente integración con APIs REST mediante peticiones HTTP.

---

## Gestor de Procesos

### PM2
- **Rol:** Gestor de procesos para Node.js en producción. Mantiene el servidor siempre activo — si se cae por cualquier error, lo reinicia automáticamente sin intervención manual.
- **Por qué PM2:** Es el estándar moderno para producción con Node.js. Sustituye a herramientas antiguas como `forever` que ya no se mantienen.
- **Ventajas:**
  - Reinicio automático si el servidor falla
  - Arranque automático al iniciar el sistema
  - Posibilidad de correr múltiples instancias en paralelo (mayor rendimiento)
  - Panel de monitorización de logs, CPU y memoria en tiempo real
- **Uso en Docker:** Se usa `pm2-runtime` en lugar de `pm2` para que funcione correctamente dentro de un contenedor (mantiene el proceso en primer plano).

---

## Autenticación y Seguridad

### JWT — JSON Web Token
- **Rol:** Estándar de autenticación seguro basado en tokens. Cuando un alumno inicia sesión con sus credenciales, el servidor genera un **token firmado** que el cliente incluye en cada petición posterior para verificar su identidad.
- **Flujo de autenticación:**
  1. El alumno introduce sus credenciales en el frontend.
  2. El backend valida las credenciales contra la base de datos.
  3. Si son correctas, el servidor genera y devuelve un JWT.
  4. El frontend almacena el token y lo envía en la cabecera de cada petición protegida.
  5. El backend verifica la firma del token antes de responder.
- **Por qué JWT:** Sin estado en el servidor (stateless), seguro, estándar ampliamente adoptado y compatible con cualquier cliente (navegador, app móvil, etc.).
- **Usuarios finales:** Alumnos de la universidad que acceden a la plataforma para realizar pruebas.

---

## Variables de Entorno

### Archivo `.env`
- **Rol:** Fichero de configuración local que almacena información sensible (credenciales de base de datos, secreto JWT, puertos, etc.) fuera del código fuente.
- **Importante:** Este archivo **nunca se sube al repositorio**. Se proporciona un `.env.example` con los campos vacíos como referencia para configurar el entorno.

---

## Control de Versiones

### Git + GitHub
- **Rol:** Sistema de control de versiones distribuido. Permite registrar el historial de cambios del proyecto, trabajar en ramas independientes y compartir el código con el equipo o con el profesor para su revisión.

---

## Repositorios del Profesor (jcsombria)

El proyecto se apoya en tres repositorios del profesor disponibles en GitHub, cada uno con un rol diferente dentro de la arquitectura:

### ReNoLabs — Backend
- **Repositorio:** `https://github.com/jcsombria/ReNoLabs`
- **Rol:** Servidor backend (Node.js). Gestiona la lógica del laboratorio remoto, recibe peticiones del frontend y se comunica con la base de datos y el robot.
- **Contenedor Docker:** `vrlabs_node` — puerto 80
- **Estado:** Clonado y configurado en local.

### vrisa — Frontend
- **Repositorio:** `https://github.com/jcsombria/vrisa`
- **Rol:** Interfaz de usuario (Vue.js). Es lo que ve el alumno en el navegador: login, lista de actividades y simulaciones de robots.
- **Estado:** ✅ Clonado, configurado y contenedorizado. Accesible en `http://localhost:8082/vr-isa/`
- **Modificaciones aplicadas:** IP del servidor corregida en build, export de LabInstance añadido.

### rip-js-server — Protocolo de comunicación
- **Repositorio:** `https://github.com/jcsombria/rip-js-server`
- **Rol:** Implementación del protocolo RIP (Remote Interoperability Protocol). Actúa como capa de comunicación entre el backend (ReNoLabs) y el robot o laboratorio físico.
- **Estado:** ✅ Clonado y contenedorizado. Usa `DummyServer` + `TestBoard` (sin robot real). Puerto 2055.

---

## EjsS — Easy JavaScript Simulations

- **Rol:** Framework de simulaciones interactivas web. Genera archivos `.xhtml` con modelos 3D, controles deslizantes, gráficas en tiempo real y lógica de cinemática del robot.
- **Uso:** Las simulaciones de cada robot (DOBOT Magician, DOBOT M1, Air Flow, Sistemas Lineales) son archivos EjsS servidos por ReNoLabs.
- **Archivos:** Cada simulación es un `.xhtml` autocontenido con JavaScript, CSS y la librería EjsS embebida.

---

## Bootstrap 5 + librerías auxiliares (DOBOT M1)

La simulación del DOBOT M1 usa Bootstrap 5 para la interfaz (tabs, botones, layout), igual que la versión más reciente del Magician del profesor.

Para garantizar que la simulación funcione **sin conexión a internet** (en la universidad, con datos móviles, etc.), las librerías externas se sirven en local desde `dobot_m1_view/_ejs_library/local_libs/`:

| Librería | Versión | Archivo local | Uso |
|---|---|---|---|
| Bootstrap JS + Popper | 5.0.2 | `bootstrap.bundle.min.js` | Navegación entre pestañas Bootstrap |
| ACE Editor | 1.14.0 | `ace.js` | Editor de código en pestaña Programación |
| Peggy | 5.1.0 | `peggy.min.js` | Parser del lenguaje ACL |
| Bootstrap Icons | 1.3.0 | `bootstrap-icons/bootstrap-icons.css` + fuentes | Iconos en botones (HOME, STOP, EJECUTAR...) |

- **Por qué local:** El navegador descarga estos scripts desde internet al cargar la simulación. Con conexión lenta (datos móviles, WiFi universitario bloqueado) la página se queda colgada esperando los CDN externos.
- **Excepción:** Bootstrap CSS sigue siendo CDN (ya estaba en todas las simulaciones del profesor y no es bloqueante al ser CSS).

---

## Flujo completo de la arquitectura

```
Alumno (navegador)
    ↓
vrisa — Frontend (Vue.js) — puerto 8082
    ↓ JWT
ReNoLabs — Backend (Node.js) ←→ MySQL 8.0 (base de datos) — puerto 80/3307
    ↓ RIP
rip-js-server — Protocolo de comunicación — puerto 2055
    ↓
Robot / Laboratorio físico
```

---

## Estado de los contenedores Docker

### Proyecto del profesor (ReNoLabs)
| Contenedor | Servicio | Puerto | Estado |
|---|---|---|---|
| docker-vrlabs_node-1 | ReNoLabs (backend profesor) | 80 | ✅ Corriendo |
| docker-vrlabs_db-1 | MySQL 8.0 | 3307 | ✅ Corriendo |

### Nuestro proyecto
| Contenedor | Servicio | Puerto | Estado |
|---|---|---|---|
| proyectorobot_universitario-backend-1 | Backend Node.js + PM2 | 3000 | ✅ Corriendo |
| proyectorobot_universitario-db-1 | MariaDB | 3308 | ✅ Corriendo |
| proyectorobot_universitario-vrisa-1 | vrisa (Vue.js + nginx) | 8082 | ✅ Corriendo |
| proyectorobot_universitario-rip-server-1 | rip-js-server | 2055 | ✅ Corriendo |

---

## Robots integrados en el sistema

| Robot | Actividad en MySQL | Imagen | Estado |
|---|---|---|---|
| DOBOT Magician | Robot DOBOT Magician | Dobot.png | ✅ Funcionando |
| Air Flow Levitation | Air Flow Levitation | Hover3DoF.png | ✅ Funcionando |
| Sistemas Lineales | Sistemas Lineales | sistemas_lineales.png | ✅ Funcionando |
| DOBOT M1 | Robot DOBOT M1 | DobotM1.jpg | ✅ Funcionando |

---

*Última actualización: Mayo 2026. Actualizar ante cualquier cambio en el stack tecnológico.*
