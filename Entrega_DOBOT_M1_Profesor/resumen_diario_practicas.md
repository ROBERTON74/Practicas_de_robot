# Resumen del diario de practicas

## 16 de marzo

Comence las practicas preparando el equipo de trabajo. Instale y particione el disco para poder usar Ubuntu, ROS 2 y los simuladores necesarios para el desarrollo del proyecto.

## 17 de marzo

Repase el funcionamiento general del **DOBOT M1**, estudiando las particularidades del brazo mecanico y del sistema que utiliza.

## 18 de marzo

Continue con la preparacion del entorno de trabajo en el laboratorio. Instale ROS 2 y Gazebo en el equipo personal asignado. Tambien pude mover el brazo mecanico con ayuda del tecnico de la universidad, ya que el software que habia descargado inicialmente no era la version correcta.

## 19 de marzo

Revise los manuales del DOBOT M1 para entender mejor el proceso de homing y calibracion. Tambien recopile informacion tecnica, guias y videos para contrastar el funcionamiento del robot y evitar errores durante las pruebas.

## 20 de marzo

Abrimos la zona donde se colocan los perifericos del robot, como pinza, ventosa, laser o impresora 3D, porque alli se encontraba una bateria extraible. Durante el intento de homing aparecio un aviso de bateria baja, por lo que no era posible completar la calibracion correctamente. Tambien revise un ejemplo en Python que Jesus me paso sobre el uso anterior del robot.

## 21 de marzo

Repase los tipos de movimiento del robot y conceptos de red como direcciones IP, puertas de enlace, mascaras y tipos de red. Tambien continue revisando el codigo Python del DOBOT M1.

## 23 de marzo

Quite el cabezal del DOBOT M1 para poder extraer la bateria que debia cambiarse antes de calibrar el robot. Tambien segui revisando el codigo que Jesus me habia pasado, usado anteriormente por el departamento de Informatica.

Ese dia tambien aprendi mejor los ejes del robot: el eje 3 corresponde al movimiento vertical, el eje 1 a la rotacion principal del brazo, el eje 2 al movimiento del codo y el eje 4 a la rotacion final limitada por los cables.

## 24 de marzo

Continue con la extraccion y revision de la bateria. Tambien estudie la API necesaria para que el codigo Python pudiera mover el robot. Ademas, prepare una animacion de los movimientos de los ejes usando Python, NumPy y Matplotlib, lo que me ayudo a entender los rangos de movimiento del DOBOT M1.

## 25 de marzo

Identifique las baterias del DOBOT M1 como baterias industriales **SAFT LS 1450 de 3,6 V**. Envie la informacion al tutor, Juan Antonio, para que pudiera comprarlas y asi poder avanzar con la calibracion del robot.

## 26 de marzo

Continue esperando la compra de las baterias necesarias para calibrar el brazo mecanico. Mientras tanto, segui mejorando el codigo, revisando posibles simulaciones y preparando el aprendizaje de ROS 2.

## 7 de abril

Despues de Semana Santa, retome el trabajo con la instalacion de las baterias y la configuracion final del robot. Revise si antes de calibrarlo era necesario dejarlo totalmente recto y correctamente anclado. Tambien comprobe que las baterias necesitaban soldadura por puntos, ya que no era recomendable soldarlas con estano.

## 8 de abril

Desde casa continue trabajando en la simulacion de un brazo mecanico para poder controlarlo sin depender del robot fisico. Tambien envie un correo para solicitar la herramienta necesaria para soldar correctamente las baterias.

## 9 de abril

Lleve las baterias de 3,6 V e intentamos avanzar con su instalacion. Tambien anclamos el robot a una placa de madera contrachapada para poder realizar las calibraciones con mas seguridad.

## 10 de abril

Intente repetir el homing del robot, ya que el dia anterior habia dado problemas. Revise la posibilidad de que un sensor lateral del eje 4 estuviera tapado por la cinta utilizada para sujetar las baterias. Tambien quedo pendiente soldar las pilas correctamente con el soldador por puntos.

## 12 de abril

Prepare un pequeno manual sobre el proceso de reinicio del DOBOT M1, especialmente enfocado en el homing y la calibracion.

## 20 de abril

Volvi despues de una semana de baja y revise si el robot ya podia moverse para empezar a trabajar con el de forma programable. Tambien empece a plantear demos de la interfaz grafica.

## 21 de abril

Comprobe que el robot seguia sin completar la calibracion. Al tener varios anos de uso, considere que necesitaba una revision o mantenimiento a fondo. Mientras gestionaba el contacto con la empresa reparadora, continue trabajando en el programa final siguiendo la arquitectura usada en otros robots del laboratorio, como el Magician.

## 23 de abril

