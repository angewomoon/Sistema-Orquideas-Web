// Variables globales
let tempChart = null;
let humChart = null;
let currentSchedule = [];
let dataFrequency = 60; // minutos

// Referencias a elementos del DOM
const elements = {
    tempValue: document.getElementById('tempValue'),
    humValue: document.getElementById('humValue'),
    tempStatus: document.getElementById('tempStatus'),
    humStatus: document.getElementById('humStatus'),
    lastUpdate: document.getElementById('lastUpdate'),
    updateDate: document.getElementById('updateDate'),
    sensorStatus: document.getElementById('sensorStatus'),
    dbStatus: document.getElementById('dbStatus'),
    frequency: document.getElementById('frequency'),
    connectionStatus: document.getElementById('connectionStatus'),
    scheduleList: document.getElementById('scheduleList'),
    alertsList: document.getElementById('alertsList'),
    irrigationForm: document.getElementById('irrigationForm'),
    timeRange: document.getElementById('timeRange'),
    exportData: document.getElementById('exportData'),
    dataFrequency: document.getElementById('dataFrequency')
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    
    // Inicializar gráficos
    initCharts();
    
    // Configurar listeners
    setupEventListeners();
    
    // Conectar a Firebase
    connectToFirebase();
    
    // Cargar configuración guardada
    loadSavedConfig();
});

// Configurar event listeners
function setupEventListeners() {
    // Formulario de riego
    elements.irrigationForm.addEventListener('submit', handleIrrigationSubmit);
    
    // Selector de rango de tiempo
    elements.timeRange.addEventListener('change', () => {
        loadHistoricalData(parseInt(elements.timeRange.value));
    });
    
    // Exportar datos
    elements.exportData.addEventListener('click', exportToCSV);
    
    // Frecuencia de datos
    elements.dataFrequency.addEventListener('change', (e) => {
        dataFrequency = parseInt(e.target.value);
        saveConfig();
        elements.frequency.textContent = `${dataFrequency} minutos`;
    });
}

// Conectar a Firebase y escuchar cambios en tiempo real
function connectToFirebase() {
    try {
        // Actualizar estado de conexión
        elements.dbStatus.textContent = 'Conectado';
        elements.dbStatus.classList.remove('offline');
        elements.dbStatus.classList.add('online');
        
        elements.connectionStatus.classList.add('connected');
        elements.connectionStatus.querySelector('span').textContent = 'Conectado';
        
        // Escuchar datos en tiempo real
        const realtimeRef = database.ref('sensors/current');
        realtimeRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateRealtimeData(data);
                elements.sensorStatus.textContent = 'Online';
                elements.sensorStatus.classList.remove('offline');
                elements.sensorStatus.classList.add('online');
            }
        });
        
        // Cargar datos históricos
        loadHistoricalData(24);
        
        // Cargar horarios de riego
        loadIrrigationSchedule();
        
        // Verificar alertas cada minuto
        setInterval(checkAlerts, 60000);
        
    } catch (error) {
        console.error('Error al conectar con Firebase:', error);
        elements.dbStatus.textContent = 'Error';
        elements.dbStatus.classList.add('offline');
        elements.connectionStatus.classList.add('disconnected');
        elements.connectionStatus.querySelector('span').textContent = 'Error de conexión';
    }
}

// Actualizar datos en tiempo real
function updateRealtimeData(data) {
    const { temperature, humidity, timestamp } = data;
    
    // Actualizar valores
    elements.tempValue.textContent = temperature ? temperature.toFixed(1) : '--';
    elements.humValue.textContent = humidity ? humidity.toFixed(1) : '--';
    
    // Actualizar estado de temperatura (18°C - 24°C óptimo)
    updateStatus(elements.tempStatus, temperature, 18, 24, '°C');
    
    // Actualizar estado de humedad (~80% óptimo)
    updateStatus(elements.humStatus, humidity, 75, 85, '%', 80);
    
    // Actualizar timestamp
    if (timestamp) {
        const date = new Date(timestamp);
        elements.lastUpdate.textContent = date.toLocaleTimeString('es-CL');
        elements.updateDate.textContent = date.toLocaleDateString('es-CL');
    }
    
    // Verificar si necesita alerta
    checkForAlerts(temperature, humidity);
}

