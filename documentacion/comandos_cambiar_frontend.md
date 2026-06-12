# Comandos para cambiar entre frontend clasico y moderno

Este documento contiene los comandos para cambiar entre la interfaz clasica y la interfaz moderna desde PowerShell.

## 1. Entrar en la carpeta del proyecto

```powershell
cd "C:\Users\rober\Desktop\Pracicas WEBS\Proyecto Robot_Universitario"
```

## 2. Ver la rama actual

```powershell
git branch --show-current
```

Interpretacion:

```text
main
```

significa que estas usando la interfaz clasica.

```text
frontend-modernizacion
```

significa que estas usando la interfaz moderna.

## 3. Cambiar a la interfaz clasica

La interfaz clasica esta en la rama `main`.

```powershell
.\scripts\usar-frontend-clasico.ps1
```

Abrir:

```text
http://localhost:8082/vr-isa/
```

## 4. Cambiar a la interfaz moderna

La interfaz moderna esta en la rama `frontend-modernizacion`.

```powershell
.\scripts\usar-frontend-moderno.ps1
```

Abrir:

```text
http://localhost:8082/vr-isa/
```

## 5. Si hay cambios sin guardar

Si el script muestra:

```text
Hay cambios sin guardar
```

guarda los cambios temporalmente con:

```powershell
git stash push -u -m "WIP antes de cambiar frontend"
```

Despues ejecuta el script que quieras:

```powershell
.\scripts\usar-frontend-clasico.ps1
```

o:

```powershell
.\scripts\usar-frontend-moderno.ps1
```

## 6. Ver cambios guardados con stash

```powershell
git stash list
```

## 7. Recuperar cambios guardados

Usar solo si quieres recuperar los cambios guardados temporalmente.

```powershell
git stash pop
```

## 8. Recargar navegador

Si cambiaste de version pero el navegador sigue mostrando la anterior:

```text
Ctrl + F5
```

Tambien puedes probar en ventana de incognito.

## 9. Resumen rapido

### Mostrar version clasica

```powershell
cd "C:\Users\rober\Desktop\Pracicas WEBS\Proyecto Robot_Universitario"
.\scripts\usar-frontend-clasico.ps1
```

### Mostrar version moderna

```powershell
cd "C:\Users\rober\Desktop\Pracicas WEBS\Proyecto Robot_Universitario"
.\scripts\usar-frontend-moderno.ps1
```

### URL comun

```text
http://localhost:8082/vr-isa/
```
