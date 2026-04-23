# 07 - Problemas Comunes y Soluciones

## Problema 1: node no se reconoce

Causa:
- PATH no actualizado en la terminal actual.

Solucion:
1. Cerrar y abrir VS Code.
2. Verificar con node -v y npm -v.
3. Mientras tanto, usar ruta absoluta:
- & "C:\Program Files\nodejs\node.exe" "server/app.js"

## Problema 2: npm run dev falla pero node funciona

Causa:
- npm invoca node por PATH y no lo encuentra.

Solucion:
- Reiniciar terminal/VS Code.
- Confirmar que C:\Program Files\nodejs esta en PATH.

## Problema 3: localhost no abre

Revision rapida:
1. Confirmar servidor activo.
2. Probar salud API:
- Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/health

## Problema 4: no guarda movimientos en DB

Revision rapida:
1. Confirmar sesion iniciada en la UI.
2. Revisar credenciales en .env.
3. Verificar tabla movement_logs con SELECT.

## Problema 5: EADDRINUSE puerto 3000 al arrancar

Causa:
- El proceso anterior no se cerro correctamente (se cerro la terminal sin Ctrl+C) y el proceso node sigue ocupando el puerto 3000.

Solucion rapida en PowerShell (mata todos los procesos node):

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Despues volver a ejecutar node server/app.js.

Prevencion: siempre pulsar Ctrl+C en la terminal del servidor antes de cerrar la terminal o apagar el ordenador.

## Problema 6: el servidor parece "colgado" despues de arrancar

No es un error. Node.js mantiene el proceso activo en segundo plano esperando peticiones HTTP y conexiones WebSocket. La terminal no devuelve el prompt porque el servidor esta corriendo. Es el comportamiento correcto. Para pararlo pulsar Ctrl+C.

## Problema 7: movimiento no se parece al robot real

Ajustes recomendados:
- Calibrar limites de J1/J2.
- Calibrar longitudes de eslabones.
- Ajustar velocidades por eje.
- Validar orden de giro y postura codo-arriba/codo-abajo.