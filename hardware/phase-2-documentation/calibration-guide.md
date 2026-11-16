# Sensor Calibration & Threshold Guide

## 1. Capacitive Soil Moisture Sensor v1.2 Calibration

Unlike resistive sensors, capacitive sensors measure dielectric permittivity and do not suffer from rapid copper trace electrolysis in acidic Himalayan soil.

### Two-Point Calibration Procedure:
1. **Air Value (0% Relative Moisture)**:
   - Hold sensor in dry air at 25°C.
   - Record raw 12-bit ADC reading (typically ~3200 on 3.3V reference).
2. **Water Value (100% Saturated Liquefaction)**:
   - Submerge sensor blade up to white stop line in water.
   - Record raw ADC reading (typically ~1400).
3. **Firmware Formula**:
   ```c
   float moisture = map(rawADC, SOIL_AIR_VALUE, SOIL_WATER_VALUE, 0, 100);
   moisture = constrain(moisture, 0.0, 100.0);
   ```

---

## 2. MPU-6050 Slope Tilt & Vibration Calibration

The MPU-6050 measures acceleration and angular velocity. Roadside installation requires zeroing relative to the mountain embankment's natural grade.

1. **Mounting Alignment**:
   - Secure node chassis firmly to a 1.5m steel ground anchor driven into bedrock or deep compacted soil.
2. **Quiescent Angle Calibration**:
   - On initial power-up, average 100 consecutive accelerometer samples:
     $$\theta_{\text{baseline}} = \text{atan2}(A_y, A_z) \times \frac{180}{\pi}$$
   - Store $\theta_{\text{baseline}}$ in EEPROM / flash.
3. **Deviation Calculation**:
   - Live tilt angle is calculated as absolute deviation:
     $$\Delta \theta = |\theta_{\text{current}} - \theta_{\text{baseline}}|$$
   - A deviation $\Delta \theta \ge 5.0^\circ$ represents geotechnical creep; $\ge 15.0^\circ$ represents active shear collapse.
