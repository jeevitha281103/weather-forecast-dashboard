import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sun, Moon, Search, MapPin, Loader2, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { weatherApi } from './services/weatherApi';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetailsGrid from './components/WeatherDetailsGrid';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import ApiKeyModal from './components/ApiKeyModal';
import ThemeToggle from './components/ThemeToggle';
import WeatherBackground from './components/WeatherBackground';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [unit, setUnit] = useState(() => localStorage.getItem('unit') || 'metric');
  const [searchHistory, setSearchHistory] = useState(() => weatherApi.getSearchHistory());
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState(() => localStorage.getItem('last_city') || '');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('unit', unit);
  }, [unit]);

  const apiKey = weatherApi.getApiKey();
  const needsApiKey = !apiKey;

  const fetchWeather = useCallback(async (city, coords = null) => {
    if (needsApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (coords) {
        result = await weatherApi.getWeatherByCoords(coords.lat, coords.lon, unit);
      } else {
        result = await weatherApi.getWeatherByCity(city, unit);
      }

      if (result.error) {
        setError(result.error);
        setWeatherData(null);
      } else {
        const processed = weatherApi.processForecastData(result.forecast, result.current.timezone_offset, unit);
        setWeatherData({
          current: result.current,
          location: result.location || { name: city },
          timezoneOffset: result.current.timezone_offset,
          ...processed,
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
  }, [unit, needsApiKey]);

  useEffect(() => {
    if (needsApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(null, { lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => fetchWeather('New York'),
        { timeout: 10000 }
      );
    } else {
      fetchWeather('New York');
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
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  const handleRetry = useCallback(() => {
    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity);
    }
  }, [fetchWeather, lastSearchedCity]);

  const handleUnitChange = useCallback((newUnit) => {
    setUnit(newUnit);
    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity);
    }
  }, [fetchWeather, lastSearchedCity]);

  const handleApiKeySave = useCallback((key) => {
    weatherApi.setApiKey(key);
    setShowApiKeyModal(false);
    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity);
    }
  }, [fetchWeather, lastSearchedCity]);

  const backgroundType = useMemo(() => {
    if (!weatherData?.current?.weather?.[0]?.id) return 'clear';
    const isDay = weatherData.current.dt > weatherData.current.sys.sunrise && 
                  weatherData.current.dt < weatherData.current.sys.sunset;
    return weatherApi.getWeatherBackground(weatherData.current.weather[0].id, isDay);
  }, [weatherData]);

  const isDaytime = useMemo(() => {
    if (!weatherData?.current) return true;
    return weatherData.current.dt > weatherData.current.sys.sunrise && 
           weatherData.current.dt < weatherData.current.sys.sunset;
  }, [weatherData]);

  return (
    <div className="app" data-theme={theme} data-weather={backgroundType}>
      <WeatherBackground weatherId={weatherData?.current?.weather?.[0]?.id} isDay={isDaytime} />
      
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Weather Forecast Dashboard</h1>
          <div className="header-actions">
            <ThemeToggle theme={theme} onChange={setTheme} />
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
          <SearchBar
            onSearch={handleSearch}
            onGeolocation={handleGeolocation}
            history={searchHistory}
            loading={loading}
            disabled={needsApiKey}
            placeholder={needsApiKey ? 'Enter API key in settings first' : 'Search for a city...'}
          />

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

          {weatherData && (
            <div className="weather-content">
              <CurrentWeather
                current={weatherData.current}
                location={weatherData.location}
                unit={unit}
                isDay={isDaytime}
              />
              
              <WeatherDetailsGrid
                current={weatherData.current}
                unit={unit}
                timezoneOffset={weatherData.timezoneOffset}
              />
              
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

          {!weatherData && !loading && !error && (
            <div className="empty-state">
              <Search size={64} className="empty-icon" />
              <h2>No Weather Data</h2>
              <p>Search for a city or use your location to get started</p>
            </div>
          )}
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

      <style jsx global>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .app-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }
        
        .app-title {
          font-family: var(--font-primary);
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .icon-btn:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }
        
        .weather-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeInUp 0.5s var(--transition-bounce);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem;
          color: var(--color-text-muted);
        }
        
        .empty-icon {
          margin-bottom: 1rem;
          opacity: 0.4;
        }
        
        .empty-state h2 {
          font-family: var(--font-primary);
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        
        .app-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }
        
        .app-footer a {
          color: var(--color-primary);
          text-decoration: none;
        }
        
        .app-footer a:hover {
          text-decoration: underline;
        }
        
        .footer-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .footer-hint kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }
        
        @media (max-width: 640px) {
          .app-container {
            padding: 1rem;
          }
          
          .app-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .app-footer {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;