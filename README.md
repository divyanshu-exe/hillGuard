# HillGuard – Real-Time Landslide Detection & Road-Blockage Alert System

> **"Know the Road Before You Go."**

A full-stack, production-grade IoT disaster monitoring and road safety platform developed for the mountainous highway networks of Arunachal Pradesh.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](#)
[![Academic Level: B.Tech 3rd Year](https://img.shields.io/badge/Academic-B.Tech%203rd%20Year%20Minor%20Project-blue.svg)](#)
[![Institution: NIT Arunachal Pradesh](https://img.shields.io/badge/Institution-NIT%20Arunachal%20Pradesh-green.svg)](#)
[![Phase: Phase 1 Complete](https://img.shields.io/badge/Status-Phase%201%20Software%20Complete%20%7C%20Phase%202%20IoT%20Ready-orange.svg)](#)

---

## 1. Project Identity & Academic Credits

- **Institution**: National Institute of Technology Arunachal Pradesh
- **Department**: Computer Science and Engineering
- **Academic Level**: B.Tech 3rd Year (Minor Project)
- **Project Supervisor & Guide**: **Dr. Koj Sambyo**
- **Project Development Team**:
  1. **Divyanshu Gupta**
  2. **Riya Yadav**
  3. **Jainesh Birla**
  4. **Nabam Rana**
  5. **Ngilyang Nancy**
- **Repository**: [https://github.com/Mohit-Gaur75/hillguard](https://github.com/Mohit-Gaur75/hillguard)

---

## 2. Project Problem Statement & Real-World Relevance

Arunachal Pradesh features rugged Himalayan roads that face sudden landslides, cloudbursts, and unstable shale soil during monsoons (e.g. NH-415 Itanagar–Naharlagun, NH-13 Bhalukpong–Bomdila, Sela Pass Tawang corridor, and Siang River valley).

### Limitations of Existing Information Channels:
1. **Misleading Social Media Rumours**: Unverified WhatsApp forwards cause public panic or lead drivers into active danger zones.
2. **Delayed Official Advisories**: Road clearance alerts often take hours to reach commuters.
3. **Weak Cellular Reception**: Mobile data drops in deep river valleys and high mountain cuts.
4. **Absence of Roadside Environmental Sensing**: Authorities lack granular, real-time telemetry on soil pore pressure and slope creep.
5. **Difficulty Authenticating Citizen Reports**: Fake photos submitted from older incidents.

**HillGuard** provides an end-to-end software platform with real-time IoT telemetry ingestion, automated geotechnical risk calculation, crowdsourced camera/GPS verification, and offline Progressive Web App (PWA) resilience.

---

## 3. Two-Phase Development Strategy

* **PHASE 1 – Complete Software Platform (CURRENT)**:
  * Complete full-stack web application with Traveller & Official dashboards.
  * Interactive Leaflet.js highway map centered on Arunachal Pradesh.
  * Multi-factor Geotechnical Landslide Risk Assessment Engine ($R = 0.35S + 0.30T + 0.25W + 0.10V$).
  * Fully functional **Hardware Simulation Module** generating 5-second realistic telemetry through the unified ingestion pipeline.
  * Citizen reporting modal requiring **live browser camera stream capture** and **automatic GPS coordinate verification** (gallery upload disabled).
  * Progressive Web App (PWA) with Service Worker and IndexedDB offline caching and background synchronization.
* **PHASE 2 – Hardware Integration (FUTURE)**:
  * Physical ESP32-WROOM-32D microcontroller nodes deployed on highway slopes.
  * Capacitive Soil Moisture v1.2, MPU6050 Accelerometer/Gyroscope, Optical Rain Gauge, and SIM800L GSM.
  * **Zero backend or frontend code changes required**: physical hardware submits the exact same JSON format via `POST /api/telemetry` with device token headers.

---

## 4. Key Features

- **Interactive Arunachal Highway Map**: OpenStreetMap Leaflet visualization showing real-time road risk status (Green = Safe, Yellow = Landslide Risk, Red = Critical Risk) and distinct Confirmed Road Blockage markers.
- **Hardware Simulator Control Centre**: Dedicated page with sliders for Soil Moisture, Slope Tilt Angle, Vibration Intensity, Rain Gauge, and Battery level. Features instant scenario triggers (`Heavy Rain`, `Soil Saturation`, `Slope Movement`, `Critical Scenario`, `Network Failure`).
- **Traveller Dashboard**: Route conditions overview, active warnings, weather snapshot, and verified incident feeds.
- **Official & Admin Control Centre**: Metric cards, Recharts timeseries trends, node health diagnostics, road passability directives, and official report verification desk.
- **Citizen Camera & GPS Reporting**: Live stream image capture with MediaDevices API and high-accuracy GPS coordinates tagged to highway sections.
- **PWA Offline Resilience**: Caches last-known highway conditions and alerts into IndexedDB; queues citizen reports created offline and auto-syncs when connectivity returns.
- **Real-Time Telemetry & Alert Broadcasting**: Socket.IO events for live dashboard and map marker updates without manual polling.

---

## 5. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Environmental Intelligence Theme
- **Routing**: React Router DOM v7
- **Maps**: Leaflet.js + React-Leaflet
- **Analytics & Graphs**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Offline Storage**: IndexedDB (`idb`) + Service Workers + PWA Manifest

### Backend
- **Runtime**: Node.js v24 + Express.js
- **Database**: MongoDB v8 + Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JWT + bcryptjs (7-day token persistence)
- **Validation**: Zod schema validation
- **Media Upload**: Multer disk storage + Base64 canvas live camera decoder
- **Security**: Helmet, CORS, Rate Limiting, RBAC Middleware

---

## 6. Pre-Configured Demo Credentials (For Viva & Faculty Evaluation)

The database includes pre-seeded demo accounts with distinct role privileges:

| Role | Email | Password | Department / Description |
|---|---|---|---|
| **Administrator** | `admin@hillguard.in` | `Admin@123` | APDMA Head Office, Itanagar (Full System Rights) |
| **Highway Official** | `official@hillguard.in` | `Official@123` | Border Roads Organisation (BRO) - Project Vartak |
| **Traveller / Citizen** | `traveller@hillguard.in` | `Traveller@123` | Commuter / General Public |

> [!TIP]
> The login page includes 1-click **Quick Login** preset buttons to instantly authenticate as any role during presentations.

---

## 7. Geotechnical Risk Calculation Formula

The HillGuard Risk Assessment Engine executes the following weighted formula:

$$R = (0.35 \times S) + (0.30 \times T) + (0.25 \times W) + (0.10 \times V)$$

Where:
- $S$ = Normalized Soil Moisture Risk (0–100)
- $T$ = Normalized Slope Tilt Risk from MPU6050 (0–100)
- $W$ = Normalized Rainfall Risk from Optical Rain Gauge (0–100)
- $V$ = Normalized Ground Vibration Risk from Gyroscope (0–100)

### Initial Classification Thresholds:
- **0 – 29: GREEN – SAFE**: Normal mountain travel permitted.
- **30 – 69: YELLOW – LANDSLIDE RISK**: Saturated soil and rain; slow convoy speed advised.
- **70 – 100: RED – CRITICAL RISK**: Soil liquefaction or steep angular shear displacement; high probability of mass movement.

### Autonomous Rules:
- **Sudden Slope Leap**: Angular shift $\Delta \ge 5^\circ$ or tilt $\ge 15^\circ$ forces an emergency override ($R \ge 75$).
- **Decoupled Blockage Logic**: Critical risk alerts commuters of slope failure danger, but physical highway closure mandates confirmed evidence (verified citizen photo + BRO official directive).

---

## 8. Installation & Setup Guide

### Prerequisites
- Node.js (v18 or higher; tested on v24.13.0)
- MongoDB (v6, v7, or v8 running on `mongodb://127.0.0.1:27017`)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Mohit-Gaur75/hillguard.git
cd hillguard
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create or verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hillguard
JWT_SECRET=hillguard_super_secret_jwt_key_2026_nit_arunachal
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DEVICE_API_KEY_SECRET=hg_esp32_device_secret_auth_2026
```

Seed the database with Arunachal Pradesh roads, nodes, and demo accounts:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# or: npm start
```

### 3. Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

The web application will launch at:
`http://localhost:5173`

---

## 9. Hardware Simulator Guide (Phase 1)

1. Navigate to `/simulator` (or click **Simulator** in the navbar).
2. Select target node (e.g. `HG_NODE_01` on NH-415 or `HG_NODE_03` on Sela Pass).
3. Click **Start Auto 5s Cycle** to begin periodic realistic brownian telemetry generation.
4. Adjust the sliders (Soil Moisture, Slope Tilt, Vibration, Rainfall) to observe the live Risk Engine score and sub-weight breakdown calculate in real-time.
5. Click **Critical Catastrophe** or **Heavy Rainfall** to trigger immediate emergency alerts and watch the map markers change from Green to Red.

---

## 10. Phase 2 Physical Hardware Integration

The C++ Arduino firmware sketch and complete wiring guides are provided:
- Firmware Sketch: `hardware/esp32_firmware/hillguard_esp32_node.ino`
- Configuration Header: `hardware/esp32_firmware/config.h`
- Wiring Pinout: `hardware/schematics/pin_connections.md`
- LoRa/GSM Fallback Architecture: `hardware/phase-2-documentation/lora-gsm-fallback.md`

### Hardware Telemetry Ingestion Contract:
```http
POST /api/telemetry HTTP/1.1
Host: localhost:5000
Content-Type: application/json
x-device-token: hg_esp32_device_secret_auth_2026

{
  "nodeId": "HG_NODE_01",
  "source": "HARDWARE",
  "timestamp": "2026-11-16T12:00:00Z",
  "sensors": {
    "soilMoisture": 78.5,
    "tiltAngle": 14.2,
    "vibration": 0.45,
    "rainIntensity": 85.0
  },
  "battery": { "percentage": 92 },
  "location": { "latitude": 27.0844, "longitude": 93.6053 }
}
```

---

## 11. Automated Testing

Run the backend unit and integration test suite:
```bash
cd backend
npm test
```

### Test Coverage Includes:
- Mathematical formula verification ($R = 0.35S + 0.30T + 0.25W + 0.10V$)
- Normalization bounds (0–100)
- Sudden slope leap detection ($\Delta \text{tilt} \ge 5^\circ$)
- Hardware simulator state and scenario transitions

---

## 12. Verification & Viva Presentation Checklist

- [x] Functional landing page with dynamic statistics and live telemetry indicator.
- [x] Interactive Leaflet.js map with Green/Yellow/Red risk colors and blockage icons.
- [x] Full authentication with pre-seeded demo accounts (Traveller, Official, Admin).
- [x] Hardware Simulation Control Centre with sliders, automated 5s cycle, and presets.
- [x] Citizen reporting with browser live camera stream capture and GPS metadata.
- [x] Official verification workflow with image inspection and audit logging.
- [x] Progressive Web App (PWA) with Service Worker and IndexedDB offline queueing.
- [x] Recharts analytics for soil moisture, tilt, rainfall, and vibration.
- [x] Phase 2 physical ESP32 firmware sketch and wiring documentation.

---

## 13. License

This project is licensed under the MIT License for educational and academic research purposes at the **National Institute of Technology Arunachal Pradesh**.
