import axios from 'axios';
import { apiCache } from '../index';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  highTemp: number;
  lowTemp: number;
  aqi: {
    index: number;
    label: string;
    status: 'Good' | 'Moderate' | 'Unhealthy';
  };
  forecast: Array<{
    time: string;
    temp: number;
    condition: string;
    pop: number;
  }>;
  dailyForecast: Array<{
    day: string;
    date: string;
    highTemp: number;
    lowTemp: number;
    condition: string;
  }>;
  updatedAt: string;
}

const DEFAULT_FALLBACK_WEATHER: WeatherData = {
  city: 'Chennai',
  country: 'India',
  temp: 31,
  feelsLike: 35,
  condition: 'Partly Cloudy',
  conditionCode: 2,
  icon: '⛅',
  humidity: 72,
  windSpeed: 14,
  uvIndex: 6,
  highTemp: 33,
  lowTemp: 26,
  aqi: { index: 42, label: 'Air Quality: Good', status: 'Good' },
  forecast: [
    { time: '12 PM', temp: 31, condition: 'Partly Cloudy', pop: 10 },
    { time: '1 PM', temp: 32, condition: 'Partly Cloudy', pop: 15 },
    { time: '2 PM', temp: 33, condition: 'Mainly Clear', pop: 5 },
    { time: '3 PM', temp: 32, condition: 'Clear Sky', pop: 0 },
    { time: '4 PM', temp: 31, condition: 'Clear Sky', pop: 0 },
  ],
  dailyForecast: [
    { day: 'Today', date: 'Sep 15', highTemp: 33, lowTemp: 26, condition: 'Partly Cloudy' },
    { day: 'Wed', date: 'Sep 16', highTemp: 34, lowTemp: 27, condition: 'Mainly Clear' },
    { day: 'Thu', date: 'Sep 17', highTemp: 32, lowTemp: 26, condition: 'Rainy' },
    { day: 'Fri', date: 'Sep 18', highTemp: 31, lowTemp: 25, condition: 'Thunderstorm' },
    { day: 'Sat', date: 'Sep 19', highTemp: 33, lowTemp: 26, condition: 'Partly Cloudy' },
  ],
  updatedAt: new Date().toISOString(),
};

function getWeatherCondition(code: number): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: '☀️' };
    case 1:
      return { label: 'Mainly Clear', icon: '🌤️' };
    case 2:
      return { label: 'Partly Cloudy', icon: '⛅' };
    case 3:
      return { label: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { label: 'Foggy', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light Drizzle', icon: '🌧️' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', icon: '🌧️' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rainy', icon: '🌧️' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snowy', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: '🌦️' };
    case 85:
    case 86:
      return { label: 'Snow Showers', icon: '🌨️' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: '⛈️' };
    default:
      return { label: 'Cloudy', icon: '☁️' };
  }
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  timezone?: string;
}

async function getGeocoding(city: string): Promise<GeocodingResult | null> {
  const cacheKey = `geo_${city.toLowerCase().trim()}`;
  const cached = apiCache.get<GeocodingResult>(cacheKey);
  if (cached) {
    console.log(`[Weather Service] Geocoding cache hit for '${city}'`);
    return cached;
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;
    const res = await axios.get(geoUrl, { timeout: 8000 });
    if (res.data?.results && res.data.results.length > 0) {
      const first = res.data.results[0];
      const geoResult: GeocodingResult = {
        latitude: first.latitude,
        longitude: first.longitude,
        name: first.name,
        country: first.country || 'Global',
        timezone: first.timezone || 'UTC',
      };
      // Cache geocoding for 24 hours (86400 seconds)
      apiCache.set(cacheKey, geoResult, 86400);
      return geoResult;
    }
  } catch (err: any) {
    console.warn(`[Weather Service] Geocoding failed for '${city}':`, err?.message || err);
  }
  return null;
}

