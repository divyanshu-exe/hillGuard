# HillGuard Database Architecture Design

**Database Engine**: MongoDB (Mongoose ODM)  
**Time-Series Indexing**: Optimized for high-frequency telemetry sampling and historical timeseries trends.

---

## Collections & Relationships

```
┌──────────────┐          1:N          ┌──────────────┐
│     User     │──────────────────────&gt;│    Report    │
└──────────────┘                       └──────────────┘
       │                                      │
       │ 1:N (Audit Logging)                  │ Refers To
       ▼                                      ▼
┌──────────────┐         1:N           ┌──────────────┐
│   AuditLog   │                       │     Road     │
└──────────────┘                       └──────────────┘
                                              ▲
                                              │ 1:N
                                       ┌──────────────┐
                                       │  SensorNode  │
                                       └──────────────┘
                                              ▲
                                              │ 1:N
                                       ┌──────────────┐
                                       │  Telemetry   │
                                       └──────────────┘
```

### Schema Summary:
1. **User**: Name, unique lowercase email, bcrypt-hashed password, role (`traveller`, `official`, `admin`), phone, department, badge number.
2. **SensorNode**: Unique uppercase `nodeId`, name, road ref, coordinates, hardwareModel (`ESP32-WROOM-32D`), equipped sensors array, status, batteryLevel, isSimulated flag, device API key.
3. **Road**: Unique `roadCode`, name, district, coordinates polyline array, riskStatus (`GREEN`, `YELLOW`, `RED`), currentRiskScore, passability (`OPEN`, `ONE_WAY_CAUTION`, `RESTRICTED_CONVOY`, `BLOCKED`), isBlockageConfirmed, blockageDetails, officialRemarks.
4. **Telemetry**: Indexed by `{ nodeId: 1, timestamp: -1 }`, source (`SIMULATED` vs `HARDWARE`), sensors (`soilMoisture`, `tiltAngle`, `vibration`, `rainIntensity`), battery, location, computedRisk breakdown (`soilRisk`, `tiltRisk`, `rainRisk`, `vibrationRisk`), triggers array.
5. **Report**: Report code, incidentType, live camera image path, GPS coordinates with accuracy, status (`NEW`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `RESOLVED`), official remarks, verifiedBy ref.
6. **Alert**: Alert code, title, category (`INFO`, `WARNING`, `CRITICAL`, `ROAD_BLOCKED`), severity, road ref, cause, status (`ACTIVE`, `RESOLVED`), location.
7. **AuditLog**: User ref, userRole, action, targetEntity, targetId, details JSON, IP address, timestamp.
