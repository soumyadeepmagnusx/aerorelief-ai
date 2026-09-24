export type CycloneCategory = 'Cat 1' | 'Cat 2' | 'Cat 3' | 'Cat 4' | 'Cat 5';

export interface TelemetryData {
  cycloneName: string;
  category: CycloneCategory;
  windSpeedKmh: number;
  centralPressureHpa: number;
  surgeHeightMeters: number;
  landfallETA: string;
  movementVector: string;
  affectedPopulation: number;
  goldenHourRemaining: string;
}

export type InfrastructureType = 'hospital' | 'substation' | 'shelter' | 'relief_hub' | 'bridge';

export type OperationalStatus = 'operational' | 'warning' | 'critical' | 'submerged';

export interface InfrastructureNode {
  id: string;
  name: string;
  type: InfrastructureType;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  capacity?: number;
  occupancy?: number;
  generatorFuelHours?: number;
  backupPowerStatus?: string;
  status: OperationalStatus;
  statusDetails: string;
  waterDepthMeters: number;
  contactChannel: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  baseElevationMeters: number;
  lengthKm: number;
  isSevered: boolean;
  waterDepthMeters: number;
  speedLimitKmh: number;
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  estimatedMinutes: number;
  path: [number, number][];
  isPassable: boolean;
  minElevationMeters: number;
  maxFloodDepthMeters: number;
  severedSegmentNames: string[];
  recommendedVehicles: string;
  waypoints: string[];
}

export interface DamageAssessment {
  id: string;
  title: string;
  locationName: string;
  coordinates: [number, number];
  imageUrl: string;
  timestamp: string;
  damageGrade: 'P1 - Catastrophic' | 'P2 - Moderate' | 'P3 - Minor';
  floodDepthEst: string;
  structuralFailurePct: number;
  casualtyRisk: 'Extremely High' | 'Moderate' | 'Low';
  observations: string[];
  recommendedAction: string;
  requiredUnits: string[];
}

export interface DroneFeedItem {
  id: string;
  name: string;
  area: string;
  batteryPct: number;
  altitudeM: number;
  previewUrl: string;
  status: 'Surveillance Active' | 'Signal Degraded' | 'Returning to Base';
}

export interface PowerGridLine {
  id: string;
  name: string;
  voltageKv: number;
  fromNodeId: string;
  toNodeId: string;
  path: [number, number][];
  isEnergized: boolean;
  currentLoadMw: number;
  maxCapacityMw: number;
  failureReason?: string;
}

export interface SOSBeacon {
  id: string;
  senderName: string;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  personsCount: number;
  waterDepthMeters: number;
  situation: string;
  urgency: 'CRITICAL_IMMEDIATE' | 'HIGH_PRIORITY' | 'MONITORED';
  dronePayloadAssigned?: string;
  isResolved: boolean;
}

export interface SatelliteComparisonScenario {
  id: string;
  title: string;
  location: string;
  preImageUrl: string;
  postImageUrl: string;
  preDate: string;
  postDate: string;
  inundatedSqKm: number;
  severedStructuresCount: number;
  description: string;
}
