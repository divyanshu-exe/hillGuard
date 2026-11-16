# HillGuard REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Tana Tara",
    "email": "tana@example.com",
    "password": "Password@123",
    "phone": "+91 94022 54321"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile (role: `traveller`).

### Login User
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "official@hillguard.in",
    "password": "Official@123"
  }
  ```
- **Response**: `200 OK` with JWT token and user object.

### Current User Profile
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Access**: Bearer Token required

---

## 2. Telemetry Ingestion (Unified Hardware & Simulator)

### Ingest Telemetry
- **Method**: `POST`
- **Endpoint**: `/telemetry`
- **Access**: Device Token header (`x-device-token`) or JWT
- **Body**:
  ```json
  {
    "nodeId": "HG_NODE_01",
    "source": "HARDWARE",
    "timestamp": "2026-11-16T10:00:00Z",
    "sensors": {
      "soilMoisture": 78,
      "tiltAngle": 12.5,
      "vibration": 0.42,
      "rainIntensity": 85
    },
    "battery": { "percentage": 88 },
    "location": { "latitude": 27.0844, "longitude": 93.6053 }
  }
  ```
- **Response**: `201 Created` with calculated risk index and alert evaluation.

### Get Node Telemetry History
- **Method**: `GET`
- **Endpoint**: `/telemetry/:nodeId/history?limit=40`
- **Access**: Public

---

## 3. Roads & Highway Management

### List Monitored Roads
- **Method**: `GET`
- **Endpoint**: `/roads?district=West%20Kameng&riskStatus=YELLOW`
- **Access**: Public

### Update Official Road Status
- **Method**: `PATCH`
- **Endpoint**: `/roads/:id/status`
- **Access**: Official / Admin JWT
- **Body**:
  ```json
  {
    "passability": "BLOCKED",
    "isBlockageConfirmed": true,
    "officialRemarks": "Rockfall clearing underway at Sela Pass Km 48."
  }
  ```

---

## 4. Citizen Incident Reporting

### Submit Incident Report
- **Method**: `POST`
- **Endpoint**: `/reports`
- **Access**: Public (Optional Auth)
- **Body**: Multipart form data with file or JSON with `imageBase64`
  ```json
  {
    "roadName": "NH-13 Sela Pass Highway",
    "incidentType": "Landslide",
    "description": "Massive boulder and mudslide across both lanes.",
    "latitude": 27.5255,
    "longitude": 92.0512,
    "accuracy": 8,
    "imageBase64": "data:image/jpeg;base64,...",
    "capturedViaLiveCamera": true
  }
  ```

### Verify / Reject Incident
- **Method**: `PATCH`
- **Endpoint**: `/reports/:id/verify`
- **Access**: Official / Admin JWT
- **Body**:
  ```json
  {
    "status": "VERIFIED",
    "officialRemarks": "Confirmed by Sector Patrol 42 BRTF.",
    "updateRoadStatus": true,
    "roadPassability": "BLOCKED"
  }
  ```

---

## 5. Hardware Simulator Endpoints

- `GET /simulator/state`: Return current simulation state & slider values
- `POST /simulator/start`: Start 5s automated telemetry loop
- `POST /simulator/stop`: Stop automated telemetry loop
- `POST /simulator/telemetry`: Send manual slider reading immediately
- `POST /simulator/scenario`: Trigger scenario (`SAFE_RESET`, `HEAVY_RAIN`, `SOIL_SATURATION`, `SLOPE_MOVEMENT`, `CRITICAL_SCENARIO`, `NETWORK_FAILURE`)
