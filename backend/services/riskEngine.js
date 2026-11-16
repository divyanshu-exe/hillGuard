/**
 * HillGuard Intelligent Landslide Risk Assessment Engine
 * National Institute of Technology Arunachal Pradesh
 * 
 * Formula: R = (0.35 * S) + (0.30 * T) + (0.25 * W) + (0.10 * V)
 * S: Normalized Soil Moisture Risk (0-100)
 * T: Normalized Slope Tilt Risk (0-100)
 * W: Normalized Rainfall Risk (0-100)
 * V: Normalized Vibration Risk (0-100)
 */

class RiskEngine {
  constructor() {
    this.weights = {
      soil: 0.35,
      tilt: 0.30,
      rain: 0.25,
      vibration: 0.10
    };

    this.thresholds = {
      safeMax: 29,       // 0-29: GREEN
      warningMax: 69,    // 30-69: YELLOW
      criticalMin: 70    // 70-100: RED
    };
  }

  /**
   * Normalize Soil Moisture (0-100%) to Risk Score (0-100)
   * Himalayan sub-soil has rapid pore-water pressure escalation above 65% saturation.
   */
  normalizeSoilMoisture(moisture) {
    const m = Math.max(0, Math.min(100, Number(moisture) || 0));
    if (m < 35) {
      return (m / 35) * 20; // 0 to 20
    } else if (m <= 65) {
      return 20 + ((m - 35) / 30) * 40; // 20 to 60
    } else {
      return 60 + ((m - 65) / 35) * 40; // 60 to 100
    }
  }

  /**
   * Normalize Slope Tilt Angle deviation (0-60 degrees) to Risk Score (0-100)
   * High angle shear displacement is the primary precursor of mass wasting in Arunachal hills.
   */
  normalizeSlopeTilt(tiltAngle) {
    const t = Math.max(0, Math.min(60, Number(tiltAngle) || 0));
    if (t < 3) {
      return (t / 3) * 15; // 0 to 15
    } else if (t < 8) {
      return 15 + ((t - 3) / 5) * 35; // 15 to 50
    } else if (t < 15) {
      return 50 + ((t - 8) / 7) * 35; // 50 to 85
    } else {
      return 85 + Math.min(15, ((t - 15) / 15) * 15); // 85 to 100
    }
  }

  /**
   * Normalize Rainfall Intensity (mm/hr) to Risk Score (0-100)
   * 0-5 mm: light, 5-25: moderate, 25-50: heavy, >50: torrential
   */
  normalizeRainfall(rainMm) {
    const r = Math.max(0, Math.min(150, Number(rainMm) || 0));
    if (r < 5) {
      return (r / 5) * 15;
    } else if (r <= 25) {
      return 15 + ((r - 5) / 20) * 35; // 15 to 50
    } else if (r <= 50) {
      return 50 + ((r - 25) / 25) * 35; // 50 to 85
    } else {
      return 85 + Math.min(15, ((r - 50) / 50) * 15); // 85 to 100
    }
  }

  /**
   * Normalize Vibration (0-5.0 g) to Risk Score (0-100)
   */
  normalizeVibration(vibG) {
    const v = Math.max(0, Math.min(5.0, Number(vibG) || 0));
    if (v < 0.2) {
      return (v / 0.2) * 15;
    } else if (v <= 0.8) {
      return 15 + ((v - 0.2) / 0.6) * 35; // 15 to 50
    } else if (v <= 2.0) {
      return 50 + ((v - 0.8) / 1.2) * 35; // 50 to 85
    } else {
      return 85 + Math.min(15, ((v - 2.0) / 2.0) * 15); // 85 to 100
    }
  }

  /**
   * Calculate comprehensive risk assessment
   * @param {Object} sensors - { soilMoisture, tiltAngle, vibration, rainIntensity }
   * @param {Object} previousSensors - (optional) previous reading for delta calculations
   * @returns {Object} { score, classification, breakdown, triggers, reason }
   */
  calculateRisk(sensors, previousSensors = null) {
    const soilRisk = this.normalizeSoilMoisture(sensors.soilMoisture);
    const tiltRisk = this.normalizeSlopeTilt(sensors.tiltAngle);
    const rainRisk = this.normalizeRainfall(sensors.rainIntensity);
    const vibrationRisk = this.normalizeVibration(sensors.vibration);

    // Weighted base formula
    let weightedScore =
      this.weights.soil * soilRisk +
      this.weights.tilt * tiltRisk +
      this.weights.rain * rainRisk +
      this.weights.vibration * vibrationRisk;

    const triggers = [];

    // Rule 1: Sudden Slope Movement Trigger (override threshold if steep tilt or large jump)
    if (sensors.tiltAngle >= 15) {
      weightedScore = Math.max(weightedScore, 85);
      triggers.push('CRITICAL_TILT_EXCEEDED (Slope angle > 15°)');
    } else if (previousSensors && Math.abs(sensors.tiltAngle - previousSensors.tiltAngle) >= 5) {
      weightedScore = Math.max(weightedScore, 75);
      triggers.push(`RAPID_SLOPE_SHIFT (Δ ${Math.abs(sensors.tiltAngle - previousSensors.tiltAngle).toFixed(1)}° sudden movement)`);
    }

    // Rule 2: Soil Saturation + Torrential Rain Synergy
    if (sensors.soilMoisture >= 75 && sensors.rainIntensity >= 35) {
      weightedScore = Math.max(weightedScore, 78);
      triggers.push('SATURATION_PLUS_DOWNPOUR (High pore pressure danger)');
    }

    // Rule 3: Abnormal Ground Vibration (Rockfall / Debris flow shockwave)
    if (sensors.vibration >= 2.2) {
      weightedScore = Math.max(weightedScore, 72);
      triggers.push('HIGH_SEISMIC_VIBRATION (Active rockfall / debris sliding)');
    }

    // Bound between 0 and 100
    const finalScore = Math.round(Math.max(0, Math.min(100, weightedScore)));

    let classification = 'GREEN';
    let reason = 'Environmental metrics within stable baseline safety limits.';

    if (finalScore >= this.thresholds.criticalMin) {
      classification = 'RED';
      reason = triggers.length > 0
        ? `CRITICAL RISK: ${triggers.join('; ')}`
        : 'CRITICAL RISK: High combined slope tilt, soil liquefaction, and rainfall stress.';
    } else if (finalScore > this.thresholds.safeMax) {
      classification = 'YELLOW';
      reason = 'ELEVATED RISK: Active rainfall and increasing soil saturation monitored.';
    }

    return {
      score: finalScore,
      classification, // GREEN, YELLOW, RED
      breakdown: {
        soilRisk: Math.round(soilRisk),
        tiltRisk: Math.round(tiltRisk),
        rainRisk: Math.round(rainRisk),
        vibrationRisk: Math.round(vibrationRisk)
      },
      triggers,
      reason
    };
  }
}

module.exports = new RiskEngine();
