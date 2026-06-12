# Resumen del diario de prácticas

## 16 de marzo

Comencé las prácticas preparando el equipo de trabajo. Instalé y particioné el disco para poder usar Ubuntu, ROS 2 y los simuladores necesarios para el desarrollo del proyecto.

## 17 de marzo

Repasé el funcionamiento general del **DOBOT M1**, estudiando las particularidades del brazo mecánico y del sistema que utiliza.

## 18 de marzo

Continué con la preparación del entorno de trabajo en el laboratorio. Instalé ROS 2 y Gazebo en el equipo personal asignado. También pude mover el brazo mecánico con ayuda del técnico de la universidad, ya que el software que había descargado inicialmente no era la versión correcta.

## 19 de marzo

Revisé los manuales del DOBOT M1 para entender mejor el proceso de homing y calibración. También recopilé información técnica, guías y vídeos para contrastar el funcionamiento del robot y evitar errores durante las pruebas.

## 20 de marzo

Abrimos la zona donde se colocan los periféricos del robot, como pinza, ventosa, láser o impresora 3D, porque allí se encontraba una batería extraíble. Durante el intento de homing apareció un aviso de batería baja, por lo que no era posible completar la calibración correctamente. También revisé un ejemplo en Python que Jesús me pasó sobre el uso anterior del robot.

## 21 de marzo

Repasé los tipos de movimiento del robot y conceptos de red como direcciones IP, puertas de enlace, máscaras y tipos de red. También continué revisando el código Python del DOBOT M1.

## 23 de marzo

Quité el cabezal del DOBOT M1 para poder extraer la batería que debía cambiarse antes de calibrar el robot. También seguí revisando el código que Jesús me había pasado, usado anteriormente por el departamento de Informática.

Ese día también aprendí mejor los ejes del robot: el eje 3 corresponde al movimiento vertical, el eje 1 a la rotación principal del brazo, el eje 2 al movimiento del codo y el eje 4 a la rotación final limitada por los cables.

## 24 de marzo

Continué con la extracción y revisión de la batería. También estudié la API necesaria para que el código Python pudiera mover el robot. Además, preparé una animación de los movimientos de los ejes usando Python, NumPy y Matplotlib, lo que me ayudó a entender los rangos de movimiento del DOBOT M1.

## 25 de marzo

Identifiqué las baterías del DOBOT M1 como baterías industriales **SAFT LS 1450 de 3,6 V**. Envié la información al tutor, Juan Antonio, para que pudiera comprarlas y así poder avanzar con la calibración del robot.

## 26 de marzo

Continué esperando la compra de las baterías necesarias para calibrar el brazo mecánico. Mientras tanto, seguí mejorando el código, revisando posibles simulaciones y preparando el aprendizaje de ROS 2.

## 7 de abril

Después de Semana Santa, retomé el trabajo con la instalación de las baterías y la configuración final del robot. Revisé si antes de calibrarlo era necesario dejarlo totalmente recto y correctamente anclado. También comprobé que las baterías necesitaban soldadura por puntos, ya que no era recomendable soldarlas con estaño.

## 8 de abril

Desde casa continué trabajando en la simulación de un brazo mecánico para poder controlarlo sin depender del robot físico. También envié un correo para solicitar la herramienta necesaria para soldar correctamente las baterías.

## 9 de abril

Llevé las baterías de 3,6 V e intentamos avanzar con su instalación. También anclamos el robot a una placa de madera contrachapada para poder realizar las calibraciones con más seguridad.

## 10 de abril

Intenté repetir el homing del robot, ya que el día anterior había dado problemas. Revisé la posibilidad de que un sensor lateral del eje 4 estuviera tapado por la cinta utilizada para sujetar las baterías. También quedó pendiente soldar las pilas correctamente con el soldador por puntos.

## 12 de abril

Preparé un pequeño manual sobre el proceso de reinicio del DOBOT M1, especialmente enfocado en el homing y la calibración.

## 20 de abril

Volví después de una semana de baja y revisé si el robot ya podía moverse para empezar a trabajar con él de forma programable. También empecé a plantear demos de la interfaz gráfica.

## 21 de abril

Comprobé que el robot seguía sin completar la calibración. Al tener varios años de uso, consideré que necesitaba una revisión o mantenimiento a fondo. Mientras gestionaba el contacto con la empresa reparadora, continué trabajando en el programa final siguiendo la arquitectura usada en otros robots del laboratorio, como el Magician.

## 23 de abril

