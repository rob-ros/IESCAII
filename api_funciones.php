<?php
/**
 * API de funciones para el Sistema de Gestión de Inventario
 * International Equipment Service, C.A.
 */

// Incluir archivo de conexión
require_once 'conexion_db.php';

/**
 * Autenticar usuario y crear sesión
 * 
 * @param string $username Nombre de usuario
 * @param string $password Contraseña
 * @param string $ip_address Dirección IP del usuario
 * @param string $user_agent User Agent del navegador
 * @return array|bool Datos del usuario con token de sesión o false si la autenticación falla
 */
function autenticar_usuario($username, $password, $ip_address = '', $user_agent = '') {
    $sql = "SELECT id, name, username, email, role, status 
            FROM users 
            WHERE username = ? AND password = ? AND status = 'active'";
    
    $result = db_select($sql, [$username, $password]);
    
    if (count($result) === 1) {
        $user = $result[0];
        
        // Crear sesión
        $session_token = crear_sesion_usuario($user['id'], $ip_address, $user_agent);
        $user['session_token'] = $session_token;
        
        return $user;
    }
    
    return false;
}

/**
 * Crear una nueva sesión de usuario
 * 
 * @param int $user_id ID del usuario
 * @param string $ip_address Dirección IP
 * @param string $user_agent User Agent
 * @return string Token de sesión generado
 */
function crear_sesion_usuario($user_id, $ip_address = '', $user_agent = '') {
    // Generar token único
    $session_token = bin2hex(random_bytes(32));
    
    // Cerrar sesiones activas del usuario (opcional: permitir múltiples sesiones)
    cerrar_sesiones_usuario($user_id);
    
    $sql = "INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, is_active) 
            VALUES (?, ?, ?, ?, TRUE)";
    
    $params = [$user_id, $session_token, $ip_address, $user_agent];
    
    if (db_execute($sql, $params) !== false) {
        return $session_token;
    }
    
    return false;
}

/**
 * Cerrar sesión de usuario
 * 
 * @param string $session_token Token de sesión
 * @return bool True si se cerró correctamente, false en caso contrario
 */
function cerrar_sesion_usuario($session_token) {
    $sql = "UPDATE user_sessions 
            SET logout_time = CURRENT_TIMESTAMP, is_active = FALSE 
            WHERE session_token = ? AND is_active = TRUE";
    
    return db_execute($sql, [$session_token]) !== false;
}

/**
 * Cerrar todas las sesiones activas de un usuario
 * 
 * @param int $user_id ID del usuario
 * @return bool True si se cerraron correctamente, false en caso contrario
 */
function cerrar_sesiones_usuario($user_id) {
    $sql = "UPDATE user_sessions 
            SET logout_time = CURRENT_TIMESTAMP, is_active = FALSE 
            WHERE user_id = ? AND is_active = TRUE";
    
    return db_execute($sql, [$user_id]) !== false;
}

/**
 * Validar token de sesión
 * 
 * @param string $session_token Token de sesión
 * @return array|bool Datos del usuario o false si el token no es válido
 */
function validar_sesion($session_token) {
    $sql = "SELECT u.id, u.name, u.username, u.email, u.role, u.status, us.login_time
            FROM users u
            JOIN user_sessions us ON u.id = us.user_id
            WHERE us.session_token = ? AND us.is_active = TRUE AND u.status = 'active'";
    
    $result = db_select($sql, [$session_token]);
    
    if (count($result) === 1) {
        return $result[0];
    }
    
    return false;
}

/**
 * Obtener lista de equipos con detalles
 * 
 * @param string $filtro_tipo Filtro opcional por tipo
 * @param string $filtro_estado Filtro opcional por estado
 * @param string $busqueda Término de búsqueda opcional
 * @return array Lista de equipos
 */
