# Puertos y Comunicación entre Microservicios

## La regla clave de los puertos en Docker

Cada línea `ports` en docker-compose tiene el formato **`HOST:CONTENEDOR`**:

```
"8082:80"
  ↑     ↑
  │     └── Puerto DENTRO del contenedor (donde escucha el proceso)
  └──── Puerto en TU MÁQUINA (donde tú accedes desde el navegador)
```

---

## Mapa completo de puertos

```
TU MÁQUINA (navegador / terminal)
│
│  localhost:8082  ──────►  [vrisa]  puerto 80 (nginx)
│                               │
│                               │  El HTML/JS/CSS se descarga al navegador.
│                               │  A partir de aquí el código corre EN TU NAVEGADOR,
│                               │  no en el servidor.
│                               │
│  localhost:3000  ──────►  [backend]  puerto 3000 (Node.js + PM2)
│                               │
│                               │  Red interna Docker → "db:3306"
│                               │  (nunca "localhost", nunca "3308")
│                               ▼
│  localhost:3308  ──────►  [db]  puerto 3306 (MariaDB)
│
│
│  ── Proyecto del profesor ──────────────────────────────────
│
│  localhost:80    ──────►  [ReNoLabs]  puerto 80 (Node.js)
│                               │
│                               │  Red interna Docker del profesor
│                               ▼
│  localhost:3307  ──────►  [db profesor]  puerto 3306 (MariaDB)
```

---

## Tabla resumen

| Servicio | Puerto HOST | Puerto CONTENEDOR | Quién accede |
|---|---|---|---|
| vrisa (nginx) | 8082 | 80 | Navegador → `localhost:8082/vr-isa/` |
| backend (Node.js) | 3000 | 3000 | Navegador / otros servicios → `localhost:3000` |
| db (MariaDB) | 3308 | 3306 | Solo backend (por dentro: `db:3306`) |
| ReNoLabs (profesor) | 80 | 80 | Navegador → `localhost` |
| db profesor (MariaDB) | 3307 | 3306 | Solo ReNoLabs (por dentro) |

---

## Los dos tipos de comunicación

### 1. Desde el navegador (externa)
El navegador usa el puerto del HOST (tu máquina):
```
Navegador → http://localhost:8082/vr-isa/   ← accede a vrisa
Navegador → http://localhost:3000/api/login ← accede al backend
```

### 2. Entre contenedores (interna — red Docker)
Los contenedores se hablan entre sí usando el **nombre del servicio** como si fuera un dominio:
```
backend → db:3306    ← NO usa localhost ni 3308
```
Docker crea una red privada automática. Dentro de esa red, cada contenedor
se llama igual que su servicio en docker-compose (`db`, `backend`, `vrisa`).

---

## Por qué MariaDB usa puertos distintos

| Instancia | Puerto HOST | Motivo |
|---|---|---|
| Nuestra MariaDB | 3308 | El 3306 estaba ocupado en local |
| MariaDB del profesor | 3307 | El 3306 estaba ocupado en local |

> Importante: esto solo afecta al acceso desde fuera (tu terminal).
> Dentro de Docker, ambas siguen usando el puerto 3306 internamente.
> No hay conflicto porque viven en redes Docker separadas.

---

## Flujo completo de una petición de login

```
1. Alumno escribe usuario y contraseña en vrisa
   └── vrisa (código JS en el navegador) hace:
       POST http://localhost:3000/api/login

2. El backend (Node.js en el contenedor) recibe la petición
   └── Consulta la base de datos:
       SELECT * FROM usuarios WHERE email = '...'
       → Dirección interna: db:3306

3. MariaDB responde al backend con los datos del usuario

4. El backend genera un token JWT y lo devuelve al navegador

5. vrisa guarda el JWT y lo adjunta en todas las peticiones siguientes
```

---

*Documento generado el 2026-04-30*
