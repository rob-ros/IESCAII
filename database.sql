-- Sistema de Gestión de Inventario - International Equipment Service, C.A.
-- Script de creación e inicialización de base de datos
-- Versión 1.0

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS inventario_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventario_ies;

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla equipment_types
CREATE TABLE IF NOT EXISTS equipment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla equipment_status
CREATE TABLE IF NOT EXISTS equipment_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla equipment
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  type_id INT NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial VARCHAR(100),
  capacity INT,
  hours INT DEFAULT 0,
  status_id INT NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  acquisition_date DATE,
  value DECIMAL(12,2),
  description TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (status_id) REFERENCES equipment_status(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla maintenance_logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  maintenance_date DATE NOT NULL,
  hours_at_maintenance INT,
  description TEXT NOT NULL,
  cost DECIMAL(12,2),
  performed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar tipos de equipos
INSERT INTO equipment_types (name, description) VALUES
('montacargas-electrico', 'Montacargas eléctrico para interiores'),
('montacargas-combustion', 'Montacargas de combustión interna para exteriores'),
('apilador', 'Apilador para estanterías'),
('transpaleta', 'Transpaleta para movimiento de pallets'),
('elevador-personal', 'Elevador para personal'),
('otros', 'Otros equipos auxiliares');

-- Insertar estados de equipos
INSERT INTO equipment_status (name, description) VALUES
('disponible', 'Equipo operativo y disponible para uso'),
('en-uso', 'Equipo actualmente en operación'),
('mantenimiento', 'Equipo en mantenimiento preventivo o correctivo'),
('fuera-servicio', 'Equipo temporalmente fuera de servicio');

-- Insertar usuarios iniciales
INSERT INTO users (name, username, password, email, role, status) VALUES
('Administrador', 'admin', 'admin123', 'admin@ies.com', 'admin', 'active'),
('Usuario Regular', 'user', 'user123', 'user@ies.com', 'user', 'active');

-- Insertar equipos de ejemplo
INSERT INTO equipment (name, code, type_id, brand, model, serial, capacity, hours, status_id, last_maintenance, next_maintenance, acquisition_date, value, description, location) VALUES
('Montacargas Toyota Eléctrico', 'MC-001', 1, 'Toyota', '8FGCU25', 'TX12345', 2500, 1200, 1, '2024-12-01', '2025-02-01', '2023-01-15', 35000.00, 'Montacargas eléctrico principal para almacén central', 'Almacén A'),
('Montacargas Hyster Combustión', 'MC-002', 2, 'Hyster', 'H80FT', 'H8-5678', 3500, 2800, 2, '2024-11-15', '2025-01-15', '2022-06-10', 42000.00, 'Montacargas de combustión para patio exterior', 'Patio Exterior'),
('Apilador Crown', 'AP-001', 3, 'Crown', 'SHR5500', 'CR78901', 1200, 980, 1, '2024-12-10', '2025-02-10', '2023-03-22', 18000.00, 'Apilador para estanterías altas', 'Almacén B'),
('Transpaleta Yale', 'TP-001', 4, 'Yale', 'MPB045', 'YA12345', 1500, 500, 3, '2024-10-05', '2025-01-05', '2023-08-15', 8500.00, 'Transpaleta eléctrica para muelle de carga', 'Muelle de Carga'),
('Montacargas Linde Eléctrico', 'MC-003', 1, 'Linde', 'E20PH', 'LE56789', 2000, 800, 4, '2024-09-20', '2025-01-20', '2023-05-18', 29000.00, 'Montacargas eléctrico secundario', 'Almacén C');

-- Insertar registros de mantenimiento de ejemplo
INSERT INTO maintenance_logs (equipment_id, maintenance_date, hours_at_maintenance, description, cost, performed_by) VALUES
(1, '2024-12-01', 1150, 'Mantenimiento preventivo 1200 horas. Cambio de aceite y filtros.', 450.00, 'Técnico Juan Pérez'),
(2, '2024-11-15', 2750, 'Mantenimiento correctivo. Reparación de sistema hidráulico.', 780.00, 'Servicio Técnico Oficial'),
(3, '2024-12-10', 950, 'Mantenimiento preventivo 1000 horas. Revisión general.', 320.00, 'Técnico Pedro Gómez'),
(4, '2024-10-05', 480, 'Mantenimiento preventivo 500 horas. Cambio de batería.', 650.00, 'Servicio Técnico Oficial'),
(5, '2024-09-20', 780, 'Reparación sistema eléctrico. Fuera de servicio por fallo en controlador.', 1200.00, 'Técnico Juan Pérez');

-- Crear vistas
CREATE OR REPLACE VIEW v_equipment_details AS
SELECT 
    e.id,
    e.name,
    e.code,
    et.name AS type,
    e.brand,
    e.model,
    e.serial,
    e.capacity,
    e.hours,
    es.name AS status,
    e.last_maintenance,
    e.next_maintenance,
    e.acquisition_date,
    e.value,
    e.description,
    e.location
FROM 
    equipment e
JOIN 
    equipment_types et ON e.type_id = et.id
JOIN 
    equipment_status es ON e.status_id = es.id;

-- Crear procedimientos almacenados
DELIMITER //

-- Procedimiento para agregar equipo
CREATE PROCEDURE sp_add_equipment(
    IN p_name VARCHAR(100),
    IN p_code VARCHAR(50),
    IN p_type VARCHAR(100),
    IN p_brand VARCHAR(100),
    IN p_model VARCHAR(100),
    IN p_serial VARCHAR(100),
    IN p_capacity INT,
    IN p_hours INT,
    IN p_status VARCHAR(50),
    IN p_last_maintenance DATE,
    IN p_next_maintenance DATE,
    IN p_acquisition_date DATE,
    IN p_value DECIMAL(12,2),
    IN p_description TEXT,
    IN p_location VARCHAR(100)
)
BEGIN
    DECLARE v_type_id INT;
    DECLARE v_status_id INT;
    
    -- Obtener IDs de tipo y estado
    SELECT id INTO v_type_id FROM equipment_types WHERE name = p_type;
    SELECT id INTO v_status_id FROM equipment_status WHERE name = p_status;
    
    -- Si no existe el tipo, usar 'otros'
    IF v_type_id IS NULL THEN
        SELECT id INTO v_type_id FROM equipment_types WHERE name = 'otros';
    END IF;
    
    -- Si no existe el estado, usar 'disponible'
    IF v_status_id IS NULL THEN
        SELECT id INTO v_status_id FROM equipment_status WHERE name = 'disponible';
    END IF;
    
    -- Insertar equipo
    INSERT INTO equipment (
        name, code, type_id, brand, model, serial, 
        capacity, hours, status_id, last_maintenance, 
        next_maintenance, acquisition_date, value, 
        description, location
    ) VALUES (
        p_name, p_code, v_type_id, p_brand, p_model, p_serial,
        p_capacity, p_hours, v_status_id, p_last_maintenance,
        p_next_maintenance, p_acquisition_date, p_value,
        p_description, p_location
    );
END //

-- Procedimiento para registrar mantenimiento
CREATE PROCEDURE sp_register_maintenance(
    IN p_equipment_code VARCHAR(50),
    IN p_maintenance_date DATE,
    IN p_hours_at_maintenance INT,
    IN p_description TEXT,
    IN p_cost DECIMAL(12,2),
    IN p_performed_by VARCHAR(100)
)
BEGIN
    DECLARE v_equipment_id INT;
    
    -- Obtener ID del equipo
    SELECT id INTO v_equipment_id FROM equipment WHERE code = p_equipment_code;
    
    -- Si existe el equipo, registrar mantenimiento
    IF v_equipment_id IS NOT NULL THEN
        -- Insertar registro de mantenimiento
        INSERT INTO maintenance_logs (
            equipment_id, maintenance_date, hours_at_maintenance,
            description, cost, performed_by
        ) VALUES (
            v_equipment_id, p_maintenance_date, p_hours_at_maintenance,
            p_description, p_cost, p_performed_by
        );
        
        -- Actualizar equipo
        UPDATE equipment 
        SET 
            last_maintenance = p_maintenance_date,
            next_maintenance = DATE_ADD(p_maintenance_date, INTERVAL 3 MONTH),
            hours = p_hours_at_maintenance,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_equipment_id;
    END IF;
END //

DELIMITER ;

-- Crear tabla user_sessions para registrar inicios y cierres de sesión
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE,
  login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear vista para consultas de sesiones con datos del usuario
CREATE OR REPLACE VIEW v_user_sessions AS
SELECT 
    us.id,
    us.user_id,
    u.name AS user_name,
    u.username,
    u.role,
    us.session_token,
    us.login_time,
    us.logout_time,
    us.ip_address,
    us.user_agent,
    us.is_active,
    CASE 
        WHEN us.logout_time IS NOT NULL THEN 
            TIMESTAMPDIFF(MINUTE, us.login_time, us.logout_time)
        ELSE 
            TIMESTAMPDIFF(MINUTE, us.login_time, NOW())
    END AS session_duration_minutes
FROM 
    user_sessions us
JOIN 
    users u ON us.user_id = u.id
ORDER BY 
    us.login_time DESC;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_equipment_code ON equipment(code);
CREATE INDEX idx_equipment_type ON equipment(type_id);
CREATE INDEX idx_equipment_status ON equipment(status_id);
CREATE INDEX idx_maintenance_equipment ON maintenance_logs(equipment_id);
CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_time ON user_sessions(login_time);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);