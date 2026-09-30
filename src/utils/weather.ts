/**
 * Live Weather Service for Lumina
 * Integrates directly with real-time weather feeds (Open-Meteo & Geolocation)
 * Generates tailored neurodivergent sensory comfort recommendations.
 * Non-editable, automatically synced.
 */

export interface LiveWeatherData {
  condition: string;
  tempF: number;
  tempDisplay: string;
  emoji: string;
  bgGradient: string;
  sensoryTip: string;
  locationName: string;
  isLive: boolean;
  lastUpdated: string;
  windMph: number;
}

// Approximate coordinates based on common timezones as instant offline fallbacks
const TIMEZONE_COORDINATES: Record<string, { lat: number; lon: number; city: string }> = {
  'America/New_York': { lat: 40.71, lon: -74.01, city: 'New York' },
  'America/Chicago': { lat: 41.88, lon: -87.63, city: 'Chicago' },
  'America/Denver': { lat: 39.74, lon: -104.99, city: 'Denver' },
  'America/Los_Angeles': { lat: 34.05, lon: -118.24, city: 'Los Angeles' },
  'America/Phoenix': { lat: 33.45, lon: -112.07, city: 'Phoenix' },
  'America/Toronto': { lat: 43.65, lon: -79.38, city: 'Toronto' },
  'Europe/London': { lat: 51.51, lon: -0.13, city: 'London' },
  'Europe/Paris': { lat: 48.86, lon: 2.35, city: 'Paris' },
  'Europe/Berlin': { lat: 52.52, lon: 13.40, city: 'Berlin' },
  'Asia/Tokyo': { lat: 35.68, lon: 139.69, city: 'Tokyo' },
  'Australia/Sydney': { lat: -33.87, lon: 151.21, city: 'Sydney' },
};

function getFallbackCoordinates(): { lat: number; lon: number; city: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_COORDINATES[tz]) {
      return TIMEZONE_COORDINATES[tz];
    }
    const cleanCity = tz.split('/')[1]?.replace(/_/g, ' ') || 'Local';
    return { lat: 40.71, lon: -74.01, city: cleanCity };
  } catch (e) {
    return { lat: 40.71, lon: -74.01, city: 'Local Area' };
  }
}

function parseWmoCode(code: number): { condition: string; emoji: string; bgGradient: string } {
  if (code === 0) {
    return { condition: 'Sunny & Clear', emoji: '☀️', bgGradient: 'from-amber-100/80 via-yellow-50 to-orange-50' };
  }
  if (code === 1 || code === 2) {
    return { condition: 'Partly Cloudy', emoji: '⛅', bgGradient: 'from-sky-100/80 via-slate-50 to-indigo-50' };
  }
  if (code === 3) {
    return { condition: 'Overcast & Soft Daylight', emoji: '☁️', bgGradient: 'from-slate-100 via-sky-50 to-indigo-50' };
  }
  if (code === 45 || code === 48) {
    return { condition: 'Foggy & Gentle Quiet', emoji: '🌫️', bgGradient: 'from-slate-100 via-teal-50 to-sky-50' };
  }
  if (code >= 51 && code <= 57) {
    return { condition: 'Cozy Light Drizzle', emoji: '🌦️', bgGradient: 'from-teal-100/80 via-sky-50 to-cyan-50' };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { condition: 'Rain Showers', emoji: '🌧️', bgGradient: 'from-indigo-100/80 via-sky-50 to-slate-50' };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { condition: 'Snow & Quiet Flurries', emoji: '❄️', bgGradient: 'from-cyan-100/80 via-white to-sky-100' };
  }
  if (code >= 95) {
    return { condition: 'Thunderstorm (Stay Safe)', emoji: '🌩️', bgGradient: 'from-purple-100/80 via-slate-100 to-indigo-100' };
  }
  return { condition: 'Mild & Calm', emoji: '🌤️', bgGradient: 'from-amber-50 via-sky-50 to-indigo-50' };
}

function getSensoryTip(tempF: number, code: number, windMph: number): string {
  if (code >= 95) {
    return 'Loud sounds outside. Ear defenders or cozy noise-cancelling headphones will help you feel calm inside.';
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'Wet ground and tapping rain sounds. Waterproof boots and a comfortable rain hood will keep you dry.';
  }
  if (code >= 71 && code <= 77) {
    return 'Very cold outside! Soft knit gloves, a warm insulated jacket, and your softest fleece layers.';
  }
  if (tempF >= 84) {
    return 'Hot & bright today! Wear loose breathable cotton, drink extra cool water, and seek shade during play.';
  }
  if (tempF <= 45) {
    return 'Brisk & cold! A warm zip coat and soft layers will protect your skin from chilly air.';
  }
  if (windMph >= 14) {
    return 'Windy breeze outside. A snug-fitting jacket or beanie will prevent annoying flapping sensations.';
  }
  if (code === 0) {
    return 'Bright natural sunlight! A brimmed cap or sunglasses can help reduce visual glare and eye strain.';
  }
  return 'Comfortable daylight and mild temperature. Your favorite cozy hoodie or comfortable tee will feel great.';
}

export const DEFAULT_WEATHER_DATA: LiveWeatherData = {
  condition: 'Sunny & Pleasant',
  tempF: 72,
  tempDisplay: '72°F • Mild',
  emoji: '☀️',
  bgGradient: 'from-amber-100/80 via-yellow-50 to-orange-50',
  sensoryTip: 'Bright natural daylight! A cap or sunglasses can help your eyes feel calm.',
  locationName: 'Local Weather',
  isLive: false,
  lastUpdated: 'Synchronizing...',
  windMph: 5,
};

const WEATHER_CACHE_KEY = 'lumina_live_weather_cache';

export async function fetchLiveWeather(): Promise<LiveWeatherData> {
  // First, check if cached weather is less than 30 minutes old
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {}

  let lat = 40.71;
  let lon = -74.01;
  let city = 'Local Weather';

  // 1. Try to get geolocation from browser
  const coordsPromise = new Promise<{ lat: number; lon: number; city?: string }>((resolve) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          const fallback = getFallbackCoordinates();
          resolve(fallback);
        },
        { timeout: 4000 }
      );
    } else {
      resolve(getFallbackCoordinates());
    }
  });

  const coords = await coordsPromise;
  lat = coords.lat;
  lon = coords.lon;
  if (coords.city) city = coords.city;

  // 2. Fetch live data from Open-Meteo
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API request failed');
    const json = await res.json();

    const tempF = Math.round(json.current?.temperature_2m ?? 70);
    const code = json.current?.weather_code ?? 0;
    const windMph = Math.round(json.current?.wind_speed_10m ?? 5);

    const { condition, emoji, bgGradient } = parseWmoCode(code);
    const sensoryTip = getSensoryTip(tempF, code, windMph);

    let tempDesc = 'Comfortable';
    if (tempF >= 82) tempDesc = 'Warm';
    else if (tempF >= 68) tempDesc = 'Mild';
    else if (tempF >= 55) tempDesc = 'Cool';
    else if (tempF < 45) tempDesc = 'Cold';

    const liveData: LiveWeatherData = {
      condition,
      tempF,
      tempDisplay: `${tempF}°F • ${tempDesc}`,
      emoji,
      bgGradient,
      sensoryTip,
      locationName: city,
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      windMph,
    };

    // Cache locally
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: liveData }));
    } catch (e) {}

    return liveData;
  } catch (err) {
    // If offline or fetch failed, return cached or fallback
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (e) {}

    return {
      ...DEFAULT_WEATHER_DATA,
      locationName: city,
      lastUpdated: 'Offline mode',
    };
  }
}
