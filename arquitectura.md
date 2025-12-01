# ARQUITECTURA DEL SISTEMA - Monitoreo de Orquídeas

## 1. VISIÓN GENERAL

### 1.1 Descripción
Sistema IoT de monitoreo ambiental para cultivo de orquídeas que integra hardware (ESP32), sensores (DHT11), plataforma en la nube (Firebase) y aplicación web responsiva.

### 1.2 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Aplicación Web (Frontend)                  │   │
│  │  - HTML5 + CSS3 + JavaScript                         │   │
│  │  - Chart.js para visualización                       │   │
│  │  - Diseño Responsive                                 │   │
│  │  - Tiempo Real con WebSockets                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                 │
│                           │ HTTPS / WebSocket               │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│                     CAPA DE SERVICIOS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Firebase (Backend as a Service)         │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Realtime Database (NoSQL)                    │  │   │
│  │  │   - Datos en tiempo real                       │  │   │
│  │  │   - Sincronización automática                  │  │   │
│  │  │   - Estructura JSON                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Authentication                               │  │   │
│  │  │   - Email/Password                             │  │   │
│  │  │   - Tokens de sesión                           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Firestore (Opcional)                         │  │   │
│  │  │   - Consultas complejas                        │  │   │
│  │  │   - Indexación                                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                 │
│                           │ WiFi / HTTPS                    │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│                      CAPA DE HARDWARE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ESP32 (Microcontrolador)                │   │
│  │  - WiFi integrado                                    │   │
│  │  - Procesamiento de datos                            │   │
│  │  - Gestión de sensores                               │   │
│  │  - Cliente Firebase                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                 │
│                           │ GPIO / I2C                      │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Sensores Ambientales                    │   │
│  │  - DHT11 (Temperatura y Humedad)                     │   │
│  │  - Otros sensores opcionales                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 2. COMPONENTES DEL SISTEMA

### 2.1 Hardware Layer (Capa de Hardware)

#### ESP32
- **Función**: Microcontrolador principal
- **Características**:
  - Procesador dual-core 240MHz
  - WiFi 802.11 b/g/n integrado
  - Múltiples pines GPIO
  - Soporte para protocolos I2C, SPI, UART
  - Bajo consumo energético
- **Responsabilidades**:
  - Leer datos de sensores
  - Procesar y validar datos
  - Enviar datos a Firebase vía WiFi
  - Gestionar reconexiones automáticas

#### Sensor DHT11
- **Función**: Medición de temperatura y humedad
- **Especificaciones**:
  - Rango temperatura: 0-50°C (±2°C precisión)
  - Rango humedad: 20-90% RH (±5% precisión)
  - Interfaz digital de 1 cable
  - Tiempo de respuesta: < 5 segundos
- **Conexión**:
  ```
  DHT11 VCC  → ESP32 3.3V
  DHT11 GND  → ESP32 GND
  DHT11 DATA → ESP32 GPIO4
  ```

### 2.2 Service Layer (Capa de Servicios)

#### Firebase Realtime Database
- **Función**: Base de datos NoSQL en tiempo real
- **Características**:
  - Sincronización en tiempo real
  - Datos en formato JSON
  - Offline persistence
  - Escalabilidad automática
- **Estructura de Datos**:
  ```json
  {
    "sensors": {
      "current": {
        "temperature": 22.5,
        "humidity": 78.3,
        "timestamp": 1234567890
      },
      "history": {
        "1234567890": {
          "temperature": 22.5,
          "humidity": 78.3,
          "timestamp": 1234567890
        }
      }
    },
    "irrigation": {
      "schedule": {
        "-ABC123": {
          "time": "08:00",
          "days": [1, 3, 5],
          "id": 1234567890
        }
      }
    },
    "alerts": {
      "1234567890": {
        "type": "temperature_high",
        "message": "Temperatura alta: 26°C",
        "temperature": 26,
        "humidity": 75,
        "timestamp": 1234567890
      }
    },
    "config": {
      "dataFrequency": 60
    }
  }
  ```

