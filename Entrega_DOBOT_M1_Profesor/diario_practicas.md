# Diario de practicas

## 6 de mayo, miercoles

Durante este dia comence a actualizar el proyecto para poder implementar una interfaz grafica mas moderna, siguiendo la recomendacion de Jesus. El dia anterior ya habia avanzado con la incorporacion de la imagen y del gemelo del DOBOT M1, intentando que su integracion fuese similar a la de los otros robots disponibles en el laboratorio.

## 7 de mayo, jueves

Continue trabajando en la pagina web del laboratorio para los alumnos, con el objetivo de modernizarla tomando como referencia el material que nos habia proporcionado Jesus. Tambien prepare el envio de un correo a la empresa fabricante del robot para consultar el coste aproximado de una revision o reparacion.

## 11 de mayo, lunes

Segui trabajando en la copia y adaptacion de la interfaz grafica de la pagina web para poder agregar el DOBOT M1 como una nueva actividad disponible para los alumnos. Ademas, continue con la gestion del contacto con el fabricante para solicitar informacion sobre el coste de una posible revision del robot.

## 12 de mayo, martes

El objetivo de este dia fue terminar la interfaz principal del trabajo para poder presentarsela a Jesus y que pudiera revisarla. Tambien revise si era posible avanzar con la automatizacion mediante cron relacionada con OpenClaw.

## 14 de mayo, jueves

Continue avanzando con el proyecto, especialmente con la preparacion de la web y la integracion del DOBOT M1. Ese dia llegue mas tarde debido a las sesiones de fisioterapia que estaba realizando, pero pude seguir trabajando en la preparacion de la aplicacion para comprobar, en cuanto fuese posible, si el robot podia conectarse y probar sus funcionalidades.

## 18 de mayo, lunes

Retome el trabajo despues del puente de mayo. Fue un dia complicado a nivel personal por algunos problemas en casa, pero continue avanzando con la intencion de terminar cuanto antes la parte web y poder centrarme despues en la parte especifica del robot.

## 28 de mayo, jueves

Ese dia hable con el tutor y me comunico que no podriamos vernos mas presencialmente porque tenia que operarse. A partir de ese momento, mantendriamos el seguimiento del proyecto principalmente por correo electronico. Tambien hablamos de enviar el robot a un tecnico de la universidad para que pudiera revisarlo y comprobar si era posible repararlo.

## 29 de mayo, viernes

Trabaje en la configuracion de Blender para poder preparar animaciones a la escala del robot y generar simulaciones mas precisas de como deberia funcionar el DOBOT M1. Tambien consegui conectar el puente MCP, lo que permitia enlazar Visual Studio con Blender para facilitar la creacion de animaciones. Quedo pendiente reunirnos el lunes con Felix para entregar el robot al tecnico de la universidad y que pudiera revisarlo.

## 1 de junio, lunes

Durante este dia continue puliendo la interfaz grafica. Por la tarde estaba previsto reunirme con Felix para realizar pruebas con el robot y prepararlo para enviarlo al tecnico especialista encargado de revisarlo.

## 2 de junio, martes

Me reuni con el tecnico especialista a las 13:30 para comprobar si podia ayudarnos con el robot. Tambien le facilite el software y la documentacion disponible del DOBOT M1 para que pudiera realizar el diagnostico con mas informacion.

## 8 de junio, lunes

Este dia cerramos el robot, que la semana anterior habiamos estado desmontando junto con Enrique, tecnico de la Facultad de Informatica, quien nos ayudo con el diagnostico del problema.

Despues de realizar numerosas pruebas, conseguimos identificar el origen de la averia. El problema estaba en el encoder del eje 1, concretamente en su placa electronica, que presentaba un fallo.

Estas piezas son de tipo OEM, es decir, fabricadas especificamente para el fabricante del robot y no disponibles como componentes estandar en el mercado. Por este motivo, facilite a mi tutor los datos del fabricante para que pudiera solicitar el repuesto original y proceder a su sustitucion.

## 9 de junio, martes

A partir de este dia seguimos esperando el repuesto del encoder, que el tutor debia solicitar al fabricante del robot. Tambien me quedaba pendiente recibir de Jesus las claves necesarias para poder conectarnos a la Raspberry Pi y probar posteriormente la comunicacion con el robot.

Mientras tanto, continue preparando la aplicacion para que la parte web, la interfaz y la simulacion quedasen listas. El objetivo era que, cuando el robot estuviera reparado y la Raspberry disponible, solo fuese necesario completar la integracion fisica.

## 11 y 12 de junio

Durante estos dias trabaje en dejar preparada la entrega final del proyecto. Como el repuesto del robot probablemente no llegaria a tiempo antes de finalizar las practicas, enfoque el trabajo en dejar la aplicacion preparada para integracion futura.

Prepare un modo simulado o mock para el DOBOT M1, de forma que los botones de la interfaz pudieran enviar comandos y estos quedasen registrados aunque no existiera conexion fisica con el robot. Tambien documente el contrato de comandos que debera usar la Raspberry Pi o el controlador real cuando el robot vuelva a estar operativo.

Finalmente, valide que la actividad DOBOT M1 se podia iniciar en local, que el mock recibia comandos y que la interfaz quedaba preparada para continuar el trabajo cuando el hardware este disponible.
