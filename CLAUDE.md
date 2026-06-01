# CLAUDE.md — Contexto del Proyecto Robot Universitario

Este archivo es para uso del agente de IA (Claude). Léelo al inicio de cada sesión para tener el contexto completo del proyecto antes de hacer cualquier cosa.

---

## Descripción del Proyecto

Aplicación web para alumnos universitarios que permite realizar pruebas a través de un robot. Los alumnos son los **usuarios finales** y acceden mediante autenticación JWT.

---

## Stack Tecnológico

| Tecnología | Rol |
|---|---|
| Docker 29.4.1 | Contenedización de servicios |
| Docker Compose v5.1.3 | Orquestación de contenedores |
| MySQL 8.0 | Base de datos relacional (proyecto del profesor) |
| MariaDB | Base de datos relacional (nuestro backend) |
| Node.js + Express.js | Backend / API REST |
| Vue.js | Frontend / Interfaz de usuario |
| JWT | Autenticación de alumnos |
| PM2 | Gestor de procesos Node.js en producción |
| Git + GitHub | Control de versiones y entrega al profesor |
| Archivo `.env` | Variables de entorno y credenciales |

---

## Repositorios del Profesor (jcsombria)

| Repositorio | Rol |
|---|---|
| ReNoLabs | Backend del profesor (Node.js) — clonado dentro del contenedor de nuestro backend |
| vrisa | Frontend (Vue.js) — version clasica funcional y version moderna en rama `frontend-modernizacion` |
| rip-js-server | Protocolo de comunicación con el robot |

### Flujo completo
```
Alumno (navegador)
    ↓
vrisa — Frontend (Vue.js)
    ↓
ReNoLabs — Backend (Node.js) ←→ MySQL 8.0
    ↓
rip-js-server — Protocolo RIP
    ↓
Robot / Laboratorio físico
```

---

## Contenedores Docker activos

### Proyecto del profesor (ReNoLabs)
Ubicación: `c:/Users/rober/Desktop/Pracicas WEBS/Proyecto Robot_Universitario/ReNoLabs/docker/`
Comando para lanzar: `cd "Proyecto Robot_Universitario/ReNoLabs/docker" && docker-compose up -d`

| Contenedor | Servicio | Puerto |
|---|---|---|
| docker-vrlabs_node-1 | ReNoLabs (backend profesor) | 80 |
| docker-vrlabs_db-1 | MySQL 8.0 (profesor) | 3307 |

**Credenciales MySQL del profesor:**
- Usuario root: `root` / `admin`
- Usuario app: `renolabs` / `renolabs`
- Base de datos: `renolabs`
- Puerto host: 3307

> **Nota:** Se cambió de MariaDB a MySQL porque el profesor no recordaba las credenciales de MariaDB y prefirió usar MySQL con credenciales conocidas (root/admin).

**Modificaciones realizadas al docker-compose del profesor (solo en local, no en su GitHub):**
- BD cambiada de `mariadb` a `mysql:8.0` — el profesor prefirió MySQL con credenciales conocidas
- Puerto: 3306 → 3307 (puerto ocupado en local)
- Añadido volumen persistente `vrlabs_mysql_data` para que los datos sobrevivan reinicios
- Añadido `depends_on: vrlabs_db` para garantizar orden de arranque

### Nuestro proyecto
Ubicación: `c:/Users/rober/Desktop/Pracicas WEBS/Proyecto Robot_Universitario/`
Comando para lanzar: `docker-compose up -d`

| Contenedor | Servicio | Puerto |
|---|---|---|
| proyectorobot_universitario-backend-1 | Nuestro backend (Node.js + PM2) | 3000 |
| proyectorobot_universitario-db-1 | Nuestra MariaDB | 3308 |
| proyectorobot_universitario-vrisa-1 | Frontend Vue.js (nginx) | 8082 |
| proyectorobot_universitario-rip-server-1 | rip-js-server (DummyServer + TestBoard) | 2055 |

---

## Estructura del Proyecto

```
Proyecto Robot_Universitario/
├── ReNoLabs/               ← backend del profesor (movido aquí desde Pracicas WEBS/)
│   └── docker/             ← docker-compose del profesor
├── vrisa/                  ← frontend Vue.js (movido aquí desde Pracicas WEBS/)
│   ├── Dockerfile          ← build multi-etapa: node:18-alpine (build) + nginx:alpine (serve)
│   ├── nginx.conf          ← sirve en /vr-isa, enruta SPA con try_files
│   ├── .dockerignore
│   └── src/assets/         ← contiene LabControl.js copiado desde ReNoLabs/src/client/
├── rip-js-server/          ← protocolo RIP (clonado de jcsombria/rip-js-server)
│   ├── Dockerfile          ← node:18-alpine, arranca con app/TestApp.js
│   ├── .dockerignore
│   └── app/TestApp.js      ← DummyServer + TestBoard (sin robot real)
├── backend/
│   ├── Dockerfile          ← instala git, clona ReNoLabs, instala PM2
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
├── documentacion/
│   ├── lib/
│   │   ├── vis-network.min.js   ← librería local (465 KB, sin internet)
│   │   └── vis-network.min.css  ← estilos locales
│   ├── tecnologias_usadas.md           ← stack tecnológico detallado
│   ├── arquitectura_microservicios.md  ← diagrama Mermaid + flujo completo
│   └── diagrama_interactivo.html       ← diagrama interactivo animado (abrir en navegador)
├── .env                    ← NUNCA subir a GitHub
├── .env.example
├── docker-compose.yml
└── CLAUDE.md
```

---

## Reglas y Advertencias Importantes

### PM2 en Docker
- Usar `pm2-runtime` (no `pm2 start`) dentro del contenedor para que el proceso no se cierre.
- PM2 reinicia automáticamente el servidor si se cae.
- Para verificar: `docker exec proyectorobot_universitario-backend-1 pm2 list`

### .dockerignore — OBLIGATORIO
Siempre tener `.dockerignore` con `node_modules` en cada servicio.

### .env — NUNCA subir a GitHub
- Credenciales en `.env`, nunca en el código.
- Siempre tener `.env.example` con campos vacíos.

### Conexión Backend → Base de Datos
El host de la base de datos en Node.js debe ser `db` (nombre del servicio en docker-compose), nunca `localhost`.

---

## Comandos útiles

```bash
# Ver todos los contenedores corriendo
docker ps

# Ver PM2 gestionando el servidor
docker exec proyectorobot_universitario-backend-1 pm2 list

# Ver monitor PM2 en tiempo real (CPU, memoria, logs)
docker exec -it proyectorobot_universitario-backend-1 pm2 monit

# Ver logs de PM2
docker exec proyectorobot_universitario-backend-1 pm2 logs

# Test de caída PM2: matar el proceso (usar el PID del pm2 list)
docker exec proyectorobot_universitario-backend-1 kill <PID>

# Ver archivos dentro del contenedor (verifica que ReNoLabs está clonado)
docker exec proyectorobot_universitario-backend-1 ls /app
docker exec proyectorobot_universitario-backend-1 ls /app/ReNoLabs

# Probar API en navegador
http://localhost:3000

# Probar ReNoLabs del profesor
http://localhost

# Ver bases de datos MySQL del profesor
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" -e "SHOW DATABASES;"

# Ver tablas de ReNoLabs en MySQL
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "SHOW TABLES;"

# Insertar usuario admin en ReNoLabs (ejecutar tras primer arranque)
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "INSERT INTO Users (username, displayName, password, isAdmin, permissions, createdAt, updatedAt) VALUES ('admin', 'Administrador', 'admin', true, 'admin,user', NOW(), NOW());"

# Ver bases de datos de nuestra MariaDB
docker exec proyectorobot_universitario-db-1 mariadb -u root -p"root_password" -e "SHOW DATABASES;"

# Probar vrisa en navegador (frontend Vue.js en Docker)
http://localhost:8082/vr-isa/

# Ver logs del contenedor vrisa
docker logs proyectorobot_universitario-vrisa-1
```

## Demostración PM2 para el tutor

1. **Abrir monitor en tiempo real** (Terminal 1):
   ```
   docker exec -it proyectorobot_universitario-backend-1 pm2 monit
   ```
2. **Ver PID actual** (Terminal 2):
   ```
   docker exec proyectorobot_universitario-backend-1 pm2 list
   ```
3. **Matar el proceso** (Terminal 2, usar PID del paso anterior):
   ```
   docker exec proyectorobot_universitario-backend-1 kill <PID>
   ```
4. **Comprobar reinicio** (Terminal 2):
   ```
   docker exec proyectorobot_universitario-backend-1 pm2 list
   ```
   El contador ↺ sube en 1 y el uptime vuelve a 0 — PM2 lo levantó solo.

> **Nota:** Cada vez que PM2 reinicia el servidor el PID cambia. Siempre hacer `pm2 list` para obtener el PID actual antes de matarlo.

## Demostración ReNoLabs clonado dentro del contenedor

```bash
docker exec proyectorobot_universitario-backend-1 ls /app/ReNoLabs
```
Muestra: LICENSE, README.md, doc, docker, fixtures, package.json, public, src, test, tools

---

## Estado del Proyecto

