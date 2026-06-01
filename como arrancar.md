# Como arrancar

Este proyecto tiene dos formas de ver el frontend de `vrisa`:

- frontend clasico: la version estable/original;
- frontend moderno: la version nueva de diseno.

Las dos usan la misma URL:

```text
http://localhost:8082/vr-isa/
```

No se abren a la vez. Primero eliges una version desde PowerShell y despues abres esa URL en el navegador.

## 1. Abrir PowerShell en la carpeta del proyecto

```powershell
cd "C:\Users\rober\Desktop\Pracicas WEBS\Proyecto Robot_Universitario"
```

## 2. Usar el frontend moderno

Cierra la web si la tienes abierta y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/usar-frontend-moderno.ps1
```

Cuando termine, abre:

```text
http://localhost:8082/vr-isa/
```

## 3. Usar el frontend clasico

Cierra la web si la tienes abierta y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/usar-frontend-clasico.ps1
```

Cuando termine, abre:

```text
http://localhost:8082/vr-isa/
```

## Nota importante

Si el script avisa de que hay cambios sin guardar, no continua para evitar mezclar versiones o perder trabajo.

En ese caso, guarda o commitea los cambios antes de cambiar entre clasico y moderno.

## Si estas trabajando en cambios nuevos

Los scripts cambian de rama cuando hace falta. Por seguridad, si hay archivos modificados sin guardar en Git, se paran.

Antes de alternar comodamente entre clasico y moderno conviene revisar y commitear los cambios pendientes.

Puedes comprobar donde estas con:

```powershell
git branch --show-current
```

Y puedes ver si hay cambios pendientes con:

```powershell
git status --short
```
