# Arquitectura de Microservicios — Robot Universitario

Documento técnico que describe la arquitectura del sistema y el flujo completo de comunicación entre cada microservicio del proyecto **Robot Universitario**.

---

## Flujo de Trabajo Completo

El diagrama muestra las tres fases del sistema: autenticación del alumno, operación desde el panel de control y control físico del robot.

```mermaid
flowchart TD
    USER(["👤 ALUMNO\nNavegador Web"])

    subgraph AUTH ["🔐  FASE 1 — AUTENTICACIÓN"]
        direction TB
        L1["vrisa · Vue.js\n━━━━━━━━━━━━━━\nFormulario de Login"]
        L2["ReNoLabs · Node.js\n━━━━━━━━━━━━━━\nVerifica credenciales\nen MariaDB"]
        L3{"¿Credenciales\ncorrectas?"}
        L4["✅ Genera JWT Token\nfirmado y seguro"]
        L5["❌ Error de acceso\nCredenciales inválidas"]
    end

    subgraph OPERACION ["⚙️  FASE 2 — OPERACIÓN"]
        direction TB
        O1["vrisa · Vue.js\n━━━━━━━━━━━━━━\nPanel de control\ndel laboratorio"]
        O2{"¿JWT Token\nválido?"}
        O3["❌ Sesión expirada\nToken inválido"]
        O4["ReNoLabs · Node.js\n━━━━━━━━━━━━━━\nProcesa la petición\ny consulta datos"]
        O5[("MariaDB\n━━━━━━━━━━━━━━\nGuarda y recupera\ndatos del alumno")]
    end

    subgraph ROBOT ["🤖  FASE 3 — CONTROL DEL ROBOT"]
        direction TB
        R1["rip-js-server\n━━━━━━━━━━━━━━\nProtocolo RIP\nTraductor de comandos"]
        R2["🦾 Robot Físico\n━━━━━━━━━━━━━━\nLaboratorio real\nActuadores y sensores"]
    end

    USER         -->|"① Introduce usuario\n    y contraseña"| L1
    L1           -->|"② POST /login\n    HTTP Request"| L2
    L2           -->|"③ SQL Query\n    Red interna Docker"| L3
    L3           -->|"SÍ ✅"| L4
    L3           -->|"NO ❌"| L5
    L5           -.->|"Vuelve al\nformulario"| L1
    L4           -->|"④ JWT Token\n    devuelto al navegador"| O1

    O1           -->|"⑤ Petición +\n    JWT Token en cabecera"| O2
    O2           -->|"NO ❌"| O3
    O3           -.->|"Redirige al\nlogin"| L1
    O2           -->|"SÍ ✅"| O4
    O4           <-->|"⑥ SQL Query\n    Red interna Docker"| O5
    O4           -->|"⑦ Comando RIP\n    WebSocket / TCP"| R1

    R1           -->|"⑧ Señal de control\n    Interfaz hardware"| R2
    R2           -->|"⑨ Datos del robot\n    Sensores / Estado"| R1
    R1           -->|"⑩ Resultado\n    de la operación"| O4
    O4           -->|"⑪ JSON Response\n    HTTP"| O1
    O1           -->|"⑫ Actualiza pantalla\n    en tiempo real"| USER

    style USER   fill:#2980B9,stroke:#1A5276,color:#fff
    style L1     fill:#27AE60,stroke:#1E8449,color:#fff
    style L2     fill:#1ABC9C,stroke:#148F77,color:#fff
    style L3     fill:#F39C12,stroke:#B7770D,color:#fff
    style L4     fill:#27AE60,stroke:#1E8449,color:#fff
    style L5     fill:#E74C3C,stroke:#A93226,color:#fff
    style O1     fill:#27AE60,stroke:#1E8449,color:#fff
    style O2     fill:#F39C12,stroke:#B7770D,color:#fff
    style O3     fill:#E74C3C,stroke:#A93226,color:#fff
    style O4     fill:#1ABC9C,stroke:#148F77,color:#fff
    style O5     fill:#E67E22,stroke:#A04000,color:#fff
    style R1     fill:#8E44AD,stroke:#6C3483,color:#fff
    style R2     fill:#C0392B,stroke:#922B21,color:#fff
```