### Completado
- [x] Docker Desktop instalado y verificado (v29.4.1)
- [x] Carpeta `documentacion/` creada con `tecnologias_usadas.md`
- [x] Decisión de usar JWT para autenticación de alumnos
- [x] Estructura de carpetas `backend/` creada
- [x] `Dockerfile` del backend creado (con git, ReNoLabs clonado, PM2)
- [x] `.dockerignore` creado en backend
- [x] `docker-compose.yml` creado
- [x] `.env` y `.env.example` creados
- [x] `server.js` básico creado y funcionando
- [x] Contenedores del profesor lanzados (ReNoLabs + MariaDB)
- [x] Nuestros contenedores lanzados (backend + MariaDB)
- [x] PM2 integrado y funcionando en el backend
- [x] ReNoLabs clonado dentro del contenedor del backend
- [x] `documentacion/arquitectura_microservicios.md` creado — diagrama Mermaid con flujo completo por fases, tablas de protocolos, puertos y aislamiento Docker
- [x] `documentacion/diagrama_interactivo.html` creado — diagrama vis-network.js interactivo con nodos arrastrables, zoom, tooltips y leyenda
- [x] Diagrama interactivo adaptado para funcionar **sin internet** — librería vis-network.js descargada localmente en `documentacion/lib/`
- [x] Animación de partículas añadida al diagrama — puntos con halo brillante que viajan por cada flecha siguiendo su curva (efecto cinta transportadora)
- [x] Colores de etiquetas de flechas mejorados — flechas de ida en blanco, flechas de vuelta en amarillo dorado, con borde oscuro para contraste
- [x] vrisa clonado desde GitHub (jcsombria/vrisa) y movido a `Proyecto Robot_Universitario/vrisa/`
- [x] ReNoLabs movido a `Proyecto Robot_Universitario/ReNoLabs/` — todo el proyecto en una sola carpeta
- [x] rip-js-server clonado y eliminado — el profesor indicó que aún no hay que descargarlo
- [x] Investigado el problema de `LabControl.js` — encontrado puntero en `ReNoLabs/src/client/LabControl.js` que apunta a `/home/jcsombria/Workspace/ejss-repo/Ejs/distribution/bin/javascript/model_elements/Plugins/LabControl.js` (archivo real en el ordenador local del profesor)
- [x] Profesor subió el `LabControl.js` real a `ReNoLabs/src/client/` en GitHub
- [x] `LabControl.js` real copiado a `vrisa/src/assets/LabControl.js`
- [x] **vrisa arranca correctamente** en local — `http://localhost:8082/vr-isa/` — compilado sin errores
- [x] `vrisa/Dockerfile` creado — build multi-etapa: node:18-alpine compila Vue.js, nginx:alpine sirve el resultado
- [x] `vrisa/nginx.conf` creado — sirve la app en la ruta `/vr-isa`, SPA routing con `try_files`
- [x] `vrisa/.dockerignore` creado — excluye `node_modules`, `dist`, `.git`
- [x] `docker-compose.yml` actualizado — servicio `vrisa` en puerto 8082, depende de `backend`
- [x] **vrisa contenedorizado y funcionando en Docker** — contenedor `proyectorobot_universitario-vrisa-1` activo — accesible en `http://localhost:8082/vr-isa/`
- [x] **Formulario de login identificado** — ya existía completo en vrisa (`Login.vue` + `Session` en `vrisa-library.js`) — el profesor lo tenía implementado
- [x] **IP del servidor corregida en Dockerfile de vrisa** — `http://147.96.71.236` → `http://localhost` mediante `sed` en el build, sin tocar el fuente del profesor
- [x] **JWT secret configurado** — `ACCESS_TOKEN_SECRET` estaba vacío en settings.js — ReNoLabs no arrancaba
- [x] **Host de BD corregido en `ReNoLabs/src/models.js`** — cambiado `127.0.0.1` → `vrlabs_db`
- [x] **Dialecto cambiado de `mariadb` a `mysql`** en models.js — usamos MySQL 8.0
- [x] **docker-compose del profesor actualizado** — MySQL 8.0, volumen persistente, depends_on, credenciales root/admin
- [x] **Imagen MySQL 8.0 descargada** — `docker pull mysql:8.0`
- [x] **MySQL + ReNoLabs levantados** — Sequelize creó las tablas automáticamente al arrancar
- [x] **Tablas creadas en MySQL** — `Users`, `Activities`, `Controllers`, `Views`, `Sessions`, `Courses`, `UserActivities`, `UserCourses`
- [x] **Usuario admin insertado** — credenciales `admin`/`admin`, permisos `admin,user`, `isAdmin: true`
- [x] **Puerto de ReNoLabs corregido** — docker-compose cambiado de `80:80` a `80:8080` — el servidor escucha en 8080
- [x] **IP del servidor cambiada a 0.0.0.0** — `AppConfig.js` tenía `127.0.0.1` (loopback) → cambiado a `0.0.0.0` para que Docker pueda enrutar tráfico
- [x] **Login API verificado** — `POST http://localhost/login` con admin/admin devuelve JWT (HTTP 200) ✓
- [x] **Login desde vrisa verificado** — `http://localhost:8082/vr-isa/` con admin/admin entra correctamente ✓
- [x] **Pantalla Home verificada** — muestra "Actividades Disponibles" correctamente tras login ✓
- [x] **Actividad de prueba insertada** — "Robot DOBOT Magician" aparece en la pantalla del alumno ✓
- [x] **Flujo completo verificado** — vrisa → login → JWT → Home → actividades desde MySQL funciona end-to-end ✓
- [x] **Fixtures importados** — script `ReNoLabs/import_fixtures.js` importa todos los ZIPs de `ReNoLabs/fixtures/` a MySQL
  - Vistas: DOBOTMagician, Air Flow Levitation, Sistemas Lineales
  - Controladores: DOBOT, Arduino, Circuit (C RPI), Circuitos PC, TwinCAT, Agent
  - Actividades creadas: Robot DOBOT Magician, Air Flow Levitation, Sistemas Lineales
  - Las 3 actividades asignadas al usuario admin
- [x] **Imágenes de robots conectadas** — las imágenes ya estaban en vrisa en `/vr-isa/activities/` — solo faltaba rellenar el campo `image` en MySQL
  - `Robot DOBOT Magician` → `Dobot.png`
  - `Air Flow Levitation` → `Hover3DoF.png`
  - `Sistemas Lineales` → `sistemas_lineales.png`
- [x] **Sistema completamente operativo** — login + 3 robots con imágenes en `http://localhost:8082/vr-isa/` ✓
- [x] **rip-js-server integrado** — clonado de jcsombria/rip-js-server, Dockerfile y .dockerignore creados, añadido al docker-compose.yml en puerto 2055
  - Usa `DummyServer` + `TestBoard` (sin robot real) — arranca sin errores
  - Bug corregido en `rip-js-server/rip/DummyServer.js`: parámetro `info` de `init()` machacaba el método `DummyServer.info`. Renombrado a `this.labInfo` y añadido método `setInfo()`
- [x] **3 apaños temporales eliminados** — la aplicación está completa sin parches:
  - `ReNoLabs/src/views.js`: `ActivityManager.getSession().connect(res.socket)` restaurado (con null-check)
  - `ReNoLabs/src/templates/remote_lab.ejs`: comentarios de apaño eliminados, localhost mantenido
  - `vrisa/src/components/RemoteLab.vue`: bloque DOMParser eliminado, restaurado `lab.html = config`

- [x] **Export de LabInstance corregido** — `vrisa/src/assets/LabControl.js` no tenía `export { LabInstance }` al final del archivo. Sin eso, `import { LabInstance }` devolvía `undefined`, `new LabInstance(...)` lanzaba TypeError y el componente RemoteLab.vue no renderizaba nada (página en blanco sin botón). Añadida la línea al final del archivo y reconstruido vrisa.
- [x] **Las 3 actividades verificadas y funcionando**:
  - Air Flow Levitation → carga simulación completa con cámara real, gráficas, controles PID ✓
  - Robot DOBOT Magician → carga simulación 3D con Control Cartesiano, Control Articular, Programación ✓
  - Sistemas Lineales → carga descripción + botón Comenzar Actividad ✓
  - Restricción de diseño: solo una actividad activa por usuario a la vez ("Only one activity is allowed at the same time") — comportamiento correcto del sistema

- [x] **DOBOT M1 integrado como 4ª actividad** — clonado del Magician y adaptado a las especificaciones reales del M1:
  - Vista `DOBOTM1_LaboratorioRemoto` importada en ReNoLabs con UUID `6a8f4d06-4d65-462d-b321-a79a8e12878c`
  - Actividad "Robot DOBOT M1" creada en MySQL y asignada al usuario admin
  - Foto real del laboratorio (`DobotM1.jpg`) en `vrisa/public/activities/` y MySQL
  - vrisa reconstruido → la actividad aparece en `http://localhost:8082/vr-isa/` con foto real
  - **Rangos adaptados al M1**: J1 ±85°, J2 ±135°, J3 10–235mm (lineal→visual 0–90°), J4 ±360°
  - **Valores iniciales**: j1=0°, j2=0°, j3=120mm, j4=0°
  - Página de introducción reescrita con especificaciones técnicas reales del DOBOT M1
  - Las 3 actividades anteriores NO fueron modificadas
- [x] **Problema SCARA identificado** — el modelo 3D del M1 usa geometría del Magician (brazo vertical). Se analizaron los 5 cambios exactos necesarios en `Simulation.xhtml` y se documentaron en CLAUDE.md con números de línea.
- [x] **M1 restaurado al modelo inicial funcional** — tras intentar corrección cinemática SCARA (que rompió la simulación), se restauró al modelo base del Magician con límites M1 correctos: J1 ±85°, J2 ±135°, J3 90° visual, J4 ±360°, j2=0°, j3=120mm inicial. El modelo 3D es el del Magician (brazo vertical articulado) — funciona correctamente aunque no tenga forma SCARA visual.
- [x] **M1 confirmado en MySQL** — actividad "Robot DOBOT M1" en tabla `Activities`, foto `DobotM1.jpg`, asignada al usuario admin. Igual que los otros 3 robots.
- [x] **Pestañas Control fusionadas** — "Control Cartesiano" y "Control Articular" fusionadas en una sola pestaña "Control". Dentro hay dos checkboxes `☑ Control Cartesiano` / `☐ Control Articular` que alternan la vista usando `Display: block/none` (sin desplazamiento de layout). Pestaña "Programación" permanece igual. Resultado: `["Control", "Programación"]` en lugar de `["Control Cartesiano", "Control Articular", "Programación"]`.
- [x] **Bootstrap modernización del DOBOT M1** — `DOBOTM1_LaboratorioRemoto_Simulation.xhtml` reescrito para usar Bootstrap 5 igual que el Magician del profesor:
  - HEAD: Bootstrap Icons CSS, Bootstrap JS bundle, ace.js, peggy.js añadidos
  - Estructura Bootstrap: `MainPanel(container-fluid)` → `FirstRow(row row-cols-12)` → `VisualPanel(col col-9)` + `EvolutionPanel(col col-3)`
  - Tabs Bootstrap: `ControlPanel(row)` con HTML de nav tabs + `ContentPanel(tab-content container)` → `CartesianPanel(tab-pane fade show active)` + `JointsPanel(tab-pane fade)` + `ProgrammingPanel(tab-pane fade container-fluid)`
  - Botones: `panel2(row)` → `Botones` → `connStatus` + `statusLabel` (imageAndTextButton) + `Home(btn btn-primary)` + `Stop(btn btn-danger mx-2)`
  - `DobotController` class añadida (extiende `Controller` del LabControl.js)
  - ACE editor initialization con syntax highlighting ACL
  - Variables `conn_status`, `status`, `vm`, `codeEditor` añadidas — con try-catch para `ACLVirtualMachine` (no disponible en esta versión de ejsS)
  - LinkProperties para connStatus/statusLabel añadidas
  - Acciones Guardar/Cargar/Ejecutar/Depurar con Bootstrap Icons añadidas
  - Desplegado en Docker via `docker cp` → UUID `6a8f4d06-4d65-462d-b321-a79a8e12878c`

