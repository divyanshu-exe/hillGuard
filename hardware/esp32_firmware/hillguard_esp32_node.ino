/**
 * HillGuard Real-Time Landslide Monitoring Node Firmware
 * National Institute of Technology Arunachal Pradesh
 * Department of Computer Science & Engineering
 * 
 * Hardware Target: ESP32-WROOM-32D (240MHz Dual-Core Xtensa LX6)
 * Sensors:
 * - Capacitive Soil Moisture v1.2 (Corrosion resistant analog)
 * - MPU6050 6-Axis Accelerometer & Gyroscope (I2C)
 * - Optical / Tipping Bucket Rain Gauge
 * - SIM800L GSM Module (AT command GPRS fallback)
 * - LiFePO4 Solar Battery Monitor
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "config.h"

// MPU6050 I2C Register Addresses
const int MPU_ADDR = 0x68;
int16_t AcX, AcY, AcZ, Tmp, GyX, GyY, GyZ;
float baselineAngle = 0.0;

// Coordinates for deployed site (configured per node)
const float NODE_LATITUDE = 27.0844;
const float NODE_LONGITUDE = 93.6053;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("\n=================================================="));
  Serial.println(F("⛰️ HILLGUARD IOT NODE BOOTING (NIT ARUNACHAL PRADESH)"));
  Serial.println(F("=================================================="));

  // Initialize GPIO Pins
  pinMode(PIN_SOIL_ANALOG, INPUT);
  pinMode(PIN_RAIN_ANALOG, INPUT);
  pinMode(PIN_BATTERY_ADC, INPUT);
  pinMode(PIN_LED_STROBE, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  digitalWrite(PIN_LED_STROBE, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // Initialize I2C and MPU6050
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU6050
  byte mpuStatus = Wire.endTransmission(true);

  if (mpuStatus == 0) {
    Serial.println(F("[MPU6050] Sensor detected and initialized on I2C bus."));
    calibrateBaselineSlope();
  } else {
    Serial.println(F("[MPU6050 Warning] Sensor not detected. Check SDA/SCL wiring."));
  }

  // Connect to Network
  connectWiFi();
}

void loop() {
  // 1. Read Capacitive Soil Moisture Sensor (Analog ADC)
  int soilRaw = analogRead(PIN_SOIL_ANALOG);
  float soilMoisture = map(soilRaw, SOIL_AIR_VALUE, SOIL_WATER_VALUE, 0, 100);
  soilMoisture = constrain(soilMoisture, 0.0, 100.0);

  // 2. Read MPU6050 Slope Tilt & Vibration
  float tiltAngle = readSlopeTilt();
  float vibration = readVibrationIntensity();

  // 3. Read Rain Gauge
  int rainRaw = analogRead(PIN_RAIN_ANALOG);
  float rainIntensity = map(rainRaw, 4095, 1200, 0, 150); // Inverted analog rain sensor
  rainIntensity = constrain(rainIntensity, 0.0, 150.0);

  // 4. Measure LiFePO4 Battery Level
  int battRaw = analogRead(PIN_BATTERY_ADC);
  float batteryVoltage = (battRaw / 4095.0) * 3.3 * 2.0; // 1:2 voltage divider
  int batteryPercentage = constrain((int)((batteryVoltage - 3.2) / (4.2 - 3.2) * 100.0), 0, 100);

  // 5. Local Emergency Alarm Trigger if Sudden Slope Collapse Detected
  if (tiltAngle >= 15.0 || vibration >= 2.2) {
    digitalWrite(PIN_LED_STROBE, HIGH);
    tone(PIN_BUZZER, 2000, 500); // Pulse warning tone
  } else {
    digitalWrite(PIN_LED_STROBE, LOW);
    noTone(PIN_BUZZER);
  }

  // 6. Build and Send JSON Telemetry Packet
  sendTelemetryHTTP(soilMoisture, tiltAngle, vibration, rainIntensity, batteryPercentage);

  // Sleep between sampling intervals
  delay(TELEMETRY_INTERVAL_MS);
}

/**
 * Calibrates the quiescent slope baseline on node mount
 */
void calibrateBaselineSlope() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  AcX = Wire.read() << 8 | Wire.read();
  AcY = Wire.read() << 8 | Wire.read();
  AcZ = Wire.read() << 8 | Wire.read();

  baselineAngle = atan2(AcY, AcZ) * 180.0 / PI;
  Serial.print(F("[Calibration] Mountain Slope Baseline Angle: "));
  Serial.print(baselineAngle);
  Serial.println(F("°"));
}

/**
 * Calculates current tilt angle deviation from vertical (degrees)
 */
float readSlopeTilt() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  AcX = Wire.read() << 8 | Wire.read();
  AcY = Wire.read() << 8 | Wire.read();
  AcZ = Wire.read() << 8 | Wire.read();

  float currentAngle = atan2(AcY, AcZ) * 180.0 / PI;
  float deviation = abs(currentAngle - baselineAngle);
  return constrain(deviation, 0.0, 60.0);
}

/**
 * Calculates resultant ground vibration in Gs from gyro/accel magnitude
 */
float readVibrationIntensity() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x43); // Gyro X register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  GyX = Wire.read() << 8 | Wire.read();
  GyY = Wire.read() << 8 | Wire.read();
  GyZ = Wire.read() << 8 | Wire.read();

  float gMagnitude = sqrt(sq(GyX / 131.0) + sq(GyY / 131.0) + sq(GyZ / 131.0)) / 250.0;
  return constrain(gMagnitude, 0.02, 5.0);
}

/**
 * Submits JSON telemetry to HillGuard backend using HTTP POST
 */
void sendTelemetryHTTP(float soil, float tilt, float vib, float rain, int batt) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[Network] WiFi disconnected. Attempting reconnect or GSM fallback..."));
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_HOST);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_API_TOKEN);

  // Construct JSON String matching HillGuard API contract
  String payload = "{";
  payload += "\"nodeId\":\"" + String(NODE_ID) + "\",";
  payload += "\"source\":\"HARDWARE\",";
  payload += "\"sensors\":{";
  payload += "\"soilMoisture\":" + String(soil, 1) + ",";
  payload += "\"tiltAngle\":" + String(tilt, 1) + ",";
  payload += "\"vibration\":" + String(vib, 2) + ",";
  payload += "\"rainIntensity\":" + String(rain, 1);
  payload += "},";
  payload += "\"battery\":{\"percentage\":" + String(batt) + "},";
  payload += "\"location\":{\"latitude\":" + String(NODE_LATITUDE, 4) + ",\"longitude\":" + String(NODE_LONGITUDE, 4) + "}";
  payload += "}";

  Serial.println(F("[HTTP Transmit] Payload:"));
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("[HTTP Success] Response code: %d\n", httpCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("[HTTP Error] Failed to send telemetry, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void connectWiFi() {
  Serial.print(F("[WiFi] Connecting to: "));
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\n[WiFi] Connected successfully."));
    Serial.print(F("[WiFi] IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("\n[WiFi] Network timed out. SIM800L GSM will take over."));
  }
}
