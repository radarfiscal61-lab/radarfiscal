# ESPECIFICACIONES TÉCNICAS Y LÓGICA DE NEGOCIO: PLATAFORMA "TERMÓMETRO DE RIESGO FISCAL"

## 1. Visión y Alcance del Producto

El **Termómetro de Riesgo Fiscal** es un sistema de inteligencia preventiva diseñado para emular los algoritmos de pre-selección y detección de discrepancias utilizados por la autoridad fiscal (SAT). Su función es actuar como un **radar de detección temprana**, identificando patrones matemáticos y fiscales que estadísticamente elevan la probabilidad de un acto de fiscalización.

**Naturaleza de la Herramienta:**
*   **Radar Preventivo:** Identifica anomalías antes de que se conviertan en requerimientos.
*   **No Resolutivo:** El sistema alerta sobre la existencia de un riesgo, pero no ejecuta correcciones automáticas ni sugiere estrategias elusivas.
*   **Inductor de Asesoría:** Su diseño lógico conduce inevitablemente a la necesidad de un criterio humano experto para la interpretación y corrección de los hallazgos.

**Cláusula de Responsabilidad:**
> "Esta herramienta realiza un análisis matemático-estadístico sobre Comprobantes Fiscales Digitales. Los resultados presentados NO constituyen asesoría fiscal, legal, ni un dictamen preventivo profesional. La interpretación correcta de estos datos requiere la intervención de un especialista certificado."

---

## 2. Arquitectura de Producción (Render + TiDB)

La infraestructura se define bajo un modelo "Decoupled Cloud Architecture", separando estrictamente la presentación, la lógica de negocio y la persistencia de datos para garantizar escalabilidad y seguridad.

### A. Frontend (Build Estático)
*   **Hosting:** Hostinger (o Render Static Site).
*   **Tecnología:** React (Vite) + TypeScript.
*   **Responsabilidad:** 
    *   Interfaz de Usuario (UI).
    *   **Procesamiento Client-Side (Zero-Knowledge):** Parseo de XMLs y ejecución del algoritmo SRF en el navegador del usuario.
    *   Visualización de resultados (Capa Pública / Capa Privada).

### B. Backend (Render)
*   **Hosting:** Render (Web Service).
*   **Tecnología:** Node.js (Express).
*   **Responsabilidad:**
    *   **API Gateway:** Punto único de entrada para leads y control de acceso.
    *   **Gestión de Leads:** Recepción y validación de formularios.
    *   **Gatekeeper:** Generación de tokens de sesión temporales para desbloquear el diagnóstico post-gate.
    *   **Logística:** Envío de correos transaccionales (PDFs) y alertas internas.
    *   **Seguridad:** Rate Limiting y CORS estricto.

### C. Base de Datos (TiDB Cloud)
*   **Proveedor:** TiDB Serverless (MySQL Compatible).
*   **Rol:** Fuente única de verdad para Leads y Auditoría.
*   **Motivo de Selección:** Arquitectura distribuida nativa de nube, escalabilidad automática y alta disponibilidad sin mantenimiento de servidor (Serverless), superior a bases de datos tradicionales de hosting compartido.

---

## 3. Principios de Infraestructura (No Negociables)

1.  **Desacoplamiento Total:** El Backend (API) es agnóstico del hosting donde vive el Frontend. Pueden moverse independientemente sin romper el sistema.
2.  **Base de Datos Gestionada:** No administrar servidores de DB. El uso de TiDB garantiza que el almacenamiento escala con la demanda sin intervención manual.
3.  **Zero-Knowledge en Persistencia:** La Base de Datos NUNCA almacenará contenido de XMLs, montos detallados de facturas o RFCs de terceros. Solo almacena metadatos del Lead y Scores agregados.
4.  **Infraestructura Inmutable:** Los despliegues son atómicos. No se modifican archivos en el servidor en ejecución; se reemplazan contenedores/builds completos.

---

## 4. Modelo de Datos (TiDB - MySQL Compatible)

El esquema está optimizado para TiDB.

### Script SQL Inicial (Schema)