Continué preocupado por el estado del DOBOT M1, ya que seguía sin funcionar y era necesario avanzar con el proyecto. Hablé con el tutor para valorar posibles soluciones y poder continuar el trabajo dentro de los plazos.

## 24 de abril

Empecé a trabajar en la arquitectura del proyecto. Mientras el departamento de Informática buscaba la factura para poder gestionar una revisión del robot, revisé la documentación para comprobar si era posible reiniciar o forzar el robot mediante Python y evitar temporalmente el paso de calibración.

## 27 de abril

Comencé el desarrollo del proyecto web siguiendo la arquitectura indicada por Jesús. Analicé el material y la estructura que me había proporcionado para crear el ecosistema necesario para trabajar con el robot cuando estuviera operativo.

## 28 de abril

Empecé el desarrollo de la aplicación web del DOBOT M1. También revisé la estructura interna del laboratorio remoto a partir del repositorio de Jesús. Identifiqué los principales bloques del sistema: MariaDB, ReNoLabs, VR-ISA y RIP-JS-Server.

## 29 de abril

Hablé con Jesús para descargar y configurar los microservicios que faltaban, especialmente VR-ISA y RIP-JS-Server. También empecé a trabajar con la base de datos y a estudiar cómo rediseñar la interfaz gráfica usando Bootstrap.

## 30 de abril

Conseguí dejar funcionando los principales servicios del entorno: VR-ISA como frontend, ReNoLabs como backend, MariaDB como base de datos y el acceso a la web del laboratorio donde realizan las prácticas los alumnos.

## 4 de mayo

Trabajé en la incorporación del DOBOT M1 a la interfaz oficial del laboratorio. Esto incluía la imagen del robot, la parte de control en Python, la adaptación a la base de datos, la integración con el backend de ReNoLabs y la modernización visual con Bootstrap.

## 6 de mayo

Continué actualizando la interfaz gráfica moderna recomendada por Jesús. También avancé con la imagen y el gemelo del DOBOT M1 para que su presencia en el laboratorio fuese similar a la de los otros robots.

## 7 de mayo

Seguí modernizando la página web del laboratorio para los alumnos. También preparé el envío de un correo a la empresa fabricante para consultar cuánto podría costar una revisión o reparación del robot.

## 11 de mayo

Continué adaptando la interfaz gráfica para agregar el DOBOT M1 como una actividad nueva para los alumnos. Además, seguí gestionando el contacto con el fabricante para conocer el coste de una posible revisión.

## 12 de mayo

Trabajé en terminar la interfaz principal para poder presentársela a Jesús y recibir su revisión. También revisé la posibilidad de avanzar con la automatización relacionada con OpenClaw.

## 14 de mayo

Continué con la preparación de la web y la integración del DOBOT M1. Aunque llegué más tarde por sesiones de fisioterapia, seguí avanzando para dejar la aplicación preparada para futuras pruebas con el robot.

## 18 de mayo

Retomé el trabajo después del puente de mayo. A pesar de estar algo desanimado por problemas personales, continué avanzando para terminar la parte web y poder centrarme después en el robot.

## 28 de mayo

Hablé con el tutor y quedó establecido que el seguimiento continuaría principalmente por correo electrónico debido a su operación. También se planteó enviar el robot a un técnico de la universidad para revisarlo y comprobar si podía repararse.

## 29 de mayo

Trabajé en la configuración de Blender para preparar animaciones y simulaciones a escala del DOBOT M1. También conseguí conectar el puente MCP entre Visual Studio y Blender para facilitar la preparación de animaciones. Quedó pendiente reunirnos con Félix para entregar el robot al técnico.

## 1 de junio

Continué puliendo la interfaz gráfica. También estaba prevista una reunión con Félix para realizar pruebas con el robot y prepararlo para enviarlo al técnico especialista.

## 2 de junio

Me reuní con el técnico especialista a las 13:30 para revisar el robot. Le facilité el software y la documentación disponible del DOBOT M1 para que pudiera hacer el diagnóstico con más información.

## 8 de junio

Cerramos el robot después de haberlo desmontado y revisado junto con Enrique, técnico de la Facultad de Informática. Tras varias pruebas, identificamos una avería en el encoder del eje 1, concretamente en su placa electrónica. Al tratarse de una pieza OEM, facilité al tutor la información necesaria para solicitar el repuesto original al fabricante.

## 9 de junio

Continué esperando el repuesto del encoder y las claves necesarias para acceder a la Raspberry Pi. Mientras tanto, seguí preparando la aplicación para que la interfaz, la web y la simulación quedasen listas para una futura conexión con el robot real.
