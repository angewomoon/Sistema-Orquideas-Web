# DOCUMENTO DE PRUEBAS - Sistema de Monitoreo de Orquídeas

## Información del Proyecto
- **Proyecto**: Sistema de Monitoreo de Orquídeas - Industria 4.0
- **Curso**: Integración de Competencias II
- **Fecha**: 2024
- **Versión**: 1.0

---

## 1. PLAN DE PRUEBAS

### 1.1 Objetivo
Verificar que todos los requerimientos funcionales del sistema se cumplan correctamente y que la integración entre hardware (ESP32), software (aplicación web) y base de datos (Firebase) funcione de manera eficiente.

### 1.2 Alcance
- Pruebas funcionales de todos los requerimientos (RF1-RF7)
- Pruebas de integración entre componentes
- Pruebas de rendimiento del sistema
- Pruebas de usabilidad de la interfaz web

### 1.3 Criterios de Aceptación
- ✅ Todos los requerimientos funcionales cumplidos
- ✅ Sistema funciona de forma continua sin errores
- ✅ Datos se actualizan en tiempo real (< 5 segundos)
- ✅ Interfaz responsive funciona en diferentes dispositivos
- ✅ Alertas se generan correctamente

---

## 2. CASOS DE PRUEBA DETALLADOS

### PRUEBA RF1: Establecer Calendario de Riego

**ID**: TC-RF1-001  
**Prioridad**: Alta  
**Tipo**: Funcional

**Objetivo**: Verificar que el usuario pueda establecer un calendario de riego

**Precondiciones**:
- Aplicación web cargada correctamente
- Firebase conectado

**Pasos**:
1. Acceder a la sección "Calendario de Riego"
2. Seleccionar días: Lunes, Miércoles, Viernes
3. Establecer hora: 08:00
4. Hacer clic en "Guardar Configuración"
5. Verificar mensaje de confirmación

**Datos de Entrada**:
- Días: [1, 3, 5]
- Hora: 08:00

**Resultado Esperado**:
- ✅ Mensaje "Horario de riego guardado correctamente"
- ✅ Horario aparece en la lista "Próximos Riegos"
- ✅ Datos guardados en Firebase (path: irrigation/schedule)

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF2: Notificar Hora de Riego

**ID**: TC-RF2-001  
**Prioridad**: Alta  
**Tipo**: Funcional

**Objetivo**: Verificar que el sistema notifique al usuario cuando es hora de regar

**Precondiciones**:
- Calendario de riego configurado
- Permisos de notificaciones habilitados
- Aplicación web abierta

**Pasos**:
1. Configurar horario de riego para 2 minutos en el futuro
2. Mantener aplicación abierta
3. Esperar a que llegue la hora programada
4. Verificar notificación del navegador

**Datos de Entrada**:
- Día: Día actual
- Hora: Hora actual + 2 minutos

**Resultado Esperado**:
- ✅ Notificación del navegador aparece
- ✅ Título: "Hora de Riego"
- ✅ Mensaje: "Es momento de regar las orquídeas"

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF3: Integración de Sensores de Humedad

**ID**: TC-RF3-001  
**Prioridad**: Crítica  
**Tipo**: Integración

**Objetivo**: Verificar la correcta integración del ESP32 con Firebase vía WiFi

**Precondiciones**:
- ESP32 programado con código correcto
- Sensor DHT11 conectado correctamente
- Red WiFi disponible
- Credenciales correctas en el código

**Pasos**:
1. Conectar ESP32 a la fuente de alimentación
2. Abrir Serial Monitor (115200 baud)
3. Verificar mensajes de conexión WiFi
4. Verificar mensaje "Firebase conectado exitosamente"
5. Observar envío de datos

**Datos de Entrada**:
- SSID de red WiFi
- Password de WiFi
- Credenciales de Firebase

**Resultado Esperado**:
- ✅ "Conectando a WiFi..."
- ✅ "Conectado con IP: xxx.xxx.xxx.xxx"
- ✅ "Firebase conectado exitosamente"
- ✅ "Datos en tiempo real actualizados"
- ✅ Estado del sensor en web: "Online"

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF4: Monitorear Nivel de Humedad

**ID**: TC-RF4-001  
**Prioridad**: Crítica  
**Tipo**: Funcional

**Objetivo**: Verificar que los sensores monitoreen y envíen datos correctamente

**Precondiciones**:
- ESP32 conectado a Firebase
- Sensor DHT11 funcionando
- Dashboard web abierto

**Pasos**:
1. Observar lecturas en Serial Monitor
2. Verificar que temperatura y humedad tienen valores razonables
3. Observar actualización en dashboard web
4. Modificar condiciones (soplar el sensor)
5. Verificar cambios en los valores

