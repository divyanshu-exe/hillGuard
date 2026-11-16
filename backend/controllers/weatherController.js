const weatherService = require('../services/weatherService');

// @desc    Get weather for a location or coordinates
// @route   GET /api/weather/:location
// @access  Public
const getWeather = async (req, res, next) => {
  try {
    const { location } = req.params;
    const { lat, lon } = req.query;

    const coordinates = (lat && lon) ? { latitude: Number(lat), longitude: Number(lon) } : null;
    const weather = await weatherService.getWeather(location, coordinates);

    res.json({
      success: true,
      data: weather
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get weather across all key Arunachal corridors
// @route   GET /api/weather
// @access  Public
const getAllCorridorsWeather = async (req, res, next) => {
  try {
    const locations = weatherService.getAllLocations();
    const weatherList = await Promise.all(
      locations.map(loc => weatherService.getWeather(loc.key, { latitude: loc.lat, longitude: loc.lon }))
    );

    res.json({
      success: true,
      count: weatherList.length,
      data: weatherList
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWeather,
  getAllCorridorsWeather
};