- [x] **Librerías externas del M1 servidas en local** — problema identificado: Bootstrap JS, Bootstrap Icons, ACE editor y peggy.js se cargaban desde CDNs externos. Con conexión de móvil (o internet lento) la simulación se quedaba colgada esperando esos scripts. Solución:
  - Archivos descargados y guardados en `dobot_m1_view/_ejs_library/local_libs/`:
    - `bootstrap.bundle.min.js` (Bootstrap 5.0.2 JS + Popper — necesario para tabs)
    - `ace.js` (ACE editor 1.14.0 — editor de código en pestaña Programación)
    - `peggy.min.js` (peggy 5.1.0 — parser ACL)
    - `bootstrap-icons/bootstrap-icons.css` + `fonts/bootstrap-icons.woff2` + `.woff` (iconos en botones)
  - XHTML actualizado para usar rutas locales (`_ejs_library/local_libs/...`)
  - La simulación ahora funciona **100% sin internet** — solo necesita Bootstrap CSS (ya estaba, igual que el Magician)
  - Desplegado en Docker via `docker cp`

- [x] **Bootstrap M1 probado y funcionando** ✅ — Simulación completamente operativa tras resolver bugs:
  - **Bug 1 resuelto**: `ReferenceError: Controller is not defined` (línea 1977) — `DobotController extends Controller` fallaba porque `Controller` viene de LabControl.js que el Magician carga del servidor pero el M1 no. Fix: añadir `if (typeof Controller === 'undefined') var Controller = class {};` antes de la clase.
  - **Bug 2 resuelto**: Pantalla en blanco — el bug de Controller impedía toda inicialización EjsS. Se añadió capturador de errores en el load handler para diagnosticar.
  - **Layout corregido**: `PlottingPanel` tenía `flex-row` (gráficas lado a lado) → cambiado a `flex-column` (gráficas apiladas verticalmente). Altura 400→560px.
  - **CSS init ampliado**: añadidos `EvolutionPanel`, `PlottingPanel`, `CartesianPlotPanel`, `JointsPlotPanel` al `removeProperty('display')`.
  - **Botones Programación**: textos simplificados a `Guardar`, `Cargar`, `Ejecutar`, `Depurar` (sin Bootstrap Icons, sin mayúsculas). Ejecutar con fondo verde `#28a745`.
  - **Botones barra inferior**: `Home` y `Stop` con texto plano (sin iconos).
  - **Resultado final**: 3 cámaras (Cámara derecha/superior/izquierda) en la parte superior, tabs Bootstrap funcionando, gráficas apiladas en col-3, barra de estado correcta — idéntico al diseño de referencia.

### Pendiente
- [ ] **🔴 BUG ACTIVO — Hueco en Control Cartesiano (DOBOT M1)** — En la pestaña "Control Cartesiano" aparece un hueco horizontal entre el panel "Movimientos Incrementales" y el panel "Velocidad JOG". Control Articular y Programación están perfectos, solo falla Cartesiano.
  - **Causa raíz identificada**: EjsS aplica automáticamente `margin-left: auto; margin-right: auto` a todos los paneles. En un contenedor flex (`d-flex`), `margin: auto` absorbe el espacio libre y separa los bloques.
  - **Solución correcta**: El Magician del profesor tiene `_view.panelVelocidadJOG3.linkProperty("CSS", {"margin-left":"0px","margin-right":"0px"})` que fuerza los márgenes a 0 en cada fotograma. Nuestro M1 tenía esta línea para `panelIncrementales` pero le faltaba para `panelVelocidadJOG3`.
  - **Estado actual (2026-05-13)**: Añadida la línea `linkProperty` para `panelVelocidadJOG3` en [dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml](dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml) (tras línea 3382) + fix JavaScript con `setProperty(..., 'important')` antes del `</body>`. **Pendiente de verificar en casa** — no se confirmó si el último despliegue resuelve el problema.
  - **Intentos fallidos registrados (para no repetirlos)**:
    1. `setProperty("CSS",{"margin-right":"0px"})` en panelIncrementales → EjsS lo sobrescribe
    2. `panel4` de `d-flex` a `d-flex flex-wrap` → no era la causa raíz
    3. Mover `panel5` como hermano de `panel4` → mejora estructura pero no el hueco
    4. `ClassName: "me-0"` en panelIncrementales → Bootstrap !important no suficiente
    5. Combinación `d-flex flex-wrap` + `linkProperty` márgenes → fallido
    6. `linkProperty` con `margin-left` y `margin-right` para panelIncrementales y panelModo → faltaba panelVelocidadJOG3
    7. `<style> #panel4 > div { margin-left: 0 !important; margin-right: 0 !important; }` → no funcionó (posiblemente selector no coincide con el DOM de EjsS)
    8. JavaScript `element.style.setProperty('margin-left','0px','important')` antes de `</body>` → no confirmado
  - **Próximo paso al retomar**: Verificar en `http://localhost:8082/vr-isa/` → Robot DOBOT M1 → Control → Control Cartesiano. Si el hueco persiste, investigar con las DevTools del navegador (F12 → Inspector → buscar `#panel4` y ver qué estilos CSS están activos en sus hijos).

- [ ] **Eliminar código debug** — quitar el `window.onerror` y el try-catch añadidos al load handler de `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml` (líneas 5029-5055). Son herramientas de diagnóstico temporales.
- [ ] **Cinemática SCARA del DOBOT M1** — OPCIONAL, de momento el modelo funciona con geometría Magician. Ver sección "PENDIENTE: Corrección cinemática SCARA" si se quiere retomar.
- [ ] Conectar rip-js-server a robot real cuando el profesor lo indique
- [/] Subida a GitHub en curso (URL corregida, pendiente push final)
- [ ] Entregar repositorio al profesor

---

## Entrega al Profesor

El proyecto se entregará mediante un repositorio de **GitHub**. El profesor ejecutará `docker-compose up --build` para levantar todo el entorno. Se le proporcionará el `.env.example` con los campos vacíos.

---

## Notas técnicas sobre la documentación

### LabControl.js — Explicación para el profesor

vrisa necesita el archivo `LabControl.js` en `vrisa/src/assets/` para arrancar. Este archivo **no estaba en el repositorio de vrisa** pero sí estaba en `ReNoLabs/src/client/LabControl.js`.

Tiene sentido que esté ahí porque ReNoLabs es un framework que incluye tanto el servidor como el código cliente. La carpeta `src/client/` contiene el código que el backend proporciona al frontend para que puedan comunicarse.

**Solución aplicada:** copiar el archivo de `ReNoLabs/src/client/LabControl.js` → `vrisa/src/assets/LabControl.js`

**Si el profesor pregunta:** se le explica que vrisa importa `LabControl.js` desde `@/assets/` y que ese archivo existe en el propio repositorio ReNoLabs dentro de `src/client/`, por lo que es correcto usarlo así ya que es el código cliente que ReNoLabs proporciona para comunicarse con el servidor.

---

### ⚠️ Modificaciones realizadas al código del profesor — MUY IMPORTANTE

Estos cambios son locales (no están en el GitHub del profesor). Si se clona ReNoLabs de cero hay que volver a aplicarlos.

#### 1. `ReNoLabs/src/models.js`
```js
// ANTES (original del profesor):
host: '127.0.0.1',
dialect: 'mariadb',
// DESPUÉS (nuestra corrección):
host: 'vrlabs_db',
dialect: 'mysql',
```
**Por qué host:** `127.0.0.1` dentro de un contenedor Docker apunta al propio contenedor, no a MySQL. Hay que usar el nombre del servicio Docker como hostname.
**Por qué dialect:** Cambiado de `mariadb` a `mysql` porque usamos MySQL 8.0.

#### 2. `ReNoLabs/src/settings.js`
```js
// ANTES:
DB_SERVER: 'mariadb',
MARIADB_DATABASE: 'renolabs',
MARIADB_USER: 'renolabs',
MARIADB_PASSWORD: 'renolabs',
ACCESS_TOKEN_SECRET: '',       // ← JWT no arrancaba por estar vacío
REFRESH_TOKEN_SECRET: '',

// DESPUÉS:
DB_SERVER: 'mariadb',
MARIADB_DATABASE: process.env.MYSQL_DATABASE || 'renolabs',
MARIADB_USER: process.env.MYSQL_USER || 'renolabs',
MARIADB_PASSWORD: process.env.MYSQL_PASSWORD || 'renolabs',
ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'vrlabs_secret_2024',
REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'vrlabs_refresh_2024',
```
**Por qué ACCESS_TOKEN_SECRET:** JWT lanzaba error `JwtStrategy requires a secret or key` con el string vacío — el servidor no arrancaba.

#### 3. `ReNoLabs/docker/docker-compose.yml`
- `vrlabs_db`: cambiado de `image: mariadb` a `image: mysql:8.0`
- Credenciales MySQL: `MYSQL_ROOT_PASSWORD: admin`, `MYSQL_DATABASE: renolabs`, `MYSQL_USER: renolabs`, `MYSQL_PASSWORD: renolabs`
- Volumen persistente añadido: `vrlabs_mysql_data:/var/lib/mysql` — los datos sobreviven reinicios
- `depends_on: vrlabs_db` añadido en vrlabs_node — MySQL arranca antes que ReNoLabs
- Puerto cambiado de `"80:80"` a `"80:8080"` — el servidor Node.js escucha en 8080, no en 80

**Por qué MySQL en vez de MariaDB:** El profesor no recordaba las credenciales de MariaDB. Pidió usar MySQL con credenciales simples (root/admin). MySQL no estaba descargado — se descarga con `docker pull mysql:8.0`.

#### 4. `vrisa/Dockerfile` — etapa de build
```dockerfile
# Añadido entre COPY . . y RUN npm run build:
RUN sed -i "s|http://147.96.71.236|http://localhost|g" src/main.js
```
**Por qué:** main.js del profesor tiene la IP de su servidor remoto fija. Con este sed se sustituye durante el build sin tocar el fuente original.

#### 5. Usuario admin — insertar tras primer arranque
Una vez que Sequelize crea las tablas automáticamente (`sequelize.sync()` en models.js línea 225), insertar el usuario administrador:
```bash
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  INSERT INTO Users (username, displayName, password, isAdmin, permissions, createdAt, updatedAt)
  VALUES ('admin', 'Administrador', 'admin', true, 'admin,user', NOW(), NOW());"
```
Credenciales de acceso: `admin` / `admin` en `http://localhost:8082/vr-isa/`

#### 6. Base de datos `renolabs` — creada automáticamente por MySQL
A diferencia de MariaDB (donde hubo que crearla manualmente), MySQL crea la base de datos automáticamente gracias a la variable `MYSQL_DATABASE: renolabs` en docker-compose.

#### 7. `ReNoLabs/docker/docker-compose.yml` — puerto corregido a 8080
```yaml
# ANTES:
ports:
  - "80:80"
# DESPUÉS:
ports:
  - "80:8080"
```
**Por qué:** El servidor Node.js escucha en el puerto 8080 (definido en `AppConfig.js`). El mapeo original `80:80` enviaba el tráfico al puerto 80 del contenedor donde no hay nada escuchando.

