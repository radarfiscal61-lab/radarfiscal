# Termómetro de Riesgo Fiscal

Plataforma de inteligencia preventiva para la detección temprana de patrones de fiscalización en México.

## 🚧 Estado del Proyecto: FASE 1 (Construcción)

### Arquitectura
Este proyecto sigue una **Arquitectura Cloud-Native Desacoplada**:

*   **Frontend (/frontend):** React + Vite (Static Build). Procesamiento Client-Side "Zero-Knowledge" de XMLs.
*   **Backend (/backend):** Node.js + Express. API REST para gestión de Leads y Oráculos (Listas Negras).
*   **Base de Datos:** TiDB Serverless (MySQL Compatible).

### Estructura del Repositorio

```
/
├── backend/            # API Service (Node.js)
│   ├── src/
│   ├── .env.example
│   └── package.json
├── frontend/           # UI Client (React)
│   ├── src/
│   └── package.json
└── docs/               # Documentación Técnica
    └── arquitectura_y_logica.md
```

## 🚀 Despliegue

### Backend (Render)
El backend se despliega como un **Web Service** en Render.
- Build Command: `npm install`
- Start Command: `node index.js` (o `npm start`)
- Environment Variables requeridas: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`, `CORS_ORIGIN`.

### Base de Datos (TiDB)
Utiliza una instancia TiDB Serverless.
- Schema compatible con MySQL 5.7/8.0.
- Requiere conexión segura (SSL).

## 🛡️ Privacidad y Seguridad
*   **Zero-Knowledge:** Los archivos XML procesados en el frontend NUNCA se envían al backend.
*   **Datos en DB:** Solo se almacenan datos de contacto (Leads) y metadatos anónimos de riesgo.

## 🛠️ Setup Local

1.  **Backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Configurar credenciales de DB en .env
    npm start
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
