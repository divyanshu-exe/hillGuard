# HillGuard System Architecture Document

**Institution**: National Institute of Technology Arunachal Pradesh  
**Department**: Computer Science and Engineering  
**Project**: HillGuard – Real-Time Landslide Detection & Road-Blockage Alert System  
**Academic Level**: B.Tech 3rd Year Minor Project  
**Project Guide**: Dr. Koj Sambyo  
**Project Team**:
1. Divyanshu Gupta
2. Riya Yadav
3. Jainesh Birla
4. Nabam Rana
5. Ngilyang Nancy

---

## 1. Architectural Overview

HillGuard is an IoT-ready disaster intelligence platform engineered specifically for the geotechnical and telecommunication challenges of mountainous highways across Arunachal Pradesh.

The system is constructed with strict modularity across three primary layers:

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  - React 19 + TypeScript + Vite + Tailwind CSS              │
│  - Interactive Leaflet.js Highway Risk Map                  │
│  - Recharts Environmental Telemetry Analytics               │
│  - Citizen Reporting with MediaDevices Live Camera & GPS    │
│  - Progressive Web App (PWA) with Service Worker & IndexedDB│
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / WebSocket (Socket.IO)
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION BACKEND                      │
│  - Node.js & Express.js REST API Architecture               │
│  - Socket.IO Real-Time Telemetry & Alert Broadcast Server   │
│  - Role-Based Access Control (Traveller, Official, Admin)   │
│  - Multi-Factor Geotechnical Risk Assessment Engine         │
│  - Hardware Simulator Service (Phase 1 5-Second Interval)   │
│  - OpenWeatherMap API Integration with Mountain Mock Cache  │
│  - Multer / Base64 Citizen Photo Ingestion                  │
└──────────────────────────────▲──────────────────────────────┘
                               │ Mongoose ODM / Time-Series
┌──────────────────────────────▼──────────────────────────────┐
│                       DATABASE TIER                         │
│  - MongoDB High-Throughput Document & Telemetry Store       │
│  - Collections: Users, SensorNodes, Roads, Telemetry,       │
│    Alerts, Reports, WeatherData, Notifications, AuditLogs   │
└──────────────────────────────▲──────────────────────────────┘
                               │ Unified HTTP Ingestion
┌──────────────────────────────┴──────────────────────────────┐
│                     TELEMETRY SOURCES                       │
│  ┌─────────────────────────┐     ┌───────────────────────┐  │
│  │   PHASE 1 SIMULATOR     │     │  PHASE 2 REAL ESP32   │  │
│  │  (Source: 'SIMULATED')  │     │  (Source: 'HARDWARE') │  │
│  └─────────────────────────┘     └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Risk vs Blockage Decoupling

A critical architectural distinction maintained in HillGuard is the decoupling between **Landslide Environmental Risk** and **Physical Road Blockage**:

1. **Landslide Risk (0–100 Score)**:
   Automated metric calculated from live sensors ($R = 0.35S + 0.30T + 0.25W + 0.10V$). Identifies unstable slopes before mass movement occurs.
2. **Road Passability (`OPEN`, `ONE_WAY_CAUTION`, `RESTRICTED_CONVOY`, `BLOCKED`)**:
   Physical passability state. High risk alone never automatically marks a highway as blocked; physical closure mandates confirmed on-site evidence via verified citizen reports or authorized Border Roads Organisation (BRO) directives.
