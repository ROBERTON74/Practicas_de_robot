# Cómo añadir un nuevo robot al laboratorio

Este documento explica paso a paso todo lo necesario para incorporar un nuevo robot a la plataforma VR-ISA Labs.

---

## Qué necesitas antes de empezar

| Elemento | Formato | Quién lo prepara |
|---|---|---|
| Foto del robot | PNG o JPG | Tú / el profesor |
| Nombre de la actividad | Texto | Tú / el profesor |
| Controller ZIP | `.zip` con `_metadata.txt` dentro | El profesor |
| View ZIP | `.zip` con `_metadata.txt` dentro | El profesor |

---

## Estructura del Controller ZIP

El ZIP del controlador debe contener un archivo `_metadata.txt` con este formato:

```
name: Nombre del Controlador
type: Python   ← (Python, C, Dobot, Arduino, TwinCAT, Javascript, Agent)
main-script: nombre_del_script.py
author: Nombre del autor
```

Además debe incluir el script principal que controla el robot.

---

## Estructura del View ZIP

El ZIP de la vista debe contener un archivo `_metadata.txt` con este formato:

```
title: Nombre de la Vista
main-simulation: archivo_principal.xhtml
html-description: archivo_descripcion.html  ← (opcional)
author: Nombre del autor
```

Además debe incluir todos los archivos HTML/XHTML/JS de la interfaz gráfica (generada normalmente con EjsS).

---

## Pasos para añadir el robot

### Paso 1 — Copiar la foto
Copiar la imagen del robot a la carpeta de imágenes de vrisa:
```
vrisa/src/assets/activities/NombreFoto.png
```
Después hay que reconstruir el contenedor vrisa:
```bash
cd "Proyecto Robot_Universitario"
docker-compose up --build vrisa -d
```

### Paso 2 — Copiar los ZIPs a fixtures
Copiar los ZIPs del nuevo robot a:
```
ReNoLabs/fixtures/Controller_NuevoRobot.zip
ReNoLabs/fixtures/View_NuevoRobot.zip
```

### Paso 3 — Importar con el script
Añadir el nuevo robot al script `ReNoLabs/import_fixtures.js` en las secciones correspondientes y ejecutarlo:
```bash
docker exec docker-vrlabs_node-1 node //home/node/app/import_fixtures.js
```

### Paso 4 — Asignar imagen en MySQL
```bash
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  UPDATE Activities SET image = 'NombreFoto.png' WHERE name = 'Nombre de la Actividad';"
```

### Paso 5 — Asignar la actividad a los usuarios
```bash
docker exec docker-vrlabs_db-1 mysql -u root -p"admin" renolabs -e "
  INSERT INTO UserActivities (UserUsername, ActivityName, createdAt, updatedAt)
  VALUES ('admin', 'Nombre de la Actividad', NOW(), NOW());"
```

---

## Robots actualmente en el sistema

| Actividad | Controlador | Vista | Imagen |
|---|---|---|---|
| Robot DOBOT Magician | DOBOT Controller (Dobot) | DOBOTMagician_LaboratorioRemoto | Dobot.png |
| Air Flow Levitation | Arduino Controller (Arduino) | Air Flow Levitation System | Hover3DoF.png |
| Sistemas Lineales | Circuit Controller (C) | Sistemas Lineales - Práctica de Identificación | sistemas_lineales.png |

---

## Notas importantes

- Los ZIPs **deben tener** `_metadata.txt` dentro o el sistema no los reconocerá.
- La foto debe estar en `vrisa/src/assets/activities/` y el contenedor vrisa debe reconstruirse (`--build`) para que la imagen esté disponible.
- El tipo del controlador (`type` en `_metadata.txt`) debe ser uno de los soportados: `Python`, `C`, `Dobot`, `Arduino`, `TwinCAT`, `Javascript`, `Agent`.
- Si rip-js-server no está activo, el robot aparecerá en la lista pero no se podrá interactuar con él.