function obtener_equipos($filtro_tipo = '', $filtro_estado = '', $busqueda = '') {
    $params = [];
    $sql = "SELECT * FROM v_equipment_details WHERE 1=1";
    
    if (!empty($filtro_tipo)) {
        $sql .= " AND type = ?";
        $params[] = $filtro_tipo;
    }
    
    if (!empty($filtro_estado)) {
        $sql .= " AND status = ?";
        $params[] = $filtro_estado;
    }
    
    if (!empty($busqueda)) {
        $sql .= " AND (name LIKE ? OR code LIKE ? OR brand LIKE ? OR model LIKE ? OR serial LIKE ?)";
        $term = "%$busqueda%";
        $params = array_merge($params, [$term, $term, $term, $term, $term]);
    }
    
    $sql .= " ORDER BY name";
    
    return db_select($sql, $params);
}

/**
 * Obtener un equipo por su ID
 * 
 * @param int $id ID del equipo
 * @return array|null Datos del equipo o null si no existe
 */
function obtener_equipo_por_id($id) {
    $sql = "SELECT * FROM v_equipment_details WHERE id = ?";
    $result = db_select($sql, [$id]);
    
    if (count($result) === 1) {
        return $result[0];
    }
    
    return null;
}

/**
 * Obtener un equipo por su código
 * 
 * @param string $code Código del equipo
 * @return array|null Datos del equipo o null si no existe
 */
function obtener_equipo_por_codigo($code) {
    $sql = "SELECT * FROM v_equipment_details WHERE code = ?";
    $result = db_select($sql, [$code]);
    
    if (count($result) === 1) {
        return $result[0];
    }
    
    return null;
}

/**
 * Agregar un nuevo equipo
 * 
 * @param array $datos Datos del equipo
 * @return bool True si se agregó correctamente, false en caso contrario
 */
function agregar_equipo($datos) {
    try {
        db_beginTransaction();
        
        $sql = "CALL sp_add_equipment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $datos['name'],
            $datos['code'],
            $datos['type'],
            $datos['brand'],
            $datos['model'],
            $datos['serial'],
            $datos['capacity'],
            $datos['hours'],
            $datos['status'],
            $datos['last_maintenance'],
            $datos['next_maintenance'],
            $datos['acquisition_date'],
            $datos['value'],
            $datos['description'],
            $datos['location']
        ];
        
        $result = db_execute($sql, $params);
        
        db_commit();
        return true;
    } catch (Exception $e) {
        db_rollback();
        error_log("Error al agregar equipo: " . $e->getMessage());
        return false;
    }
}

/**
 * Actualizar un equipo existente
 * 
 * @param int $id ID del equipo
 * @param array $datos Datos actualizados del equipo
 * @return bool True si se actualizó correctamente, false en caso contrario
 */
function actualizar_equipo($id, $datos) {
    try {
        $type_sql = "SELECT id FROM equipment_types WHERE name = ?";
        $type_result = db_select($type_sql, [$datos['type']]);
        $type_id = $type_result[0]['id'] ?? 6; // 6 = otros (por defecto)
        
        $status_sql = "SELECT id FROM equipment_status WHERE name = ?";
        $status_result = db_select($status_sql, [$datos['status']]);
        $status_id = $status_result[0]['id'] ?? 1; // 1 = disponible (por defecto)
        
        $sql = "UPDATE equipment SET 
                name = ?, 
                code = ?, 
                type_id = ?, 
                brand = ?, 
                model = ?, 
                serial = ?, 
                capacity = ?, 
                hours = ?, 
                status_id = ?, 
                last_maintenance = ?, 
                next_maintenance = ?, 
                acquisition_date = ?, 
                value = ?, 
                description = ?, 
                location = ?, 
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?";
        
        $params = [
            $datos['name'],
            $datos['code'],
            $type_id,
            $datos['brand'],
            $datos['model'],
            $datos['serial'],
            $datos['capacity'],
            $datos['hours'],
            $status_id,
            $datos['last_maintenance'],
            $datos['next_maintenance'],
            $datos['acquisition_date'],
            $datos['value'],
            $datos['description'],
            $datos['location'],
            $id
        ];
        
        return db_execute($sql, $params) !== false;
    } catch (Exception $e) {
        error_log("Error al actualizar equipo: " . $e->getMessage());
        return false;
    }
}

