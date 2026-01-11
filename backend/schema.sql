-- Configuración
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabla de Leads (Activo del Negocio)
CREATE TABLE IF NOT EXISTS `leads` (
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
CREATE TABLE IF NOT EXISTS `system_audit` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL, -- 'ANALYSIS_COMPLETED', 'LEAD_CAPTURED'
  `risk_level_detected` ENUM('BAJO', 'MEDIO', 'ALTO', 'CRITICO'),
  `meta_json` JSON, -- Almacenamiento flexible para metadatos no sensibles
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
