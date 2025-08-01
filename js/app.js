// Sistema de autenticación
        function getUserCredentials() {
            const userCreds = {};
            systemUsers.forEach(user => {
                if (user.status === 'active') {
                    userCreds[user.username] = {
                        password: user.password,
                        role: user.role,
                        name: user.name,
                        email: user.email,
                        id: user.id
                    };
                }
            });
            return userCreds;
        }

        let currentUser = null;
        let systemUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Administrador del Sistema',
                email: 'admin@ies.com',
                status: 'active',
                created_at: '2023-01-01'
            },
            {
                id: 2,
                username: 'user',
                password: 'user123',
                role: 'user',
                name: 'Usuario Regular',
                email: 'user@ies.com',
                status: 'active',
                created_at: '2023-01-15'
            }
        ];
        let filteredUsers = [...systemUsers];
        let editingUser = null;
        
        let equipment = [
            {
                id: 1,
                name: 'Montacargas Toyota 8FGU25',
                code: 'MC-001',
                type: 'montacargas-combustion',
                brand: 'Toyota',
                model: '8FGU25',
                serial: 'TOY123456789',
                capacity: 2500,
                hours: 2450,
                status: 'disponible',
                lastMaintenance: '2024-06-15',
                nextMaintenance: '2024-09-15',
                acquisitionDate: '2022-01-15',
                value: 45000,
                description: 'Montacargas a gas propano de 2.5 toneladas, con mástil triple, altura máxima 6m',
                location: 'Almacén Central - Zona A'
            },
            {
                id: 2,
                name: 'Montacargas Eléctrico Crown',
                code: 'MC-002',
                type: 'montacargas-electrico',
                brand: 'Crown',
                model: 'RC5500',
                serial: 'CRW987654321',
                capacity: 1800,
                hours: 1850,
                status: 'en-uso',
                lastMaintenance: '2024-07-01',
                nextMaintenance: '2024-10-01',
                acquisitionDate: '2023-03-10',
                value: 38000,
                description: 'Montacargas eléctrico con batería de 48V, ideal para uso en interiores',
                location: 'Almacén B - Zona de Picking'
            },
            {
                id: 3,
                name: 'Apilador Caterpillar',
                code: 'AP-001',
                type: 'apilador',
                brand: 'Caterpillar',
                model: 'NSP16N',
                serial: 'CAT456789123',
                capacity: 1600,
                hours: 980,
                status: 'mantenimiento',
                lastMaintenance: '2024-07-10',
                nextMaintenance: '2024-07-25',
                acquisitionDate: '2023-11-20',
                value: 28000,
                description: 'Apilador eléctrico con conductor a pie, altura de elevación 5.5m',
                location: 'Taller de Mantenimiento'
            },
            {
                id: 4,
                name: 'Elevador de Tijera JLG',
                code: 'ET-001',
                type: 'elevador-tijera',
                brand: 'JLG',
                model: '2646ES',
                serial: 'JLG789123456',
                capacity: 350,
                hours: 1200,
                status: 'disponible',
                lastMaintenance: '2024-05-08',
                nextMaintenance: '2024-08-08',
                acquisitionDate: '2023-05-08',
                value: 32000,
                description: 'Elevador de tijera eléctrico, altura máxima de trabajo 10m',
                location: 'Patio de Equipos - Zona 2'
            },
            {
                id: 5,
                name: 'Transpaleta Manual',
                code: 'TP-001',
                type: 'transpaleta',
                brand: 'Jungheinrich',
                model: 'AM22',
                serial: 'JUN321654987',
                capacity: 2200,
                hours: 0,
                status: 'disponible',
                lastMaintenance: '2024-06-01',
                nextMaintenance: '2024-12-01',
                acquisitionDate: '2024-01-15',
                value: 1200,
                description: 'Transpaleta manual con ruedas de poliuretano, ergonómica',
                location: 'Almacén C - Entrada'
            }
        ];

        let filteredEquipment = [...equipment];
        let editingEquipment = null;

        // Login functionality
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = getUserCredentials();
            
            if (users[username] && users[username].password === password) {
                currentUser = users[username];
                currentUser.username = username;
                showApp();
            } else {
                showLoginError();
            }
        });

        function showLoginError() {
            document.getElementById('loginAlert').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('loginAlert').classList.add('hidden');
            }, 3000);
        }

        function showApp() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            
            document.getElementById('currentUser').textContent = currentUser.name;
            document.getElementById('currentRole').textContent = `(${currentUser.role === 'admin' ? 'Administrador' : 'Usuario'})`;
            
            if (currentUser.role === 'admin') {
                document.getElementById('usersNavTab').classList.remove('hidden');
                document.getElementById('sessionsNavTab').classList.remove('hidden');
                document.getElementById('addEquipmentBtn').classList.remove('hidden');
            }
            
            updateDashboard();
            renderEquipment();
            updateReports();
            if (currentUser.role === 'admin') {
                renderUsers();
                renderSessions();
            }
        }

        function logout() {
            currentUser = null;
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appContainer').style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            showTab('dashboard');
        }

        // Tab navigation
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all nav tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Add active class to clicked nav tab
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            // Hide equipment form when switching tabs
            hideEquipmentForm();
            
            // Hide user form when switching tabs
            if (typeof hideUserForm === 'function') {
                hideUserForm();
            }
            
            // Load sessions data when switching to sessions tab
            if (tabName === 'sessions' && currentUser && currentUser.role === 'admin') {
                renderSessions();
            }
        }

        // Dashboard functions
        function updateDashboard() {
            const total = equipment.length;
            const available = equipment.filter(eq => eq.status === 'disponible').length;
            const inUse = equipment.filter(eq => eq.status === 'en-uso').length;
            const maintenance = equipment.filter(eq => eq.status === 'mantenimiento').length;
            const outOfService = equipment.filter(eq => eq.status === 'fuera-servicio').length;
            
            document.getElementById('totalEquipment').textContent = total;
            document.getElementById('availableEquipment').textContent = available;
            document.getElementById('inUseEquipment').textContent = inUse;
            document.getElementById('maintenanceEquipment').textContent = maintenance;
            document.getElementById('outOfServiceEquipment').textContent = outOfService;
            
            renderRecentEquipment();
        }

        function renderRecentEquipment() {
            const recent = equipment.slice(-4);
            const container = document.getElementById('recentEquipment');
            
            container.innerHTML = recent.map(eq => createEquipmentCard(eq, true)).join('');
        }

        // Equipment functions
        function renderEquipment() {
            const container = document.getElementById('equipmentList');
            container.innerHTML = filteredEquipment.map(eq => createEquipmentCard(eq)).join('');
        }

        function createEquipmentCard(eq, isRecent = false) {
            const typeLabels = {
                'montacargas-electrico': 'Montacargas Eléctrico',
                'montacargas-combustion': 'Montacargas Combustión',
                'apilador': 'Apilador',
                'transpaleta': 'Transpaleta',
                'grua-horquilla': 'Grúa Horquilla',
                'elevador-tijera': 'Elevador de Tijera',
                'cargador-frontal': 'Cargador Frontal',
                'equipo-auxiliar': 'Equipo Auxiliar'
            };

            const statusLabels = {
                'disponible': 'Disponible',
                'en-uso': 'En Operación',
                'mantenimiento': 'En Mantenimiento',
                'fuera-servicio': 'Fuera de Servicio'
            };

            const actions = currentUser && currentUser.role === 'admin' && !isRecent ? `
                <div class="equipment-actions">
                    <button class="btn btn-primary btn-sm" onclick="editEquipment(${eq.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipment(${eq.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            ` : '';

            return `
                <div class="equipment-card">
                    <div class="equipment-header">
                        <div>
                            <div class="equipment-name">${eq.name}</div>
                            <div class="equipment-code">${eq.code}</div>
                        </div>
                        <div class="equipment-status status-${eq.status}">
                            ${statusLabels[eq.status]}
                        </div>
                    </div>
                    
                    <div class="equipment-details">
                        <div class="equipment-detail">
                            <span>Tipo:</span>
                            <span>${typeLabels[eq.type]}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Marca/Modelo:</span>
                            <span>${eq.brand || 'N/A'} ${eq.model || ''}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Capacidad:</span>
                            <span>${eq.capacity ? eq.capacity + ' kg' : 'N/A'}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Horas:</span>
                            <span>${eq.hours || 0}h</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Próximo Mantenimiento:</span>
                            <span>${eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString() : 'No programado'}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Ubicación:</span>
                            <span>${eq.location}</span>
                        </div>
                    </div>
                    
                    <p style="margin-top: 12px; color: var(--text-secondary); font-size: 0.9rem;">
                        ${eq.description}
                    </p>
                    
                    ${actions}
                </div>
            `;
        }

        function filterEquipment() {
            const search = document.getElementById('searchEquipment').value.toLowerCase();
            const typeFilter = document.getElementById('filterType').value;
            const statusFilter = document.getElementById('filterStatus').value;
            
            filteredEquipment = equipment.filter(eq => {
                const matchesSearch = eq.name.toLowerCase().includes(search) || 
                                    eq.code.toLowerCase().includes(search) ||
                                    eq.description.toLowerCase().includes(search);
                const matchesType = !typeFilter || eq.type === typeFilter;
                const matchesStatus = !statusFilter || eq.status === statusFilter;
                
                return matchesSearch && matchesType && matchesStatus;
            });
            
            renderEquipment();
        }

        function showEquipmentForm() {
            document.getElementById('equipmentForm').classList.remove('hidden');
            document.getElementById('formTitle').textContent = 'Nuevo Equipo';
            document.getElementById('equipForm').reset();
            document.getElementById('equipmentId').value = '';
            editingEquipment = null;
        }

        function hideEquipmentForm() {
            document.getElementById('equipmentForm').classList.add('hidden');
            editingEquipment = null;
        }

        function editEquipment(id) {
            const eq = equipment.find(e => e.id === id);
            if (!eq) return;
            
            editingEquipment = eq;
            document.getElementById('equipmentForm').classList.remove('hidden');
            document.getElementById('formTitle').textContent = 'Editar Equipo';
            
            document.getElementById('equipmentId').value = eq.id;
            document.getElementById('equipmentName').value = eq.name;
            document.getElementById('equipmentCode').value = eq.code;
            document.getElementById('equipmentType').value = eq.type;
            document.getElementById('equipmentBrand').value = eq.brand || '';
            document.getElementById('equipmentModel').value = eq.model || '';
            document.getElementById('equipmentSerial').value = eq.serial || '';
            document.getElementById('equipmentCapacity').value = eq.capacity || '';
            document.getElementById('equipmentHours').value = eq.hours || '';
            document.getElementById('equipmentStatus').value = eq.status;
            document.getElementById('lastMaintenance').value = eq.lastMaintenance || '';
            document.getElementById('nextMaintenance').value = eq.nextMaintenance || '';
            document.getElementById('acquisitionDate').value = eq.acquisitionDate;
            document.getElementById('equipmentValue').value = eq.value;
            document.getElementById('equipmentLocation').value = eq.location;
            document.getElementById('equipmentDescription').value = eq.description;
        }

        function deleteEquipment(id) {
            if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
                equipment = equipment.filter(eq => eq.id !== id);
                filteredEquipment = filteredEquipment.filter(eq => eq.id !== id);
                renderEquipment();
                updateDashboard();
                updateReports();
            }
        }

        // Form submission
        document.getElementById('equipForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('equipmentName').value,
                code: document.getElementById('equipmentCode').value,
                type: document.getElementById('equipmentType').value,
                brand: document.getElementById('equipmentBrand').value,
                model: document.getElementById('equipmentModel').value,
                serial: document.getElementById('equipmentSerial').value,
                capacity: parseInt(document.getElementById('equipmentCapacity').value) || null,
                hours: parseInt(document.getElementById('equipmentHours').value) || 0,
                status: document.getElementById('equipmentStatus').value,
                lastMaintenance: document.getElementById('lastMaintenance').value,
                nextMaintenance: document.getElementById('nextMaintenance').value,
                acquisitionDate: document.getElementById('acquisitionDate').value,
                value: parseFloat(document.getElementById('equipmentValue').value),
                location: document.getElementById('equipmentLocation').value,
                description: document.getElementById('equipmentDescription').value
            };
            
            if (editingEquipment) {
                // Update existing equipment
                const index = equipment.findIndex(eq => eq.id === editingEquipment.id);
                equipment[index] = { ...equipment[index], ...formData };
            } else {
                // Add new equipment
                const newId = Math.max(...equipment.map(eq => eq.id)) + 1;
                equipment.push({ id: newId, ...formData });
            }
            
            filteredEquipment = [...equipment];
            renderEquipment();
            updateDashboard();
            updateReports();
            hideEquipmentForm();
        });

        // Reports functions
        function updateReports() {
            const totalValue = equipment.reduce((sum, eq) => sum + eq.value, 0);
            const forklifts = equipment.filter(eq => 
                eq.type === 'montacargas-electrico' || eq.type === 'montacargas-combustion'
            ).length;
            const liftingEquipment = equipment.filter(eq => 
                eq.type === 'apilador' || eq.type === 'elevador-tijera' || eq.type === 'grua-horquilla'
            ).length;
            const auxiliaryEquipment = equipment.filter(eq => 
                eq.type === 'transpaleta' || eq.type === 'cargador-frontal' || eq.type === 'equipo-auxiliar'
            ).length;
            
            document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
            document.getElementById('forklifts').textContent = forklifts;
            document.getElementById('liftingEquipment').textContent = liftingEquipment;
            document.getElementById('auxiliaryEquipment').textContent = auxiliaryEquipment;
        }

        function exportData(format) {
            if (format === 'csv') {
                const csv = generateCSV();
                downloadFile(csv, 'inventario.csv', 'text/csv');
            } else if (format === 'excel') {
                const excel = generateExcel();
                downloadFile(excel, 'inventario.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            } else if (format === 'json') {
                const json = JSON.stringify(equipment, null, 2);
                downloadFile(json, 'inventario.json', 'application/json');
            }
        }

        function generateCSV() {
            const headers = ['ID', 'Nombre', 'Código', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Capacidad (kg)', 'Horas', 'Estado', 'Último Mantenimiento', 'Próximo Mantenimiento', 'Fecha Adquisición', 'Valor', 'Ubicación', 'Observaciones'];
            const rows = equipment.map(eq => [
                eq.id,
                `"${eq.name}"`,
                eq.code,
                eq.type,
                `"${eq.brand || ''}"`,
                `"${eq.model || ''}"`,
                `"${eq.serial || ''}"`,
                eq.capacity || '',
                eq.hours || 0,
                eq.status,
                eq.lastMaintenance || '',
                eq.nextMaintenance || '',
                eq.acquisitionDate,
                eq.value,
                `"${eq.location}"`,
                `"${eq.description}"`
            ]);
            
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }

        function generateExcel() {
            // Simple Excel XML format for basic compatibility
            const headers = ['ID', 'Nombre', 'Código', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Capacidad (kg)', 'Horas', 'Estado', 'Último Mantenimiento', 'Próximo Mantenimiento', 'Fecha Adquisición', 'Valor', 'Ubicación', 'Observaciones'];
            let xml = '<?xml version="1.0"?>\n';
            xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
            xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
            xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
            xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
            xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">\n';
            xml += '<Worksheet ss:Name="Inventario_Montacargas">\n';
            xml += '<Table>\n';
            
            // Headers
            xml += '<Row>\n';
            headers.forEach(header => {
                xml += `<Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
            });
            xml += '</Row>\n';
            
            // Data rows
            equipment.forEach(eq => {
                xml += '<Row>\n';
                xml += `<Cell><Data ss:Type="Number">${eq.id}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.name}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.code}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.type}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.brand || ''}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.model || ''}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.serial || ''}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="Number">${eq.capacity || 0}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="Number">${eq.hours || 0}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.status}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.lastMaintenance || ''}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.nextMaintenance || ''}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.acquisitionDate}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="Number">${eq.value}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.location}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${eq.description}</Data></Cell>\n`;
                xml += '</Row>\n';
            });
            
            xml += '</Table>\n';
            xml += '</Worksheet>\n';
            xml += '</Workbook>';
            
            return xml;
        }

        function printReport() {
            const printWindow = window.open('', '_blank');
            const companyLogo = 'frkydepn3w.jpg';
            
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reporte de Inventario - IES</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #293f8e;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .logo {
                            width: 150px;
                            margin-bottom: 10px;
                        }
                        .company-name {
                            font-size: 18px;
                            font-weight: bold;
                            color: #293f8e;
                        }
                        .report-title {
                            font-size: 24px;
                            margin: 20px 0;
                            color: #293f8e;
                        }
                        .stats {
                            display: flex;
                            justify-content: space-around;
                            margin: 20px 0;
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                        }
                        .stat-item {
                            text-align: center;
                        }
                        .stat-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #293f8e;
                        }
                        .stat-label {
                            font-size: 12px;
                            color: #666;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #293f8e;
                            color: white;
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-top: 1px solid #ddd;
                            padding-top: 15px;
                        }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${companyLogo}" alt="IES Logo" class="logo">
                        <div class="company-name">INTERNATIONAL EQUIPMENT SERVICE, C.A.</div>
                        <div style="font-size: 14px; color: #666;">RIF: J-29353024-5</div>
                        <h1 class="report-title">Reporte de Inventario - Montacargas y Equipos de Carga</h1>
                        <div style="font-size: 14px; color: #666;">Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</div>
                    </div>
                    
                    <div class="stats">
                        <div class="stat-item">
                            <div class="stat-value">${equipment.length}</div>
                            <div class="stat-label">Total Equipos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${equipment.filter(eq => eq.status === 'disponible').length}</div>
                            <div class="stat-label">Disponibles</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${equipment.filter(eq => eq.status === 'en-uso').length}</div>
                            <div class="stat-label">En Uso</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${equipment.filter(eq => eq.status === 'mantenimiento').length}</div>
                            <div class="stat-label">Mantenimiento</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">$${equipment.reduce((sum, eq) => sum + eq.value, 0).toLocaleString()}</div>
                            <div class="stat-label">Valor Total</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Marca/Modelo</th>
                                <th>Tipo</th>
                                <th>Capacidad</th>
                                <th>Horas</th>
                                <th>Estado</th>
                                <th>Próximo Mantenimiento</th>
                                <th>Ubicación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${equipment.map(eq => `
                                <tr>
                                    <td>${eq.code}</td>
                                    <td>${eq.name}</td>
                                    <td>${(eq.brand || '') + ' ' + (eq.model || '')}</td>
                                    <td>${eq.type}</td>
                                    <td>${eq.capacity ? eq.capacity + ' kg' : 'N/A'}</td>
                                    <td>${eq.hours || 0}h</td>
                                    <td>${eq.status}</td>
                                    <td>${eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString('es-ES') : 'No programado'}</td>
                                    <td>${eq.location}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>International Equipment Service, C.A. | RIF: J-29353024-5</p>
                        <p>Sistema de Gestión de Inventario | Página 1 de 1</p>
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }

        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }

        // User Management Functions
        function renderUsers() {
            const container = document.getElementById('usersList');
            container.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');
        }

        function createUserCard(user) {
            const statusClass = user.status === 'active' ? 'status-disponible' : 'status-mantenimiento';
            const roleLabel = user.role === 'admin' ? 'Administrador' : 'Usuario Regular';
            
            return `
                <div class="equipment-card">
                    <div class="equipment-header">
                        <div>
                            <div class="equipment-name">${user.name}</div>
                            <div class="equipment-code">@${user.username}</div>
                        </div>
                        <div class="equipment-status ${statusClass}">
                            ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </div>
                    </div>
                    
                    <div class="equipment-details">
                        <div class="equipment-detail">
                            <span>Email:</span>
                            <span>${user.email}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Rol:</span>
                            <span>${roleLabel}</span>
                        </div>
                        <div class="equipment-detail">
                            <span>Creado:</span>
                            <span>${new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="equipment-actions">
                        <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        ${user.username !== 'admin' ? `
                            <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function showUserForm() {
            document.getElementById('userForm').classList.remove('hidden');
            document.getElementById('userFormTitle').textContent = 'Nuevo Usuario';
            document.getElementById('userCreateForm').reset();
            document.getElementById('userId').value = '';
            editingUser = null;
        }

        function hideUserForm() {
            document.getElementById('userForm').classList.add('hidden');
            editingUser = null;
        }

        function editUser(id) {
            const user = systemUsers.find(u => u.id === id);
            if (!user) return;
            
            editingUser = user;
            document.getElementById('userForm').classList.remove('hidden');
            document.getElementById('userFormTitle').textContent = 'Editar Usuario';
            
            document.getElementById('userId').value = user.id;
            document.getElementById('userFullName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userPassword').value = user.password;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
        }

        function deleteUser(id) {
            const user = systemUsers.find(u => u.id === id);
            if (!user) return;
            
            if (user.username === 'admin') {
                alert('No se puede eliminar el usuario administrador principal.');
                return;
            }
            
            if (confirm(`¿Estás seguro de que deseas eliminar el usuario "${user.name}"?`)) {
                systemUsers = systemUsers.filter(u => u.id !== id);
                filteredUsers = filteredUsers.filter(u => u.id !== id);
                renderUsers();
            }
        }

        function filterUsers() {
            const search = document.getElementById('searchUsers').value.toLowerCase();
            
            filteredUsers = systemUsers.filter(user => {
                return user.name.toLowerCase().includes(search) ||
                       user.username.toLowerCase().includes(search) ||
                       user.email.toLowerCase().includes(search);
            });
            
            renderUsers();
        }

        // User form submission
        document.getElementById('userCreateForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('userFullName').value,
                email: document.getElementById('userEmail').value,
                username: document.getElementById('userUsername').value,
                password: document.getElementById('userPassword').value,
                role: document.getElementById('userRole').value,
                status: document.getElementById('userStatus').value
            };
            
            // Check for duplicate username
            const existingUser = systemUsers.find(u => 
                u.username === formData.username && 
                (!editingUser || u.id !== editingUser.id)
            );
            
            if (existingUser) {
                alert('Ya existe un usuario con ese nombre de usuario.');
                return;
            }
            
            if (editingUser) {
                // Update existing user
                const index = systemUsers.findIndex(u => u.id === editingUser.id);
                systemUsers[index] = { ...systemUsers[index], ...formData };
            } else {
                // Add new user
                const newId = Math.max(...systemUsers.map(u => u.id)) + 1;
                systemUsers.push({ 
                    id: newId, 
                    ...formData, 
                    created_at: new Date().toISOString().split('T')[0]
                });
            }
            
            filteredUsers = [...systemUsers];
            renderUsers();
            hideUserForm();
        });

        // Session Management Variables
        let userSessions = [
            {
                id: 1,
                user_id: 1,
                user_name: 'Administrador',
                username: 'admin',
                role: 'admin',
                login_time: '2024-07-15 08:30:00',
                logout_time: '2024-07-15 17:45:00',
                ip_address: '192.168.1.100',
                user_agent: 'Chrome/120.0.0.0',
                is_active: false,
                session_duration_minutes: 555
            },
            {
                id: 2,
                user_id: 2,
                user_name: 'Usuario Regular',
                username: 'user',
                role: 'user',
                login_time: '2024-07-15 09:15:00',
                logout_time: '2024-07-15 16:30:00',
                ip_address: '192.168.1.105',
                user_agent: 'Firefox/115.0',
                is_active: false,
                session_duration_minutes: 435
            },
            {
                id: 3,
                user_id: 1,
                user_name: 'Administrador',
                username: 'admin',
                role: 'admin',
                login_time: '2024-07-15 14:20:00',
                logout_time: null,
                ip_address: '192.168.1.100',
                user_agent: 'Chrome/120.0.0.0',
                is_active: true,
                session_duration_minutes: 24
            },
            {
                id: 4,
                user_id: 1,
                user_name: 'Administrador',
                username: 'admin',
                role: 'admin',
                login_time: '2024-07-14 10:00:00',
                logout_time: '2024-07-14 18:30:00',
                ip_address: '192.168.1.100',
                user_agent: 'Chrome/120.0.0.0',
                is_active: false,
                session_duration_minutes: 510
            },
            {
                id: 5,
                user_id: 2,
                user_name: 'Usuario Regular',
                username: 'user',
                role: 'user',
                login_time: '2024-07-14 11:30:00',
                logout_time: '2024-07-14 15:00:00',
                ip_address: '192.168.1.105',
                user_agent: 'Firefox/115.0',
                is_active: false,
                session_duration_minutes: 210
            }
        ];
        let filteredSessions = [...userSessions];

        // Session Management Functions
        function renderSessions() {
            const container = document.getElementById('sessionsList');
            container.innerHTML = filteredSessions.map(session => createSessionCard(session)).join('');
            updateSessionsStats();
        }

        function createSessionCard(session) {
            const loginDate = new Date(session.login_time);
            const logoutDate = session.logout_time ? new Date(session.logout_time) : null;
            const statusClass = session.is_active ? 'status-en-uso' : 'status-disponible';
            const statusText = session.is_active ? 'Activa' : 'Cerrada';
            const durationText = session.session_duration_minutes ? 
                `${Math.floor(session.session_duration_minutes / 60)}h ${session.session_duration_minutes % 60}m` : 
                'En curso';
            
            return `
                <div class="equipment-card">
                    <div class="equipment-header">
                        <div>
                            <div class="equipment-name">${session.user_name}</div>
                            <div class="equipment-code">@${session.username} (${session.role})</div>
                        </div>
                        <div class="equipment-status ${statusClass}">
                            ${statusText}
                        </div>
                    </div>
                    
                    <div class="equipment-details">
                        <div class="equipment-detail">
                            <span><i class="fas fa-sign-in-alt"></i> Entrada:</span>
                            <span>${loginDate.toLocaleString('es-ES')}</span>
                        </div>
                        <div class="equipment-detail">
                            <span><i class="fas fa-sign-out-alt"></i> Salida:</span>
                            <span>${logoutDate ? logoutDate.toLocaleString('es-ES') : 'Sesión activa'}</span>
                        </div>
                        <div class="equipment-detail">
                            <span><i class="fas fa-clock"></i> Duración:</span>
                            <span>${durationText}</span>
                        </div>
                        <div class="equipment-detail">
                            <span><i class="fas fa-network-wired"></i> IP:</span>
                            <span>${session.ip_address}</span>
                        </div>
                        <div class="equipment-detail">
                            <span><i class="fas fa-browser"></i> Navegador:</span>
                            <span>${session.user_agent}</span>
                        </div>
                    </div>
                    
                    ${session.is_active && currentUser && currentUser.role === 'admin' ? `
                        <div class="equipment-actions">
                            <button class="btn btn-danger btn-sm" onclick="closeUserSession(${session.id})">
                                <i class="fas fa-sign-out-alt"></i>
                                Cerrar Sesión
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        function updateSessionsStats() {
            const activeSessions = userSessions.filter(s => s.is_active).length;
            const today = new Date().toISOString().split('T')[0];
            const sessionsToday = userSessions.filter(s => s.login_time.startsWith(today)).length;
            
            const closedSessions = userSessions.filter(s => !s.is_active && s.session_duration_minutes);
            const avgTime = closedSessions.length > 0 ? 
                Math.round(closedSessions.reduce((sum, s) => sum + s.session_duration_minutes, 0) / closedSessions.length) : 0;
            
            const uniqueUsersToday = new Set(
                userSessions.filter(s => s.login_time.startsWith(today)).map(s => s.user_id)
            ).size;
            
            document.getElementById('activeSessions').textContent = activeSessions;
            document.getElementById('sessionsToday').textContent = sessionsToday;
            document.getElementById('avgSessionTime').textContent = `${Math.floor(avgTime / 60)}h ${avgTime % 60}m`;
            document.getElementById('uniqueUsersToday').textContent = uniqueUsersToday;
        }

        function filterSessions() {
            const searchTerm = document.getElementById('searchSessions').value.toLowerCase();
            const dateFrom = document.getElementById('filterDateFrom').value;
            const dateTo = document.getElementById('filterDateTo').value;
            const statusFilter = document.getElementById('filterSessionStatus').value;
            
            filteredSessions = userSessions.filter(session => {
                const matchesSearch = searchTerm === '' || 
                    session.user_name.toLowerCase().includes(searchTerm) ||
                    session.username.toLowerCase().includes(searchTerm);
                
                const sessionDate = session.login_time.split(' ')[0];
                const matchesDateFrom = !dateFrom || sessionDate >= dateFrom;
                const matchesDateTo = !dateTo || sessionDate <= dateTo;
                
                let matchesStatus = true;
                if (statusFilter === 'active') {
                    matchesStatus = session.is_active;
                } else if (statusFilter === 'closed') {
                    matchesStatus = !session.is_active;
                }
                
                return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus;
            });
            
            renderSessions();
        }

        function refreshSessions() {
            // En una implementación real, esto haría una llamada a la API
            renderSessions();
            showAlert('success', 'Sesiones actualizadas correctamente');
        }

        function exportSessionsCSV() {
            const headers = ['ID', 'Usuario', 'Nombre', 'Rol', 'Entrada', 'Salida', 'Duración (min)', 'IP', 'Navegador', 'Estado'];
            const csvContent = [
                headers.join(','),
                ...filteredSessions.map(session => [
                    session.id,
                    session.username,
                    session.user_name,
                    session.role,
                    session.login_time,
                    session.logout_time || 'Activa',
                    session.session_duration_minutes || 'En curso',
                    session.ip_address,
                    `"${session.user_agent}"`,
                    session.is_active ? 'Activa' : 'Cerrada'
                ].join(','))
            ].join('\\n');
            
            downloadFile(csvContent, 'sesiones_usuarios.csv', 'text/csv');
        }

        function closeUserSession(sessionId) {
            if (confirm('¿Está seguro de que desea cerrar esta sesión?')) {
                const sessionIndex = userSessions.findIndex(s => s.id === sessionId);
                if (sessionIndex !== -1) {
                    const session = userSessions[sessionIndex];
                    session.logout_time = new Date().toISOString().replace('T', ' ').split('.')[0];
                    session.is_active = false;
                    
                    // Calcular duración
                    const loginTime = new Date(session.login_time);
                    const logoutTime = new Date(session.logout_time);
                    session.session_duration_minutes = Math.round((logoutTime - loginTime) / (1000 * 60));
                    
                    filteredSessions = [...userSessions];
                    renderSessions();
                    showAlert('success', 'Sesión cerrada correctamente');
                }
            }
        }

        // Initialize with demo credentials info
        window.addEventListener('load', function() {
            // Show demo credentials for testing
            setTimeout(() => {
                const demoInfo = document.createElement('div');
                demoInfo.innerHTML = `
                    <div style="position: fixed; top: 10px; right: 10px; background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px; z-index: 1000;">
                        <strong>Credenciales de prueba:</strong><br>
                        Admin: admin / admin123<br>
                        Usuario: user / user123
                    </div>
                `;
                document.body.appendChild(demoInfo);
                
                setTimeout(() => {
                    demoInfo.remove();
                }, 10000);
            }, 1000);
        });