/**
 * Eliminar un equipo
 * 
 * @param int $id ID del equipo
 * @return bool True si se eliminó correctamente, false en caso contrario
 */
function eliminar_equipo($id) {
    try {
        db_beginTransaction();
        
        // Primero eliminar registros de mantenimiento relacionados
        $sql_logs = "DELETE FROM maintenance_logs WHERE equipment_id = ?";
        db_execute($sql_logs, [$id]);
        
        // Luego eliminar el equipo
        $sql_equipment = "DELETE FROM equipment WHERE id = ?";
        $result = db_execute($sql_equipment, [$id]);
        
        db_commit();
        return $result > 0;
    } catch (Exception $e) {
        db_rollback();
        error_log("Error al eliminar equipo: " . $e->getMessage());
        return false;
    }
}

/**
 * Registrar mantenimiento de un equipo
 * 
 * @param array $datos Datos del mantenimiento
 * @return bool True si se registró correctamente, false en caso contrario
 */
function registrar_mantenimiento($datos) {
    try {
        $sql = "CALL sp_register_maintenance(?, ?, ?, ?, ?, ?)";
        
        $params = [
            $datos['equipment_code'],
            $datos['maintenance_date'],
            $datos['hours_at_maintenance'],
            $datos['description'],
            $datos['cost'],
            $datos['performed_by']
        ];
        
        return db_execute($sql, $params) !== false;
    } catch (Exception $e) {
        error_log("Error al registrar mantenimiento: " . $e->getMessage());
        return false;
    }
}

/**
 * Obtener historial de mantenimiento de un equipo
 * 
 * @param int $equipment_id ID del equipo
 * @return array Historial de mantenimiento
 */
function obtener_historial_mantenimiento($equipment_id) {
    $sql = "SELECT * FROM maintenance_logs 
            WHERE equipment_id = ? 
            ORDER BY maintenance_date DESC";
    
    return db_select($sql, [$equipment_id]);
}

/**
 * Obtener lista de usuarios
 * 
 * @param string $busqueda Término de búsqueda opcional
 * @return array Lista de usuarios
 */
function obtener_usuarios($busqueda = '') {
    $params = [];
    $sql = "SELECT id, name, username, email, role, status, created_at 
            FROM users WHERE 1=1";
    
    if (!empty($busqueda)) {
        $sql .= " AND (name LIKE ? OR username LIKE ? OR email LIKE ?)";
        $term = "%$busqueda%";
        $params = array_merge($params, [$term, $term, $term]);
    }
    
    $sql .= " ORDER BY name";
    
    return db_select($sql, $params);
}

/**
 * Agregar un nuevo usuario
 * 
 * @param array $datos Datos del usuario
 * @return bool True si se agregó correctamente, false en caso contrario
 */
function agregar_usuario($datos) {
    try {
        $sql = "INSERT INTO users (name, username, password, email, role, status) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $params = [
            $datos['name'],
            $datos['username'],
            $datos['password'],
            $datos['email'],
            $datos['role'],
            $datos['status']
        ];
        
        return db_execute($sql, $params) !== false;
    } catch (Exception $e) {
        error_log("Error al agregar usuario: " . $e->getMessage());
        return false;
    }
}

/**
 * Actualizar un usuario existente
 * 
 * @param int $id ID del usuario
 * @param array $datos Datos actualizados del usuario
 * @return bool True si se actualizó correctamente, false en caso contrario
 */
