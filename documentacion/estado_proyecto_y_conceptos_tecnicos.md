# Estado del Proyecto y Conceptos Técnicos

## Estado actual del sistema (05/05/2026)

El sistema VR-ISA Labs está completamente operativo en entorno local con Docker. Todas las piezas están integradas y funcionando.

### Contenedores activos

| Contenedor | Servicio | Puerto |
|---|---|---|
| docker-vrlabs_node-1 | ReNoLabs (backend profesor) | 80 |
| docker-vrlabs_db-1 | MySQL 8.0 | 3307 |
| proyectorobot_universitario-vrisa-1 | Frontend Vue.js (nginx) | 8082 |
| proyectorobot_universitario-backend-1 | Nuestro backend (Node.js + PM2) | 3000 |
| proyectorobot_universitario-db-1 | Nuestra MariaDB | 3308 |
| proyectorobot_universitario-rip-server-1 | rip-js-server (DummyServer) | 2055 |

### URL de acceso
```
http://localhost:8082/vr-isa/
Credenciales: admin / admin
```

### Actividades disponibles y verificadas

| Actividad | Estado | Controlador | Vista |
|---|---|---|---|
| Air Flow Levitation | ✓ Funciona — carga simulación completa con cámara, gráficas y controles PID | Arduino Controller | Air Flow Levitation System |
| Robot DOBOT Magician | ✓ Funciona — carga simulación 3D con Control Cartesiano, Articular y Programación | DOBOT Controller | DOBOTMagician_LaboratorioRemoto |
| Sistemas Lineales | ✓ Funciona — carga descripción y botón Comenzar Actividad | Circuit Controller | Sistemas Lineales |

**Nota:** Solo una actividad puede estar activa por usuario a la vez. Esto es el comportamiento correcto del sistema (igual que en un laboratorio real).

---

## Flujo completo verificado

```
Alumno → http://localhost:8082/vr-isa/
    ↓ Login (admin/admin)
    ↓ JWT generado por ReNoLabs
    ↓ Pantalla Home — lista de actividades desde MySQL
    ↓ Alumno escoge un robot
    ↓ Página de descripción + botón "Comenzar Actividad"
    ↓ ReNoLabs inicia sesión + arranca controlador
    ↓ Carga interfaz gráfica del robot (simulación .xhtml de EjsS)
    ↓ Alumno interactúa con los controles
    ↓ "Terminar actividad" — cierra la sesión
```

---

## Corrección técnica clave — LabControl.js

`vrisa/src/assets/LabControl.js` define la clase `LabInstance` pero no la exportaba. Sin `export { LabInstance }` al final del archivo, el componente `RemoteLab.vue` recibía `undefined` al importarla y lanzaba un TypeError en el arranque, dejando la página completamente en blanco.

**Solución:** añadir al final de `vrisa/src/assets/LabControl.js`:
```js
export { LabInstance };
```

---

## Conceptos técnicos del robot DOBOT Magician

### Control Cartesiano vs Control Articular

**Control Cartesiano — "dónde quiero que llegue la mano"**

El operador define el punto final en el espacio mediante coordenadas (X, Y, Z, R). El robot calcula internamente cuánto debe girar cada articulación para llegar a ese punto. Este cálculo se llama **cinemática inversa**.

- **X** (flecha roja) — distancia horizontal hacia adelante/atrás respecto a la base
- **Y** (flecha verde) — desplazamiento lateral izquierda/derecha
- **Z** (flecha azul) — altura, sube o baja el extremo del brazo
- **R** — rotación de la muñeca (giro del efector final sin cambiar la posición)

El operador solo piensa en el destino; el robot se encarga de la trayectoria.

**Control Articular — "cómo muevo cada motor"**

El operador controla directamente cada articulación del brazo de forma independiente: J1, J2, J3, J4. Útil para posicionamiento preciso o cuando se necesita control total sobre la trayectoria del brazo.

