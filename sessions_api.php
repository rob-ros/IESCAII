<?php
/**
 * API para manejo de sesiones de usuarios
 * Sistema de Gestión de Inventario - International Equipment Service, C.A.
 */

// Configurar headers para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir funciones de base de datos
require_once 'conexion_db.php';
require_once 'api_funciones.php';

// Obtener método HTTP y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Función para enviar respuesta JSON
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Función para obtener IP del cliente
function getClientIP() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

try {
    switch ($method) {
        case 'GET':
            // Obtener sesiones con filtros
            $filtro_usuario = $_GET['usuario'] ?? '';
            $fecha_inicio = $_GET['fecha_inicio'] ?? '';
            $fecha_fin = $_GET['fecha_fin'] ?? '';
            $solo_activas = isset($_GET['solo_activas']) ? (bool)$_GET['solo_activas'] : false;
            $limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 50;
            $accion = $_GET['accion'] ?? 'listar';
            
            if ($accion === 'estadisticas') {
                // Obtener estadísticas de sesiones
                $estadisticas = obtener_estadisticas_sesiones();
                sendResponse(['success' => true, 'data' => $estadisticas]);
            } else {
                // Obtener lista de sesiones
                $sesiones = obtener_sesiones_usuarios($filtro_usuario, $fecha_inicio, $fecha_fin, $solo_activas, $limite);
                sendResponse(['success' => true, 'data' => $sesiones]);
            }
            break;
            
        case 'POST':
            // Crear nueva sesión (login)
            if (!isset($input['username']) || !isset($input['password'])) {
                sendResponse(['success' => false, 'message' => 'Usuario y contraseña requeridos'], 400);
            }
            
            $ip_address = getClientIP();
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            
            $usuario = autenticar_usuario($input['username'], $input['password'], $ip_address, $user_agent);
            
            if ($usuario) {
                sendResponse([
                    'success' => true, 
                    'message' => 'Autenticación exitosa',
                    'data' => $usuario
                ]);
            } else {
                sendResponse(['success' => false, 'message' => 'Credenciales inválidas'], 401);
            }
            break;
            
        case 'PUT':
            // Cerrar sesión
            if (!isset($input['session_token'])) {
                sendResponse(['success' => false, 'message' => 'Token de sesión requerido'], 400);
            }
            
            $resultado = cerrar_sesion_usuario($input['session_token']);
            
            if ($resultado) {
                sendResponse(['success' => true, 'message' => 'Sesión cerrada correctamente']);
            } else {
                sendResponse(['success' => false, 'message' => 'Error al cerrar sesión'], 500);
            }
            break;
            
        case 'DELETE':
            // Limpiar sesiones antiguas (solo admin)
            if (!isset($input['admin_token'])) {
                sendResponse(['success' => false, 'message' => 'Token de administrador requerido'], 403);
            }
            
            // Validar que es administrador
            $admin = validar_sesion($input['admin_token']);
            if (!$admin || $admin['role'] !== 'admin') {
                sendResponse(['success' => false, 'message' => 'Permisos insuficientes'], 403);
            }
            
            $dias_antiguedad = $input['dias_antiguedad'] ?? 30;
            $sesiones_eliminadas = limpiar_sesiones_antiguas($dias_antiguedad);
            
            sendResponse([
                'success' => true, 
                'message' => "Se eliminaron $sesiones_eliminadas sesiones antiguas",
                'data' => ['sesiones_eliminadas' => $sesiones_eliminadas]
            ]);
            break;
            
        default:
            sendResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            break;
    }
    
} catch (Exception $e) {
    error_log("Error en sessions_api.php: " . $e->getMessage());
    sendResponse(['success' => false, 'message' => 'Error interno del servidor'], 500);
}
?>