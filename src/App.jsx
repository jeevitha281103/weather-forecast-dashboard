import { useState, useEffect, useCallback, useMemo } from 'react';
import { weatherApi } from './services/weatherApi';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetailsGrid from './components/WeatherDetailsGrid';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherBackground from './components/WeatherBackground';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import './App.css';

function App() {
  const [searchHistory, setSearchHistory] = useState(() => weatherApi.getSearchHistory());
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchedCity, setLastSearchedCity] = useState(() => localStorage.getItem('last_city') || '');
  const [hasSearched, setHasSearched] = useState(false);

  const unit = 'metric';

  const fetchWeather = useCallback(async (city, coords = null, isUserAction = true) => {
    if (isUserAction) {
      setHasSearched(true);
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (coords) {
        result = await weatherApi.getWeatherByCoords(coords.lat, coords.lon);
      } else {
        result = await weatherApi.getWeatherByCity(city);
      }

      if (result.error) {
        setError(result.error);
        setWeatherData(null);
      } else {
        const tzOffset = result.current.timezone;
        const processed = weatherApi.processForecastData(result.forecast, tzOffset);

        const currentData = { ...result.current };

        const weatherId = result.current.weather?.[0]?.id || 800;
        const now = new Date();
        const utcHour = now.getUTCHours();
        const hourFactor = 1 - Math.abs(utcHour - 12) / 6;
        const cloudFactor = result.current.clouds?.all != null ? 1 - result.current.clouds.all / 200 : 0.8;
        let baseUv = 3;
        if (result.current.coord) {
          const lat = Math.abs(result.current.coord.lat);
          baseUv = lat < 25 ? 8 : lat < 35 ? 6 : lat < 50 ? 4 : 2;
        }
        if (weatherId >= 500 && weatherId < 600) baseUv *= 0.3;
        else if (weatherId >= 300 && weatherId < 500) baseUv *= 0.5;
        else if (weatherId > 800) baseUv *= 0.6;
        currentData.uvi = Math.max(0, Math.round(baseUv * Math.max(hourFactor, 0.15) * Math.max(cloudFactor, 0.3) * 10) / 10);

        setWeatherData({
          current: currentData,
          location: result.location || { name: city },
          timezoneOffset: tzOffset,
          hourly: processed.hourly,
          daily: processed.daily,
        });
        if (city) {
          const newHistory = weatherApi.saveSearchHistory(city);
          setSearchHistory(newHistory);
          setLastSearchedCity(city);
          localStorage.setItem('last_city', city);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lastSearchedCity && !hasSearched) {
      fetchWeather(lastSearchedCity, null, false);
    }
  }, []);

  const handleSearch = useCallback((city) => {
    fetchWeather(city);
  }, [fetchWeather]);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(null, { lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => { setError(err.message); setLoading(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  const handleRetry = useCallback(() => {
    if (lastSearchedCity) fetchWeather(lastSearchedCity);
  }, [fetchWeather, lastSearchedCity]);

  const backgroundType = useMemo(() => {
    if (!weatherData?.current?.weather?.[0]?.id) return 'clear';
    const now = Math.floor(Date.now() / 1000);
    const isDay = now >= weatherData.current.sys.sunrise && now < weatherData.current.sys.sunset;
    return weatherApi.getWeatherBackground(weatherData.current.weather[0].id, isDay);
  }, [weatherData]);

  return (
    <div className="app" data-weather={backgroundType}>
      <WeatherBackground
        type={backgroundType}
        isDay={weatherData?.current ? (Math.floor(Date.now() / 1000) >= weatherData.current.sys.sunrise && Math.floor(Date.now() / 1000) < weatherData.current.sys.sunset) : true}
      />

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Weather Forecast Dashboard</h1>
        </header>

        <main className="app-main">
          <div className="main-content">
            <SearchBar
              onSearch={handleSearch}
              onGeolocation={handleGeolocation}
              history={searchHistory}
              loading={loading}
              placeholder="Search for a city..."
            />

            {hasSearched && weatherData && (
              <div className="location-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink: 0}}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="location-city">{weatherData.location?.name || lastSearchedCity}</span>
                {weatherData.location?.country && (
                  <span className="location-country">{weatherData.location.country}</span>
                )}
              </div>
            )}

            {error && (
              <ErrorDisplay
                message={error}
                onRetry={handleRetry}
                onDismiss={() => setError(null)}
              />
            )}

            {loading && !weatherData && (
              <LoadingSpinner size="large" message="Fetching weather data..." />
            )}

            {hasSearched && weatherData && (
              <div className="weather-content">
                <CurrentWeather
                  data={weatherData.current}
                  unit={unit}
                  timezoneOffset={weatherData.timezoneOffset}
                />

                <div className="weather-details-grid">
                  <WeatherDetailsGrid
                    current={weatherData.current}
                    unit={unit}
                    timezoneOffset={weatherData.timezoneOffset}
                  />
                </div>

                <HourlyForecast
                  hourly={weatherData.hourly}
                  unit={unit}
                  timezoneOffset={weatherData.timezoneOffset}
                />

                <DailyForecast
                  daily={weatherData.daily}
                  unit={unit}
                  timezoneOffset={weatherData.timezoneOffset}
                />
              </div>
            )}

          </div>
        </main>

        <footer className="app-footer">
          <p>Data provided by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></p>
          <div className="social-links">
            <a href="https://github.com/jeevitha281103" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="mailto:jeevitharaja2811@gmail.com" aria-label="Email" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