---

## Resumen de Fases

| Fase | Qué ocurre | Servicios implicados |
|------|-----------|----------------------|
| **① Autenticación** | El alumno introduce sus credenciales. ReNoLabs las verifica en MariaDB. Si son correctas devuelve un JWT Token. | vrisa → ReNoLabs → MariaDB |
| **② Operación** | El alumno usa el panel de control. Cada petición lleva el JWT Token. ReNoLabs lo verifica, consulta la base de datos y procesa la acción. | vrisa → ReNoLabs ↔ MariaDB |
| **③ Control del robot** | ReNoLabs envía comandos al robot mediante el protocolo RIP. El robot ejecuta la acción y devuelve los datos al alumno. | ReNoLabs → rip-js-server → Robot |

---

## Descripción de cada Microservicio

| Servicio | Tecnología | Rol en el sistema |
|----------|-----------|-------------------|
| **vrisa** | Vue.js | Interfaz visual del alumno. Muestra el panel de control, envía peticiones al backend y actualiza la pantalla con los resultados en tiempo real. |
| **ReNoLabs** | Node.js + Express.js + PM2 | Núcleo del sistema. Expone la API REST, valida el JWT Token en cada petición, consulta MariaDB y envía comandos al robot. PM2 lo mantiene siempre activo. |
| **MariaDB** | MariaDB | Almacena usuarios, sesiones, resultados de pruebas y configuraciones del laboratorio. Solo accesible desde la red interna de Docker. |
| **rip-js-server** | JavaScript · Protocolo RIP | Capa de comunicación entre el backend y el robot. Traduce los comandos de software a señales que el hardware puede interpretar. |
| **Robot Físico** | Hardware | Laboratorio real. Ejecuta las acciones físicas y devuelve datos de sensores y actuadores al sistema. |

---

## Protocolos de Comunicación

| Tramo | Protocolo | Datos transmitidos |
|-------|----------|--------------------|
| Alumno → vrisa | HTTP / HTTPS | Credenciales, acciones del usuario |
| vrisa → ReNoLabs | REST + JWT | JSON con datos de la petición |
| ReNoLabs ↔ MariaDB | SQL | Consultas y resultados de base de datos |
| ReNoLabs → rip-js-server | WebSocket / TCP · RIP | Comandos de control del robot |
| rip-js-server → Robot | Interfaz hardware · RIP | Señales físicas de control y lectura de sensores |

---

## Aislamiento con Docker

Cada microservicio corre en su propio contenedor Docker, aislado del resto. Todos comparten la misma red interna virtual, por lo que se comunican entre sí sin exponer puertos innecesarios al exterior.

```
┌──────────────────────────────────────────────────┐
│                  RED DOCKER INTERNA              │
│                                                  │
│   ┌───────────┐        ┌────────────────────┐   │
│   │   vrisa   │ ──────►│     ReNoLabs       │   │
│   │  Vue.js   │◄─────  │  Node.js + PM2     │   │
│   │  :80      │        │  :3000             │   │
│   └───────────┘        └────────┬───────────┘   │
│                                 │                │
│                    ┌────────────▼───────────┐    │
│                    │       MariaDB          │    │
│                    │   Base de Datos        │    │
│                    │   :3306 (interno)      │    │
│                    └────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
         │ rip-js-server · Protocolo RIP
         ▼
   🤖 Robot Físico
```

> El profesor puede levantar todo el entorno con un único comando: `docker-compose up --build`

---

*Actualizar este documento ante cualquier cambio en la arquitectura del sistema.*
