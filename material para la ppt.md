# Sistema de Monitoreo de Orquídeas - Industria 4.0

Sistema web de monitoreo en tiempo real para cultivo de orquídeas utilizando IoT (ESP32), sensores ambientales y Firebase.

## 📋 Descripción del Proyecto

Este sistema permite monitorear las condiciones ambientales óptimas para el cultivo de orquídeas en invernadero:
- **Temperatura óptima**: 18°C - 24°C
- **Humedad relativa**: ~80%

### Características Principales

✅ **Monitoreo en Tiempo Real**
- Visualización instantánea de temperatura y humedad
- Dashboard web interactivo
- Indicadores de estado (óptimo, advertencia, peligro)

✅ **Registro Histórico**
- Almacenamiento en Firebase
- Gráficos de tendencias
- Exportación de datos a CSV
- Frecuencia configurable (30 min, 1 hora, 2 horas, 6 horas)

✅ **Sistema de Alertas**
- Notificaciones cuando los valores están fuera de rango
- Historial de alertas
- Alertas en tiempo real

✅ **Calendario de Riego**
- Programación de horarios de riego
- Recordatorios automáticos
- Configuración por días de la semana

✅ **Integración IoT**
- ESP32 con sensor DHT11
- Conexión WiFi
- Sincronización automática con Firebase

## 🛠️ Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (diseño responsive)
- JavaScript (ES6+)
- Chart.js (gráficos)

### Backend
- Firebase Realtime Database
- Firebase Firestore
- Firebase Authentication

### Hardware
- ESP32
- Sensor DHT11 (Temperatura y Humedad)
- Módulo WiFi integrado en ESP32

## 📦 Instalación

### 1. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Realtime Database** y **Authentication**
3. En Authentication, habilitar "Email/Password"
4. Crear un usuario de prueba
5. Obtener la configuración del proyecto

### 2. Configurar la Aplicación Web

1. Abrir `firebase-config.js`
2. Reemplazar con tu configuración de Firebase:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

3. Abrir `index.html` en un navegador web

### 3. Configurar ESP32

#### Requisitos de Hardware
- ESP32
- Sensor DHT11
- Cables jumper
- Protoboard (opcional)

#### Conexiones
```
DHT11 -> ESP32
VCC   -> 3.3V
GND   -> GND
DATA  -> GPIO 4
```

#### Instalación de Librerías en Arduino IDE

1. Instalar Arduino IDE
2. Configurar ESP32 en Arduino IDE:
   - File > Preferences
   - Agregar URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools > Board > Boards Manager > Buscar "ESP32" e instalar

3. Instalar librerías necesarias (Sketch > Include Library > Manage Libraries):
   - `DHT sensor library` by Adafruit
   - `Firebase ESP Client` by Mobizt

#### Configurar y Subir Código

1. Abrir `esp32_code.ino`
2. Modificar credenciales:

```cpp
#define WIFI_SSID "TU_RED_WIFI"
#define WIFI_PASSWORD "TU_PASSWORD_WIFI"
#define API_KEY "TU_API_KEY"
#define DATABASE_URL "https://tu-proyecto-default-rtdb.firebaseio.com"
#define USER_EMAIL "tu-email@example.com"
#define USER_PASSWORD "tu-password"
```

3. Seleccionar placa: Tools > Board > ESP32 Dev Module
4. Seleccionar puerto COM
5. Subir código al ESP32

## 🗄️ Estructura de la Base de Datos Firebase

```
orquideas-monitor/
├── sensors/
│   ├── current/
│   │   ├── temperature: 22.5
│   │   ├── humidity: 78.3
│   │   └── timestamp: 1234567890
│   └── history/
│       ├── 1234567890/
│       │   ├── temperature: 22.5
│       │   ├── humidity: 78.3
│       │   └── timestamp: 1234567890
│       └── ...
├── irrigation/
│   └── schedule/
│       ├── -ABC123/
│       │   ├── time: "08:00"
│       │   ├── days: [1, 3, 5]
│       │   └── id: 1234567890
│       └── ...
├── alerts/
│   └── 1234567890/
│       ├── type: "temperature_high"
│       ├── message: "Temperatura alta: 26°C"
│       ├── temperature: 26
│       ├── humidity: 75
│       └── timestamp: 1234567890
└── config/
    └── dataFrequency: 60
```

## 🧪 Pruebas del Sistema

### Pruebas Funcionales

#### RF1: Establecer Calendario de Riego
1. Acceder a la sección "Calendario de Riego"
2. Seleccionar días (Lun, Mié, Vie)
3. Establecer hora (08:00)
4. Clic en "Guardar Configuración"
5. Verificar que aparezca en "Próximos Riegos"

**Resultado esperado**: ✅ Calendario guardado correctamente

#### RF2: Notificar Hora de Riego
1. Configurar un horario cercano a la hora actual
2. Esperar a que llegue la hora configurada
3. Verificar notificación

