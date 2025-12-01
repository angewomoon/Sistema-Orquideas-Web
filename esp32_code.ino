#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Configuración WiFi
#define WIFI_SSID "Polipoket"
#define WIFI_PASSWORD "1222250410"

// Configuración Firebase
#define API_KEY "1:692829732322:web:dbfdd1afbec734a6b7cdbb"
#define DATABASE_URL "https://orquideas-monitor-default-rtdb.firebaseio.com"
#define USER_EMAIL "test@orquideas.com"
#define USER_PASSWORD "A123456"

// Configuración del sensor DHT11
#define DHTPIN 4          // Pin donde está conectado el DHT11
#define DHTTYPE DHT11     // Tipo de sensor
DHT dht(DHTPIN, DHTTYPE);

// Objetos Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variables de tiempo
unsigned long sendDataPrevMillis = 0;
unsigned long dataFrequency = 60000; // Frecuencia de envío en milisegundos (1 minuto por defecto)

// Variables de datos
float temperature = 0;
float humidity = 0;
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  
  // Inicializar sensor DHT
  dht.begin();
  Serial.println("Sensor DHT11 inicializado");
  
  // Conectar a WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Conectado con IP: ");
  Serial.println(WiFi.localIP());
  
  // Configurar Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Autenticación
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  // Callback de token
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Verificar conexión
  if (Firebase.ready()) {
    Serial.println("Firebase conectado exitosamente");
    signupOK = true;
  } else {
    Serial.printf("Firebase error: %s\n", config.signer.signupError.message.c_str());
  }
  
  // Cargar configuración de frecuencia desde Firebase
  loadConfiguration();
}

void loop() {
  // Verificar si es tiempo de enviar datos
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > dataFrequency || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    // Leer datos del sensor
    readSensorData();
    
    // Enviar datos a Firebase
    if (temperature != NAN && humidity != NAN) {
      sendToFirebase();
    } else {
      Serial.println("Error al leer datos del sensor");
    }
    
    // Verificar configuración actualizada
    checkConfiguration();
  }
  
  delay(100);
}

// Leer datos del sensor DHT11
void readSensorData() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Verificar si las lecturas son válidas
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error al leer del sensor DHT11");
    return;
  }
  
  Serial.println("------ Datos del Sensor ------");
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("Humedad: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.println("------------------------------");
}

// Enviar datos a Firebase
void sendToFirebase() {
  unsigned long timestamp = millis();
  
  // Crear objeto JSON con los datos actuales
  FirebaseJson currentData;
  currentData.set("temperature", temperature);
  currentData.set("humidity", humidity);
  currentData.set("timestamp", timestamp);
  
  // Actualizar datos en tiempo real
  if (Firebase.RTDB.setJSON(&fbdo, "sensors/current", &currentData)) {
    Serial.println("Datos en tiempo real actualizados");
  } else {
    Serial.println("Error al actualizar datos en tiempo real");
    Serial.println(fbdo.errorReason());
  }
  
  // Guardar en historial
  String historyPath = "sensors/history/" + String(timestamp);
  if (Firebase.RTDB.setJSON(&fbdo, historyPath.c_str(), &currentData)) {
    Serial.println("Datos guardados en historial");
  } else {
    Serial.println("Error al guardar en historial");
    Serial.println(fbdo.errorReason());
  }
  
  // Verificar condiciones y enviar alertas si es necesario
  checkConditionsAndAlert();
}

// Verificar condiciones y generar alertas
void checkConditionsAndAlert() {
  bool needsAlert = false;
  String alertMessage = "";
  String alertType = "";
  
  // Verificar temperatura (rango óptimo: 18-24°C)
  if (temperature < 18) {
    needsAlert = true;
    alertType = "temperature_low";
    alertMessage = "Temperatura baja: " + String(temperature) + "°C";
  } else if (temperature > 24) {
    needsAlert = true;
    alertType = "temperature_high";
    alertMessage = "Temperatura alta: " + String(temperature) + "°C";
  }
  
  // Verificar humedad (óptimo: ~80%)
  if (humidity < 70) {
    needsAlert = true;
    alertType = "humidity_low";
    alertMessage = "Humedad baja: " + String(humidity) + "%";
  } else if (humidity > 90) {
    needsAlert = true;
    alertType = "humidity_high";
    alertMessage = "Humedad alta: " + String(humidity) + "%";
  }
  
  // Enviar alerta si es necesario
  if (needsAlert) {
    FirebaseJson alert;
    alert.set("type", alertType);
    alert.set("message", alertMessage);
    alert.set("temperature", temperature);
    alert.set("humidity", humidity);
    alert.set("timestamp", millis());
    
    String alertPath = "alerts/" + String(millis());
    if (Firebase.RTDB.setJSON(&fbdo, alertPath.c_str(), &alert)) {
      Serial.println("Alerta enviada: " + alertMessage);
    }
  }
}

// Cargar configuración desde Firebase
void loadConfiguration() {
  if (Firebase.RTDB.getInt(&fbdo, "config/dataFrequency")) {
    if (fbdo.dataType() == "int") {
      int freq = fbdo.intData();
      dataFrequency = freq * 60 * 1000; // Convertir minutos a milisegundos
      Serial.print("Frecuencia de datos cargada: ");
      Serial.print(freq);
      Serial.println(" minutos");
    }
  } else {
    Serial.println("No se pudo cargar la configuración de frecuencia");
  }
}

// Verificar si la configuración ha cambiado
void checkConfiguration() {
  static unsigned long lastConfigCheck = 0;
  
  // Verificar configuración cada 5 minutos
  if (millis() - lastConfigCheck > 300000) {
    lastConfigCheck = millis();
    loadConfiguration();
  }
}

// Función para limpiar datos antiguos (opcional)
void cleanOldData() {
  // Esta función puede ser llamada periódicamente para limpiar datos históricos
  // que tengan más de X días (implementar según necesidad)
  Serial.println("Limpiando datos antiguos...");
  // Implementación pendiente según política de retención de datos
}
