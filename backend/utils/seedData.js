const mongoose = require('mongoose');
const { User, Road, SensorNode, Telemetry, Alert, Report, WeatherData, AuditLog } = require('../models');
const connectDB = require('../config/db');
const riskEngine = require('../services/riskEngine');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Cleaning old seed records...');

    await Promise.all([
      User.deleteMany({}),
      Road.deleteMany({}),
      SensorNode.deleteMany({}),
      Telemetry.deleteMany({}),
      Alert.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed] Inserting default demo users...');
    const users = await User.create([
      {
        name: 'Er. Tape Bagra',
        email: 'admin@hillguard.in',
        password: 'Admin@123',
        role: 'admin',
        department: 'Arunachal Pradesh Disaster Management Authority (APDMA)',
        badgeNumber: 'APDMA-DIR-01',
        phone: '+91 94360 12345'
      },
      {
        name: 'Major Vikram Negi',
        email: 'official@hillguard.in',
        password: 'Official@123',
        role: 'official',
        department: 'Border Roads Organisation (BRO) - Project Vartak',
        badgeNumber: 'BRO-VRTK-904',
        phone: '+91 98625 67890'
      },
      {
        name: 'Tana Tara',
        email: 'traveller@hillguard.in',
        password: 'Traveller@123',
        role: 'traveller',
        phone: '+91 94022 54321'
      }
    ]);

    const adminUser = users[0];
    const officialUser = users[1];
    const travellerUser = users[2];

    console.log('[Seed] Inserting Arunachal Pradesh road corridors...');

    // Road 1: NH-415 Itanagar - Naharlagun Expressway
    const roadNH415 = await Road.create({
      roadCode: 'NH-415',
      name: 'Itanagar - Naharlagun Highway (Twin Capital Expressway)',
      district: 'Papum Pare',
      totalDistanceKm: 14.5,
      startPoint: { name: 'Ganga Lake Junction, Itanagar', latitude: 27.0844, longitude: 93.6053 },
      endPoint: { name: 'Naharlagun Railway Station', latitude: 27.1062, longitude: 93.6931 },
      coordinates: [
        { latitude: 27.0844, longitude: 93.6053, elevation: 320 },
        { latitude: 27.0910, longitude: 93.6210, elevation: 310 },
        { latitude: 27.0955, longitude: 93.6450, elevation: 295 },
        { latitude: 27.1012, longitude: 93.6705, elevation: 270 },
        { latitude: 27.1062, longitude: 93.6931, elevation: 250 }
      ],
      riskStatus: 'GREEN',
      currentRiskScore: 18,
      riskReason: 'Telemetry shows dry sub-soil and negligible slope vibration.',
      passability: 'OPEN',
      isBlockageConfirmed: false,
      officialRemarks: 'All lanes open. PWD highway patrol on standby.'
    });

    // Road 2: NH-13 Bhalukpong - Bomdila - Dirang
    const roadBhalukpong = await Road.create({
      roadCode: 'NH-13-WKM',
      name: 'Bhalukpong - Tenga - Bomdila Highway',
      district: 'West Kameng',
      totalDistanceKm: 98.0,
      startPoint: { name: 'Bhalukpong Check Gate', latitude: 27.0142, longitude: 92.6416 },
      endPoint: { name: 'Bomdila Pass', latitude: 27.2644, longitude: 92.4231 },
      coordinates: [
        { latitude: 27.0142, longitude: 92.6416, elevation: 213 },
        { latitude: 27.0890, longitude: 92.5800, elevation: 540 },
        { latitude: 27.1560, longitude: 92.5100, elevation: 1100 },
        { latitude: 27.2100, longitude: 92.4600, elevation: 1850 },
        { latitude: 27.2644, longitude: 92.4231, elevation: 2415 }
      ],
      riskStatus: 'YELLOW',
      currentRiskScore: 56,
      riskReason: 'Active intermittent rainfall and loose shale formation near Tenga Valley.',
      passability: 'ONE_WAY_CAUTION',
      isBlockageConfirmed: false,
      officialRemarks: 'Vehicles advised to maintain 20m distance. Light debris on shoulder.'
    });

    // Road 3: Sela Pass to Tawang Highway
    const roadTawang = await Road.create({
      roadCode: 'NH-13-TWG',
      name: 'Sela Tunnel - Jaswant Garh - Tawang Corridor',
      district: 'Tawang',
      totalDistanceKm: 76.0,
      startPoint: { name: 'Sela Pass Alpine Ridge', latitude: 27.5020, longitude: 92.1030 },
      endPoint: { name: 'Tawang Town Centre', latitude: 27.5861, longitude: 91.8594 },
      coordinates: [
        { latitude: 27.5020, longitude: 92.1030, elevation: 4170 },
        { latitude: 27.5250, longitude: 92.0500, elevation: 3800 },
        { latitude: 27.5450, longitude: 91.9800, elevation: 3300 },
        { latitude: 27.5700, longitude: 91.9100, elevation: 3100 },
        { latitude: 27.5861, longitude: 91.8594, elevation: 3048 }
      ],
      riskStatus: 'RED',
      currentRiskScore: 82,
      riskReason: 'CRITICAL: Rapid slope tilt shift (18.5°) and mud saturation following snowmelt.',
      passability: 'BLOCKED',
      isBlockageConfirmed: true,
      blockageDetails: {
        reason: 'Severe rockfall and mass debris blockage at Km 48 near Jaswant Garh.',
        clearingAgency: 'Border Roads Organisation (BRO) - Project Vartak 42 BRTF',
        estimatedReopeningTime: new Date(Date.now() + 18 * 3600 * 1000),
        confirmedBy: officialUser._id,
        confirmedAt: new Date(Date.now() - 2 * 3600 * 1000)
      },
      officialRemarks: 'Strict roadblock enforced at Sela Tunnel exit. Heavy bulldozers clearing debris.'
    });

    // Road 4: Pasighat - Mariyang - Yingkiong Highway
    const roadPasighat = await Road.create({
      roadCode: 'NH-513-SNG',
      name: 'Pasighat - Mariyang - Yingkiong Canyon Highway',
      district: 'East Siang',
      totalDistanceKm: 64.0,
      startPoint: { name: 'Pasighat Siang Bridge', latitude: 28.0665, longitude: 95.3268 },
      endPoint: { name: 'Mariyang Hills', latitude: 28.3200, longitude: 95.2100 },
      coordinates: [
        { latitude: 28.0665, longitude: 95.3268, elevation: 153 },
        { latitude: 28.1400, longitude: 95.2900, elevation: 340 },
        { latitude: 28.2200, longitude: 95.2500, elevation: 780 },
        { latitude: 28.3200, longitude: 95.2100, elevation: 1120 }
      ],
      riskStatus: 'YELLOW',
      currentRiskScore: 48,
      riskReason: 'Siang river water level high; saturated clay bank near Mariyang.',
      passability: 'RESTRICTED_CONVOY',
      isBlockageConfirmed: false,
      officialRemarks: 'Heavy vehicles prohibited between 6 PM and 6 AM.'
    });

    // Road 5: Potin - Ziro Valley Road
    const roadZiro = await Road.create({
      roadCode: 'SH-03-ZRO',
      name: 'Potin Junction - Yazali - Ziro Valley Road',
      district: 'Lower Subansiri',
      totalDistanceKm: 52.0,
      startPoint: { name: 'Potin Trisection', latitude: 27.3500, longitude: 93.8000 },
      endPoint: { name: 'Hapoli / Ziro Town', latitude: 27.5445, longitude: 93.8197 },
      coordinates: [
        { latitude: 27.3500, longitude: 93.8000, elevation: 580 },
        { latitude: 27.4200, longitude: 93.8100, elevation: 890 },
        { latitude: 27.4800, longitude: 93.8150, elevation: 1250 },
        { latitude: 27.5445, longitude: 93.8197, elevation: 1572 }
      ],
      riskStatus: 'GREEN',
      currentRiskScore: 22,
      riskReason: 'Dry weather and stable slope indicators.',
      passability: 'OPEN',
      isBlockageConfirmed: false,
      officialRemarks: 'Route completely clear.'
    });

    console.log('[Seed] Inserting Sensor Nodes...');

    const node1 = await SensorNode.create({
      nodeId: 'HG_NODE_01',
      name: 'NH-415 Ganga Ridge Monitoring Station',
      road: roadNH415._id,
      location: { latitude: 27.0910, longitude: 93.6210, elevation: 310, landmark: 'Km 6 Ganga Cut', district: 'Papum Pare' },
      status: 'ONLINE',
      batteryLevel: 94,
      signalStrength: 92,
      isSimulated: true,
      lastSeen: new Date()
    });

    const node2 = await SensorNode.create({
      nodeId: 'HG_NODE_02',
      name: 'NH-13 Tenga Valley Rockfall Station',
      road: roadBhalukpong._id,
      location: { latitude: 27.1560, longitude: 92.5100, elevation: 1100, landmark: 'Tenga Military Gate', district: 'West Kameng' },
      status: 'ONLINE',
      batteryLevel: 88,
      signalStrength: 78,
      isSimulated: true,
      lastSeen: new Date()
    });

    const node3 = await SensorNode.create({
      nodeId: 'HG_NODE_03',
      name: 'NH-13 Sela Pass High Altitude Station',
      road: roadTawang._id,
      location: { latitude: 27.5250, longitude: 92.0500, elevation: 3800, landmark: 'Jaswant Garh Turn 4', district: 'Tawang' },
      status: 'ONLINE',
      batteryLevel: 82,
      signalStrength: 65,
      isSimulated: true,
      lastSeen: new Date()
    });

    const node4 = await SensorNode.create({
      nodeId: 'HG_NODE_04',
      name: 'NH-513 Siang Canyon Node Alpha',
      road: roadPasighat._id,
      location: { latitude: 28.1400, longitude: 95.2900, elevation: 340, landmark: 'Pangin Bridge Approach', district: 'East Siang' },
      status: 'ONLINE',
      batteryLevel: 91,
      signalStrength: 84,
      isSimulated: true,
      lastSeen: new Date()
    });

    const node5 = await SensorNode.create({
      nodeId: 'HG_NODE_05',
      name: 'SH-03 Lower Subansiri Escarpment Sensor',
      road: roadZiro._id,
      location: { latitude: 27.4200, longitude: 93.8100, elevation: 890, landmark: 'Yazali Hydro Reservoir', district: 'Lower Subansiri' },
      status: 'ONLINE',
      batteryLevel: 96,
      signalStrength: 90,
      isSimulated: true,
      lastSeen: new Date()
    });

    // Link nodes to roads
    roadNH415.sensorNodes.push(node1._id);
    await roadNH415.save();

    roadBhalukpong.sensorNodes.push(node2._id);
    await roadBhalukpong.save();

    roadTawang.sensorNodes.push(node3._id);
    await roadTawang.save();

    roadPasighat.sensorNodes.push(node4._id);
    await roadPasighat.save();

    roadZiro.sensorNodes.push(node5._id);
    await roadZiro.save();

    console.log('[Seed] Generating initial historical telemetry records...');

    // Generate 15 historical telemetry entries for Node 1 (Green)
    for (let i = 15; i >= 0; i--) {
      const time = new Date(Date.now() - i * 5 * 60 * 1000);
      const sensors = {
        soilMoisture: 22 + (Math.sin(i) * 3),
        tiltAngle: 1.2 + (Math.random() * 0.4),
        vibration: 0.08 + (Math.random() * 0.04),
        rainIntensity: Math.max(0, 1.5 + (Math.random() * 2))
      };
      const computedRisk = riskEngine.calculateRisk(sensors);

      await Telemetry.create({
        nodeId: 'HG_NODE_01',
        nodeRef: node1._id,
        roadRef: roadNH415._id,
        source: 'SIMULATED',
        timestamp: time,
        sensors,
        battery: { percentage: 94, voltage: 4.1 },
        location: node1.location,
        computedRisk
      });
    }

    // Telemetry for Node 3 (Critical Sela Pass)
    const criticalSensors = {
      soilMoisture: 92.5,
      tiltAngle: 19.8,
      vibration: 2.8,
      rainIntensity: 64.0
    };
    const criticalRisk = riskEngine.calculateRisk(criticalSensors);

    await Telemetry.create({
      nodeId: 'HG_NODE_03',
      nodeRef: node3._id,
      roadRef: roadTawang._id,
      source: 'SIMULATED',
      timestamp: new Date(),
      sensors: criticalSensors,
      battery: { percentage: 82, voltage: 3.9 },
      location: node3.location,
      computedRisk: criticalRisk
    });

    console.log('[Seed] Inserting initial Alerts...');
    await Alert.create([
      {
        alertCode: 'ALT-TWG-8041',
        title: 'CRITICAL LANDSLIDE BLOWOUT: Sela Pass (NH-13)',
        category: 'ROAD_BLOCKED',
        severity: 'CRITICAL',
        road: roadTawang._id,
        roadName: roadTawang.name,
        node: node3._id,
        nodeId: 'HG_NODE_03',
        message: 'Massive landslide and rockfall near Jaswant Garh. Road is totally impassable. BRO deploying heavy excavators.',
        cause: 'Steep slope tilt (19.8°) with extreme soil saturation and continuous monsoon precipitation.',
        status: 'ACTIVE',
        isVerified: true,
        location: node3.location
      },
      {
        alertCode: 'ALT-WKM-3319',
        title: 'Landslide Warning: Tenga Valley Ridge (NH-13)',
        category: 'WARNING',
        severity: 'MEDIUM',
        road: roadBhalukpong._id,
        roadName: roadBhalukpong.name,
        node: node2._id,
        nodeId: 'HG_NODE_02',
        message: 'Active rainfall has increased soil saturation to 68%. Slopes are unstable. Exercise high caution.',
        cause: 'Elevated pore pressure in loose shale cutting.',
        status: 'ACTIVE',
        isVerified: true,
        location: node2.location
      }
    ]);

    console.log('[Seed] Inserting initial Citizen Incident Reports...');
    await Report.create([
      {
        reportId: 'REP-772910',
        user: travellerUser._id,
        reporterName: 'Tana Tara',
        reporterPhone: '+91 94022 54321',
        road: roadTawang._id,
        roadName: roadTawang.name,
        incidentType: 'Landslide',
        description: 'Large boulders and deep mud sliding across the road 2 km before Sela Tunnel. Four vehicles trapped on either side.',
        imageUrl: '/uploads/reports/sample_landslide_sela.jpg',
        location: {
          latitude: 27.5255,
          longitude: 92.0512,
          accuracy: 8,
          capturedViaGPS: true
        },
        capturedViaLiveCamera: true,
        status: 'VERIFIED',
        verificationDetails: {
          verifiedBy: officialUser._id,
          verifiedByName: 'Major Vikram Negi (BRO)',
          verifiedAt: new Date(Date.now() - 2 * 3600 * 1000),
          officialRemarks: 'Verified on-site by BRO Sector Patrol. Heavy machinery moving in.',
          actionTaken: 'UPDATED_ROAD_TO_BLOCKED'
        }
      },
      {
        reportId: 'REP-881204',
        user: null,
        reporterName: 'Koj Ralo (Taxi Driver)',
        reporterPhone: '+91 97740 99881',
        road: roadBhalukpong._id,
        roadName: roadBhalukpong.name,
        incidentType: 'Rockfall',
        description: 'Loose stones falling continuously on blind curve. Small gravel heap on left lane.',
        imageUrl: '/uploads/reports/sample_rockfall_tenga.jpg',
        location: {
          latitude: 27.1580,
          longitude: 92.5120,
          accuracy: 12,
          capturedViaGPS: true
        },
        capturedViaLiveCamera: true,
        status: 'UNDER_REVIEW',
        verificationDetails: {
          officialRemarks: 'PWD patrol team en route for physical assessment.'
        }
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ HILLGUARD DATABASE SEEDED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Viva / Evaluation:');
    console.log('1. Admin:     admin@hillguard.in     / Admin@123');
    console.log('2. Official:  official@hillguard.in  / Official@123');
    console.log('3. Traveller: traveller@hillguard.in / Traveller@123');
    console.log('----------------------------------------------------');

    return true;
  } catch (error) {
    console.error('[Seed Error]', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;