#### Firebase Authentication
- **Función**: Gestión de usuarios y autenticación
- **Método**: Email/Password
- **Seguridad**: Tokens JWT

### 2.3 Presentation Layer (Capa de Presentación)

#### Aplicación Web
- **Tecnologías**:
  - HTML5 (estructura)
  - CSS3 (estilos y responsive)
  - JavaScript ES6+ (lógica)
  - Chart.js (visualización)
  - Firebase SDK (conexión)
  
- **Componentes Principales**:
  1. **Dashboard de Tiempo Real**
     - Tarjetas de temperatura y humedad
     - Indicadores de estado
     - Última actualización
     
  2. **Gráficos Históricos**
     - Gráfico de líneas de temperatura
     - Gráfico de líneas de humedad
     - Selector de rango temporal
     
  3. **Calendario de Riego**
     - Formulario de configuración
     - Lista de horarios programados
     - Gestión de recordatorios
     
  4. **Sistema de Alertas**
     - Visualización de alertas activas
     - Historial de alertas
     - Notificaciones push

## 3. FLUJO DE DATOS

### 3.1 Flujo de Lectura de Sensores

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  DHT11   │─────▶│  ESP32   │────▶│ Firebase │────▶│   Web    │
│  Sensor  │      │          │      │          │      │   App    │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
    │                  │                  │                  │
    │ 1. Lectura       │                  │                  │
    │ cada minuto      │                  │                  │
    │                  │                  │                  │
    │                  │ 2. Procesa y     │                  │
    │                  │    valida        │                  │
    │                  │                  │                  │
    │                  │ 3. Envía vía     │                  │
    │                  │    WiFi/HTTPS    │                  │
    │                  │                  │                  │
    │                  │                  │ 4. Almacena en   │
    │                  │                  │    current y     │
    │                  │                  │    history       │
    │                  │                  │                  │
    │                  │                  │ 5. Sincroniza    │
    │                  │                  │    WebSocket     │
    │                  │                  │                  │
    │                  │                  │                  │ 6. Actualiza
    │                  │                  │                  │    UI
```

### 3.2 Flujo de Alertas

```
ESP32 lee datos → Verifica rangos óptimos → ¿Fuera de rango?
                                                    │
                                           ┌────────┴────────┐
                                           │                 │
                                          Sí                No
                                           │                 │
                                           ▼                 ▼
                            Crea alerta en Firebase    Sin acción
                                           │
                                           ▼
                            Web recibe alerta vía WebSocket
                                           │
                                           ▼
                            Muestra notificación al usuario
```

### 3.3 Flujo de Calendario de Riego

```
Usuario configura horario → Guarda en Firebase → ESP32/Web verifica hora
                                                         │
                                                         ▼
                                              ¿Es hora programada?
                                                         │
                                                ┌────────┴────────┐
                                                │                 │
                                               Sí                No
                                                │                 │
                                                ▼                 ▼
                                    Envía notificación      Continúa
                                                              esperando
