# 04 - Frontend y Simulador SCARA

## Archivos clave

- public/index.html
- public/styles.css
- public/app.js

## Que se mejoro para parecerse al DOBOT M1

- Se paso de movimiento cartesiano simple a modelo por articulaciones.
- Se usan ejes J1/J2/Z/R con limites.
- Se agrego cinematica directa para calcular TCP en XY.
- Se agrego cinematica inversa para convertir XY a J1/J2 cuando llega estado remoto.
- Se separaron velocidades por eje para una sensacion mas real.

## Controles de teclado

- Flecha izquierda/derecha: J1
- Flecha arriba/abajo: J2
- W/S: Z
- Q/E: R

## Datos visibles en UI

- Angulos J1/J2 en grados.
- Recorrido Z en mm.
- Rotacion R en grados.
- Posicion TCP X/Y en mm.

## Por que ahora se siente mas realista

Porque un SCARA real no traslada todo el brazo como bloque: gira articulaciones y el extremo sigue trayectorias derivadas de esas articulaciones.

## Controles adicionales

- Espacio: abrir / cerrar pinza
- Raton (clic izquierdo + arrastrar): rotar camara
- Rueda del raton: zoom

## Mejoras visuales del simulador 3D

- Sombras realistas activadas en el renderer y en la luz direccional.
- Rejilla en el suelo para referencia espacial.
- Indicadores de ejes X (rojo), Y (verde), Z (azul) en el origen.
- Marcador naranja en el TCP en tiempo real.
- Control de camara implementado sin librerias externas.

## Pinza y simulacion fisica

- Pinza de dos dedos en el extremo del robot controlada con Espacio.
- 4 cubos de colores en el suelo dentro del alcance del robot.
- Para coger: posicionar encima del cubo, bajar Z a 0 mm, cerrar pinza.
- Al soltar, el objeto cae con gravedad simulada (9.8 m/s²) hasta el suelo.
- Estado de la pinza visible en el panel lateral.

## Panel de programacion Python (nuevo)

Se anadio un panel plegable al final de la pagina web con:

- Editor de codigo con fuente monoespaciada y soporte de tabulacion.
- Boton Ejecutar: envia el codigo al servidor y arranca el script.
- Boton Detener: para el script en cualquier momento.
- Consola: muestra los movimientos ejecutados, mensajes de log y errores en tiempo real.

Comportamiento importante:
- Mientras el cursor esta dentro del editor Python, el teclado no mueve el robot (para poder escribir con normalidad).
- Los movimientos generados por Python siguen el mismo camino que los del teclado: actualizan el target y el robot anima suavemente hasta la posicion indicada.
- Si hay sesion activa, los movimientos Python se registran en MySQL igual que los del teclado.
