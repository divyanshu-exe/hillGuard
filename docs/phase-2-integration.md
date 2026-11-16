# Phase 2 Hardware Integration Guide

## 1. Zero-Backend Modification Guarantee

HillGuard was purposefully engineered in Phase 1 so that physical ESP32 microcontrollers can replace the Hardware Simulator without modifying backend schemas, authentication middleware, or frontend visualization dashboards.

---

## 2. Telemetry Ingestion Contract

The physical hardware must send an HTTP POST request to:

```
POST /api/telemetry
Host: <your-server-domain-or-ip>:5000
Content-Type: application/json
x-device-token: hg_esp32_device_secret_auth_2026
```

### JSON Payload:
```json
{
  "nodeId": "HG_NODE_01",
  "source": "HARDWARE",
  "timestamp": "2026-11-16T14:30:00Z",
  "sensors": {
    "soilMoisture": 78.5,
    "tiltAngle": 14.2,
    "vibration": 0.45,
    "rainIntensity": 85.0
  },
  "battery": {
    "percentage": 92,
    "voltage": 4.12
  },
  "location": {
    "latitude": 27.0844,
    "longitude": 93.6053
  }
}
```

---

## 3. Hardware Deployment Checklist

1. **Firmware Upload**:
   - Open `hardware/esp32_firmware/hillguard_esp32_node.ino` in Arduino IDE or PlatformIO.
   - Install dependencies: `WiFi`, `HTTPClient`, `Wire`.
   - Update `WIFI_SSID` and `SERVER_HOST` in `config.h`.
   - Flash to ESP32 board.
2. **Mounting on Highway Slope**:
   - Install solar panel facing south with 30° tilt angle for Arunachal latitude.
   - Insert Capacitive Soil Moisture probe 30cm deep into embankment sub-soil.
   - Anchor MPU-6050 enclosure firmly to rock face or steel pylon.
3. **Database Verification**:
   - Once powered on, the node status changes from `OFFLINE` to `ONLINE` on the Official Dashboard.
   - Historical readings populate Recharts automatically.
