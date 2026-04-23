# 01 - Docker en local

## Que hace Docker aqui

Levanta dos contenedores juntos con docker-compose:
- db: MySQL 8.4 con la base de datos robot_mecanico ya creada automaticamente
- app: Node.js con Python incluido, sirviendo la aplicacion en el puerto 3000

## Requisitos

- Docker Desktop instalado y arrancado
- No es necesario tener Node.js ni MySQL instalados en el ordenador

## Arrancar con Docker

Abrir una terminal en la raiz del proyecto y ejecutar:

docker-compose up --build

La primera vez tarda unos minutos porque descarga las imagenes de MySQL y Node.js.

Cuando aparezca el mensaje "Robot web app listening on http://localhost:3000" abrir el navegador en:

http://localhost:3000

## Parar los contenedores

Pulsar Ctrl+C en la terminal donde corre docker-compose, o en otra terminal ejecutar:

docker-compose down

## Parar y borrar todos los datos de la base de datos

docker-compose down -v

El flag -v borra el volumen donde se guardan los datos de MySQL. Usar solo si se quiere empezar desde cero.

## Reconstruir la imagen despues de cambiar codigo

Si se modifica algun archivo del proyecto hay que reconstruir la imagen:

docker-compose up --build

## Ver los logs de un contenedor especifico

docker-compose logs app
docker-compose logs db

## Diferencia con arrancar sin Docker

Sin Docker: necesitas Node.js, MySQL y Python instalados en tu ordenador y arrancarlos por separado.

Con Docker: un solo comando levanta todo. No necesitas instalar nada mas.