// Actualizar estado con badge
function updateStatus(element, value, min, max, unit, optimal = null) {
    const badge = element.querySelector('.status-badge');
    if (!badge) return;
    
    if (!value) {
        badge.textContent = 'Esperando datos...';
        badge.className = 'status-badge waiting';
        return;
    }
    
    if (optimal) {
        // Para humedad con valor óptimo específico
        const diff = Math.abs(value - optimal);
        if (diff <= 5) {
            badge.textContent = `Óptimo (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge optimal';
        } else if (diff <= 10) {
            badge.textContent = `Aceptable (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge warning';
        } else {
            badge.textContent = `Fuera de rango (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge danger';
        }
    } else {
        // Para temperatura con rango
        if (value >= min && value <= max) {
            badge.textContent = `Óptimo (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge optimal';
        } else if (value >= min - 2 && value <= max + 2) {
            badge.textContent = `Aceptable (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge warning';
        } else {
            badge.textContent = `Fuera de rango (${value.toFixed(1)}${unit})`;
            badge.className = 'status-badge danger';
        }
    }
}

// Verificar alertas
function checkForAlerts(temperature, humidity) {
    const alerts = [];
    
    if (temperature < 16) {
        alerts.push({
            type: 'danger',
            icon: 'fa-temperature-low',
            title: 'Temperatura Crítica Baja',
            message: `La temperatura es de ${temperature.toFixed(1)}°C, muy por debajo del rango óptimo (18-24°C)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    } else if (temperature < 18) {
        alerts.push({
            type: 'warning',
            icon: 'fa-temperature-low',
            title: 'Temperatura Baja',
            message: `La temperatura es de ${temperature.toFixed(1)}°C, por debajo del rango óptimo (18-24°C)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    } else if (temperature > 26) {
        alerts.push({
            type: 'danger',
            icon: 'fa-temperature-high',
            title: 'Temperatura Crítica Alta',
            message: `La temperatura es de ${temperature.toFixed(1)}°C, muy por encima del rango óptimo (18-24°C)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    } else if (temperature > 24) {
        alerts.push({
            type: 'warning',
            icon: 'fa-temperature-high',
            title: 'Temperatura Alta',
            message: `La temperatura es de ${temperature.toFixed(1)}°C, por encima del rango óptimo (18-24°C)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    }
    
    if (humidity < 70) {
        alerts.push({
            type: 'warning',
            icon: 'fa-tint-slash',
            title: 'Humedad Baja',
            message: `La humedad es de ${humidity.toFixed(1)}%, por debajo del nivel óptimo (~80%)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    } else if (humidity > 90) {
        alerts.push({
            type: 'warning',
            icon: 'fa-tint',
            title: 'Humedad Alta',
            message: `La humedad es de ${humidity.toFixed(1)}%, por encima del nivel óptimo (~80%)`,
            time: new Date().toLocaleTimeString('es-CL')
        });
    }
    
    displayAlerts(alerts);
}

// Mostrar alertas
function displayAlerts(alerts) {
    if (alerts.length === 0) {
        elements.alertsList.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <p>No hay alertas activas</p>
            </div>
        `;
        return;
    }
    
    elements.alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <i class="fas ${alert.icon}"></i>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
            </div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `).join('');
}

// Verificar alertas periódicamente
function checkAlerts() {
    const currentRef = database.ref('sensors/current');
    currentRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            checkForAlerts(data.temperature, data.humidity);
            checkIrrigationReminders();
        }
    });
}

// Inicializar gráficos
function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: false
            },
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };
    
    // Gráfico de temperatura
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Historial de Temperatura'
                }
            },
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 10,
                    max: 30
                }
            }
        }
    });
    
    // Gráfico de humedad
    const humCtx = document.getElementById('humChart').getContext('2d');
    humChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humedad (%)',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Historial de Humedad'
                }
            },
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Cargar datos históricos
function loadHistoricalData(hours) {
    const now = Date.now();
    const startTime = now - (hours * 60 * 60 * 1000);
    
    const historyRef = database.ref('sensors/history')
        .orderByChild('timestamp')
        .startAt(startTime);
    
    historyRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            console.log('No hay datos históricos');
            return;
        }
        
        const entries = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        
        const labels = [];
        const tempData = [];
        const humData = [];
        
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            labels.push(date.toLocaleString('es-CL', { 
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }));
            tempData.push(entry.temperature);
            humData.push(entry.humidity);
        });
        
        // Actualizar gráficos
        tempChart.data.labels = labels;
        tempChart.data.datasets[0].data = tempData;
        tempChart.update();
        
        humChart.data.labels = labels;
        humChart.data.datasets[0].data = humData;
        humChart.update();
    });
}

