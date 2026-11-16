const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  // Strict rule: Public registration CANNOT choose official or admin!
  role: z.enum(['traveller']).default('traveller')
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required')
});

const telemetrySchema = z.object({
  nodeId: z.string().min(2, 'Node ID required (e.g. HG_NODE_01)'),
  source: z.enum(['SIMULATED', 'HARDWARE']).default('SIMULATED'),
  timestamp: z.string().optional(),
  sensors: z.object({
    soilMoisture: z.number().min(0).max(100),
    tiltAngle: z.number().min(0).max(90),
    vibration: z.number().min(0).max(20),
    rainIntensity: z.number().min(0).max(300)
  }),
  battery: z.object({
    percentage: z.number().min(0).max(100).optional(),
    voltage: z.number().optional()
  }).optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional()
});

const reportCreateSchema = z.object({
  roadId: z.string().optional(),
  roadName: z.string().min(2, 'Road name is required'),
  incidentType: z.enum(['Landslide', 'Road Blockage', 'Fallen Trees', 'Rockfall', 'Flooding', 'Other']),
  description: z.string().min(5, 'Detailed description is required'),
  latitude: z.union([z.number(), z.string().transform(v => Number(v))]),
  longitude: z.union([z.number(), z.string().transform(v => Number(v))]),
  accuracy: z.union([z.number(), z.string().transform(v => Number(v))]).optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  capturedViaLiveCamera: z.union([z.boolean(), z.string().transform(v => v === 'true')]).default(true),
  imageBase64: z.string().optional()
});

const roadStatusUpdateSchema = z.object({
  passability: z.enum(['OPEN', 'ONE_WAY_CAUTION', 'RESTRICTED_CONVOY', 'BLOCKED']).optional(),
  riskStatus: z.enum(['GREEN', 'YELLOW', 'RED']).optional(),
  isBlockageConfirmed: z.boolean().optional(),
  officialRemarks: z.string().min(3, 'Official remarks required'),
  clearingAgency: z.string().optional(),
  estimatedReopeningTime: z.string().optional()
});

const reportVerifySchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED']),
  officialRemarks: z.string().min(2, 'Remarks required'),
  updateRoadStatus: z.boolean().default(false),
  roadPassability: z.enum(['OPEN', 'ONE_WAY_CAUTION', 'RESTRICTED_CONVOY', 'BLOCKED']).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  telemetrySchema,
  reportCreateSchema,
  roadStatusUpdateSchema,
  reportVerifySchema
};
