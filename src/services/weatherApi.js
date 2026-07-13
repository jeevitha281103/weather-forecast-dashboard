const API_KEY_LS_KEY = 'openweather_api_key';
const API_BASE = 'https://api.openweathermap.org/data/2.5';

const fetchWithTimeout = async (url, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

function getWeatherBackground(weatherId, isDay = true) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return isDay ? 'clear' : 'clear';
  if (weatherId === 801) return isDay ? 'clouds' : 'clouds';
  if (weatherId > 801) return 'clouds';
  return 'clear';
}

export const weatherApi = {
  getApiKey() {
    return import.meta.env.VITE_OPENWEATHER_API_KEY || localStorage.getItem(API_KEY_LS_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(API_KEY_LS_KEY, key);
  },

  getSearchHistory() {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  },

  saveSearchHistory(city) {
    const history = this.getSearchHistory();
    const updated = [city, ...history.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(updated));
    return updated;
  },

  getWeatherBackground,

  async getWeatherByCity(city) {
    const key = this.getApiKey();
    if (!key) throw new Error('API key required');

    const currentRes = await fetchWithTimeout(
      `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${key}`
    );

    if (!currentRes.ok) {
      if (currentRes.status === 404) throw new Error(`City "${city}" not found. Check the spelling and try again.`);
      if (currentRes.status === 401) throw new Error('Invalid API key. Please check your API key in settings.');
      throw new Error(`Weather service error (${currentRes.status}). Please try again later.`);
    }

    const current = await currentRes.json();
    const forecastRes = await fetchWithTimeout(
      `${API_BASE}/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${key}`
    );
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    return {
      current,
      forecast,
      location: { name: current.name, country: current.sys.country, lat: current.coord.lat, lon: current.coord.lon }
    };
  },

  async getWeatherByCoords(lat, lon) {
    const key = this.getApiKey();
    if (!key) throw new Error('API key required');

    const currentRes = await fetchWithTimeout(
      `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${key}`
    );
    if (!currentRes.ok) throw new Error('Failed to fetch weather data');
    const current = await currentRes.json();

    const forecastRes = await fetchWithTimeout(
      `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${key}`
    );
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    return {
      current,
      forecast,
      location: { name: current.name, country: current.sys.country, lat, lon }
    };
  },

  processForecastData(forecast, timezoneOffset) {
    if (!forecast?.list) return { hourly: [], daily: [] };

    const dailyMap = new Map();

    forecast.list.forEach((item) => {
      const utcMs = item.dt * 1000;
      const localDate = new Date(utcMs + timezoneOffset * 1000);
      const dateKey = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

      const weather = item.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky' };

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          dt: item.dt,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          wind_deg: item.wind.deg,
          pop: item.pop || 0,
          weather: { id: weather.id, main: weather.main, description: weather.description },
          count: 1
        });
      } else {
        const day = dailyMap.get(dateKey);
        day.temp_min = Math.min(day.temp_min, item.main.temp_min);
        day.temp_max = Math.max(day.temp_max, item.main.temp_max);
        day.humidity = Math.round((day.humidity * day.count + item.main.humidity) / (day.count + 1));
        day.wind_speed = (day.wind_speed * day.count + item.wind.speed) / (day.count + 1);
        day.pop = Math.max(day.pop, item.pop || 0);
        day.count++;
      }
    });

    const daily = Array.from(dailyMap.values()).map(d => ({
      dt: d.dt,
      temp_min: d.temp_min,
      temp_max: d.temp_max,
      humidity: d.humidity,
      wind_speed: d.wind_speed,
      wind_deg: d.wind_deg,
      pop: d.pop,
      weather: d.weather
    }));

    const hourly = forecast.list.slice(0, 24).map(item => {
      const weather = item.weather?.[0] || { id: 800, main: 'Clear', description: 'clear sky' };
      return {
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        pop: item.pop || 0,
        weather: { id: weather.id, main: weather.main, description: weather.description }
      };
    });

    return { hourly, daily };
  },


};

export default weatherApi;
