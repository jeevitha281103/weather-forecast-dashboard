import { 
  Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, 
  CloudSnow, Wind, Droplets, Thermometer, Droplet, 
  Gauge, Eye, Sunrise, Sunset, Compass, Calendar,
  ChevronLeft, ChevronRight, Search, MapPin, 
  History, X, Settings, RefreshCw, AlertCircle,
  Loader2, CloudFog, Umbrella, SunMedium, CloudSun,
  CloudSunRain, Snowflake, Tornado, Waves
} from 'lucide-react';

const weatherIcons = {
  clear: { day: Sun, night: Sun },
  clouds: { day: CloudSun, night: Cloud },
  rain: { day: CloudSunRain, night: CloudRain },
  drizzle: { day: CloudDrizzle, night: CloudDrizzle },
  thunderstorm: { day: CloudLightning, night: CloudLightning },
  snow: { day: Snowflake, night: Snowflake },
  mist: { day: CloudFog, night: CloudFog },
  fog: { day: CloudFog, night: CloudFog },
  haze: { day: CloudFog, night: CloudFog },
  dust: { day: CloudFog, night: CloudFog },
  sand: { day: CloudFog, night: CloudFog },
  ash: { day: CloudFog, night: CloudFog },
  squall: { day: Wind, night: Wind },
  tornado: { day: Tornado, night: Tornado },
  wind: { day: Wind, night: Wind },
};

function getWeatherIcon(weatherId, isDay) {
  if (weatherId >= 200 && weatherId < 300) return weatherIcons.thunderstorm[isDay ? 'day' : 'night'];
  if (weatherId >= 300 && weatherId < 400) return weatherIcons.drizzle[isDay ? 'day' : 'night'];
  if (weatherId >= 500 && weatherId < 600) return weatherIcons.rain[isDay ? 'day' : 'night'];
  if (weatherId >= 600 && weatherId < 700) return weatherIcons.snow[isDay ? 'day' : 'night'];
  if (weatherId >= 700 && weatherId < 800) return weatherIcons.mist[isDay ? 'day' : 'night'];
  if (weatherId === 800) return weatherIcons.clear[isDay ? 'day' : 'night'];
  if (weatherId > 800) return weatherIcons.clouds[isDay ? 'day' : 'night'];
  return weatherIcons.clear[isDay ? 'day' : 'night'];
}

function getWeatherBackground(weatherId, isDay) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return isDay ? 'clear' : 'clear';
  if (weatherId > 800) return 'clouds';
  return 'clear';
}

function getWeatherLabel(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'Thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'Drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'Rain';
  if (weatherId >= 600 && weatherId < 700) return 'Snow';
  if (weatherId >= 700 && weatherId < 800) return 'Mist';
  if (weatherId === 800) return 'Clear Sky';
  if (weatherId > 800) return 'Cloudy';
  return 'Unknown';
}

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

function formatTime(timestamp, timezoneOffset, options = {}) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
    ...options 
  });
}

function formatDate(timestamp, timezoneOffset, options = {}) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC',
    ...options 
  });
}

function formatDay(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    timeZone: 'UTC' 
  });
}

function convertTemp(kelvin, unit) {
  if (unit === 'imperial') return Math.round((kelvin - 273.15) * 9/5 + 32);
  return Math.round(kelvin - 273.15);
}

function convertSpeed(ms, unit) {
  if (unit === 'imperial') return Math.round(ms * 2.237);
  return Math.round(ms * 3.6);
}

function getPressure(hpa) {
  return Math.round(hpa);
}

function getVisibility(meters) {
  return Math.round(meters / 1000);
}

function getUVIndexColor(uvi) {
  if (uvi <= 2) return 'var(--color-success)';
  if (uvi <= 5) return 'var(--color-accent)';
  if (uvi <= 7) return '#f97316';
  if (uvi <= 10) return 'var(--color-danger)';
  return 'var(--color-purple)';
}

const API_BASE = 'https://api.openweathermap.org/data/2.5';

let apiKey = null;

function setApiKey(key) {
  apiKey = key;
}

function getApiKey() {
  return apiKey || import.meta.env.VITE_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key');
}

function saveApiKey(key) {
  localStorage.setItem('openweather_api_key', key);
  apiKey = key;
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function geocodeCity(city) {
  const key = getApiKey();
  if (!key) throw new Error('API key not configured');
  
  const url = `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${key}`;
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'City not found' }));
    throw new Error(error.message || 'City not found');
  }
  
  const data = await response.json();
  return { 
    lat: data.coord.lat, 
    lon: data.coord.lon, 
    name: data.name, 
    country: data.sys.country 
  };
}

async function reverseGeocode(lat, lon) {
  const key = getApiKey();
  if (!key) throw new Error('API key not configured');
  
  const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    throw new Error('Location not found');
  }
  
  const data = await response.json();
  return { 
    lat: data.coord.lat, 
    lon: data.coord.lon, 
    name: data.name, 
    country: data.sys.country 
  };
}

async function fetchCurrentWeather(lat, lon) {
  const key = getApiKey();
  if (!key) throw new Error('API key not configured');
  
  const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch weather' }));
    throw new Error(error.message || 'Failed to fetch weather');
  }
  
  return response.json();
}

async function fetchForecast(lat, lon) {
  const key = getApiKey();
  if (!key) throw new Error('API key not configured');
  
  const url = `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch forecast' }));
    throw new Error(error.message || 'Failed to fetch forecast');
  }
  
  return response.json();
}

function processForecastData(forecastData, timezoneOffset) {
  const hourly = forecastData.list.slice(0, 24).map(item => ({
    dt: item.dt,
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    weather: item.weather[0],
    pop: item.pop,
    wind_speed: item.wind.speed,
    wind_deg: item.wind.deg,
    humidity: item.main.humidity,
  }));

  const dailyMap = new Map();
  forecastData.list.forEach(item => {
    const date = new Date((item.dt + timezoneOffset) * 1000).toDateString();
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        dt: item.dt,
        temps: [],
        weather: [],
        pops: [],
        wind_speeds: [],
        humidities: [],
      });
    }
    const day = dailyMap.get(date);
    day.temps.push(item.main.temp);
    day.weather.push(item.weather[0]);
    day.pops.push(item.pop);
    day.wind_speeds.push(item.wind.speed);
    day.humidities.push(item.main.humidity);
  });

  const daily = Array.from(dailyMap.entries()).slice(0, 5).map(([date, data]) => ({
    dt: data.dt,
    temp_min: Math.min(...data.temps),
    temp_max: Math.max(...data.temps),
    weather: data.weather.reduce((a, b) => a.id < b.id ? a : b),
    pop: Math.max(...data.pops),
    wind_speed: Math.max(...data.wind_speeds),
    humidity: Math.round(data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length),
  }));

  return { hourly, daily };
}

function needsApiKey() {
  return !getApiKey();
}

export const weatherApi = {
  setApiKey,
  getApiKey,
  saveApiKey,
  geocodeCity,
  reverseGeocode,
  fetchCurrentWeather,
  fetchForecast,
  processForecastData,
  needsApiKey,
  getWeatherIcon,
  getWeatherBackground,
  getWeatherLabel,
  getWindDirection,
  formatTime,
  formatDate,
  formatDay,
  convertTemp,
  convertSpeed,
  getPressure,
  getVisibility,
  getUVIndexColor,
  API_BASE,
};

export default weatherApi;