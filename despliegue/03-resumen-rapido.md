# 03 - Resumen Rapido

## Opcion A - Usar en local sin Docker (como hasta ahora)

1. Abrir terminal en la raiz del proyecto
2. node server/app.js
3. Abrir http://localhost:3000
4. Para cerrar: Ctrl+C en la terminal

## Opcion B - Usar en local con Docker

1. Tener Docker Desktop arrancado
2. docker-compose up --build
3. Abrir http://localhost:3000
4. Para cerrar: Ctrl+C o docker-compose down

## Opcion C - Usar en la nube con Railway

1. Subir proyecto a GitHub
2. Crear cuenta en railway.app
3. Conectar el repositorio
4. Agregar servicio MySQL
5. Configurar variables de entorno
6. Acceder por la URL publica que Railway asigna

## Diferencias clave

| Opcion | Quien puede acceder | Requiere instalar |
|--------|--------------------|--------------------|
| Local sin Docker | Solo tu ordenador | Node.js, MySQL, Python |
| Local con Docker | Solo tu ordenador | Docker Desktop |
| Railway | Cualquiera en internet | Nada (solo navegador) |

## Archivos Docker creados

- Dockerfile — define como construir la imagen de la aplicacion
- docker-compose.yml — levanta la app y MySQL juntos con un solo comando
- .dockerignore — archivos que no se incluyen en la imagen (node_modules, .env, etc.)

## Documentacion completa

- despliegue/01-docker-local.md — instrucciones detalladas para Docker en local
- despliegue/02-railway-despliegue.md — instrucciones paso a paso para Railway