```sql
-- Configuración
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabla de Leads (Activo del Negocio)
CREATE TABLE `leads` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20),
  `business_sector` VARCHAR(100),
  `risk_score_captured` TINYINT UNSIGNED, -- Score al momento del registro
  `conversion_status` ENUM('NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED') DEFAULT 'NEW',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_email` (`email`),
  INDEX `idx_status` (`conversion_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Auditoría de Sistema (Anonimizado)
CREATE TABLE `system_audit` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL, -- 'ANALYSIS_COMPLETED', 'LEAD_CAPTURED'
  `risk_level_detected` ENUM('BAJO', 'MEDIO', 'ALTO', 'CRITICO'),
  `meta_json` JSON, -- Almacenamiento flexible para metadatos no sensibles
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---

## 5. Motor de Riesgo (SRF) Formalizado

### 5.1 Fórmula Maestra

El `GlobalRiskScore` (0-100) se calcula como una suma ponderada de vectores de riesgo, acotada a 100.

$$
Score = \min\left(100, \sum (R_i \times W_i)\right)
$$

Donde:
*   $R_i$: Valor del riesgo individual (normalizado 0-1).
*   $W_i$: Peso del vector (Puntos máximos que aporta).

### 5.2 Vectores y Pesos ($W_i$)

| Vector de Riesgo ($i$) | Peso ($W_i$) | Descripción | Condición de Activación ($R_i=1$) |
| :--- | :--- | :--- | :--- |
| **V1. Integridad (EFOS)** | **60 pts** | Presencia de proveedores en listas negras. | `Count(Prov_EFOS_Definitivos) > 0` |
| **V2. Rentabilidad** | **25 pts** | Margen de utilidad peligrosamente bajo. | `Margen < 5%` Y `Ingresos > $200k` |
| **V3. Formalidad PUE** | **15 pts** | Simulación de pago (PUE + No Bancarizado). | `Metodo='PUE'` Y `Forma='99'/'PorDefinir'` |

*Nota: Si V1 se activa (hay EFOS), el score base ya es 60 (Riesgo Alto).*

### 5.3 Pseudocódigo de Ejecución (Client-Side)

```typescript
function calculateRiskScore(xmls: CFDI[], blacklists: Set<string>): RiskResult {
    let scoreAccumulator = 0;
    
    // 1. Análisis de EFOS (Vector Crítico - 60 pts)
    const distinctRFCs = extractUniqueEmisors(xmls);
    const efosFound = distinctRFCs.filter(rfc => blacklists.has(rfc));
    
    if (efosFound.length > 0) {
        scoreAccumulator += 60; 
    }

    // 2. Análisis de Rentabilidad (25 pts)
    const totalIngreso = sumValidSubtotals(xmls, 'I');
    const totalDeduccion = sumValidSubtotals(xmls, 'E');
    const margen = (totalIngreso - totalDeduccion) / totalIngreso;

    if (totalIngreso > 200000 && margen < 0.05) {
        scoreAccumulator += 25;
    } else if (totalIngreso > 200000 && margen < 0.10) {
         scoreAccumulator += 10;
    }

    // 3. Análisis Formal (15 pts)
    const irregularPayments = xmls.filter(xml => 
        xml.MetodoPago === 'PUE' && xml.FormaPago === '99'
    ).length;

    if (irregularPayments > 0) {
        scoreAccumulator += Math.min(15, irregularPayments * 2); 
    }

    return {
        score: Math.min(100, scoreAccumulator),
        details: { efosFound, margen, irregularPayments }
    };
}
```

---

## 6. Estrategia de Despliegue Detallada

La configuración de producción es estricta.

### 6.1 Configuración Base de Datos (TiDB Cloud)
1.  Crear Cluster Serverless.
2.  Obtener Connection String segura (TLS obligatorio).
3.  Permitir acceso desde IP de Render (0.0.0.0/0 controlado por autenticación).

### 6.2 Configuración Backend (Render)
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`
*   **Environment Variables:**
    *   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Datos de TiDB).
    *   `DB_SSL`: `true`.
    *   `CORS_ORIGIN`: `https://analisis.tudominio.com`.

### 6.3 Configuración Frontend (Hostinger / Render Static)
*   Hostear únicamente los archivos estáticos de la carpeta `dist/`.
*   Configurar redirecciones SPA (Todo tráfico a `index.html`).
*   Variable de entorno `VITE_API_URL` apuntando al servicio de Render (`https://api-termometro.onrender.com`).

---

## 7. Confirmación de Viabilidad

Validación final de la arquitectura propuesta:

*   **Arquitectura final validada:** **SÍ**. Modelo Cloud-Native desacoplado.
*   **Backend en Render:** **SÍ**. Como orquestador de API y seguridad.
*   **Base de datos en TiDB:** **SÍ**. Como motor de persistencia escalable y robusto.
*   **Compliance:** Se mantiene el principio Zero-Knowledge respetando la privacidad fiscal.

**Estado:** Documentación cerrada. Listo para fase de construcción de infraestructura.