**Resultado esperado**: ✅ Notificación mostrada al usuario

#### RF3-RF4: Integración y Monitoreo de Sensores
1. Encender ESP32
2. Verificar conexión WiFi en Serial Monitor
3. Verificar envío de datos a Firebase
4. Observar actualización en dashboard web

**Resultado esperado**: ✅ Datos mostrados en tiempo real

#### RF5: Registro Histórico
1. Configurar frecuencia (1 hora)
2. Esperar al menos 3 registros
3. Verificar gráficos históricos
4. Exportar datos a CSV

**Resultado esperado**: ✅ Datos almacenados y visualizados

#### RF6: Base de Datos
1. Acceder a Firebase Console
2. Verificar estructura de datos
3. Verificar datos en tiempo real
4. Verificar datos históricos

**Resultado esperado**: ✅ Base de datos funcionando correctamente

#### RF7: Visualización en Tiempo Real
1. Modificar condiciones ambientales (soplar sensor)
2. Observar cambios en dashboard
3. Verificar badges de estado (óptimo/advertencia/peligro)

**Resultado esperado**: ✅ Visualización actualizada instantáneamente

### Pruebas de Integración

#### Prueba 1: Sistema Completo
1. ESP32 enviando datos
2. Firebase recibiendo y almacenando
3. Web mostrando datos en tiempo real
4. Alertas funcionando
5. Calendario de riego activo

**Resultado esperado**: ✅ Todo el sistema funcionando en conjunto

#### Prueba 2: Condiciones Extremas
1. Probar con temperatura < 18°C
2. Probar con temperatura > 24°C
3. Probar con humedad < 70%
4. Probar con humedad > 90%
5. Verificar alertas generadas

**Resultado esperado**: ✅ Alertas correctas para cada condición

### Pruebas de Rendimiento

1. **Frecuencia de actualización**: Verificar envío cada 1 minuto
2. **Carga de datos históricos**: Cargar 1000+ registros
3. **Exportación CSV**: Exportar archivo grande
4. **Múltiples usuarios**: Varios navegadores simultáneos

## 📊 Evaluación de Viabilidad Técnica

### Complejidad: MEDIA-ALTA

**Componentes de Hardware**:
- ✅ ESP32: Microcontrolador potente con WiFi integrado
- ✅ DHT11: Sensor económico y fácil de usar
- ✅ Conexión simple (solo 3 cables)

**Componentes de Software**:
- ✅ Firebase: Plataforma robusta y escalable
- ✅ Web responsive: Funciona en PC, tablet y móvil
- ✅ Tiempo real: Actualizaciones instantáneas

### Viabilidad: ALTA

**Ventajas**:
1. Tecnologías probadas y documentadas
2. Bajo costo de implementación
3. Escalable (puede agregar más sensores)
4. Mantenimiento simple
5. Acceso remoto desde cualquier dispositivo

**Desafíos**:
1. Requiere conexión WiFi estable
2. Dependencia de servicios en la nube
3. Consumo eléctrico continuo del ESP32

### Originalidad en la Combinación Tecnológica

**Aspectos Innovadores**:
1. ✅ Integración ESP32 + Firebase (comunicación directa sin servidor intermedio)
2. ✅ Dashboard web moderno con visualización en tiempo real
3. ✅ Sistema de alertas inteligente basado en rangos óptimos
4. ✅ Exportación de datos para análisis posterior
5. ✅ Calendario de riego integrado con el sistema de monitoreo

## 📱 Uso del Sistema

### Dashboard Principal
- Ver temperatura y humedad actuales
- Estado del sistema (sensores, base de datos)
- Última actualización

### Gráficos Históricos
- Seleccionar rango de tiempo (24h, 48h, 1 semana)
- Exportar datos históricos

### Calendario de Riego
- Programar horarios de riego
- Ver próximos riegos programados
- Eliminar horarios

### Configuración
- Ajustar frecuencia de registro
- Ver estado de conexión de sensores

## 🔧 Solución de Problemas

### El ESP32 no se conecta a WiFi
- Verificar SSID y contraseña
- Verificar que la red es 2.4GHz (no 5GHz)
- Verificar alcance de señal WiFi

### No se muestran datos en el dashboard
- Verificar configuración de Firebase
- Verificar que el ESP32 está enviando datos (Serial Monitor)
- Verificar reglas de seguridad en Firebase

### Sensor DHT11 da lecturas erróneas
- Verificar conexiones físicas
- Esperar 2 segundos entre lecturas
- Reemplazar sensor si está dañado

## 👥 Autores

Proyecto desarrollado para **Integración de Competencias II**

## 📄 Licencia

Este proyecto es para fines educativos.

## 📞 Soporte

Para problemas o consultas, revisar la documentación de:
- [Firebase](https://firebase.google.com/docs)
- [ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [DHT Sensor](https://www.adafruit.com/product/386)