```

## 4. PATRONES DE DISEÑO UTILIZADOS

### 4.1 Observer Pattern (Patrón Observador)
- **Uso**: Firebase Realtime Database
- **Implementación**: `.on('value', callback)`
- **Beneficio**: Actualización automática cuando cambian los datos

### 4.2 Singleton Pattern
- **Uso**: Instancia de Firebase
- **Implementación**: `firebase.initializeApp(config)`
- **Beneficio**: Una sola conexión compartida

### 4.3 Model-View-Controller (MVC)
- **Model**: Estructura de datos en Firebase
- **View**: HTML + CSS (interfaz de usuario)
- **Controller**: JavaScript (app.js - lógica de negocio)

## 5. SEGURIDAD

### 5.1 Reglas de Seguridad Firebase

```json
{
  "rules": {
    "sensors": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "irrigation": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "config": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "alerts": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 5.2 Autenticación ESP32
- Credenciales almacenadas en el código
- Comunicación HTTPS
- Tokens de autenticación automáticos

### 5.3 Seguridad Web
- Firebase Authentication
- Tokens de sesión
- Reglas de acceso por usuario

## 6. ESCALABILIDAD

### 6.1 Horizontal
- **Múltiples ESP32**: Cada uno con ID único
- **Estructura de datos por dispositivo**:
  ```json
  {
    "devices": {
      "device_001": {
        "current": {...},
        "history": {...}
      },
      "device_002": {
        "current": {...},
        "history": {...}
      }
    }
  }
  ```

### 6.2 Vertical
- Firebase escala automáticamente
- Límites según plan (Spark/Blaze)
- Optimización de consultas con índices

## 7. RENDIMIENTO

### 7.1 Optimizaciones Implementadas
- ✅ Actualización por intervalos configurables
- ✅ Caché local en navegador
- ✅ Consultas limitadas por rango temporal
- ✅ Gráficos con canvas (Chart.js)
- ✅ Lazy loading de datos históricos

### 7.2 Métricas Esperadas
- **Latencia de actualización**: < 5 segundos
- **Tamaño de payload**: ~200 bytes por registro
- **Consumo de datos**: ~1 MB por día (frecuencia 1 hora)
- **Tiempo de carga inicial**: < 3 segundos

## 8. MANTENIBILIDAD

### 8.1 Código Modular
- **Separación de responsabilidades**:
  - `firebase-config.js`: Configuración
  - `app.js`: Lógica de negocio
  - `styles.css`: Presentación
  - `esp32_code.ino`: Hardware

### 8.2 Documentación
- Comentarios en código
- README completo
- Guía de pruebas
- Diagramas de arquitectura

### 8.3 Versionamiento
- Git para control de versiones
- Branches para desarrollo/producción
- Tags para releases

## 9. TECNOLOGÍAS DE INDUSTRIA 4.0

### 9.1 IoT (Internet of Things)
- ✅ Dispositivos conectados (ESP32)
- ✅ Comunicación M2M (Machine-to-Machine)
- ✅ Sensores inteligentes

### 9.2 Cloud Computing
- ✅ Firebase (Backend as a Service)
- ✅ Almacenamiento en la nube
- ✅ Procesamiento distribuido

### 9.3 Big Data (escalable a)
- ✅ Recopilación continua de datos
- ✅ Análisis de tendencias
- ✅ Exportación para análisis avanzado

### 9.4 Conectividad
- ✅ WiFi
- ✅ HTTPS/WebSocket
- ✅ API RESTful (Firebase)

## 10. DIAGRAMA DE COMPONENTES

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente Web                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  index.html│  │ styles.css │  │   app.js   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                              │
│                  ┌───────▼────────┐                     │
│                  │ firebase-config│                     │
│                  │      .js       │                     │
│                  └───────┬────────┘                     │
└──────────────────────────┼──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Firebase  │
                    │   Platform  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
  │ Realtime  │    │Authentication│   │  Firestore  │
  │ Database  │    │              │   │  (Optional) │
  └───────────┘    └──────────────┘   └─────────────┘
        ▲
        │ WiFi/HTTPS
        │
  ┌─────┴─────┐
  │   ESP32   │
  │ + DHT11   │
  └───────────┘
```

## 11. CONCLUSIÓN

Esta arquitectura combina:
- **Hardware asequible**: ESP32 + DHT11
- **Cloud robusto**: Firebase
- **Frontend moderno**: Web responsiva
- **Comunicación eficiente**: WiFi + HTTPS
- **Escalabilidad**: Múltiples dispositivos
- **Mantenibilidad**: Código modular

El sistema es viable técnicamente, escalable y alineado con principios de Industria 4.0.
