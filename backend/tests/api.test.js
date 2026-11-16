const test = require('node:test');
const assert = require('node:assert');
const riskEngine = require('../services/riskEngine');

test('Risk Engine - Formula and Normalization Tests', async (t) => {
  await t.test('Safe baseline conditions produce GREEN classification (<30)', () => {
    const safeSensors = {
      soilMoisture: 20,
      tiltAngle: 1.0,
      vibration: 0.05,
      rainIntensity: 0
    };
    const result = riskEngine.calculateRisk(safeSensors);
    assert.strictEqual(result.classification, 'GREEN');
    assert.ok(result.score <= 29, `Expected score <= 29, got ${result.score}`);
  });

  await t.test('Elevated rainfall and moisture produce YELLOW warning (30-69)', () => {
    const warningSensors = {
      soilMoisture: 60,
      tiltAngle: 5.5,
      vibration: 0.4,
      rainIntensity: 30
    };
    const result = riskEngine.calculateRisk(warningSensors);
    assert.strictEqual(result.classification, 'YELLOW');
    assert.ok(result.score >= 30 && result.score <= 69, `Expected 30-69, got ${result.score}`);
  });

  await t.test('Sudden high slope tilt triggers CRITICAL RED override (>=70)', () => {
    const criticalSensors = {
      soilMoisture: 70,
      tiltAngle: 18.0, // Exceeds 15° threshold
      vibration: 1.5,
      rainIntensity: 45
    };
    const result = riskEngine.calculateRisk(criticalSensors);
    assert.strictEqual(result.classification, 'RED');
    assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
    assert.ok(result.triggers.some(tr => tr.includes('CRITICAL_TILT_EXCEEDED')));
  });

  await t.test('Rapid slope shift delta (jump of >=5°) triggers high-priority alert', () => {
    const prevSensors = { soilMoisture: 40, tiltAngle: 2.0, vibration: 0.1, rainIntensity: 5 };
    const currentSensors = { soilMoisture: 45, tiltAngle: 8.5, vibration: 0.6, rainIntensity: 10 };
    const result = riskEngine.calculateRisk(currentSensors, prevSensors);
    assert.strictEqual(result.classification, 'RED');
    assert.ok(result.triggers.some(tr => tr.includes('RAPID_SLOPE_SHIFT')));
  });
});

test('Simulator Service - State and Scenarios', async (t) => {
  const simulatorService = require('../services/simulatorService');

  await t.test('Apply scenario CRITICAL_SCENARIO sets high sensor values', () => {
    const state = simulatorService.applyScenario('CRITICAL_SCENARIO');
    assert.strictEqual(state.sensors.soilMoisture, 95);
    assert.strictEqual(state.sensors.tiltAngle, 24);
    assert.strictEqual(state.sensors.rainIntensity, 90);
  });

  await t.test('Apply scenario SAFE_RESET resets to baseline values', () => {
    const state = simulatorService.applyScenario('SAFE_RESET');
    assert.strictEqual(state.sensors.soilMoisture, 22);
    assert.strictEqual(state.sensors.tiltAngle, 1.2);
    assert.strictEqual(state.sensors.rainIntensity, 0);
  });
});
