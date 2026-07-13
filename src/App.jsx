import { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings } from 'lucide-react';
import { weatherApi } from './services/weatherApi';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetailsGrid from './components/WeatherDetailsGrid';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import ApiKeyModal from './components/ApiKeyModal';
import WeatherBackground from './components/WeatherBackground';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import './App.css';

function App() {
  const [searchHistory, setSearchHistory] = useState(() => weatherApi.getSearchHistory());
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState(() => localStorage.getItem('last_city') || '');
  const [hasSearched, setHasSearched] = useState(false);

  const apiKey = weatherApi.getApiKey();
  const needsApiKey = !apiKey;

  const unit = 'metric';

  const fetchWeather = useCallback(async (city, coords = null, isUserAction = true) => {
    if (needsApiKey) {
      setShowApiKeyModal(true);
      return;
    }

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

        let daily = processed.daily;

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
          daily,
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
  }, [needsApiKey]);

  useEffect(() => {
    if (needsApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    // Only auto-load if user has previously searched (has lastSearchedCity)
    // and hasn't explicitly searched in this session
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

  const handleApiKeySave = useCallback((key) => {
    weatherApi.setApiKey(key);
    setShowApiKeyModal(false);
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
          <div className="header-actions">
            {!needsApiKey && (
              <button 
                className="icon-btn" 
                onClick={() => setShowApiKeyModal(true)}
                aria-label="API Settings"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </header>

        <main className="app-main">
          <div className="main-content">
            <SearchBar
              onSearch={handleSearch}
              onGeolocation={handleGeolocation}
              history={searchHistory}
              loading={loading}
              disabled={needsApiKey}
              placeholder={needsApiKey ? 'Enter API key in settings first' : 'Search for a city...'}
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
          <p className="footer-hint">Press <kbd>/</kbd> to focus search</p>
        </footer>
      </div>

      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSave={handleApiKeySave}
          currentKey={apiKey}
        />
      )}
    </div>
  );
}

export default App;