/**
 * Live Geospatial & Meteorological Data Service
 * Integrates real public APIs for live weather, barometric pressure, and SRTM digital elevation models.
 * Includes graceful timeout, error recovery, and clear provenance labeling.
 */

export interface LiveAtmosphericData {
  surfacePressureHpa: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  timestamp: string;
  source: 'Open-Meteo Live API' | 'Calibrated Disaster Baseline';
  isLive: boolean;
}

export interface LiveElevationData {
  nodeId: string;
  name: string;
  coordinates: [number, number];
  elevationMeters: number;
  source: 'Open-Meteo / SRTM 30m DEM' | 'Survey of India Baseline';
  isLive: boolean;
}

/**
 * Fetches real-time atmospheric pressure and 10m wind speeds from Open-Meteo API
 * (CORS-friendly, no API key required, public NOAA/ECMWF data pipeline)
 */
export async function fetchLiveAtmosphericTelemetry(
  lat: number,
  lng: number,
  fallbackPressure: number = 942,
  fallbackWind: number = 195
): Promise<LiveAtmosphericData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&current=surface_pressure,wind_speed_10m,wind_gusts_10m`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.current) {
      return {
        surfacePressureHpa: Math.round(data.current.surface_pressure || fallbackPressure),
        windSpeedKmh: Math.round(data.current.wind_speed_10m || fallbackWind),
        windGustsKmh: Math.round(data.current.wind_gusts_10m || fallbackWind * 1.25),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'Open-Meteo Live API',
        isLive: true,
      };
    }
    throw new Error('Malformed current weather payload');
  } catch (err) {
    // Graceful fallback to calibrated disaster baseline
    return {
      surfacePressureHpa: fallbackPressure,
      windSpeedKmh: fallbackWind,
      windGustsKmh: Math.round(fallbackWind * 1.2),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Calibrated Disaster Baseline',
      isLive: false,
    };
  }
}

/**
 * Fetches verified digital ground elevation (SRTM 30m / Copernicus DEM)
 * for a list of coordinates using Open-Meteo Elevation API
 */
export async function fetchLiveElevations(
  nodes: { id: string; name: string; coordinates: [number, number]; defaultElevation: number }[]
): Promise<LiveElevationData[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const lats = nodes.map((n) => n.coordinates[0].toFixed(4)).join(',');
    const lngs = nodes.map((n) => n.coordinates[1].toFixed(4)).join(',');
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Elevation API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.elevation) && data.elevation.length === nodes.length) {
      return nodes.map((node, idx) => ({
        nodeId: node.id,
        name: node.name,
        coordinates: node.coordinates,
        elevationMeters: Math.max(0.5, Number(data.elevation[idx].toFixed(1))),
        source: 'Open-Meteo / SRTM 30m DEM',
        isLive: true,
      }));
    }
    throw new Error('Elevation array mismatch');
  } catch (err) {
    // Return baseline values
    return nodes.map((node) => ({
      nodeId: node.id,
      name: node.name,
      coordinates: node.coordinates,
      elevationMeters: node.defaultElevation,
      source: 'Survey of India Baseline',
      isLive: false,
    }));
  }
}
