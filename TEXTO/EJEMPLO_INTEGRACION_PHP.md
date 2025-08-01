# Integración con Base de Datos PHP - Sistema de Inventario IES

## Cómo Conectar el Frontend con la Base de Datos

### 1. Estructura de Archivos Requerida
```
htdocs/
└── inventario-ies/
    ├── index.html              # Frontend principal
    ├── frkydepn3w.jpg         # Logo corporativo
    ├── database.sql           # Script de base de datos
    ├── conexion_db.php        # Conexión a MySQL
    ├── api_funciones.php      # Funciones CRUD
    ├── sessions_api.php       # API de sesiones
    └── INSTALACION.txt        # Guía de instalación
```

### 2. Modificaciones Necesarias en index.html

#### A. Configurar Variables de Conexión
Agregar al inicio del `<script>` en index.html:

```javascript
// Configuración para modo base de datos
const USE_DATABASE = true; // Cambiar a true para usar BD
const API_BASE_URL = './'; // Ruta base de los archivos PHP

// Variable para almacenar token de sesión
let sessionToken = null;
```

#### B. Modificar Función de Login
Reemplazar la función de autenticación:

```javascript
// Función de login con base de datos
async function authenticateUser(username, password) {
    if (!USE_DATABASE) {
        // Mantener lógica actual para modo demo
        return authenticateUserDemo(username, password);
    }
    
    try {
        const response = await fetch('sessions_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            sessionToken = result.data.session_token;
            return true;
        } else {
            showAlert('error', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        showAlert('error', 'Error de conexión al servidor');
        return false;
    }
}
```

#### C. Modificar Función de Logout
```javascript
async function logout() {
    if (USE_DATABASE && sessionToken) {
        try {
            await fetch('sessions_api.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_token: sessionToken
                })
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
    currentUser = null;
    sessionToken = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    showTab('dashboard');
}
```

#### D. Cargar Datos desde Base de Datos
Agregar funciones para cargar datos:

```javascript
// Cargar equipos desde base de datos
async function loadEquipmentFromDB() {
    if (!USE_DATABASE) return;
    
    try {
        const response = await fetch('api_equipos.php');
        const result = await response.json();
        
        if (result.success) {
            equipment = result.data;
            filteredEquipment = [...equipment];
            renderEquipment();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error cargando equipos:', error);
    }
}

// Cargar sesiones desde base de datos
async function loadSessionsFromDB() {
    if (!USE_DATABASE || !currentUser || currentUser.role !== 'admin') return;
    
    try {
        const response = await fetch('sessions_api.php');
        const result = await response.json();
        
        if (result.success) {
            userSessions = result.data;
            filteredSessions = [...userSessions];
            renderSessions();
        }
    } catch (error) {
        console.error('Error cargando sesiones:', error);
    }
}
```

### 3. Crear API para Equipos (api_equipos.php)

```php
<?php
require_once 'conexion_db.php';
require_once 'api_funciones.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener equipos
        $filtro_tipo = $_GET['tipo'] ?? '';
        $filtro_estado = $_GET['estado'] ?? '';
        $busqueda = $_GET['busqueda'] ?? '';
        
        $equipos = obtener_equipos($filtro_tipo, $filtro_estado, $busqueda);
        echo json_encode(['success' => true, 'data' => $equipos]);
        break;
        
    case 'POST':
        // Crear equipo
        $input = json_decode(file_get_contents('php://input'), true);
        $resultado = agregar_equipo($input);
        
        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Equipo creado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear equipo']);
        }
        break;
        
    case 'PUT':
        // Actualizar equipo
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? 0;
        unset($input['id']);
        
        $resultado = actualizar_equipo($id, $input);
        
        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Equipo actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar equipo']);
        }
        break;
        
    case 'DELETE':
        // Eliminar equipo
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? 0;
        
        $resultado = eliminar_equipo($id);
        
        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Equipo eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar equipo']);
        }
        break;
}
?>
```

### 4. Pasos para Activar Base de Datos

#### Paso 1: Configurar Base de Datos
1. Importar `database.sql` en phpMyAdmin
2. Verificar que las tablas se crearon correctamente
3. Confirmar que los datos de ejemplo están presentes

#### Paso 2: Configurar Conexión
En `conexion_db.php`, verificar configuración:
```php
$db_host = 'localhost';
$db_name = 'inventario_ies';
$db_user = 'root';        // Cambiar si es necesario
$db_pass = '';            // Cambiar si hay contraseña
```

#### Paso 3: Modificar Frontend
En `index.html`, cambiar la variable:
```javascript
const USE_DATABASE = true; // Activar modo base de datos
```

#### Paso 4: Probar Funcionalidad
1. Acceder al sistema: `http://localhost/inventario-ies/`
2. Iniciar sesión con credenciales de la BD
3. Verificar que los datos se cargan desde MySQL
4. Probar operaciones CRUD
5. Revisar historial de sesiones

### 5. Ventajas de la Integración

**Con Base de Datos:**
- ✅ Persistencia real de datos
- ✅ Múltiples usuarios simultáneos
- ✅ Historial completo de sesiones
- ✅ Respaldos automáticos
- ✅ Escalabilidad mejorada

**Modo Demo (actual):**
- ✅ Instalación simple
- ✅ Sin dependencias de servidor
- ✅ Ideal para demostraciones
- ❌ Sin persistencia de datos
- ❌ Un solo usuario por sesión

### 6. Migración de Datos

Para migrar desde modo demo a base de datos:

```javascript
// Función para exportar datos del modo demo
function exportDemoData() {
    const data = {
        equipment: equipment,
        users: systemUsers,
        sessions: userSessions
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    downloadFile(jsonData, 'datos_demo.json', 'application/json');
}

// Función para importar datos a la base de datos
async function importDataToDB(jsonData) {
    try {
        const response = await fetch('import_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('success', 'Datos importados correctamente');
        } else {
            showAlert('error', 'Error al importar datos: ' + result.message);
        }
    } catch (error) {
        console.error('Error en importación:', error);
        showAlert('error', 'Error de conexión durante la importación');
    }
}
```

### 7. Mantenimiento

**Tareas Periódicas:**
- Limpiar sesiones antiguas: `DELETE` a `sessions_api.php`
- Respaldar base de datos regularmente
- Monitorear tamaño de tabla `user_sessions`
- Optimizar índices según uso

**Logs y Monitoreo:**
- Revisar logs de Apache en `xampp/apache/logs/`
- Monitorear errores PHP en `xampp/php/logs/`
- Implementar logs de aplicación en archivos dedicados

Esta integración mantiene la compatibilidad con el modo demo actual, permitiendo una transición gradual hacia el uso completo de base de datos.