// Manejar envío del formulario de riego
function handleIrrigationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const time = form.time.value;
    const daysChecked = Array.from(form.querySelectorAll('input[name="days"]:checked'))
        .map(cb => parseInt(cb.value));
    
    if (daysChecked.length === 0) {
        alert('Por favor selecciona al menos un día');
        return;
    }
    
    const scheduleEntry = {
        time: time,
        days: daysChecked,
        id: Date.now()
    };
    
    // Guardar en Firebase
    database.ref('irrigation/schedule').push(scheduleEntry)
        .then(() => {
            alert('Horario de riego guardado correctamente');
            form.reset();
            loadIrrigationSchedule();
        })
        .catch(error => {
            console.error('Error al guardar:', error);
            alert('Error al guardar el horario');
        });
}

// Cargar horarios de riego
function loadIrrigationSchedule() {
    const scheduleRef = database.ref('irrigation/schedule');
    
    scheduleRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            elements.scheduleList.innerHTML = `
                <div class="no-schedule">
                    <i class="fas fa-info-circle"></i>
                    <p>No hay horarios configurados</p>
                </div>
            `;
            return;
        }
        
        currentSchedule = Object.entries(data).map(([key, value]) => ({
            key,
            ...value
        }));
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        elements.scheduleList.innerHTML = currentSchedule.map(item => {
            const daysText = item.days.map(d => dayNames[d]).join(', ');
            return `
                <div class="schedule-item">
                    <div>
                        <div class="time">${item.time}</div>
                        <div class="days">${daysText}</div>
                    </div>
                    <button onclick="deleteSchedule('${item.key}')" class="btn-secondary">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    });
}

// Eliminar horario
function deleteSchedule(key) {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
        database.ref(`irrigation/schedule/${key}`).remove()
            .then(() => {
                alert('Horario eliminado');
                loadIrrigationSchedule();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el horario');
            });
    }
}

// Verificar recordatorios de riego
function checkIrrigationReminders() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    currentSchedule.forEach(item => {
        if (item.days.includes(currentDay) && item.time === currentTime) {
            showNotification('Hora de Riego', 'Es momento de regar las orquídeas');
        }
    });
}

// Mostrar notificación
function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/1593/1593234.png'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

// Solicitar permiso de notificaciones
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Guardar configuración
function saveConfig() {
    const config = {
        dataFrequency: dataFrequency
    };
    localStorage.setItem('orchidConfig', JSON.stringify(config));
    database.ref('config').set(config);
}

// Cargar configuración guardada
function loadSavedConfig() {
    const saved = localStorage.getItem('orchidConfig');
    if (saved) {
        const config = JSON.parse(saved);
        dataFrequency = config.dataFrequency || 60;
        elements.dataFrequency.value = dataFrequency;
        elements.frequency.textContent = `${dataFrequency} minutos`;
    }
}

// Exportar datos a CSV
function exportToCSV() {
    const hours = parseInt(elements.timeRange.value);
    const now = Date.now();
    const startTime = now - (hours * 60 * 60 * 1000);
    
    const historyRef = database.ref('sensors/history')
        .orderByChild('timestamp')
        .startAt(startTime);
    
    historyRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            alert('No hay datos para exportar');
            return;
        }
        
        const entries = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        
        let csv = 'Fecha,Hora,Temperatura (°C),Humedad (%)\n';
        
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('es-CL');
            const timeStr = date.toLocaleTimeString('es-CL');
            csv += `${dateStr},${timeStr},${entry.temperature},${entry.humidity}\n`;
        });
        
        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos_orquideas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

console.log('App.js cargado correctamente');