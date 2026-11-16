const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { PORT, CLIENT_URL } = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./sockets/socketHandler');
const simulatorService = require('./services/simulatorService');
const { User } = require('./models');
const seedData = require('./utils/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const roadRoutes = require('./routes/roadRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const nodeRoutes = require('./routes/nodeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach io to Express app context and Simulator service
app.set('io', io);
simulatorService.setIO(io);
socketHandler(io);

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading uploaded images from frontend
}));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'HillGuard - Real-Time Landslide Detection & Road-Blockage Alert System',
    institution: 'National Institute of Technology Arunachal Pradesh',
    department: 'Computer Science and Engineering',
    guide: 'Dr. Koj Sambyo',
    phase: 'PHASE 1 (Software Complete & Phase 2 Hardware-Ready)',
    time: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/roads', roadRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Auto-seed if first time boot
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Empty database detected. Auto-seeding initial demo data...');
      await seedData();
    }
  } catch (err) {
    console.error('[Bootstrap Seed Warning]', err.message);
  }

  server.listen(PORT, () => {
    console.log('====================================================');
    console.log(`⛰️  HILLGUARD SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🌐  API URL: http://localhost:${PORT}/api/health`);
    console.log(`📡  Socket.IO: Enabled & Ready`);
    console.log(`🎓  NIT Arunachal Pradesh - CSE Minor Project`);
    console.log('====================================================');
  });
};

startServer();

module.exports = { app, server };