#### 8. `ReNoLabs/src/config/AppConfig.js` — IP cambiada a 0.0.0.0
```js
// ANTES:
ip: "127.0.0.1",
// DESPUÉS:
ip: "0.0.0.0",
```
**Por qué:** Con `127.0.0.1` el servidor solo escucha en el loopback interno del contenedor. Docker no puede enrutar tráfico externo al loopback — necesita que el servidor escuche en `0.0.0.0` (todas las interfaces). Sin este cambio las peticiones de vrisa llegaban al contenedor pero no alcanzaban el servidor Node.

#### 9. `ReNoLabs/src/views.js` — ✅ RESTAURADO (apaño eliminado)

```js
// ANTES (original del profesor):
ActivityManager.getSession(activity, user).connect(res.socket);
return res.render('remote_lab.ejs', {...});

// DESPUÉS (apaño):
// ⚠️ APAÑO TEMPORAL — Sin rip-js-server la conexión de socket falla.
// Se comenta para poder ver la interfaz gráfica sin el servidor del robot.
// ELIMINAR cuando rip-js-server esté activo.
// ActivityManager.getSession(activity, user).connect(res.socket);
return res.render('remote_lab.ejs', {...});
```

**Por qué:** `ActivityManager.getSession().connect(res.socket)` requiere rip-js-server activo. Sin él lanza excepción y el alumno no puede ver la interfaz.

#### 10. `ReNoLabs/src/templates/remote_lab.ejs` — ✅ RESTAURADO (apaño eliminado)

```html
<!-- ANTES (original del profesor): -->
<iframe src="http://147.96.71.236/views/<%= view %>"></iframe>

<!-- DESPUÉS (apaño): -->
<!-- ⚠️ APAÑO TEMPORAL — IP cambiada de 147.96.71.236 a localhost para despliegue local -->
<!-- ELIMINAR este comentario y restaurar la IP original cuando se despliegue en el servidor del profesor -->
<iframe class="container-fluid vh-100" src="http://localhost/views/<%= view %>"></iframe>
```

**Por qué:** La IP original apunta al servidor del profesor (147.96.71.236). Para desarrollo local hay que usar localhost.

#### 11. `vrisa/src/components/RemoteLab.vue` — ✅ RESTAURADO (apaño eliminado)

El modo "extern" en vrisa usa `v-html` para renderizar el HTML del servidor. **Problema:** `v-html` no ejecuta `<script>` por seguridad, así que `LAB_KEY` nunca se define en el contexto del iframe de la simulación y esta no puede inicializarse.

**Apaño:** se extrae la URL del iframe de la respuesta HTML y se crea un iframe limpio con dimensiones explícitas.

```js
// ⚠️ APAÑO TEMPORAL — v-html no ejecuta <script>, así que LAB_KEY nunca se define.
// Se parsea la URL del iframe de la respuesta y se usa directamente.
// ELIMINAR cuando rip-js-server esté activo y usar el modo built-in.
try {
  const parser = new DOMParser();
  const doc = parser.parseFromString(config, 'text/html');
  const iframeSrc = doc.querySelector('iframe')?.getAttribute('src');
  lab.html = iframeSrc
    ? `<iframe style="width:100%;height:80vh;border:0;" src="${iframeSrc}"></iframe>`
    : config;
} catch(e) {
  lab.html = config;
}
```

**Resultado:** La simulación se muestra en modo "desconectado" (sin datos del robot real) pero la interfaz gráfica es visible. Requiere reconstruir vrisa: `docker-compose up --build vrisa -d`.

---

### Añadir un nuevo robot al laboratorio

Ver documento completo: `documentacion/nuevo_robot_laboratorio.md`

**Resumen de lo que se necesita:**
1. **Foto del robot** — PNG o JPG → copiar a `vrisa/src/assets/activities/` y reconstruir vrisa (`docker-compose up --build vrisa -d`)
2. **Nombre** de la actividad
3. **Controller ZIP** — con `_metadata.txt` dentro (lo prepara el profesor) → copiar a `ReNoLabs/fixtures/`
4. **View ZIP** — con `_metadata.txt` dentro (lo prepara el profesor) → copiar a `ReNoLabs/fixtures/`

Después: añadir al script `import_fixtures.js`, ejecutarlo, asignar imagen y usuario en MySQL.

---

### Importar fixtures — cómo volver a hacerlo desde cero

Si alguna vez hay que borrar todo y reimportar los robots:

```bash
# 1. Borrar datos importados (vuelve al estado solo con admin)
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  DELETE FROM UserActivities;
  DELETE FROM Activities;
  DELETE FROM Controllers;
  DELETE FROM Views;"

# 2. Borrar archivos extraídos dentro del contenedor
docker exec docker-vrlabs_node-1 rm -rf /home/node/app/var/controllers/*
docker exec docker-vrlabs_node-1 rm -rf /home/node/app/var/views/*
docker exec docker-vrlabs_node-1 rm -rf /home/node/app/public/views/*

# 3. Volver a importar con el script
docker exec docker-vrlabs_node-1 node //home/node/app/import_fixtures.js

# 4. Asignar imágenes
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  UPDATE Activities SET image = 'Dobot.png'             WHERE name = 'Robot DOBOT Magician';
  UPDATE Activities SET image = 'Hover3DoF.png'         WHERE name = 'Air Flow Levitation';
  UPDATE Activities SET image = 'sistemas_lineales.png'  WHERE name = 'Sistemas Lineales';"
```

**Nota:** el script `import_fixtures.js` está en `ReNoLabs/import_fixtures.js` y se ejecuta siempre con `//` (doble barra) por el Git Bash de Windows.

---

### Cómo funcionan las Actividades (robots) — MUY IMPORTANTE

Las actividades/robots **NO están en el código** — viven en MySQL y se gestionan dinámicamente.

Para que un robot aparezca en la pantalla del alumno se necesitan 4 pasos:
1. **Subir Controller ZIP** → ReNoLabs lo descomprime en `var/controllers/` y crea registro en tabla `Controllers`
2. **Subir View ZIP** → ReNoLabs lo descomprime en `var/views/` y crea registro en tabla `Views`
3. **Crear Activity** → enlaza un controller con una view → registro en tabla `Activities`
4. **Asignar Activity al usuario** → registro en tabla `UserActivities`

El profesor hace todo esto desde el **panel de administración**: `http://localhost:8082/vr-isa/#/admin`

Los ZIPs de ejemplo están en `ReNoLabs/fixtures/`:
- `Controller_DOBOT.zip`, `Controller_Arduino.zip`, `Controller_TwinCAT.zip`…
- `View_DOBOTMagician.zip`, `View_AirLevitation.zip`, `View_Sistemas Lineales.zip`…

**Actividad de prueba insertada manualmente en MySQL (solo para verificar funcionamiento):**
```bash
# Crear actividad de prueba (sin controller/view reales — solo para probar que aparece en pantalla)
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  INSERT INTO Activities (name, sessionTimeout, disconnectTimeout, controllerName, viewName, state, createdAt, updatedAt)
  VALUES ('Robot DOBOT Magician', 30, 10, 'Controller_DOBOT', 'View_DOBOT', 'idle', NOW(), NOW());"

# Asignar al usuario admin
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  INSERT INTO UserActivities (UserUsername, ActivityName, createdAt, updatedAt)
  VALUES ('admin', 'Robot DOBOT Magician', NOW(), NOW());"
```
Esta actividad de prueba aparece en la pantalla pero si se intenta entrar dará error (no tiene archivos reales detrás).

---

### vrisa en Docker — Cómo funciona

vrisa usa un **build multi-etapa**:
1. **Etapa 1 (build):** `node:18-alpine` instala dependencias y ejecuta `npm run build` → genera la carpeta `dist/` con los ficheros HTML/CSS/JS listos para producción.
2. **Etapa 2 (serve):** `nginx:alpine` copia la carpeta `dist/` a `/usr/share/nginx/html/vr-isa` y sirve la app.

La ruta `/vr-isa` es importante porque `vue.config.js` tiene `publicPath: '/vr-isa'` — nginx debe servir en esa misma ruta.

**LabControl.js en Docker:** El `Dockerfile` copia todo el directorio `vrisa/` al contenedor, incluyendo `vrisa/src/assets/LabControl.js`. Si el profesor actualiza `LabControl.js` en GitHub, hay que:
1. Hacer `git pull` en `ReNoLabs/`
2. Copiar el archivo: `cp ReNoLabs/src/client/LabControl.js vrisa/src/assets/`
3. Reconstruir: `docker-compose up --build vrisa`

### diagrama_interactivo.html
- Usa la librería **vis-network.js v9.1.9** almacenada **localmente** en `documentacion/lib/` — funciona sin internet.
- Para abrirlo: doble clic en el archivo → se abre en el navegador. También: `start documentacion\diagrama_interactivo.html`
- Nodos arrastrables, zoom con rueda del ratón, botón "Restablecer" para volver a posición original.
- Animación de partículas: puntos de colores con halo que viajan por cada flecha siguiendo su curva bezier.
  - Flechas de ida (peticiones): partículas grandes y brillantes en el color del servicio
  - Flechas de vuelta (respuestas): partículas pequeñas y tenues
  - Etiquetas de flechas: blanco (ida) y amarillo dorado (vuelta) con borde oscuro para contraste

### arquitectura_microservicios.md
- Contiene diagrama Mermaid — se renderiza en GitHub automáticamente o con la extensión "Markdown Preview Mermaid Support" en VS Code.
- En VS Code sin extensión se ve como texto plano — esto es normal.

---

## Simulación DOBOT M1 — Integración completa ✓ / Funcionando ✓

### Estado actual
- **Infraestructura**: 100% lista — actividad visible en vrisa, foto real, en MySQL, asignada a admin.
- **Modelo 3D**: ✅ Funciona — usa geometría del Magician (brazo vertical) con límites reales del M1. Corrección SCARA opcional (ver sección de pendientes).
- **UI Fusionada**: ✅ Pestañas "Control Cartesiano" y "Control Articular" fusionadas en "Control" con selector de checkbox.