**Datos de Entrada**:
- Lecturas del sensor DHT11

**Resultado Esperado**:
- ✅ Temperatura: 15-35°C (valores razonables)
- ✅ Humedad: 30-90% (valores razonables)
- ✅ Dashboard se actualiza en < 5 segundos
- ✅ Valores coinciden con Serial Monitor

**Resultado Obtenido**: 
- Temperatura: _____ °C
- Humedad: _____ %
- Tiempo de actualización: _____ segundos

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF5: Registro Histórico de Condiciones Ambientales

**ID**: TC-RF5-001  
**Prioridad**: Alta  
**Tipo**: Funcional

**Objetivo**: Verificar que el sistema mantiene un registro histórico

**Precondiciones**:
- Sistema funcionando al menos 3 horas
- Frecuencia configurada en 1 hora

**Pasos**:
1. Acceder a sección "Datos Históricos"
2. Seleccionar rango: "Últimas 24 horas"
3. Verificar que hay al menos 3 puntos de datos
4. Verificar gráfico de temperatura
5. Verificar gráfico de humedad
6. Cambiar a rango "Últimas 48 horas"
7. Hacer clic en "Exportar Datos"

**Datos de Entrada**:
- N/A (datos históricos automáticos)

**Resultado Esperado**:
- ✅ Gráficos se muestran correctamente
- ✅ Al menos 3 registros históricos visibles
- ✅ Archivo CSV se descarga
- ✅ CSV contiene: Fecha, Hora, Temperatura, Humedad

**Resultado Obtenido**: 
- Registros históricos: _____
- CSV descargado: ☐ Sí  ☐ No

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF6: Crear Base de Datos

**ID**: TC-RF6-001  
**Prioridad**: Crítica  
**Tipo**: Integración

**Objetivo**: Verificar que la base de datos almacena correctamente los datos

**Precondiciones**:
- Firebase configurado
- ESP32 enviando datos

**Pasos**:
1. Acceder a Firebase Console
2. Ir a Realtime Database
3. Verificar estructura: sensors/current
4. Verificar estructura: sensors/history
5. Verificar estructura: irrigation/schedule
6. Verificar estructura: alerts
7. Verificar estructura: config

**Datos de Entrada**:
- N/A

**Resultado Esperado**:
- ✅ Todas las estructuras existen
- ✅ sensors/current tiene datos recientes
- ✅ sensors/history tiene múltiples registros
- ✅ Timestamps son correctos

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

### PRUEBA RF7: Visualización de Datos en Tiempo Real

**ID**: TC-RF7-001  
**Prioridad**: Alta  
**Tipo**: Funcional

**Objetivo**: Verificar visualización en tiempo real en el dashboard

**Precondiciones**:
- Sistema completo funcionando
- ESP32 enviando datos

**Pasos**:
1. Abrir dashboard web
2. Verificar valores de temperatura y humedad
3. Verificar badges de estado (óptimo/advertencia/peligro)
4. Modificar condiciones (cubrir sensor, soplarlo)
5. Observar actualización en dashboard
6. Verificar cambio de color de badges

**Datos de Entrada**:
- Cambios físicos en el ambiente del sensor

**Resultado Esperado**:
- ✅ Valores numéricos se actualizan
- ✅ Badges cambian de estado correctamente
- ✅ Última actualización muestra hora correcta
- ✅ Estado de conexión: "Conectado" (verde)

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

**Observaciones**: ___________________________________________

---

## 3. PRUEBAS DE INTEGRACIÓN

### INTEGRACIÓN COMPLETA: ESP32 → Firebase → Web

**ID**: TC-INT-001  
**Prioridad**: Crítica

**Pasos**:
1. Encender ESP32
2. Verificar conexión WiFi (Serial Monitor)
3. Verificar envío a Firebase (Serial Monitor)
4. Abrir dashboard web
5. Verificar datos en tiempo real
6. Esperar siguiente actualización automática
7. Verificar que datos se actualizan

**Resultado Esperado**:
- ✅ Flujo de datos completo sin interrupciones
- ✅ Latencia < 5 segundos
- ✅ No hay errores en consola del navegador
- ✅ No hay errores en Serial Monitor

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

---

### SISTEMA DE ALERTAS COMPLETO

**ID**: TC-INT-002  
**Prioridad**: Alta

**Escenarios de Prueba**:

#### Escenario 1: Temperatura Baja
- Temperatura: 16°C
- Resultado esperado: Alerta "Temperatura Crítica Baja"

#### Escenario 2: Temperatura Alta
- Temperatura: 26°C
- Resultado esperado: Alerta "Temperatura Crítica Alta"

