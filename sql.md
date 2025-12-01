-- BASE DE DATOS COMPLEMENTARIA (OPCIONAL)
-- Este script SQL puede usarse para crear una base de datos relacional
-- complementaria que almacene datos históricos para análisis avanzado

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS orquideas_monitor;
USE orquideas_monitor;

-- Tabla de dispositivos/sensores
CREATE TABLE IF NOT EXISTS dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
    fecha_instalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de lecturas de sensores (datos históricos)
CREATE TABLE IF NOT EXISTS lecturas_sensores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    temperatura DECIMAL(5,2) NOT NULL,
    humedad DECIMAL(5,2) NOT NULL,
    fecha_lectura DATETIME NOT NULL,
    timestamp_sistema BIGINT,
    es_valida BOOLEAN DEFAULT TRUE,
    INDEX idx_device_fecha (device_id, fecha_lectura),
    INDEX idx_fecha (fecha_lectura),
    INDEX idx_timestamp (timestamp_sistema),
    FOREIGN KEY (device_id) REFERENCES dispositivos(device_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de horarios de riego
CREATE TABLE IF NOT EXISTS horarios_riego (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    hora_riego TIME NOT NULL,
    dias_semana VARCHAR(20) NOT NULL COMMENT 'Formato: 1,3,5 (0=Domingo, 6=Sábado)',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_activo (device_id, activo),
    FOREIGN KEY (device_id) REFERENCES dispositivos(device_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    tipo_alerta ENUM('temperature_low', 'temperature_high', 'humidity_low', 'humidity_high', 'device_offline') NOT NULL,
    mensaje TEXT NOT NULL,
    temperatura DECIMAL(5,2),
    humedad DECIMAL(5,2),
    nivel_severidad ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    fecha_alerta DATETIME NOT NULL,
    fecha_resolucion DATETIME NULL,
    resuelta BOOLEAN DEFAULT FALSE,
    INDEX idx_device_fecha (device_id, fecha_alerta),
    INDEX idx_tipo (tipo_alerta),
    INDEX idx_resuelta (resuelta),
    INDEX idx_severidad (nivel_severidad),
    FOREIGN KEY (device_id) REFERENCES dispositivos(device_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    parametro VARCHAR(100) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_device_param (device_id, parametro),
    FOREIGN KEY (device_id) REFERENCES dispositivos(device_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios (opcional)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de log de eventos
CREATE TABLE IF NOT EXISTS log_eventos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    tipo_evento VARCHAR(100) NOT NULL,
    descripcion TEXT,
    datos_adicionales JSON,
    fecha_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_fecha (device_id, fecha_evento),
    INDEX idx_tipo (tipo_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista: Lecturas recientes (últimas 24 horas)
CREATE OR REPLACE VIEW lecturas_recientes AS
SELECT 
    l.id,
    l.device_id,
    d.nombre AS nombre_dispositivo,
    l.temperatura,
    l.humedad,
    l.fecha_lectura,
    CASE 
        WHEN l.temperatura BETWEEN 18 AND 24 AND l.humedad BETWEEN 75 AND 85 THEN 'Óptimo'
        WHEN l.temperatura BETWEEN 16 AND 26 AND l.humedad BETWEEN 70 AND 90 THEN 'Aceptable'
        ELSE 'Fuera de rango'
    END AS estado_condiciones
FROM lecturas_sensores l
JOIN dispositivos d ON l.device_id = d.device_id
WHERE l.fecha_lectura >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY l.fecha_lectura DESC;

-- Vista: Estadísticas diarias
CREATE OR REPLACE VIEW estadisticas_diarias AS
SELECT 
    DATE(fecha_lectura) AS fecha,
    device_id,
    COUNT(*) AS total_lecturas,
    AVG(temperatura) AS temp_promedio,
    MIN(temperatura) AS temp_minima,
    MAX(temperatura) AS temp_maxima,
    AVG(humedad) AS hum_promedio,
    MIN(humedad) AS hum_minima,
    MAX(humedad) AS hum_maxima
FROM lecturas_sensores
GROUP BY DATE(fecha_lectura), device_id
ORDER BY fecha DESC;

-- Vista: Alertas activas
CREATE OR REPLACE VIEW alertas_activas AS
SELECT 
    a.id,
    a.device_id,
    d.nombre AS nombre_dispositivo,
    a.tipo_alerta,
    a.mensaje,
    a.nivel_severidad,
    a.fecha_alerta,
    TIMESTAMPDIFF(HOUR, a.fecha_alerta, NOW()) AS horas_desde_alerta
FROM alertas a
JOIN dispositivos d ON a.device_id = d.device_id
WHERE a.resuelta = FALSE
ORDER BY a.nivel_severidad DESC, a.fecha_alerta DESC;

-- Procedimiento: Insertar lectura de sensor
DELIMITER //
CREATE PROCEDURE sp_insertar_lectura(
    IN p_device_id VARCHAR(50),
    IN p_temperatura DECIMAL(5,2),
    IN p_humedad DECIMAL(5,2),
    IN p_timestamp BIGINT
)
BEGIN
    DECLARE v_es_valida BOOLEAN DEFAULT TRUE;
    
    -- Validar rangos razonables
    IF p_temperatura < -10 OR p_temperatura > 50 THEN
        SET v_es_valida = FALSE;
    END IF;
    
    IF p_humedad < 0 OR p_humedad > 100 THEN
        SET v_es_valida = FALSE;
    END IF;
    
    -- Insertar lectura
    INSERT INTO lecturas_sensores (
        device_id, 
        temperatura, 
        humedad, 
        fecha_lectura, 
        timestamp_sistema,
        es_valida
    ) VALUES (
        p_device_id,
        p_temperatura,
        p_humedad,
        NOW(),
        p_timestamp,
        v_es_valida
    );
    
    -- Verificar y crear alertas si es necesario
    CALL sp_verificar_alertas(p_device_id, p_temperatura, p_humedad);
    
END //
DELIMITER ;

-- Procedimiento: Verificar y crear alertas
DELIMITER //
CREATE PROCEDURE sp_verificar_alertas(
    IN p_device_id VARCHAR(50),
    IN p_temperatura DECIMAL(5,2),
    IN p_humedad DECIMAL(5,2)
)
BEGIN
    -- Alerta de temperatura baja
    IF p_temperatura < 18 THEN
        INSERT INTO alertas (device_id, tipo_alerta, mensaje, temperatura, humedad, nivel_severidad, fecha_alerta)
        VALUES (
            p_device_id,
            'temperature_low',
            CONCAT('Temperatura baja: ', p_temperatura, '°C'),
            p_temperatura,
            p_humedad,
            IF(p_temperatura < 16, 'critical', 'warning'),
            NOW()
        );
    END IF;
    
    -- Alerta de temperatura alta
    IF p_temperatura > 24 THEN
        INSERT INTO alertas (device_id, tipo_alerta, mensaje, temperatura, humedad, nivel_severidad, fecha_alerta)
        VALUES (
            p_device_id,
            'temperature_high',
            CONCAT('Temperatura alta: ', p_temperatura, '°C'),
            p_temperatura,
            p_humedad,
            IF(p_temperatura > 26, 'critical', 'warning'),
            NOW()
        );
    END IF;
    
    -- Alerta de humedad baja
    IF p_humedad < 70 THEN
        INSERT INTO alertas (device_id, tipo_alerta, mensaje, temperatura, humedad, nivel_severidad, fecha_alerta)
        VALUES (
            p_device_id,
            'humidity_low',
            CONCAT('Humedad baja: ', p_humedad, '%'),
            p_temperatura,
            p_humedad,
            'warning',
            NOW()
        );
    END IF;
    
    -- Alerta de humedad alta
    IF p_humedad > 90 THEN
        INSERT INTO alertas (device_id, tipo_alerta, mensaje, temperatura, humedad, nivel_severidad, fecha_alerta)
        VALUES (
            p_device_id,
            'humidity_high',
            CONCAT('Humedad alta: ', p_humedad, '%'),
            p_temperatura,
            p_humedad,
            'warning',
            NOW()
        );
    END IF;
END //
DELIMITER ;

-- Procedimiento: Limpiar datos antiguos
DELIMITER //
CREATE PROCEDURE sp_limpiar_datos_antiguos(
    IN p_dias_antiguedad INT
)
BEGIN
    DECLARE v_fecha_limite DATETIME;
    SET v_fecha_limite = DATE_SUB(NOW(), INTERVAL p_dias_antiguedad DAY);
    
    -- Eliminar lecturas antiguas
    DELETE FROM lecturas_sensores
    WHERE fecha_lectura < v_fecha_limite;
    
    -- Eliminar alertas resueltas antiguas
    DELETE FROM alertas
    WHERE resuelta = TRUE AND fecha_resolucion < v_fecha_limite;
    
    -- Registrar evento
    INSERT INTO log_eventos (tipo_evento, descripcion)
    VALUES ('limpieza_datos', CONCAT('Eliminados datos anteriores a ', v_fecha_limite));
    
    SELECT CONCAT('Limpieza completada. Datos anteriores a ', v_fecha_limite, ' eliminados.') AS mensaje;
END //
DELIMITER ;

-- Datos de ejemplo (para pruebas)
INSERT INTO dispositivos (device_id, nombre, ubicacion) VALUES
('ESP32_001', 'Invernadero Principal', 'Sector A - Orquídeas Premium'),
('ESP32_002', 'Invernadero Secundario', 'Sector B - Orquídeas Estándar');

INSERT INTO configuracion (device_id, parametro, valor, descripcion) VALUES
('ESP32_001', 'frecuencia_lectura', '60', 'Minutos entre lecturas'),
('ESP32_001', 'temp_minima', '18', 'Temperatura mínima óptima (°C)'),
('ESP32_001', 'temp_maxima', '24', 'Temperatura máxima óptima (°C)'),
('ESP32_001', 'humedad_optima', '80', 'Humedad relativa óptima (%)'),
('ESP32_002', 'frecuencia_lectura', '60', 'Minutos entre lecturas'),
('ESP32_002', 'temp_minima', '18', 'Temperatura mínima óptima (°C)'),
('ESP32_002', 'temp_maxima', '24', 'Temperatura máxima óptima (°C)'),
('ESP32_002', 'humedad_optima', '80', 'Humedad relativa óptima (%)');

-- Consultas útiles

-- Ver lecturas recientes con estado
SELECT * FROM lecturas_recientes LIMIT 50;

-- Ver estadísticas de la última semana
SELECT * FROM estadisticas_diarias 
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY fecha DESC;

-- Ver alertas activas
SELECT * FROM alertas_activas;

-- Promedio de condiciones por dispositivo (última semana)
SELECT 
    d.nombre,
    AVG(l.temperatura) as temp_prom,
    AVG(l.humedad) as hum_prom,
    COUNT(*) as total_lecturas
FROM lecturas_sensores l
JOIN dispositivos d ON l.device_id = d.device_id
WHERE l.fecha_lectura >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY d.nombre;

-- Crear índices adicionales para optimización
CREATE INDEX idx_lectura_validez ON lecturas_sensores(es_valida, fecha_lectura);
CREATE INDEX idx_alerta_severidad_fecha ON alertas(nivel_severidad, fecha_alerta);

-- Evento automático: Limpieza semanal de datos antiguos (más de 90 días)
-- NOTA: Requiere activar el event scheduler en MySQL
-- SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT IF NOT EXISTS evento_limpieza_semanal
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    CALL sp_limpiar_datos_antiguos(90);
END //
DELIMITER ;

-- Comentarios finales
/*
INSTRUCCIONES DE USO:

1. Ejecutar este script en MySQL para crear la base de datos
2. Configurar conexión desde aplicación web (opcional)
3. Modificar ESP32 para enviar datos también a MySQL (opcional)
4. Usar vistas para análisis rápido
5. Ejecutar procedimiento de limpieza periódicamente

VENTAJAS DE USAR BASE DE DATOS SQL COMPLEMENTARIA:
- Consultas complejas y análisis avanzado
- Generación de reportes
- Auditoría y trazabilidad
- Backup estructurado
- Integridad referencial

NOTA: Firebase es suficiente para el funcionamiento básico.
      Esta base de datos SQL es complementaria y opcional.
*/
