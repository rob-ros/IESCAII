<?php
/**
 * Archivo de conexión a la base de datos MySQL
 * Sistema de Gestión de Inventario - International Equipment Service, C.A.
 */

// Configuración de la base de datos
$db_host = 'localhost';     // Host de la base de datos (generalmente localhost en XAMPP)
$db_name = 'inventario_ies'; // Nombre de la base de datos
$db_user = 'root';          // Usuario de MySQL (por defecto en XAMPP es root)
$db_pass = '';              // Contraseña (por defecto en XAMPP está vacía)

// Crear conexión
try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    
    // Configurar el modo de error para que lance excepciones
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Configurar fetch mode para que devuelva arrays asociativos por defecto
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Desactivar emulación de prepared statements para mayor seguridad
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
} catch(PDOException $e) {
    // En producción, es mejor registrar el error en un log y mostrar un mensaje genérico
    error_log("Error de conexión: " . $e->getMessage());
    die("Error de conexión a la base de datos. Por favor, contacte al administrador.");
}

/**
 * Función para realizar consultas SELECT de forma segura
 *
 * @param string $sql Consulta SQL con placeholders (?)
 * @param array $params Parámetros para la consulta
 * @return array Resultados de la consulta
 */
function db_select($sql, $params = []) {
    global $conn;
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        error_log("Error en consulta: " . $e->getMessage());
        return [];
    }
}

/**
 * Función para realizar operaciones INSERT, UPDATE o DELETE
 *
 * @param string $sql Consulta SQL con placeholders (?)
 * @param array $params Parámetros para la consulta
 * @return int|bool Número de filas afectadas o false en caso de error
 */
function db_execute($sql, $params = []) {
    global $conn;
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    } catch(PDOException $e) {
        error_log("Error en operación: " . $e->getMessage());
        return false;
    }
}

/**
 * Función para obtener el último ID insertado
 *
 * @return int|string Último ID insertado
 */
function db_lastInsertId() {
    global $conn;
    return $conn->lastInsertId();
}

/**
 * Función para iniciar una transacción
 */
function db_beginTransaction() {
    global $conn;
    $conn->beginTransaction();
}

/**
 * Función para confirmar una transacción
 */
function db_commit() {
    global $conn;
    $conn->commit();
}

/**
 * Función para revertir una transacción
 */
function db_rollback() {
    global $conn;
    $conn->rollBack();
}