### Archivos del M1
```
ReNoLabs/fixtures/View_DOBOTM1.zip                    ← ZIP importable en ReNoLabs
ReNoLabs/import_m1.js                                 ← script de importación SOLO M1
vrisa/public/activities/DobotM1.jpg                   ← foto real del laboratorio
dobot_m1_view/                                        ← archivos fuente (EDITAR AQUÍ)
  DOBOTM1_LaboratorioRemoto_Simulation.xhtml          ← archivo principal (~5500 líneas)
  DOBOTM1_LaboratorioRemoto_Intro_1.html              ← introducción con specs reales M1
  DOBOTM1_LaboratorioRemoto_Contents.xhtml            ← tabla de contenidos/tabs
  DOBOTM1_LaboratorioRemoto.xhtml                     ← página principal
  _metadata.txt                                       ← metadatos del ZIP
  _ejs_library/local_libs/                            ← librerías externas servidas en LOCAL (sin internet)
    bootstrap.bundle.min.js                           ← Bootstrap 5.0.2 JS + Popper (tabs)
    ace.js                                            ← ACE editor 1.14.0
    peggy.min.js                                      ← peggy 5.1.0 (parser ACL)
    bootstrap-icons/
      bootstrap-icons.css                             ← Bootstrap Icons 1.3.0 CSS
      fonts/bootstrap-icons.woff2                     ← fuente de iconos
      fonts/bootstrap-icons.woff                      ← fuente de iconos (fallback)
dobot_m1_sim_work/                                    ← extracción original Magician (referencia)
```

### Vista importada en Docker
- **UUID**: `6a8f4d06-4d65-462d-b321-a79a8e12878c`
- Ruta en contenedor: `/home/node/app/public/views/6a8f4d06-4d65-462d-b321-a79a8e12878c/`
- Controlador reutilizado: `DOBOT Controller` (mismo que el Magician)

### Adaptaciones ya aplicadas al Simulation.xhtml

| Cambio | Magician | M1 actual |
|--------|----------|-----------|
| Nombre | `DOBOTMagician_LaboratorioRemoto` | `DOBOTM1_LaboratorioRemoto` |
| Actividad | `'Dobot Magician'` | `'DOBOT M1'` |
| J1 límite | 155° | **85°** |
| J2 límite superior | 130° | **135°** |
| J2 límite inferior | -35° | **-135°** |
| J3 cinemática | angular (°) | `j3/235 * PI/2` (normalizado, ⚠️ pendiente mejorar) |
| J3 límite visual | 130° | **90°** |
| J4 límite | 570° | **360°** |
| j1 inicial | — | **0°** |
| j2 inicial | 45° | **0°** |
| j3 inicial | 45° | **120mm** |
| j4 inicial | — | **0°** |
| Foto | dobot.JPG | **dobotm1.jpg** |
| Intro HTML | Descripción Magician | **Specs reales del M1** |

---

## ⚠️ PENDIENTE: Corrección cinemática SCARA del DOBOT M1

### El problema
El DOBOT M1 es un robot **SCARA** (brazo horizontal), pero la simulación usa el modelo
cinemático del **Magician** (brazo vertical articulado). Diferencias clave:

| Aspecto | Magician (actual en M1) | M1 real (SCARA) |
|---------|------------------------|-----------------|
| J1 | Rotación horizontal base | Rotación horizontal base ✓ |
| J2 (thetaH) | **Pitch vertical** (hombro sube/baja) | **Rotación horizontal** (antebrazo en plano XY) |
| J3 (thetaC) | **Ángulo de codo** (arriba/abajo) | **Traslación lineal Z** (eje tornillo, mm) |
| J4 (thetaR) | Rotación efector | Rotación efector ✓ |

### Archivo a modificar
`dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`

### Cambios necesarios (con números de línea exactos)

#### Cambio 1 — Sincronizacion (línea 2035): J3 normalizado
```js
// ANTES (actual):
thetaC = (j3 / 235.0) * (Math.PI / 2);  // ángulo — INCORRECTO para SCARA

// DESPUÉS:
thetaC = j3 / 235.0;  // normalizado 0-1 (0=arriba, 1=abajo)
```

#### Cambio 2 — posicion() (líneas 1898-1905): cinemática directa SCARA
```js
// ANTES (Magician vertical):
function posicion(t1, t2, t3, t4) {
  x = Math.cos(t1)*(l3*Math.cos(t3)-l2*Math.cos(t2+ang90)) + Math.cos(t1)*(41+18);
  y = Math.sin(t1)*(l3*Math.cos(t3)-l2*Math.cos(t2+ang90)) + Math.sin(t1)*(41+18);
  z = -l3*Math.sin(t3)+l2*Math.sin(t2+ang90);
  R = t4 + t1;
  xyzr = [x, y, z, R];
  return xyzr;
}

// DESPUÉS (SCARA horizontal — L1=L2=200mm, total reach=400mm):
function posicion(t1, t2, t3, t4) {
  var L1 = 200; // rear arm mm (brazo trasero)
  var L2 = 200; // forearm mm (antebrazo)
  x = L1*Math.cos(t1) + L2*Math.cos(t1+t2);
  y = L1*Math.sin(t1) + L2*Math.sin(t1+t2);
  z = t3 * 235.0;  // normalizado → mm (0=arriba, 235=abajo)
  R = t1 + t2 + t4;
  xyzr = [x, y, z, R];
  return xyzr;
}
```

#### Cambio 3 — inversa() (líneas 1907-1938): cinemática inversa SCARA
```js
// ANTES (Magician, 3R vertical — incorrecto para SCARA):
function inversa(px, py, pz, p) { ... }  // usa a2, a3, d1, d5 — INCORRECTO

// DESPUÉS (SCARA IK — solución "righty"):
function inversa(px, py, pz, p) {
  var L1 = 200; var L2 = 200;
  var r2 = px*px + py*py;
  var cos_t2 = (r2 - L1*L1 - L2*L2) / (2*L1*L2);
  cos_t2 = Math.max(-1, Math.min(1, cos_t2));
  var sin_t2 = Math.sqrt(1 - cos_t2*cos_t2); // righty
  t2 = Math.atan2(sin_t2, cos_t2);
  var alpha = Math.atan2(py, px);
  var beta  = Math.atan2(L2*sin_t2, L1 + L2*cos_t2);
  t1 = alpha - beta;
  t3 = pz / 235.0; // mm → normalizado
  t4 = p - t1 - t2;
  t1234 = [t1, t2, t3, t4];
  return t1234;
}
```

#### Cambio 4 — cx/cy/cz iniciales (líneas 1847-1850): posición inicial SCARA
```js
// ANTES (Magician, fórmulas incorrectas):
cx = Math.cos(thetaB+ang90)*(a1+a3*Math.cos(...)+...);
cy = Math.sin(thetaB+ang90)*(...);
cz = d1+a2*Math.sin(thetaH)+...;
cp = -ang90;

// DESPUÉS (SCARA home position = 400mm en X):
cx = 200*Math.cos(thetaB) + 200*Math.cos(thetaB+thetaH);  // ≈ 400 en reposo
cy = 200*Math.sin(thetaB) + 200*Math.sin(thetaB+thetaH);  // ≈ 0 en reposo
cz = thetaC * 235.0;                                        // mm (0 en reposo)
cp = thetaB + thetaH + thetaR;                              // orientación efector
```

#### Cambio 5 — Ángulos de vista 3D (líneas 2871, 2879, 2889-2890): modelo SCARA
```js
// Línea 2871 — q1_alpha: eliminar el giro de 90° (SCARA no tiene pitch)
// ANTES: _view.q1_alpha.linkProperty("Angle", function() { return ang90; }, ...)
// DESPUÉS:
_view.q1_alpha.linkProperty("Angle", function() { return 0; });

// Línea 2879 — q2_theta: rotación horizontal del antebrazo (J2)
// ANTES: _view.q2_theta.linkProperty("Angle", function() { return -(thetaH+ang90); })
// DESPUÉS:
_view.q2_theta.linkProperty("Angle", function() { return thetaH; });

// Línea 2889 — q3_theta: sin ángulo de codo (J3 es lineal)
// ANTES: _view.q3_theta.linkProperty("Angle", function() { return -thetaC+(thetaH+ang90); })
// DESPUÉS:
_view.q3_theta.linkProperty("Angle", function() { return 0; });

// Línea 2890 — J3: añadir traslación Z para el movimiento lineal de J3
// ANTES: _view.J3.linkProperty("X", function() { return a3; }, ...)
// DESPUÉS: mantener X=a3 Y agregar también Z:
_view.J3.linkProperty("Z", function() { return -thetaC * 2.5; }); // 0→0, 1→-2.5 unidades modelo
```

### Flujo para aplicar los cambios y probar

```bash
# 1. Editar dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml (los 5 cambios)

# 2. Reempaquetar el ZIP
cd "dobot_m1_view"
# En PowerShell: Compress-Archive -Force . ..\ReNoLabs\fixtures\View_DOBOTM1.zip
# En Git Bash: zip -r ../ReNoLabs/fixtures/View_DOBOTM1.zip .

# 3. Copiar ZIP y script al contenedor
docker cp "ReNoLabs/fixtures/View_DOBOTM1.zip" docker-vrlabs_node-1:/home/node/app/fixtures/
docker cp "ReNoLabs/import_m1.js" docker-vrlabs_node-1:/home/node/app/

# 4. Reimportar (borra M1 anterior, crea uno nuevo)
docker exec docker-vrlabs_node-1 node /home/node/app/import_m1.js

# 5. Asignar imagen
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  UPDATE Activities SET image = 'DobotM1.jpg' WHERE name = 'Robot DOBOT M1';"

# 6. Verificar en http://localhost:8082/vr-isa/ → Robot DOBOT M1
```

> **IMPORTANTE**: Después de cada cambio en Simulation.xhtml, el contenedor ReNoLabs sirve el
> archivo directamente desde `/home/node/app/public/views/<UUID>/`. Para actualizar rápido
> sin reimportar, copiar solo el .xhtml modificado:
> ```bash
> docker cp "dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml" \
>   docker-vrlabs_node-1:/home/node/app/public/views/6a8f4d06-4d65-462d-b321-a79a8e12878c/
> ```
> Luego recargar el navegador (F5). No hace falta reconstruir vrisa.

### Rollback — cómo deshacer el M1 si es necesario
```bash
# Eliminar actividad M1 de MySQL (NO toca las otras 3)
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  DELETE FROM UserActivities WHERE ActivityName = 'Robot DOBOT M1';
  DELETE FROM Activities WHERE name = 'Robot DOBOT M1';
  DELETE FROM Views WHERE name = 'DOBOTM1_LaboratorioRemoto';"

# Eliminar archivos extraídos del contenedor
docker exec docker-vrlabs_node-1 rm -rf /home/node/app/public/views/6a8f4d06-4d65-462d-b321-a79a8e12878c
docker exec docker-vrlabs_node-1 rm -f /home/node/app/var/views/6a8f4d06-4d65-462d-b321-a79a8e12878c.zip

# Reconstruir vrisa (para quitar la foto del contenedor)
docker-compose up --build vrisa -d
```