#### Escenario 3: Humedad Baja
- Humedad: 65%
- Resultado esperado: Alerta "Humedad Baja"

#### Escenario 4: Humedad Alta
- Humedad: 92%
- Resultado esperado: Alerta "Humedad Alta"

#### Escenario 5: Condiciones Óptimas
- Temperatura: 21°C
- Humedad: 80%
- Resultado esperado: No hay alertas / Badge "Óptimo"

**Resultado Obtenido**: _____________

**Estado**: ☐ Aprobado  ☐ Fallido  ☐ Pendiente

---

## 4. PRUEBAS DE RENDIMIENTO

### CARGA DE DATOS HISTÓRICOS

**Objetivo**: Verificar rendimiento con gran cantidad de datos

**Prueba**:
1. Dejar sistema funcionando 48 horas
2. Acumular > 100 registros históricos
3. Cargar dashboard
4. Medir tiempo de carga de gráficos

**Métricas**:
- Tiempo de carga: _____ segundos
- Registros cargados: _____
- Memoria usada: _____ MB

**Criterio de Aceptación**: < 3 segundos

---

### MÚLTIPLES USUARIOS SIMULTÁNEOS

**Objetivo**: Verificar que múltiples usuarios pueden acceder simultáneamente

**Prueba**:
1. Abrir 5 pestañas del navegador
2. Cargar dashboard en cada una
3. Verificar que todos reciben datos
4. Modificar configuración en una pestaña
5. Verificar actualización en otras pestañas

**Resultado Esperado**:
- ✅ Todas las pestañas funcionan correctamente
- ✅ Datos se sincronizan entre pestañas

---

## 5. PRUEBAS DE USABILIDAD

### NAVEGACIÓN Y DISEÑO RESPONSIVE

**Dispositivos de Prueba**:
- ☐ PC (1920x1080)
- ☐ Tablet (768x1024)
- ☐ Móvil (375x667)

**Aspectos a Verificar**:
- ☐ Layout se adapta correctamente
- ☐ Todos los botones son clickables
- ☐ Textos son legibles
- ☐ Gráficos se muestran correctamente
- ☐ Formularios funcionan en todos los tamaños

---

## 6. PRUEBAS DE RECUPERACIÓN

### PÉRDIDA DE CONEXIÓN WIFI

**Prueba**:
1. Sistema funcionando normalmente
2. Desconectar WiFi del ESP32
3. Esperar 2 minutos
4. Reconectar WiFi
5. Verificar que sistema se recupera automáticamente

**Resultado Esperado**:
- ✅ ESP32 reintenta conexión automáticamente
- ✅ Datos se sincronizan al reconectar

---

### PÉRDIDA DE CONEXIÓN A FIREBASE

**Prueba**:
1. Deshabilitar temporalmente reglas de Firebase
2. Observar comportamiento del sistema
3. Restaurar reglas
4. Verificar recuperación

**Resultado Esperado**:
- ✅ Dashboard muestra mensaje de error
- ✅ Sistema se recupera al restaurar conexión

---

## 7. MATRIZ DE TRAZABILIDAD

| Requerimiento | Caso de Prueba | Estado | Prioridad |
|---------------|----------------|--------|-----------|
| RF1 | TC-RF1-001 | ☐ | Alta |
| RF2 | TC-RF2-001 | ☐ | Alta |
| RF3 | TC-RF3-001 | ☐ | Crítica |
| RF4 | TC-RF4-001 | ☐ | Crítica |
| RF5 | TC-RF5-001 | ☐ | Alta |
| RF6 | TC-RF6-001 | ☐ | Crítica |
| RF7 | TC-RF7-001 | ☐ | Alta |

---

## 8. REPORTE DE DEFECTOS

| ID | Descripción | Severidad | Estado | Responsable |
|----|-------------|-----------|--------|-------------|
| | | | | |

**Niveles de Severidad**:
- Crítico: Sistema no funciona
- Alto: Funcionalidad principal afectada
- Medio: Funcionalidad secundaria afectada
- Bajo: Problema cosmético

---

## 9. CONCLUSIONES

### Resumen de Pruebas

**Total de Casos de Prueba**: 10  
**Casos Aprobados**: _____  
**Casos Fallidos**: _____  
**Casos Pendientes**: _____  

**Porcentaje de Éxito**: _____% 

### Observaciones Generales

________________________________________________________________

________________________________________________________________

________________________________________________________________

### Recomendaciones

________________________________________________________________

________________________________________________________________

________________________________________________________________

### Firma y Aprobación

**Probador**: ____________________  Fecha: __________

**Revisor**: ____________________  Fecha: __________

**Aprobado**: ☐ Sí  ☐ No  ☐ Con Observaciones
