# HillGuard ESP32 Hardware Wiring & Schematic Guide

## System Components List

1. **Microcontroller**: ESP32-WROOM-32D Dual-Core 240MHz (38-pin DevKit V1)
2. **Soil Moisture Sensor**: Capacitive Soil Moisture Sensor v1.2 (Corrosion-resistant)
3. **Inertial Measurement Unit**: MPU-6050 (3-Axis Accelerometer + 3-Axis Gyroscope)
4. **Rainfall Sensor**: Optical Tipping Bucket / Optical Rain Gauge module
5. **Cellular Module**: SIM800L GPRS/GSM Module (microSIM, 850/900/1800/1900 MHz)
6. **Optional Long-Range Radio**: SX1278 LoRa 433MHz Transceiver module
7. **Local Warning Actuators**: High-lumen Red Flashing Strobe LED + 5V Piezoelectric Buzzer
8. **Power Subsystem**: 3.2V 6000mAh LiFePO4 Battery + 10W Monocrystalline Solar Panel + CN3791 MPPT Solar Charger

---

## Detailed Pin Interconnect Table

| Component | Pin Label | ESP32 GPIO | Operating Voltage | Interface Mode | Function |
|---|---|---|---|---|---|
| **Capacitive Soil v1.2** | VCC | 3.3V | 3.3V DC | Power | Continuous ground power |
| | GND | GND | 0V | Ground | System common ground |
| | AOUT | GPIO 34 | 0–3.3V Analog | ADC1_CH6 | Soil pore-water saturation reading |
| **MPU-6050** | VCC | 3.3V | 3.3V DC | Power | Power supply |
| | GND | GND | 0V | Ground | System common ground |
| | SCL | GPIO 22 | 3.3V Logic | I2C Clock (100kHz) | Clock line |
| | SDA | GPIO 21 | 3.3V Logic | I2C Data | Bidirectional data line |
| **Optical Rain Sensor** | VCC | 3.3V | 3.3V DC | Power | Optical emitter/receiver supply |
| | GND | GND | 0V | Ground | System common ground |
| | AOUT | GPIO 35 | 0–3.3V Analog | ADC1_CH7 | Rain precipitation intensity |
| **SIM800L GSM Module** | VCC | Buck 4.0V | 3.8–4.2V (2A peak) | Power Supply | Dedicated LM2596 buck converter |
| | GND | GND | 0V | Ground | Shared ground with ESP32 |
| | TXD | GPIO 16 | 3.3V Logic | Hardware Serial2 RX | Receives AT responses |
| | RXD | GPIO 17 | 3.3V Logic (Resistor Divider) | Hardware Serial2 TX | Sends AT commands |
| **Warning Strobe LED** | Anode (+) | GPIO 4 (via 220Ω) | 3.3V | Digital Output | Pulses during critical risk |
| | Cathode (-) | GND | 0V | Ground | Current sink |
| **Highway Siren Buzzer**| VCC (+) | GPIO 5 | 3.3V | PWM Tone Output | Auditory horn alarm |
| | GND (-) | GND | 0V | Ground | Ground |
| **Solar Battery Monitor**| V_BATT | GPIO 36 | 0–3.3V Analog | Voltage Divider 100kΩ/100kΩ | LiFePO4 state-of-charge calculation |

---

## Power Supply Design Notes

> [!IMPORTANT]
> The SIM800L module draws up to 2.0A current bursts when transmitting GSM packets in remote mountain valleys. Do NOT power the SIM800L directly from the ESP32 3.3V pin. Power the SIM800L using an external LM2596 DC-DC step-down buck converter tuned to 4.0V DC with a 1000µF electrolytic capacitor placed across its VCC and GND pins.