function actualizar_usuario($id, $datos) {
    try {
        // Si se proporciona contraseña, actualizarla también
        if (!empty($datos['password'])) {
            $sql = "UPDATE users SET 
                    name = ?, 
                    username = ?, 
                    password = ?, 
                    email = ?, 
                    role = ?, 
                    status = ? 
                    WHERE id = ?";
            
            $params = [
                $datos['name'],
                $datos['username'],
                $datos['password'],
                $datos['email'],
                $datos['role'],
                $datos['status'],
                $id
            ];
        } else {
            // Si no se proporciona contraseña, no actualizarla
            $sql = "UPDATE users SET 
                    name = ?, 
                    username = ?, 
                    email = ?, 
                    role = ?, 
                    status = ? 
                    WHERE id = ?";
            
            $params = [
                $datos['name'],
                $datos['username'],
                $datos['email'],
                $datos['role'],
                $datos['status'],
                $id
            ];
        }
        
        return db_execute($sql, $params) !== false;
    } catch (Exception $e) {
        error_log("Error al actualizar usuario: " . $e->getMessage());
        return false;
    }
}

/**
 * Eliminar un usuario
 * 
 * @param int $id ID del usuario
 * @return bool True si se eliminó correctamente, false en caso contrario
 */
function eliminar_usuario($id) {
    try {
        $sql = "DELETE FROM users WHERE id = ?";
        return db_execute($sql, [$id]) !== false;
    } catch (Exception $e) {
        error_log("Error al eliminar usuario: " . $e->getMessage());
        return false;
    }
}

/**
 * Obtener estadísticas del sistema
 * 
 * @return array Estadísticas del sistema
 */
function obtener_estadisticas() {
    $stats = [
        'total_equipos' => 0,
        'valor_total' => 0,
        'por_tipo' => [],
        'por_estado' => []
    ];
    
    // Total de equipos y valor total
    $sql_total = "SELECT COUNT(*) AS total, SUM(value) AS valor_total FROM equipment";
    $total_result = db_select($sql_total);
    
    if (count($total_result) > 0) {
        $stats['total_equipos'] = $total_result[0]['total'];
        $stats['valor_total'] = $total_result[0]['valor_total'];
    }
    
    // Equipos por tipo
    $sql_tipos = "SELECT et.name, COUNT(e.id) AS cantidad 
                  FROM equipment e 
                  JOIN equipment_types et ON e.type_id = et.id 
                  GROUP BY et.name";
    $stats['por_tipo'] = db_select($sql_tipos);
    
    // Equipos por estado
    $sql_estados = "SELECT es.name, COUNT(e.id) AS cantidad 
                    FROM equipment e 
                    JOIN equipment_status es ON e.status_id = es.id 
                    GROUP BY es.name";
    $stats['por_estado'] = db_select($sql_estados);
    
    // Próximos mantenimientos
    $sql_mant = "SELECT e.id, e.name, e.code, e.next_maintenance 
                 FROM equipment e 
                 WHERE e.next_maintenance IS NOT NULL 
                 AND e.next_maintenance >= CURDATE() 
                 ORDER BY e.next_maintenance 
                 LIMIT 5";
    $stats['proximos_mantenimientos'] = db_select($sql_mant);
    
    return $stats;
}

/**
 * Obtener sesiones de usuarios con filtros
 * 
 * @param string $filtro_usuario Filtro por nombre de usuario
 * @param string $fecha_inicio Fecha de inicio del rango (YYYY-MM-DD)
 * @param string $fecha_fin Fecha de fin del rango (YYYY-MM-DD)
 * @param bool $solo_activas Solo sesiones activas
 * @param int $limite Límite de resultados
 * @return array Lista de sesiones
 */
function obtener_sesiones_usuarios($filtro_usuario = '', $fecha_inicio = '', $fecha_fin = '', $solo_activas = false, $limite = 50) {
    $params = [];
    $sql = "SELECT * FROM v_user_sessions WHERE 1=1";
    
    if (!empty($filtro_usuario)) {
        $sql .= " AND (user_name LIKE ? OR username LIKE ?)";
        $term = "%$filtro_usuario%";
        $params = array_merge($params, [$term, $term]);
    }
    
    if (!empty($fecha_inicio)) {
        $sql .= " AND DATE(login_time) >= ?";
        $params[] = $fecha_inicio;
    }
    
    if (!empty($fecha_fin)) {
        $sql .= " AND DATE(login_time) <= ?";
        $params[] = $fecha_fin;
    }
    
    if ($solo_activas) {
        $sql .= " AND is_active = TRUE";
    }
    
    $sql .= " ORDER BY login_time DESC";
    
    if ($limite > 0) {
        $sql .= " LIMIT ?";
        $params[] = $limite;
    }
    
    return db_select($sql, $params);
}