**Analogía:**
- Cartesiano = "pon la mano en la mesa" (destino final)
- Articular = "dobla el codo 90°, gira el hombro 45°" (motor por motor)

---

### Velocidad JOG vs Velocidad PTP

**Velocidad JOG**
- Velocidad de movimiento cuando se usan los botones incrementales (flechas X+, X-, Y+, Y-, Z+, Z-, R+, R-)
- El robot se mueve mientras se mantiene pulsado el botón y se detiene al soltarlo
- Movimiento manual en tiempo real, paso a paso
- Útil para posicionamiento fino y ajustes precisos

**Velocidad PTP (Point To Point)**
- Velocidad de movimiento cuando se define un punto destino concreto (x, y, z, r) y el robot se desplaza automáticamente hasta él
- El robot calcula la trayectoria y se mueve solo desde la posición actual hasta el punto destino
- Movimiento automático de un punto a otro

**Resumen:**
- JOG = movimiento manual con botones en tiempo real
- PTP = movimiento automático a un punto definido en el plano cartesiano

Ambas velocidades se miden en mm/s. Valor por defecto en la simulación: **200 mm/s**.

---

### Modos de movimiento PTP

- **MOVL** (Movement Linear) — el robot se mueve en línea recta hasta el punto destino
- **MOVJ** (Movement Joint) — cada articulación se mueve de forma independiente, la trayectoria no es necesariamente recta
- **JUMP** — el robot sube primero en Z, se desplaza y luego baja (útil para evitar obstáculos)

---

## rip-js-server y DummyServer

**rip-js-server** es el servidor que implementa el protocolo RIP (Remote Instrumentation Protocol) para comunicarse con el hardware del robot. Es un repositorio del profesor (jcsombria/rip-js-server).

**DummyServer** es un módulo que viene dentro de rip-js-server. Simula el comportamiento del hardware sin necesidad de un robot físico conectado. Se usa durante el desarrollo y las pruebas.

```
rip-js-server
    └── DummyServer     ← simulador de hardware (usado en desarrollo)
    └── Adaptador real  ← se conectaría al robot físico en producción
```

Sin rip-js-server corriendo, ReNoLabs no puede gestionar las sesiones de actividad correctamente y la carga de la interfaz gráfica falla. Con DummyServer el sistema arranca completo y los alumnos pueden acceder a la simulación sin robot real.

Cuando el profesor conecte un robot físico, se sustituye DummyServer por el adaptador real del robot correspondiente.

---

## Archivos de la simulación DOBOT Magician (referencia para DOBOT M1)

Ubicación dentro del contenedor Docker:
```
/home/node/app/public/views/bc430dfd-b2dc-432c-ba46-b5801e1a0a97/
```

| Archivo | Descripción |
|---|---|
| `DobotMagician.ejss` | Código fuente XML (UTF-16) — editar con EjsS |
| `DOBOTMagician_LaboratorioRemoto.xhtml` | Página principal que carga el iframe |
| `DOBOTMagician_LaboratorioRemoto_Contents.xhtml` | Estructura HTML de la interfaz |
| `DOBOTMagician_LaboratorioRemoto_Simulation.xhtml` | Clase JavaScript con la lógica |
| `DOBOTMagician_LaboratorioRemoto_Intro_1.html` | Texto introductorio |
| `_metadata.txt` | Define nombre de actividad, controlador y vista en MySQL |
| `_ejs_library/` | Librería EjsS (scripts JS y CSS) |
| `dobot.JPG` | Foto del robot real |

Estos archivos son la base para crear la simulación del DOBOT M1.

---

## Próxima tarea — Simulación DOBOT M1

Crear una nueva actividad con interfaz idéntica al DOBOT Magician pero adaptada al robot DOBOT M1. La interfaz debe tener las mismas 3 pestañas: Control Cartesiano, Control Articular y Programación.

Ver sección completa en `CLAUDE.md` → "Próxima Tarea — Simulación DOBOT M1".
