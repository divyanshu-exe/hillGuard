# Cellular GSM & LoRa SX1278 Dual Communication Architecture

## 1. Network Vulnerability in Arunachal Pradesh

The hilly roads of Arunachal Pradesh (e.g. Bhalukpong–Bomdila NH-13, Sela Pass, and the deep gorges of the Siang River) often experience total cellular link dropouts caused by:
- Deep valley line-of-sight blockage
- Storm damage to roadside cellular base transceiver stations (BTS)
- Fiber optic severed lines along mountain cuttings

To address this, Phase 2 implements a multi-tier fallback mechanism:

```
[ESP32 Node]
     │
     ├── 1. Primary: Wi-Fi Mesh or Station (APDMA High-Speed Backbone)
     │
     ├── 2. Secondary: SIM800L GPRS Cellular (HTTP POST to /api/telemetry)
     │
     ├── 3. Tertiary: SX1278 LoRa 433MHz Mesh (Hop to nearest valley gateway)
     │
     └── 4. Emergency Fallback: Encrypted SMS via SIM800L Gateway
```

---

## 2. Secure SMS Gateway Architecture

> [!CAUTION]
> An SMS cannot update a web database directly without a connected receiver or gateway.

When cellular GPRS data connectivity is unavailable but GSM 2G voice/SMS network remains operational, the node formats an encrypted SMS packet:

```
HG#01#S:88#T:18.5#V:2.4#R:75#B:92#SIG:4a8f9b#
```

### Ingestion Flow:
1. **Node Transmission**: ESP32 instructs SIM800L to send SMS to a dedicated APDMA Central GSM Gateway Number.
2. **Central SMS Gateway**: A Raspberry Pi / GSM modem base station running at the district headquarters receives the SMS.
3. **Authentication & Decryption**: The gateway verifies the hardware signature (`SIG`) using the node's pre-shared secret key.
4. **API Forwarding**: The gateway constructs the standard JSON telemetry payload and submits it to `POST /api/telemetry` over high-speed local broadband.
