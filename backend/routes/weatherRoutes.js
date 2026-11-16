const express = require('express');
const router = express.Router();
const { getWeather, getAllCorridorsWeather } = require('../controllers/weatherController');

router.get('/', getAllCorridorsWeather);
router.get('/:location', getWeather);

module.exports = router;
