# Tecnologias Usadas

## Lenguajes

- **JavaScript** — lenguaje principal del frontend y del backend.
- **Python** — para programar secuencias de movimientos del robot.
- **SQL** — para consultar y guardar datos en MySQL.
- **HTML5** — estructura de la pagina web.
- **CSS3** — estilos visuales de la pagina web.

## Frontend

- **Three.js** — libreria JavaScript para graficos y animaciones 3D en el navegador.
- **Socket.IO (cliente)** — comunicacion en tiempo real con el servidor.
- **API Fetch** — para hacer peticiones HTTP al backend desde el navegador.
- **Beacon API** — para cerrar la sesion al cerrar el navegador.
- **Google Fonts** — tipografias Space Grotesk y Sora.

## Backend

- **Node.js** — entorno que permite ejecutar JavaScript en el servidor.
- **Express** — framework para crear rutas y endpoints HTTP.
- **Socket.IO (servidor)** — comunicacion en tiempo real con el navegador.
- **mysql2** — conector entre Node.js y la base de datos MySQL.
- **cors** — permite la comunicacion entre frontend y backend sin bloqueos del navegador.
- **dotenv** — carga las variables del archivo .env en el codigo.
- **nodemon** — reinicia el servidor automaticamente al modificar archivos (solo en desarrollo).

## Base de datos

- **MySQL** — base de datos relacional donde se guardan usuarios, sesiones y movimientos.

## Programacion de movimientos

- **Python** — lenguaje usado para escribir los scripts de movimiento.
- **robot_api.py** — clase Robot creada para este proyecto con los metodos de control.
- **child_process (Node.js)** — modulo nativo que ejecuta el script Python como proceso hijo.

## Configuracion

- **.env** — archivo con variables sensibles como credenciales de MySQL y puerto del servidor.
- **keys.mcd** — archivo con API keys y datos de acceso para integraciones externas.

## Integracion externa

- **MCP (Model Context Protocol)** — servidor que permite a IAs externas consultar y controlar el robot.