Continue preocupado por el estado del DOBOT M1, ya que seguia sin funcionar y era necesario avanzar con el proyecto. Hable con el tutor para valorar posibles soluciones y poder continuar el trabajo dentro de los plazos.

## 24 de abril

Empece a trabajar en la arquitectura del proyecto. Mientras el departamento de Informatica buscaba la factura para poder gestionar una revision del robot, revise la documentacion para comprobar si era posible reiniciar o forzar el robot mediante Python y evitar temporalmente el paso de calibracion.

## 27 de abril

Comence el desarrollo del proyecto web siguiendo la arquitectura indicada por Jesus. Analice el material y la estructura que me habia proporcionado para crear el ecosistema necesario para trabajar con el robot cuando estuviera operativo.

## 28 de abril

Empece el desarrollo de la aplicacion web del DOBOT M1. Tambien revise la estructura interna del laboratorio remoto a partir del repositorio de Jesus. Identifique los principales bloques del sistema: MariaDB, ReNoLabs, VR-ISA y RIP-JS-Server.

## 29 de abril

Hable con Jesus para descargar y configurar los microservicios que faltaban, especialmente VR-ISA y RIP-JS-Server. Tambien empece a trabajar con la base de datos y a estudiar como redisenar la interfaz grafica usando Bootstrap.

## 30 de abril

Consegui dejar funcionando los principales servicios del entorno: VR-ISA como frontend, ReNoLabs como backend, MariaDB como base de datos y el acceso a la web del laboratorio donde realizan las practicas los alumnos.

## 4 de mayo

Trabaje en la incorporacion del DOBOT M1 a la interfaz oficial del laboratorio. Esto incluia la imagen del robot, la parte de control en Python, la adaptacion a la base de datos, la integracion con el backend de ReNoLabs y la modernizacion visual con Bootstrap.

## 6 de mayo

Continue actualizando la interfaz grafica moderna recomendada por Jesus. Tambien avance con la imagen y el gemelo del DOBOT M1 para que su presencia en el laboratorio fuese similar a la de los otros robots.

## 7 de mayo

Segui modernizando la pagina web del laboratorio para los alumnos. Tambien prepare el envio de un correo a la empresa fabricante para consultar cuanto podria costar una revision o reparacion del robot.

## 11 de mayo

Continue adaptando la interfaz grafica para agregar el DOBOT M1 como una actividad nueva para los alumnos. Ademas, segui gestionando el contacto con el fabricante para conocer el coste de una posible revision.

## 12 de mayo

Trabaje en terminar la interfaz principal para poder presentarsela a Jesus y recibir su revision. Tambien revise la posibilidad de avanzar con la automatizacion relacionada con OpenClaw.

## 14 de mayo

Continue con la preparacion de la web y la integracion del DOBOT M1. Aunque llegue mas tarde por sesiones de fisioterapia, segui avanzando para dejar la aplicacion preparada para futuras pruebas con el robot.

## 18 de mayo

Retome el trabajo despues del puente de mayo. A pesar de estar algo desanimado por problemas personales, continue avanzando para terminar la parte web y poder centrarme despues en el robot.

## 28 de mayo

Hable con el tutor y quedo establecido que el seguimiento continuaria principalmente por correo electronico debido a su operacion. Tambien se planteo enviar el robot a un tecnico de la universidad para revisarlo y comprobar si podia repararse.

## 29 de mayo

Trabaje en la configuracion de Blender para preparar animaciones y simulaciones a escala del DOBOT M1. Tambien consegui conectar el puente MCP entre Visual Studio y Blender para facilitar la preparacion de animaciones. Quedo pendiente reunirnos con Felix para entregar el robot al tecnico.

## 1 de junio

Continue puliendo la interfaz grafica. Tambien estaba prevista una reunion con Felix para realizar pruebas con el robot y prepararlo para enviarlo al tecnico especialista.

## 2 de junio

Me reuni con el tecnico especialista a las 13:30 para revisar el robot. Le facilite el software y la documentacion disponible del DOBOT M1 para que pudiera hacer el diagnostico con mas informacion.

## 8 de junio

Cerramos el robot despues de haberlo desmontado y revisado junto con Enrique, tecnico de la Facultad de Informatica. Tras varias pruebas, identificamos una averia en el encoder del eje 1, concretamente en su placa electronica. Al tratarse de una pieza OEM, facilite al tutor la informacion necesaria para solicitar el repuesto original al fabricante.

## 9 de junio

Continue esperando el repuesto del encoder y las claves necesarias para acceder a la Raspberry Pi. Mientras tanto, segui preparando la aplicacion para que la interfaz, la web y la simulacion quedasen listas para una futura conexion con el robot real.
