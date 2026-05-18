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
| vrisa | Frontend (Vue.js) — pendiente de desarrollar |
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
- [x] Preparación para GitHub: .gitignore y .dockerignore configurados según reglas del profesor
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
