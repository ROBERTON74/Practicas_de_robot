# Tecnologias y Stack del Proyecto

Este archivo explica para que sirve cada tecnologia usada en el proyecto, de forma clara y sencilla.

---

## Frontend (lo que ve el usuario en el navegador)

### JavaScript
Lenguaje de programacion principal del frontend. Controla toda la logica de la interfaz: el movimiento del robot, el teclado, la conexion con el servidor y el editor Python.

### HTML5
Define la estructura visual de la pagina: el canvas del robot, los paneles de datos, el formulario de login y el panel Python.

### CSS3
Da el estilo visual a la web: colores, tipografia, disposicion de los elementos, el tema oscuro con acentos en verde azulado.

### Three.js
Libreria de JavaScript para crear graficos y animaciones 3D directamente en el navegador web. Es el equivalente web de Matplotlib en Python para escritorio. Usa WebGL por debajo (que es la tarjeta grafica del ordenador a traves del navegador). Se usa para dibujar y animar el robot DOBOT M1.

### Socket.IO (cliente)
Parte del cliente que mantiene la conexion en tiempo real con el servidor. Cada movimiento del robot se envia y recibe al instante sin recargar la pagina.

---

## Backend (lo que corre en el servidor, invisible al usuario)

### Node.js
Entorno de ejecucion que permite usar JavaScript fuera del navegador, es decir, en el servidor. Es la base sobre la que corre todo el backend del proyecto.

### Express
Framework de Node.js para crear rutas y endpoints HTTP de forma sencilla. Gestiona todas las peticiones que llegan al servidor (login, movimientos, sesiones, etc.).

### Socket.IO (servidor)
Permite la comunicacion bidireccional en tiempo real entre el servidor y el navegador. Cuando el robot se mueve, el servidor lo sabe al instante y puede notificar a todos los clientes conectados.

### CORS
Modulo que permite que el navegador pueda hacer peticiones al servidor sin que el navegador las bloquee por seguridad. Sin CORS el frontend no podria hablar con el backend.

### mysql2
Driver o conector que permite a Node.js comunicarse con la base de datos MySQL. Es el puente entre el codigo JavaScript del servidor y los datos guardados en MySQL.

### dotenv
Lee el archivo .env y hace que las variables de entorno esten disponibles en el codigo. Evita escribir datos sensibles directamente en el codigo fuente.

---

## Base de datos

### MySQL
Sistema de base de datos relacional donde se guardan todos los datos del proyecto. Tablas principales:
- users: operadores que han usado el sistema.
- control_sessions: cada sesion de uso con inicio, fin y duracion.
- movement_logs: cada movimiento realizado con sus valores de ejes.
- robot_state: estado actual del robot.
- audit_events: registro de eventos importantes.

---

## Archivos de configuracion

### .env
Archivo donde se guardan las variables de entorno sensibles como la contrasena de MySQL, el nombre de la base de datos y el puerto del servidor. No se sube a repositorios publicos.

### keys.mcd
Archivo donde se guardan las API keys y otros datos de acceso necesarios para integraciones externas como MCP.

---

## Programacion de movimientos

### Python
Lenguaje de programacion usado para escribir secuencias de movimientos del robot desde la propia web. El usuario escribe un script en el editor integrado, Node.js lo ejecuta como proceso hijo, y los movimientos llegan al simulador en tiempo real via Socket.IO.

### robot_api.py
Clase Python creada especificamente para este proyecto. Define el objeto robot con los metodos mover_j1, mover_j2, mover_z, mover_r, esperar, velocidad y log.

---

## Integracion externa

### MCP (Model Context Protocol)
Servidor aparte que expone herramientas para que IAs externas o agentes automatizados puedan consultar el estado del robot, crear sesiones y registrar movimientos sin pasar por la interfaz web.

### nodemon
Herramienta de desarrollo que reinicia el servidor Node.js automaticamente cada vez que se modifica algun archivo. Solo se usa durante el desarrollo, no en produccion.

---

## Comparativa rapida frontend vs backend

| Parte | Donde corre | Lenguaje | Para que |
|---|---|---|---|
| Frontend | Navegador del usuario | JavaScript + HTML + CSS | Lo que ve y controla el usuario |
| Backend | Servidor (Node.js) | JavaScript | Logica, base de datos, tiempo real |
| Base de datos | Servidor MySQL | SQL | Guardar todos los datos |
| Editor Python | Servidor (proceso hijo) | Python | Programar secuencias de movimiento |
