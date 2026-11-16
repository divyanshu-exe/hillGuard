export type UserRole = 'traveller' | 'official' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  badgeNumber?: string;
  preferences?: {
    emailAlerts: boolean;
    soundAlerts: boolean;
    criticalOnly: boolean;
  };
}

export type RiskStatus = 'GREEN' | 'YELLOW' | 'RED';
export type RoadPassability = 'OPEN' | 'ONE_WAY_CAUTION' | 'RESTRICTED_CONVOY' | 'BLOCKED';

export interface Coordinate {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface SensorNode {
  _id: string;
  nodeId: string;
  name: string;
  road: string | Road;
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    landmark?: string;
    district?: string;
  };
  hardwareModel: string;
  sensorsEquipped: string[];
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'FAULTY';
  calculatedStatus?: 'ONLINE' | 'OFFLINE';
  isStale?: boolean;
  batteryLevel: number;
  signalStrength: number;
  lastSeen: string;
  isSimulated: boolean;
  apiKey?: string;
}

export interface Road {
  _id: string;
  roadCode: string;
  name: string;
  district: string;
  state: string;
  totalDistanceKm: number;
  startPoint: Coordinate & { name: string };
  endPoint: Coordinate & { name: string };
  coordinates: Coordinate[];
  riskStatus: RiskStatus;
  currentRiskScore: number;
  riskReason: string;
  passability: RoadPassability;
  isBlockageConfirmed: boolean;
  blockageDetails?: {
    reason?: string;
    clearingAgency?: string;
    estimatedReopeningTime?: string;
    confirmedAt?: string;
  };
  officialRemarks: string;
  lastStatusUpdate: string;
  sensorNodes: SensorNode[];
}

export interface TelemetrySensors {
  soilMoisture: number; // 0-100%
  tiltAngle: number;    // 0-60°
  vibration: number;    // 0-5 g
  rainIntensity: number;// mm/h
}

export interface Telemetry {
  _id: string;
  nodeId: string;
  nodeRef?: string | SensorNode;
  roadRef?: string | Road;
  source: 'SIMULATED' | 'HARDWARE';
  timestamp: string;
  sensors: TelemetrySensors;
  battery: {
    percentage: number;
    voltage: number;
  };
  location: Coordinate;
  computedRisk: {
    score: number;
    classification: RiskStatus;
    breakdown: {
      soilRisk: number;
      tiltRisk: number;
      rainRisk: number;
      vibrationRisk: number;
    };
    triggers: string[];
    reason?: string;
  };
  isStale?: boolean;
}

export type AlertCategory = 'INFO' | 'WARNING' | 'CRITICAL' | 'ROAD_BLOCKED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  _id: string;
  alertCode: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  road: string | Road;
  roadName: string;
  nodeId?: string;
  message: string;
  cause: string;
  status: AlertStatus;
  issuedAt: string;
  resolvedAt?: string;
  resolvedBy?: {
    name: string;
    role: string;
    department?: string;
  };
  location?: Coordinate;
}

export type ReportIncidentType = 'Landslide' | 'Road Blockage' | 'Fallen Trees' | 'Rockfall' | 'Flooding' | 'Other';
export type ReportStatus = 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';

export interface Report {
  _id: string;
  reportId: string;
  user?: User;
  reporterName: string;
  reporterPhone?: string;
  road: string | Road;
  roadName: string;
  incidentType: ReportIncidentType;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    capturedViaGPS: boolean;
  };
  capturedViaLiveCamera: boolean;
  status: ReportStatus;
  verificationDetails?: {
    verifiedByName?: string;
    verifiedAt?: string;
    officialRemarks?: string;
    actionTaken?: string;
  };
  resolutionDetails?: {
    resolvedAt?: string;
    clearanceNotes?: string;
  };
  createdAt: string;
}

export interface WeatherData {
  _id?: string;
  locationKey: string;
  locationName: string;
  district: string;
  coordinates: { latitude: number; longitude: number };
  temperature: number;
  feelsLike?: number;
  humidity: number;
  pressure?: number;
  rainfallMm: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  source: 'OPENWEATHERMAP' | 'MOCK_HILL_WEATHER';
  fetchedAt: string;
}

export interface SimulatorState {
  isRunning: boolean;
  intervalSeconds: number;
  activeNodeId: string;
  currentValues: {
    nodeId: string;
    source: string;
    status: 'ONLINE' | 'OFFLINE';
    sensors: TelemetrySensors;
    battery: { percentage: number; voltage: number };
    location: Coordinate;
  };
}

export interface AuditLog {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress: string;
  createdAt: string;
}