### Reimportar el M1 desde cero
```bash
docker cp "ReNoLabs/fixtures/View_DOBOTM1.zip" docker-vrlabs_node-1:/home/node/app/fixtures/
docker cp "ReNoLabs/import_m1.js" docker-vrlabs_node-1:/home/node/app/
docker exec docker-vrlabs_node-1 node /home/node/app/import_m1.js
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  UPDATE Activities SET image = 'DobotM1.jpg' WHERE name = 'Robot DOBOT M1';"
docker-compose up --build vrisa -d
```

---

## Preferencias del Usuario

- Prefiere explicaciones claras y simples con analogías.
- Quiere documentación profesional.
- Hay que ir paso a paso, no adelantarse sin tener los recursos necesarios.
- Le gusta entender lo que se hace antes de ejecutarlo.
- Es un trabajo supervisado por un tutor universitario — no se pueden cometer errores.

---

*Actualizar este archivo cada vez que se complete una tarea o se tome una decisión técnica relevante.*

---

## Registro de trabajo — 2026-05-25

### Regla de documentación confirmada

- A partir de esta fecha, **todo cambio, problema, decisión, prueba, actualización, tarea pendiente o trabajo descartado debe quedar registrado en la documentación**, principalmente en este `CLAUDE.md`.
- Se permite editar y ampliar `CLAUDE.md`, pero **no borrar historial existente**. Las correcciones se documentan como nuevas notas o actualizaciones.

### Confirmación técnica sobre frontend

- `vrisa` es el frontend del proyecto y está construido con **Vue.js**.
- Node.js se usa para instalar dependencias y compilar la aplicación Vue durante el build. En Docker, el frontend compilado se sirve con **nginx**.
- El JavaScript de la interfaz lo ejecuta el **navegador del alumno**, no Node.js.
- Bootstrap se usa en la interfaz/simulaciones, especialmente en el DOBOT M1.

### Trabajo realizado — DOBOT M1 / Control Cartesiano

- Problema reportado: en la actividad **Robot DOBOT M1**, dentro de la interfaz gráfica, la pestaña **Control Cartesiano** mostraba separado el bloque `Movimientos Incrementales` respecto a `Velocidad JOG` y `Modo de PTP`.
- Alcance acordado: tocar solo este bloque; `Control Articular` y `Programación` estaban correctos y no debían modificarse funcionalmente.
- Archivo modificado: `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`.
- Cambios aplicados:
  - `#panel4` pasa de `display:flex` a `display:inline-flex` para que el contenedor se ajuste al ancho real de sus hijos.
  - Se fuerzan `margin`, `padding`, `flex` y `float` de `panelIncrementales`, `panelVelocidadJOG3` y `panelModo` para evitar que EjsS/Bootstrap generen espacio automático entre paneles.
  - Se actualizan las propiedades dinámicas `linkProperty("CSS")` de EjsS para mantener esos estilos durante la ejecución.
  - Se refuerza el script `fixCartesianLayout()` para ejecutarse al cargar y repetirse durante los primeros segundos, porque EjsS puede reescribir estilos después del primer render.
  - Se eliminó una segunda cabecera XML duplicada al inicio del `.xhtml`, porque podía volver inválido el documento al desplegar.
  - Se dejó una sola instancia `new LabInstance("localhost", "8080")`, igual que en la simulación de referencia del Magician, para evitar dobles conexiones no relacionadas con este ajuste visual.
- Despliegue realizado:
  - Copiado el `.xhtml` corregido al contenedor `docker-vrlabs_node-1` en:
    `/home/node/app/public/views/6a8f4d06-4d65-462d-b321-a79a8e12878c/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`
  - Verificado dentro del contenedor que el archivo desplegado contiene `inline-flex`, `panelVelocidadJOG3` y `cartesianFixTimer`.
- Estado: **pendiente de verificación visual final en navegador**. Recargar `http://localhost:8082/vr-isa/`, entrar a `Robot DOBOT M1` y revisar `Control > Control Cartesiano`.

### Actualización — DOBOT M1 / Control Cartesiano sigue separado

- Verificación del usuario: tras el primer arreglo, los bloques seguían apareciendo separados.
- Segunda corrección aplicada en `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`:
  - Se abandonó la solución basada solo en `inline-flex`, porque no resolvió la separación visual.
  - Se fijó `panel4` como contenedor `position: relative`, `display: block`, `width/min-width: 712px` y `height: 224px`.
  - Se cambió `panelIncrementales` de `Width 310` a `Width 410`, igual que la referencia del Magician y la fila inferior `Punto destino`.
  - Se posicionaron explícitamente los tres bloques:
    - `panelIncrementales`: `left: 0px`, `width: 410px`
    - `panelVelocidadJOG3`: `left: 410px`, `width: 150px`
    - `panelModo`: `left: 560px`, `width: 152px`
  - Se actualizó también `fixCartesianLayout()` con esas posiciones absolutas para reimponerlas tras el render de EjsS.
- Despliegue realizado de nuevo con `docker cp` al contenedor `docker-vrlabs_node-1`.
- Verificado dentro del contenedor que el archivo desplegado contiene `width: 712px`, `left: 410px` y `left: 560px`.
- Estado: **pendiente de nueva verificación visual en navegador**. Usar `Ctrl+F5` o limpiar caché del iframe si el navegador insiste en mostrar la versión anterior.

### Actualización — duplicado de vistas M1 y caché

- Se descubrió que MySQL tenía **dos registros** en `Views` con el mismo nombre `DOBOTM1_LaboratorioRemoto`:
  - `6a8f4d06-4d65-462d-b321-a79a8e12878c` creado el 2026-05-05.
  - `b7d5517b-aca9-4f05-b7b3-59e0e98355ec` creado el 2026-05-11.
- `ReNoLabs/src/views.js` usa `findOne({ where: { name: activity.viewName }, order: [['updatedAt', 'DESC']] })`, por lo que la vista activa es la más reciente (`b7d5517b...`).
- Se copió el `DOBOTM1_LaboratorioRemoto_Simulation.xhtml` corregido a **ambas carpetas** dentro del contenedor para eliminar la ambigüedad.
- Se verificó que ambas copias contienen `width: 712px`.
- Se modificó `ReNoLabs/src/templates/remote_lab.ejs` para añadir un parámetro de versión al iframe:
  - Antes: `http://localhost/views/<%= view %>`
  - Ahora: `http://localhost/views/<%= view %>?v=<%= Date.now() %>`
- Motivo: evitar que el navegador mantenga en caché una versión anterior de la simulación dentro del iframe.
- Se reinició `docker-vrlabs_node-1` para que Express cargue la plantilla EJS actualizada.
- Verificación posterior:
  - `docker-vrlabs_node-1` volvió a estar activo correctamente.
  - `remote_lab.ejs` dentro del contenedor contiene `?v=<%= Date.now() %>`.
  - La vista activa `b7d5517b...` contiene `width: 712px`.
- Estado: pendiente de que el usuario vuelva a entrar a la actividad o recargue la página para confirmar visualmente.

### Verificación de funcionamiento — 2026-05-25

- Contenedores activos:
  - `proyectorobot_universitario-vrisa-1`
  - `proyectorobot_universitario-backend-1`
  - `proyectorobot_universitario-rip-server-1`
  - `docker-vrlabs_node-1`
  - `docker-vrlabs_db-1`
  - `proyectorobot_universitario-db-1`
- `vrisa` responde correctamente:
  - `GET http://localhost:8082/vr-isa/` -> HTTP 200.
- Backend propio responde correctamente:
  - `GET http://localhost:3000/` -> HTTP 200, mensaje: `API Robot Universitario funcionando correctamente`.
- ReNoLabs responde correctamente en login:
  - `POST http://localhost/login` con `admin/admin` -> HTTP 200 y devuelve JWT.
- Vista activa del DOBOT M1 responde correctamente:
  - `GET http://localhost/views/b7d5517b-aca9-4f05-b7b3-59e0e98355ec/DOBOTM1_LaboratorioRemoto_Simulation.xhtml` -> HTTP 200.
  - Confirmado que el archivo servido contiene el arreglo `width: 712px`.
- Nota: `GET http://localhost/` devuelve HTTP 404. Esto no indica caída del sistema; la ruta raíz de ReNoLabs no sirve una página directa útil en esta configuración. La prueba válida es `/login` y las rutas `/views/...`.
- Estado general: **aplicación levantada y servicios principales funcionando**. Queda pendiente solo confirmar visualmente en navegador que el bloque de Control Cartesiano aparece unido.

### Correccion de error XHTML - DOBOT M1

- Problema reportado por el usuario: al entrar al DOBOT M1 aparecia arriba una caja roja del navegador con:
  - `This page contains the following errors`
  - `error on line 4803 at column 21: xmlParseEntityRef: no name`
- Causa identificada:
  - El script anadido para `fixCartesianLayout()` contenia `if (panel4 && targets.every(...))`.
  - En un archivo `.xhtml`, el caracter `&` debe escaparse si el script no esta dentro de CDATA.
  - El navegador interpretaba el primer `&` de `&&` como inicio de una entidad XML invalida, por eso mostraba `xmlParseEntityRef: no name`.
- Correccion aplicada:
  - Se cambio `&&` por `&amp;&amp;` en la condicion de `fixCartesianLayout()`.
  - El archivo local `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml` valida como XML (`XML OK`).
  - Se desplego de nuevo el `.xhtml` corregido en las dos carpetas M1 dentro del contenedor:
    - `6a8f4d06-4d65-462d-b321-a79a8e12878c`
    - `b7d5517b-aca9-4f05-b7b3-59e0e98355ec`
- Estado: pendiente de recarga visual en navegador para confirmar que desaparece la caja roja.

### Ajuste de alineacion final - DOBOT M1 Control Cartesiano

- Problema reportado por el usuario: aunque los bloques superiores ya estaban juntos, el conjunto superior no coincidia exactamente con la fila inferior (`Punto destino`, `Velocidad PTP`, `Efector Final`).
- Nueva decision de layout:
  - `panel4` y `panel5` deben tener el mismo ancho total: `712px`.
  - Ambos deben arrancar en la misma posicion horizontal.
  - La fila superior y la fila inferior usan las mismas columnas:
    - Columna 1: `left: 0px`, `width: 410px`
    - Columna 2: `left: 410px`, `width: 150px`
    - Columna 3: `left: 560px`, `width: 152px`
- Cambios aplicados en `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`:
  - CSS fijo para `#panel5`, `#panelPuntoDestino`, `#panelVelocidadPTP` y `#panelEfectorFinal`.
  - `linkProperty("CSS")` actualizado para esos mismos elementos.
  - `fixCartesianLayout()` ampliado con `bottomTargets` para reimponer la alineacion de la fila inferior igual que en la fila superior.
