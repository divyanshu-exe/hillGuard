const axios = require('axios');
const { WeatherData } = require('../models');
const { OPENWEATHER_API_KEY } = require('../config/env');

// Key Arunachal Pradesh geographic zones for weather monitoring
const ARUNACHAL_WEATHER_LOCATIONS = {
  ITANAGAR: { name: 'Itanagar (State Capital)', lat: 27.0844, lon: 93.6053, district: 'Papum Pare', elevation: 320 },
  TAWANG: { name: 'Tawang High Pass', lat: 27.5861, lon: 91.8594, district: 'Tawang', elevation: 3048 },
  BHALUKPONG: { name: 'Bhalukpong Valley', lat: 27.0142, lon: 92.6416, district: 'West Kameng', elevation: 213 },
  ZIRO: { name: 'Ziro Plateau', lat: 27.5445, lon: 93.8197, district: 'Lower Subansiri', elevation: 1572 },
  PASIGHAT: { name: 'Pasighat Siang Corridor', lat: 28.0665, lon: 95.3268, district: 'East Siang', elevation: 153 },
  ROING: { name: 'Roing Foothills', lat: 28.1408, lon: 95.8344, district: 'Lower Dibang Valley', elevation: 390 }
};

class WeatherService {
  constructor() {
    this.cacheTTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Fetch weather for coordinates or location key
   */
  async getWeather(locationKey = 'ITANAGAR', coordinates = null) {
    const key = (locationKey || 'ITANAGAR').toUpperCase();
    const locInfo = ARUNACHAL_WEATHER_LOCATIONS[key] || {
      name: key,
      lat: coordinates?.latitude || 27.0844,
      lon: coordinates?.longitude || 93.6053,
      district: 'Arunachal Pradesh'
    };

    // Check recent cached record from DB
    try {
      const fifteenMinutesAgo = new Date(Date.now() - this.cacheTTL);
      const cached = await WeatherData.findOne({
        locationKey: key,
        fetchedAt: { $gte: fifteenMinutesAgo }
      }).sort({ fetchedAt: -1 });

      if (cached) {
        return cached;
      }
    } catch (err) {
      console.warn('[Weather Service] Cache lookup warning:', err.message);
    }

    // Attempt real OpenWeatherMap call if key exists
    if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'mock_key_or_real_key' && OPENWEATHER_API_KEY !== 'your_openweather_api_key_or_leave_empty_for_smart_mock') {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${locInfo.lat}&lon=${locInfo.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const response = await axios.get(url, { timeout: 4000 });
        const d = response.data;

        const rain1h = d.rain ? (d.rain['1h'] || d.rain['3h'] || 0) : 0;

        const record = await WeatherData.create({
          locationKey: key,
          locationName: locInfo.name,
          district: locInfo.district,
          coordinates: { latitude: locInfo.lat, longitude: locInfo.lon },
          temperature: Math.round(d.main.temp * 10) / 10,
          feelsLike: Math.round(d.main.feels_like * 10) / 10,
          humidity: d.main.humidity,
          pressure: d.main.pressure,
          rainfallMm: rain1h,
          windSpeed: d.wind ? d.wind.speed : 1.5,
          condition: d.weather[0]?.main || 'Clear',
          description: d.weather[0]?.description || 'Clear sky',
          icon: d.weather[0]?.icon || '02d',
          source: 'OPENWEATHERMAP',
          fetchedAt: new Date()
        });

        return record;
      } catch (apiErr) {
        console.warn(`[Weather API] Live call failed (${apiErr.message}), switching to mountain realistic simulation.`);
      }
    }

    // High fidelity mountain weather simulation (Ground-truthed to Arunachal conditions)
    const simulatedWeather = this.generateRealisticHimalayanWeather(locInfo, key);
    try {
      const record = await WeatherData.create(simulatedWeather);
      return record;
    } catch (saveErr) {
      return simulatedWeather;
    }
  }

  generateRealisticHimalayanWeather(locInfo, key) {
    const hour = new Date().getHours();
    // Elevation adjustments (higher = colder, more moisture condensation)
    const elev = locInfo.elevation || 800;
    const baseTemp = 24 - (elev / 1000) * 6.5; // Environmental lapse rate
    const tempJitter = (Math.sin(hour / 3) * 3) + ((Math.random() - 0.5) * 2);
    const temperature = Math.round((baseTemp + tempJitter) * 10) / 10;
    
    // Monsoon / sub-Himalayan rainfall variation
    const conditionsPool = [
      { cond: 'Rain', desc: 'Continuous hill showers', rain: 18.5, icon: '10d', hum: 88 },
      { cond: 'Thunderstorm', desc: 'Monsoon cloudburst over ridge', rain: 42.0, icon: '11d', hum: 94 },
      { cond: 'Clouds', desc: 'Heavy monsoon cloud cover', rain: 4.2, icon: '04d', hum: 76 },
      { cond: 'Mist', desc: 'Dense valley fog & dampness', rain: 1.0, icon: '50d', hum: 85 }
    ];

    const pick = conditionsPool[Math.floor(Math.random() * conditionsPool.length)];

    return {
      locationKey: key,
      locationName: locInfo.name,
      district: locInfo.district,
      coordinates: { latitude: locInfo.lat, longitude: locInfo.lon },
      temperature,
      feelsLike: Math.round((temperature - 1.2) * 10) / 10,
      humidity: pick.hum,
      pressure: 1012 - Math.round(elev / 8),
      rainfallMm: pick.rain,
      windSpeed: Math.round((2.5 + Math.random() * 4.5) * 10) / 10,
      condition: pick.cond,
      description: pick.desc,
      icon: pick.icon,
      source: 'MOCK_HILL_WEATHER',
      fetchedAt: new Date()
    };
  }

  getAllLocations() {
    return Object.entries(ARUNACHAL_WEATHER_LOCATIONS).map(([key, val]) => ({
      key,
      ...val
    }));
  }
}

module.exports = new WeatherService();
