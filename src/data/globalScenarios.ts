export interface GlobalDisasterScenario {
  id: string;
  name: string;
  badge: string;
  theater: string;
  category: 'Cat 4' | 'Cat 5';
  windSpeedKmh: number;
  pressureHpa: number;
  defaultSurgeM: number;
  affectedPopulation: number;
  landfallETA: string;
  centerCoordinates: [number, number];
  zoom: number;
  description: string;
}

export const GLOBAL_SCENARIOS: GlobalDisasterScenario[] = [
  {
    id: 'scen-bob-amrit',
    name: 'Super Cyclone AMRIT',
    badge: '🇮🇳 Bay of Bengal Theater',
    theater: 'Puri - Paradip - Kendrapara Coastal Corridor (India)',
    category: 'Cat 4',
    windSpeedKmh: 195,
    pressureHpa: 942,
    defaultSurgeM: 3.4,
    affectedPopulation: 1850000,
    landfallETA: 'T+02:45 hrs',
    centerCoordinates: [19.865, 86.02],
    zoom: 11,
    description: 'Active coastal landfall threatening Puri District Hospital and severing 34km Marine Drive corridor.',
  },
  {
    id: 'scen-gulf-milton',
    name: 'Super Hurricane MILTON',
    badge: '🇺🇸 Gulf of Mexico Theater',
    theater: 'Tampa Bay - Sarasota - Barrier Islands (United States)',
    category: 'Cat 5',
    windSpeedKmh: 265,
    pressureHpa: 902,
    defaultSurgeM: 4.2,
    affectedPopulation: 3100000,
    landfallETA: 'T+01:15 hrs',
    centerCoordinates: [27.77, -82.63],
    zoom: 11,
    description: 'Extreme catastrophic surge threatening Sunshine Skyway bridge approaches and regional trauma centers.',
  },
  {
    id: 'scen-pacific-rai',
    name: 'Super Typhoon RAI (ODETTE)',
    badge: '🇵🇭 Pacific Basin Theater',
    theater: 'Siargao Island - Surigao Strait (Philippines)',
    category: 'Cat 5',
    windSpeedKmh: 260,
    pressureHpa: 915,
    defaultSurgeM: 3.8,
    affectedPopulation: 980000,
    landfallETA: 'T+03:30 hrs',
    centerCoordinates: [9.85, 126.05],
    zoom: 11,
    description: 'Violent eyewall landfall with complete island telecom blackout and emergency relief airdrop requirements.',
  },
];