- Validacion:
  - Archivo local valida como XML (`XML OK`).
  - Desplegado en las dos carpetas M1 (`6a8...` y `b7d...`).
  - Vista activa `b7d...` responde HTTP 200 y contiene `panel5`, `bottomTargets` y `&amp;&amp;`.
- Estado: pendiente de confirmacion visual del usuario en navegador.

### Verificacion de las 4 actividades en la web principal - 2026-05-25

- Objetivo del usuario: asegurar que en la web principal funcionan las 4 actividades del laboratorio.
- Actividades verificadas en MySQL (`Activities`):
  - `Air Flow Levitation`
  - `Robot DOBOT Magician`
  - `Sistemas Lineales`
  - `Robot DOBOT M1`
- Las 4 actividades estan asignadas al usuario `admin` en `UserActivities`.
- Las 4 actividades tienen imagen configurada y accesible desde `vrisa`:
  - `Dobot.png` -> HTTP 200
  - `DobotM1.jpg` -> HTTP 200
  - `Hover3DoF.png` -> HTTP 200
  - `sistemas_lineales.png` -> HTTP 200
- Las 4 vistas principales responden HTTP 200:
  - Air Flow Levitation -> `AirLevitation_Remote_ReNoLabs_Simulation.xhtml`
  - Robot DOBOT Magician -> `DOBOTMagician_LaboratorioRemoto_Simulation.xhtml`
  - Sistemas Lineales -> `Bode_Simulation.xhtml`
  - Robot DOBOT M1 -> `DOBOTM1_LaboratorioRemoto_Simulation.xhtml`
- Login verificado:
  - `POST http://localhost/login` con `admin/admin` devuelve JWT.
- Flujo `request_activity` verificado una por una:
  - `Air Flow Levitation` -> OK, devuelve token de actividad.
  - `Robot DOBOT Magician` -> OK, devuelve token de actividad.
  - `Sistemas Lineales` -> OK, devuelve token de actividad.
  - `Robot DOBOT M1` -> OK, devuelve token de actividad.
- Nota importante:
  - ReNoLabs solo permite **una actividad activa por usuario al mismo tiempo**.
  - Al probar varias seguidas, las siguientes pueden devolver 401 con `Only one activity is allowed at the same time`.
  - Para verificar una por una se reinicio `docker-vrlabs_node-1` entre pruebas, liberando la sesion activa.
- Observaciones de logs:
  - En actividades con controlador DOBOT aparece `Error: spawn sudo ENOENT`. Esto ya ocurria al iniciar el controlador dentro del contenedor porque no existe `sudo`; aun asi `request_activity` devuelve token y la vista/simulacion carga. Es un tema del controlador/hardware real, no de que la actividad desaparezca de la web principal.
  - En Sistemas Lineales aparece `Adapter: stop is NOT Implemented...` al reiniciar/cortar, relacionado con el adaptador C.
- Estado final:
  - Se reinicio `docker-vrlabs_node-1` al terminar para dejar limpio el estado tras las pruebas.
  - Resultado: **las 4 actividades estan disponibles, asignadas, con imagen, vista accesible y flujo de inicio autorizado**.

### Cierre de sesion de trabajo - 2026-05-25

- El usuario confirma que por ahora se deja el trabajo y se retomara mas tarde.
- Reglas principales confirmadas para futuras sesiones:
  - No cambiar estructura del proyecto.
  - No cambiar puertos.
  - No cambiar conexiones base entre servicios.
  - No modificar arquitectura Docker ni nombres de servicios salvo autorizacion explicita.
  - Hacer cambios pequenos, controlados y documentados.
  - Registrar todo en `CLAUDE.md`.
- Puertos/conexiones que deben respetarse:
  - `vrisa`: `8082:80`
  - ReNoLabs: `80:8080`
  - MySQL ReNoLabs: `3307:3306`
  - Backend propio: `3000:3000`
  - MariaDB propia: `3308:3306`
  - `rip-js-server`: `2055:2055`
- Cambios realizados durante esta sesion:
  - Corregido layout del DOBOT M1 en `Control Cartesiano`.
  - Corregida alineacion entre fila superior e inferior del bloque cartesiano.
  - Corregido error XHTML `xmlParseEntityRef: no name`.
  - Copiado el `.xhtml` corregido a las dos vistas M1 existentes en el contenedor.
  - Detectado y documentado duplicado de vistas M1 en MySQL.
  - Anadido parametro anti-cache al iframe de `remote_lab.ejs`.
  - Verificadas las 4 actividades principales de la web.
- Estado al cerrar:
  - Aplicacion levantada.
  - Login `admin/admin` funcionando.
  - Las 4 actividades estan disponibles en MySQL y asignadas a `admin`.
  - Las 4 imagenes y vistas responden HTTP 200.
  - ReNoLabs fue reiniciado al final de las pruebas para limpiar sesiones activas.
- Pendiente para la proxima sesion:
  - Confirmar visualmente en navegador que el layout final del DOBOT M1 sigue correcto tras recarga.
  - Si se quiere limpiar tecnicamente el proyecto, revisar con cuidado el duplicado de vistas `DOBOTM1_LaboratorioRemoto`, pero no eliminar nada sin autorizacion.

### Confirmacion visual de funcionamiento - 2026-05-26

- El usuario confirma que la web ya esta funcionando bien.
- Se da por validado visualmente el estado final tras los cambios anteriores, incluyendo el acceso a la web principal y el ajuste del DOBOT M1.
- Estado: **funcionamiento correcto confirmado por el usuario**.

### Inicio de modernizacion frontend - 2026-05-26

- Objetivo nuevo del usuario: modernizar el frontend de `vrisa` para hacerlo mas profesional visualmente, reutilizando lo que ya existe:
  - mismas fotos/imagenes del proyecto;
  - Bootstrap y dependencias actuales siempre que sea razonable;
  - mismas rutas, backend, actividades y conexiones existentes.
- Regla de proteccion:
  - La version actual del frontend debe conservarse como version estable.
  - No se debe romper ni sustituir directamente el frontend actual sin confirmacion.
  - El redisenio visual se trabajara en una rama separada.
- Rama creada para el trabajo nuevo:
  - `frontend-modernizacion`
- Rama estable de referencia:
  - `main`
- Decision sobre puertos:
  - Se mantiene la regla de no cambiar puertos.
  - Como ambas versiones usarian el mismo puerto de `vrisa` (`8082:80`), solo se usara una version a la vez.
  - No se intentara levantar simultaneamente el frontend actual y el frontend moderno en el mismo puerto.
- Estado inicial:
  - Rama `frontend-modernizacion` creada.
  - Todavia no se han hecho cambios visuales del nuevo frontend.
  - Antes de modificar componentes, revisar estructura actual de `vrisa` y plantear una estrategia que permita volver al frontend clasico con facilidad.

### Flujo elegido para alternar frontend clasico/moderno - 2026-05-26

- El usuario quiere un uso sencillo:
  - cerrar la web que este viendo;
  - activar la otra version del frontend;
  - abrir de nuevo la misma URL.
- URL unica de uso:
  - `http://localhost:8082/vr-isa/`
- Scripts creados:
  - `scripts/usar-frontend-clasico.ps1`
  - `scripts/usar-frontend-moderno.ps1`
- Funcionamiento de los scripts:
  - cambian a la rama correspondiente si es necesario;
  - paran el servicio Docker `vrisa`;
  - reconstruyen y levantan de nuevo solo `vrisa`;
  - mantienen el mismo puerto `8082:80`.
- Comandos de uso desde la raiz del proyecto:
  - `powershell -ExecutionPolicy Bypass -File scripts/usar-frontend-clasico.ps1`
  - `powershell -ExecutionPolicy Bypass -File scripts/usar-frontend-moderno.ps1`
- Regla de seguridad:
  - Si hay cambios sin guardar y el script necesita cambiar de rama, se detiene y avisa.
  - Esto evita perder trabajo o mezclar el frontend clasico con el moderno.
- Estado:
  - El mecanismo de alternancia queda preparado.
  - Nota historica: en este punto todavia no se habia redisenado el frontend moderno. El redisenio inicial se documento despues en la seccion "Primera version visual del frontend moderno".

### Primera version visual del frontend moderno - 2026-05-26

- Rama de trabajo:
  - `frontend-modernizacion`
- Objetivo de esta primera pasada:
  - modernizar la apariencia sin cambiar backend, rutas, puertos ni flujo funcional;
  - mantener Bootstrap y los assets existentes;
  - proteger el frontend clasico en `main`.
- Archivos modificados en `vrisa`:
  - `src/App.vue`
  - `src/components/NavBar.vue`
  - `src/components/Login.vue`
  - `src/components/Home.vue`
  - `src/components/RemoteLab.vue`
- Cambios visuales aplicados:
  - paleta global mas sobria basada en verde tecnico, azul de acento, fondo claro y paneles blancos;
  - barra superior oscura, mas compacta y profesional;
  - login redisenado con foto real existente de `public/images/vrlabs/front.jpg`;
  - tarjetas de actividades mas limpias, con imagen grande, estado disponible/ocupada y boton de entrada;
  - panel lateral de ultimos experimentos con estilo de lista;
  - pantalla de laboratorio remoto reorganizada con cabecera, temporizador y acciones mas claras.
- Archivo nuevo creado en la raiz:
  - `como arrancar.md`
- Contenido del archivo:
  - pasos para abrir PowerShell en la carpeta del proyecto;
  - comando para activar frontend moderno;
  - comando para activar frontend clasico;
  - URL unica `http://localhost:8082/vr-isa/`;
  - aviso de seguridad sobre cambios sin guardar.
- Verificacion:
  - `npm.cmd run build` en `vrisa` compila correctamente.
  - Quedan warnings no bloqueantes sobre tamano de assets y `caniuse-lite` desactualizado.
  - Se reconstruyo y levanto `vrisa` con Docker usando la version moderna.
  - `GET http://localhost:8082/vr-isa/` responde HTTP 200.
- Ajuste adicional:
  - Los scripts `usar-frontend-clasico.ps1` y `usar-frontend-moderno.ps1` ahora comprueban el codigo de salida de `git` y `docker`.
  - Si Docker falla por permisos o por cualquier otro error, el script debe detenerse en vez de mostrar un mensaje de exito incorrecto.

### Pausa de trabajo para revision posterior - 2026-05-26

- El usuario pausa la sesion para comer.
- Al volver, el objetivo sera revisar con calma todos los cambios realizados y confirmar que todo queda correctamente documentado y actualizado.
- Estado de rama:
  - Rama actual: `frontend-modernizacion`.
  - Rama estable protegida: `main`.
- Estado funcional antes de la pausa:
  - Frontend moderno levantado en Docker.
  - URL de prueba: `http://localhost:8082/vr-isa/`.
  - La URL responde HTTP 200.
