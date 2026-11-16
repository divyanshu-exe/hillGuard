/**
 * HillGuard ESP32 Field Node - Configuration Header
 * National Institute of Technology Arunachal Pradesh
 * Department of Computer Science & Engineering
 * Project Guide: Dr. Koj Sambyo
 */

#ifndef HILLGUARD_CONFIG_H
#define HILLGUARD_CONFIG_H

// Node Identity Configuration
#define NODE_ID "HG_NODE_01"
#define HARDWARE_SOURCE "HARDWARE"
#define FIRMWARE_VERSION "v2.1-arunachal-field"

// Device Authentication Key (Must match backend DEVICE_API_KEY_SECRET)
#define DEVICE_API_TOKEN "hg_esp32_device_secret_auth_2026"

// HillGuard Ingestion Endpoint (Cloud Server or Local Gateway)
#define SERVER_HOST "http://hillguard.in/api/telemetry"
#define SERVER_PORT 5000

// Wi-Fi Credentials (Primary Mountain Repeater or Station)
#define WIFI_SSID "APDMA_HIGHWAY_MESH"
#define WIFI_PASSWORD "HimalayaSafe2026"

// GSM SIM800L APN Configuration (Secondary Cellular Fallback)
#define GSM_APN "airtelgprs.com"
#define GSM_USER ""
#define GSM_PASS ""

// Pin Assignments on ESP32-WROOM-32D
#define PIN_SOIL_ANALOG       34  // ADC1_CH6 (Capacitive v1.2)
#define PIN_I2C_SDA           21  // MPU6050 SDA
#define PIN_I2C_SCL           22  // MPU6050 SCL
#define PIN_RAIN_ANALOG       35  // ADC1_CH7 (Optical Rain Gauge)
#define PIN_SIM800_RX         16  // Hardware Serial2 RX
#define PIN_SIM800_TX         17  // Hardware Serial2 TX
#define PIN_BATTERY_ADC       36  // Voltage divider (LiFePO4 cell monitor)
#define PIN_LED_STROBE        4   // High-intensity warning strobe
#define PIN_BUZZER            5   // Piezo alarm horn

// Geotechnical Sampling Intervals
#define TELEMETRY_INTERVAL_MS 10000 // 10 seconds normal cycle
#define EMERGENCY_INTERVAL_MS 2000  // 2 seconds during active rockfall

// Calibration Constants (Soil Moisture: dry air value vs distilled water)
#define SOIL_AIR_VALUE        3200  // ADC reading in completely dry air
#define SOIL_WATER_VALUE      1400  // ADC reading saturated in water

#endif // HILLGUARD_CONFIG_H
