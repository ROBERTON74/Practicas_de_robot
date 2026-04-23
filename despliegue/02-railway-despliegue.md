# 02 - Despliegue en Railway

## Que es Railway

Plataforma en la nube gratuita (con limites) donde se puede alojar el servidor Node.js y la base de datos MySQL. Una vez desplegado cualquier persona puede acceder a la aplicacion desde internet sin instalar nada.

## Requisitos

- Cuenta en https://railway.app (registro gratuito)
- Git instalado en el ordenador
- El proyecto subido a un repositorio de GitHub

## Paso 1 - Subir el proyecto a GitHub

Si no tienes el proyecto en GitHub:

1. Crear un repositorio nuevo en https://github.com
2. En la terminal del proyecto ejecutar:

git init
git add .
git commit -m "primer commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main

## Paso 2 - Crear proyecto en Railway

1. Entrar en https://railway.app e iniciar sesion
2. Hacer clic en "New Project"
3. Elegir "Deploy from GitHub repo"
4. Seleccionar el repositorio del proyecto
5. Railway detectara automaticamente que es un proyecto Node.js

## Paso 3 - Agregar MySQL en Railway

1. Dentro del proyecto Railway hacer clic en "New Service"
2. Elegir "Database" y luego "MySQL"
3. Railway crea la base de datos automaticamente

## Paso 4 - Conectar la app con la base de datos

1. Hacer clic en el servicio MySQL de Railway
2. Ir a la pestana "Variables"
3. Copiar los valores de MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
4. Ir al servicio de la aplicacion Node.js
5. En "Variables" agregar estas variables de entorno:

DB_HOST=valor copiado de MYSQL_HOST
DB_PORT=valor copiado de MYSQL_PORT
DB_USER=valor copiado de MYSQL_USER
DB_PASSWORD=valor copiado de MYSQL_PASSWORD
DB_NAME=robot_mecanico
PORT=3000

## Paso 5 - Inicializar la base de datos

La primera vez hay que crear las tablas. En Railway, en el servicio MySQL:

1. Ir a la pestana "Query"
2. Copiar y pegar el contenido del archivo database/schema.sql
3. Ejecutar

## Paso 6 - Acceder a la aplicacion

Railway asigna una URL publica automaticamente (algo como https://tu-app.railway.app).
Esa URL es la que se comparte con otros para que accedan.

## Plan gratuito de Railway

- 500 horas de uso al mes (suficiente para uso personal)
- Si se acaban las horas el servicio se pausa hasta el mes siguiente
- La base de datos persiste aunque el servidor este pausado

## Actualizar la aplicacion despues de cambios

Cada vez que se hace git push al repositorio de GitHub, Railway redespliega automaticamente la aplicacion con los cambios nuevos.