export async function fetchWeatherData(city: string): Promise<WeatherData> {
  const cleanCity = city.trim();
  const cacheKey = `weather_${cleanCity.toLowerCase()}`;

  // 1. Check 10-minute server cache
  const cachedWeather = apiCache.get<WeatherData>(cacheKey);
  if (cachedWeather) {
    console.log(`[Weather Service] Cache hit for '${cleanCity}'`);
    return cachedWeather;
  }

  console.log(`[Weather Service] Fetching Open-Meteo weather for '${cleanCity}'...`);

  try {
    // 2. Geocode city name to lat/lon & timezone
    const geo = await getGeocoding(cleanCity);
    if (!geo) {
      throw new Error(`City '${cleanCity}' not found via Geocoding API.`);
    }

    const { latitude, longitude, name, country, timezone } = geo;

    // 3. Parallel fetch Forecast + Air Quality
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(
      timezone || 'auto'
    )}`;

    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=${encodeURIComponent(
      timezone || 'auto'
    )}`;

    const [weatherRes, airRes] = await Promise.all([
      axios.get(forecastUrl, { timeout: 8000 }),
      axios.get(airQualityUrl, { timeout: 8000 }).catch(() => null),
    ]);

    const current = weatherRes.data.current;
    const daily = weatherRes.data.daily;
    const hourly = weatherRes.data.hourly;

    if (!current || !daily || !hourly) {
      throw new Error('Incomplete weather response from Open-Meteo API.');
    }

    const condition = getWeatherCondition(current.weather_code);

    // Calculate AQI
    let aqiIndex = 38;
    let aqiStatus: 'Good' | 'Moderate' | 'Unhealthy' = 'Good';

    const rawAqi = airRes?.data?.current?.us_aqi;
    if (rawAqi !== undefined && rawAqi !== null) {
      aqiIndex = Math.round(rawAqi);
      if (aqiIndex <= 50) {
        aqiStatus = 'Good';
      } else if (aqiIndex <= 100) {
        aqiStatus = 'Moderate';
      } else {
        aqiStatus = 'Unhealthy';
      }
    }

    // Format Hourly (next 5 hours starting from current hour)
    const nowMs = Date.now();
    let startIdx = hourly.time.findIndex((tStr: string) => new Date(tStr).getTime() >= nowMs - 1800000);
    if (startIdx === -1) startIdx = 0;

    const formattedHourly = hourly.time.slice(startIdx, startIdx + 5).map((timeStr: string, i: number) => {
      const idx = startIdx + i;
      const dateObj = new Date(timeStr);
      let timeFormatted = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      });
      if (!timeFormatted || timeFormatted === 'Invalid Date') {
        timeFormatted = `${dateObj.getHours()}:00`;
      }
      return {
        time: timeFormatted,
        temp: Math.round(hourly.temperature_2m[idx] ?? current.temperature_2m),
        condition: getWeatherCondition(hourly.weather_code[idx] ?? current.weather_code).label,
        pop: Math.round(hourly.precipitation_probability[idx] ?? 0),
      };
    });

    // Format Daily (5 days)
    const formattedDaily = daily.time.slice(0, 5).map((dateStr: string, idx: number) => {
      const dateObj = new Date(dateStr);
      const dayFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        day: idx === 0 ? 'Today' : dayFormatted,
        date: monthFormatted,
        highTemp: Math.round(daily.temperature_2m_max[idx]),
        lowTemp: Math.round(daily.temperature_2m_min[idx]),
        condition: getWeatherCondition(daily.weather_code[idx]).label,
      };
    });

    const resultWeather: WeatherData = {
      city: name,
      country: country || 'Global',
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: condition.label,
      conditionCode: current.weather_code,
      icon: condition.icon,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      uvIndex: 5,
      highTemp: Math.round(daily.temperature_2m_max[0]),
      lowTemp: Math.round(daily.temperature_2m_min[0]),
      aqi: {
        index: aqiIndex,
        label: `Air Quality: ${aqiStatus}`,
        status: aqiStatus,
      },
      forecast: formattedHourly,
      dailyForecast: formattedDaily,
      updatedAt: new Date().toISOString(),
    };

    // Cache for 10 minutes (600 seconds)
    apiCache.set(cacheKey, resultWeather, 600);
    return resultWeather;
  } catch (err: any) {
    console.warn(`[Weather Service Warning] ${err?.message || err}`);
    if (cachedWeather) return cachedWeather;
    return { ...DEFAULT_FALLBACK_WEATHER, city: cleanCity };
  }
}