- Verificaciones ejecutadas:
  - `npm.cmd run build` dentro de `vrisa`: correcto.
  - `docker compose up --build vrisa -d` mediante script moderno: correcto tras ejecutar con permisos suficientes.
  - `Invoke-WebRequest http://localhost:8082/vr-isa/`: HTTP 200.
- Archivos modificados o creados relacionados con la modernizacion:
  - `vrisa/src/App.vue`
  - `vrisa/src/components/NavBar.vue`
  - `vrisa/src/components/Login.vue`
  - `vrisa/src/components/Home.vue`
  - `vrisa/src/components/RemoteLab.vue`
  - `scripts/usar-frontend-clasico.ps1`
  - `scripts/usar-frontend-moderno.ps1`
  - `como arrancar.md`
  - `CLAUDE.md`
- Cambios previos que siguen presentes en la rama:
  - `ReNoLabs/src/templates/remote_lab.ejs`
  - `dobot_m1_view/DOBOTM1_LaboratorioRemoto_Simulation.xhtml`
  - `vrisa/src/assets/LabControl.js`
- Pendientes para cuando vuelva el usuario:
  - Revisar visualmente el frontend moderno en navegador.
  - Investigar por que en el frontend moderno, al revisar todos los robots/actividades, no todos funcionan correctamente.
  - Separar esa investigacion entre problema visual del frontend moderno, problema de inicio de actividad, problema de iframe/vista remota o problema previo del controlador/backend.
  - Confirmar si el estilo visual gusta o ajustar colores, espaciados, tarjetas, login y pantalla de laboratorio.
  - Revisar si conviene commitear primero los cambios funcionales previos y despues los cambios de modernizacion en commits separados.
  - Confirmar que `como arrancar.md` es suficientemente claro para alternar entre clasico y moderno.

### Tarea pendiente detectada por el usuario - Robots/actividades en frontend moderno

- El usuario quiere revisar por que en el frontend moderno no todos los robots/actividades funcionan al probarlos.
- Objetivo de la proxima revision:
  - probar cada actividad una por una desde el frontend moderno;
  - comprobar si el fallo ocurre solo en la version moderna o tambien en la clasica;
  - revisar consola/navegador, peticiones HTTP, logs Docker y respuesta de ReNoLabs;
  - confirmar si el problema esta en el redisenio de `RemoteLab.vue`, en el iframe, en el estado de actividad ocupada, en cache, o en el controlador/backend.
- Esta tarea queda pendiente y no debe olvidarse al retomar la sesion.

### Aclaracion sobre Bootstrap en frontend moderno - 2026-05-26

- El usuario pregunta si todo lo hecho en el frontend moderno esta hecho con Bootstrap.
- Confirmacion tecnica:
  - El frontend moderno mantiene Bootstrap como base de componentes y utilidades.
  - Se siguen usando clases Bootstrap como `navbar`, `container-fluid`, `btn`, `btn-success`, `btn-outline-danger`, `dropdown`, `input-group`, `alert`, `row` y utilidades responsive.
  - Ademas de Bootstrap, se ha anadido CSS propio en los componentes Vue para conseguir un acabado mas profesional: paleta, sombras, layout de login, tarjetas de actividades, paneles, espaciados y comportamiento responsive.
- Conclusion:
  - No es Bootstrap puro sin CSS adicional.
  - Es Bootstrap + CSS propio controlado, reutilizando la base actual del proyecto.

### Revision de documentacion - 2026-05-27

- Se retoma la rama `frontend-modernizacion` para revisar especialmente documentacion.
- Estado revisado:
  - Rama actual: `frontend-modernizacion`.
  - Hay cambios sin commit en documentacion, scripts, frontend moderno y ajustes funcionales previos.
  - `como arrancar.md` existe en la raiz y explica como activar frontend moderno o clasico.
- Correcciones documentales realizadas:
  - Actualizada la tabla de repositorios para reflejar que `vrisa` ya tiene version clasica funcional y version moderna en rama separada.
  - Aclarada una frase historica que decia que el frontend moderno aun no estaba redisenado: ahora queda marcada como nota del momento anterior al redisenio inicial.
- Recordatorio importante:
  - Los scripts de alternancia cambian de rama solo si el arbol de trabajo esta limpio.
  - Mientras existan cambios sin commit, intentar pasar de `frontend-modernizacion` a `main` con el script clasico puede detenerse para proteger el trabajo.
  - Antes de usar comodamente los scripts para alternar clasico/moderno conviene revisar, ordenar y commitear los cambios.

### Revision documental sobre funcionamiento del robot - 2026-05-28

- Objetivo del usuario:
  - revisar la documentacion antes de hacer nada para saber si el robot puede funcionar.
- Conclusion segun la documentacion actual:
  - La web, ReNoLabs, MySQL, `vrisa` y las vistas/simulaciones pueden funcionar en entorno local con Docker.
  - Las actividades pueden aparecer, iniciar sesion, devolver token y cargar la interfaz grafica/simulacion.
  - Esto NO equivale necesariamente a confirmar que el robot fisico real funcione conectado.
- Estado del entorno de desarrollo:
  - `rip-js-server` esta documentado como `DummyServer + TestBoard`, es decir, simulador de hardware para desarrollo.
  - `documentacion/estado_proyecto_y_conceptos_tecnicos.md` indica que DummyServer permite acceder a la simulacion sin robot real.
  - El robot fisico real quedaria para produccion o para cuando el profesor conecte/sustituya DummyServer por el adaptador real correspondiente.
- DOBOT / hardware real:
  - En `ReNoLabs/src/hardware/Dobot/Adapter.js`, el adaptador DOBOT intenta arrancar el controlador con `spawn('sudo', ['python3', ...])`.
  - En los logs ya documentados aparece `Error: spawn sudo ENOENT` para actividades con controlador DOBOT.
  - Esto significa que dentro del contenedor actual no existe `sudo`, por lo que el controlador real DOBOT no queda confirmado como operativo en este entorno Docker local.
  - Aun con ese error, la actividad puede devolver token y la vista/simulacion puede cargar; por eso hay que distinguir entre simulacion funcional y hardware real funcional.
- Estado practico:
  - Para simulacion y demostracion de interfaz: **si puede funcionar**.
  - Para controlar un robot fisico real desde este entorno actual: **no queda confirmado** y probablemente requiere ajustes del controlador/adaptador, permisos, dependencias de hardware y/o indicaciones del profesor.
- Pendiente recomendado:
  - Si el objetivo pasa a ser robot fisico real, revisar con el profesor:
    - que controlador debe usarse para DOBOT Magician/M1;
    - si debe ejecutarse con `sudo` dentro del contenedor o cambiarse el arranque;
    - que puertos/dispositivos fisicos deben exponerse al contenedor;
    - si `rip-js-server` debe seguir como DummyServer o sustituirse por un servidor/adaptador real.

### Ajuste visual Home frontend moderno - 2026-05-28

- Peticion del usuario:
  - En la pantalla `#/home`, las cuatro tarjetas/contenedores de actividades debian ocupar todo el ancho disponible del area principal, antes del panel lateral de `Ultimos experimentos`.
- Archivo modificado:
  - `vrisa/src/components/Home.vue`
- Cambio aplicado:
  - `.activity-grid` pasa a usar `grid-template-columns: repeat(4, minmax(0, 1fr))` en escritorio.
  - Las cuatro actividades se reparten en cuatro columnas flexibles y ocupan el ancho completo disponible del bloque principal.
  - En pantallas medianas se mantiene responsive con dos columnas.
  - En pantallas pequenas se mantiene una columna.
  - Se ajusta ligeramente el ancho del panel lateral de datos de `340px` a `320px` para dar mas espacio a las tarjetas.
- Verificacion:
  - `npm.cmd run build` en `vrisa` compila correctamente.
  - Persisten solo warnings no bloqueantes de tamano de assets, `caniuse-lite` desactualizado y advertencias de Node.

### Ajuste de ancho global Home frontend moderno - 2026-05-28

- Problema observado por el usuario:
  - Aunque las tarjetas estaban en cuatro columnas, seguia apareciendo un margen grande a la izquierda.
  - Las tarjetas no llegaban hasta el inicio izquierdo util de la pagina porque el contenedor general estaba centrado con ancho maximo.
- Causa:
  - `.app-main` en `vrisa/src/App.vue` usaba `width: min(1480px, calc(100% - 32px))` y `margin: 0 auto`.
  - En pantallas anchas esto centraba todo el contenido y dejaba espacio vacio lateral.
- Archivo modificado:
  - `vrisa/src/App.vue`
- Cambio aplicado:
  - `.app-main` pasa a `width: 100%`, `margin: 0` y padding lateral controlado.
  - En escritorio el contenido usa casi todo el ancho disponible de la pagina.
  - En movil se mantiene padding reducido.
- Verificacion:
  - `npm.cmd run build` en `vrisa` compila correctamente.
  - Se reconstruyo/arranco `vrisa`; aunque el comando supero el timeout, el contenedor quedo activo.
  - `GET http://localhost:8082/vr-isa/` responde HTTP 200.

### Pausa para comer - revision visual pendiente - 2026-05-28

- El usuario pausa para comer.
- Estado antes de la pausa:
  - Rama actual: `frontend-modernizacion`.
  - Frontend moderno activo en `http://localhost:8082/vr-isa/`.
  - `vrisa` responde HTTP 200.
  - Se aplicaron dos ajustes consecutivos al Home moderno:
    - las 4 tarjetas de actividades usan 4 columnas flexibles;
    - el contenedor global `.app-main` ya no centra el contenido con ancho maximo, usa `width: 100%`.
- Pendiente al volver:
  - Abrir `http://localhost:8082/vr-isa/#/home`.
  - Recargar con `Ctrl + F5`.
  - Confirmar visualmente que las tarjetas empiezan mucho mas cerca del borde izquierdo util y ocupan mejor todo el ancho hasta el panel lateral de `Ultimos experimentos`.
  - Si todavia queda demasiado margen o las tarjetas no ocupan exactamente lo esperado, revisar `Home.vue` y `App.vue` de nuevo.
- Nota tecnica:
  - El ultimo `docker compose up --build vrisa -d` lanzado por el script supero el timeout del comando, pero despues se verifico que el contenedor `proyectorobot_universitario-vrisa-1` quedo activo y la URL devuelve HTTP 200.

### Confirmacion visual Home frontend moderno - 2026-05-28

- El usuario confirma tras revisar en navegador que el ajuste de ancho del Home moderno ya esta bien hecho.
- Estado:
  - Las cuatro tarjetas de actividades se ven correctamente repartidas.
  - El contenido ya aprovecha el ancho de pantalla esperado.
  - Este ajuste visual queda cerrado como correcto.
- Pendiente general:
  - Antes de subir a GitHub o entregar, revisar/ordenar commits y decidir que hacer con la limpieza de seguridad minima.