/**
 * Obtener sesiones de un usuario específico
 * 
 * @param int $user_id ID del usuario
 * @param int $limite Límite de resultados
 * @return array Lista de sesiones del usuario
 */
function obtener_sesiones_por_usuario($user_id, $limite = 20) {
    $sql = "SELECT * FROM v_user_sessions 
            WHERE user_id = ? 
            ORDER BY login_time DESC";
    
    $params = [$user_id];
    
    if ($limite > 0) {
        $sql .= " LIMIT ?";
        $params[] = $limite;
    }
    
    return db_select($sql, $params);
}

/**
 * Obtener estadísticas de sesiones
 * 
 * @return array Estadísticas de sesiones
 */
function obtener_estadisticas_sesiones() {
    $stats = [
        'sesiones_activas' => 0,
        'sesiones_hoy' => 0,
        'sesiones_semana' => 0,
        'tiempo_promedio_sesion' => 0,
        'usuarios_activos_hoy' => 0
    ];
    
    // Sesiones activas
    $sql_activas = "SELECT COUNT(*) AS total FROM user_sessions WHERE is_active = TRUE";
    $result_activas = db_select($sql_activas);
    if (count($result_activas) > 0) {
        $stats['sesiones_activas'] = $result_activas[0]['total'];
    }
    
    // Sesiones hoy
    $sql_hoy = "SELECT COUNT(*) AS total FROM user_sessions WHERE DATE(login_time) = CURDATE()";
    $result_hoy = db_select($sql_hoy);
    if (count($result_hoy) > 0) {
        $stats['sesiones_hoy'] = $result_hoy[0]['total'];
    }
    
    // Sesiones esta semana
    $sql_semana = "SELECT COUNT(*) AS total FROM user_sessions 
                   WHERE YEARWEEK(login_time) = YEARWEEK(CURDATE())";
    $result_semana = db_select($sql_semana);
    if (count($result_semana) > 0) {
        $stats['sesiones_semana'] = $result_semana[0]['total'];
    }
    
    // Tiempo promedio de sesión (en minutos)
    $sql_promedio = "SELECT AVG(session_duration_minutes) AS promedio 
                     FROM v_user_sessions 
                     WHERE logout_time IS NOT NULL 
                     AND DATE(login_time) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    $result_promedio = db_select($sql_promedio);
    if (count($result_promedio) > 0 && $result_promedio[0]['promedio']) {
        $stats['tiempo_promedio_sesion'] = round($result_promedio[0]['promedio'], 1);
    }
    
    // Usuarios únicos activos hoy
    $sql_usuarios_hoy = "SELECT COUNT(DISTINCT user_id) AS total 
                         FROM user_sessions 
                         WHERE DATE(login_time) = CURDATE()";
    $result_usuarios_hoy = db_select($sql_usuarios_hoy);
    if (count($result_usuarios_hoy) > 0) {
        $stats['usuarios_activos_hoy'] = $result_usuarios_hoy[0]['total'];
    }
    
    return $stats;
}

/**
 * Limpiar sesiones antiguas (automático o manual)
 * 
 * @param int $dias_antiguedad Días de antigüedad para limpiar
 * @return int Número de sesiones eliminadas
 */
function limpiar_sesiones_antiguas($dias_antiguedad = 30) {
    $sql = "DELETE FROM user_sessions 
            WHERE login_time < DATE_SUB(NOW(), INTERVAL ? DAY)
            AND is_active = FALSE";
    
    return db_execute($sql, [$dias_antiguedad]);
}