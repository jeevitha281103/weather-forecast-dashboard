import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Wind, CloudFog, CloudSun, SunMedium } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import WeatherBackground from './WeatherBackground';

const weatherIcons = {
  clear: { day: Sun, night: Moon },
  clouds: { day: CloudSun, night: Cloud },
  rain: { day: CloudRain, night: CloudRain },
  drizzle: { day: CloudDrizzle, night: CloudDrizzle },
  thunderstorm: { day: CloudLightning, night: CloudLightning },
  snow: { day: CloudSnow, night: CloudSnow },
  mist: { day: CloudFog, night: CloudFog },
  fog: { day: CloudFog, night: CloudFog },
  haze: { day: CloudFog, night: CloudFog },
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

function getWeatherDescription(weatherId) {
  const descriptions = {
    200: 'Thunderstorm with light rain',
    201: 'Thunderstorm with rain',
    202: 'Thunderstorm with heavy rain',
    210: 'Light thunderstorm',
    211: 'Thunderstorm',
    212: 'Heavy thunderstorm',
    221: 'Ragged thunderstorm',
    230: 'Thunderstorm with light drizzle',
    231: 'Thunderstorm with drizzle',
    232: 'Thunderstorm with heavy drizzle',
    300: 'Light intensity drizzle',
    301: 'Drizzle',
    302: 'Heavy intensity drizzle',
    310: 'Light intensity drizzle rain',
    311: 'Drizzle rain',
    312: 'Heavy intensity drizzle rain',
    313: 'Shower rain and drizzle',
    314: 'Heavy shower rain and drizzle',
    321: 'Shower drizzle',
    500: 'Light rain',
    501: 'Moderate rain',
    502: 'Heavy intensity rain',
    503: 'Very heavy rain',
    504: 'Extreme rain',
    511: 'Freezing rain',
    520: 'Light intensity shower rain',
    521: 'Shower rain',
    522: 'Heavy intensity shower rain',
    531: 'Ragged shower rain',
    600: 'Light snow',
    601: 'Snow',
    602: 'Heavy snow',
    611: 'Sleet',
    612: 'Light shower sleet',
    613: 'Shower sleet',
    615: 'Light rain and snow',
    616: 'Rain and snow',
    620: 'Light shower snow',
    621: 'Shower snow',
    622: 'Heavy shower snow',
    701: 'Mist',
    711: 'Smoke',
    721: 'Haze',
    731: 'Sand/dust whirls',
    741: 'Fog',
    751: 'Sand',
    761: 'Dust',
    762: 'Volcanic ash',
    771: 'Squalls',
    781: 'Tornado',
    800: 'Clear sky',
    801: 'Few clouds',
    802: 'Scattered clouds',
    803: 'Broken clouds',
    804: 'Overcast clouds',
  };
  return descriptions[weatherId] || 'Unknown';
}

export default function CurrentWeather({ data, unit = 'metric', timezoneOffset = 0 }) {
  const [isDay, setIsDay] = useState(true);
  const [animateIcon, setAnimateIcon] = useState(false);

  useEffect(() => {
    if (!data) return;
    const currentTime = Math.floor(Date.now() / 1000);
    const sunrise = data.sys.sunrise + timezoneOffset;
    const sunset = data.sys.sunset + timezoneOffset;
    setIsDay(currentTime >= sunrise && currentTime < sunset);
    
    setAnimateIcon(false);
    setTimeout(() => setAnimateIcon(true), 100);
  }, [data, timezoneOffset]);

  if (!data) return null;

  const weather = data.weather[0];
  const weatherId = weather.id;
  const main = weather.main;
  const description = weather.description;
  const temp = data.main.temp;
  const feelsLike = data.main.feels_like;
  const tempMin = data.main.temp_min;
  const tempMax = data.main.temp_max;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const windDeg = data.wind.deg;
  const pressure = data.main.pressure;
  const visibility = data.visibility;
  const clouds = data.clouds?.all || 0;
  const sunrise = data.sys.sunrise + timezoneOffset;
  const sunset = data.sys.sunset + timezoneOffset;
  const cityName = data.name || 'Unknown';
  const country = data.sys.country || '';

  const IconComponent = getWeatherIcon(weatherId, isDay);
  const weatherType = getWeatherType(weatherId);

  const formatTemp = (t) => `${Math.round(t)}°${unit === 'metric' ? 'C' : 'F'}`;
  const formatWindSpeed = (speed) => unit === 'metric' ? `${speed} m/s` : `${Math.round(speed * 2.237)} mph`;

  const getWindDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
  };

  return (
    <div className="current-weather-container">
      <div className="current-weather-card card-strong animate-slide-up">
        <div className="current-weather-header">
          <div className="location-info">
            <h1 className="city-name">{cityName}{country && `, ${country}`}</h1>
            <div className="current-time">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="weather-badge badge-primary">{main}</div>
        </div>

        <div className="current-weather-main">
          <div className="temperature-section">
            <div className={`weather-icon-wrapper ${animateIcon ? 'animate' : ''} ${weatherType} ${isDay ? 'day' : 'night'}`}>
              <IconComponent 
                className="weather-main-icon" 
                size={120} 
                style={{ color: 'var(--color-accent)' }}
              />
            </div>
            <div className="temperature-display">
              <span className="temperature-value">{formatTemp(temp)}</span>
              <span className="temperature-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="feels-like">
              Feels like {formatTemp(feelsLike)}
            </div>
          </div>

          <div className="weather-description">
            <p className="description-main">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p className="description-detail">
              H: {formatTemp(tempMax)} • L: {formatTemp(tempMin)}
            </p>
          </div>
        </div>

        <div className="current-weather-highlights">
          <div className="highlight-item">
            <div className="highlight-icon humidity-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label">Humidity</span>
              <span className="highlight-value">{humidity}%</span>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon wind-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 14 19H2" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label">Wind</span>
              <span className="highlight-value">{formatWindSpeed(windSpeed)} {getWindDirection(windDeg)}</span>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon pressure-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label">Pressure</span>
              <span className="highlight-value">{pressure} hPa</span>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon visibility-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label">Visibility</span>
              <span className="highlight-value">
                {visibility >= 10000 ? '10+ km' : `${(visibility / 1000).toFixed(1)} km`}
              </span>
            </div>
          </div>
        </div>

        <div className="sun-times">
          <div className="sun-time sunrise">
            <div className="sun-icon sunrise-icon">
              <SunMedium size={20} />
            </div>
            <div className="sun-info">
              <span className="sun-label">Sunrise</span>
              <span className="sun-time">{new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="sun-divider"></div>
          <div className="sun-time sunset">
            <div className="sun-icon sunset-icon">
              <SunMedium size={20} />
            </div>
            <div className="sun-info">
              <span className="sun-label">Sunset</span>
              <span className="sun-time">{new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      <WeatherBackground weatherId={weatherId} isDay={isDay} />

      <style jsx>{`
        .current-weather-container {
          position: relative;
          width: 100%;
        }
        .current-weather-card {
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .current-weather-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .city-name {
          font-family: var(--font-primary);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 0.25rem;
          letter-spacing: -0.02em;
        }
        .current-time {
          color: var(--color-text-muted);
          font-size: 0.9375rem;
        }
        .weather-badge {
          flex-shrink: 0;
          text-transform: capitalize;
        }
        .current-weather-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .temperature-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .weather-icon-wrapper {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .weather-icon-wrapper .weather-main-icon {
          filter: drop-shadow(0 4px 20px var(--color-accent-glow));
        }
        .weather-icon-wrapper.animate .weather-main-icon {
          animation: float 3s ease-in-out infinite;
        }
        .weather-icon-wrapper.thunderstorm .weather-main-icon {
          color: var(--color-accent);
          filter: drop-shadow(0 0 30px var(--color-accent-glow));
        }
        .weather-icon-wrapper.rain .weather-main-icon,
        .weather-icon-wrapper.drizzle .weather-main-icon {
          color: var(--color-primary);
          filter: drop-shadow(0 0 30px var(--color-primary-glow));
        }
        .weather-icon-wrapper.snow .weather-main-icon {
          color: #e2e8f0;
          filter: drop-shadow(0 0 20px rgba(226, 232, 240, 0.5));
        }
        .weather-icon-wrapper.clear .weather-main-icon {
          color: var(--color-accent);
          filter: drop-shadow(0 0 40px var(--color-accent-glow));
        }
        .weather-icon-wrapper.clear.day .weather-main-icon {
          animation: sunPulse 4s ease-in-out infinite, sunRotate 20s linear infinite;
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes sunRotate {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1); }
        }
        .temperature-display {
          display: flex;
          align-items: flex-start;
          line-height: 1;
        }
        .temperature-value {
          font-family: var(--font-primary);
          font-size: 5.5rem;
          font-weight: 800;
          color: var(--color-text);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .temperature-unit {
          font-family: var(--font-primary);
          font-size: 2rem;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-top: 0.5rem;
        }
        .feels-like {
          color: var(--color-text-muted);
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        .weather-description {
          flex: 1;
          text-align: right;
        }
        .description-main {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--color-text);
          margin: 0 0 0.5rem;
          text-transform: capitalize;
        }
        .description-detail {
          font-size: 1.125rem;
          color: var(--color-text-muted);
          margin: 0;
        }
        .current-weather-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .highlight-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }
        .highlight-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-strong);
        }
        .highlight-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .humidity-icon {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-primary);
        }
        .wind-icon {
          background: rgba(34, 197, 94, 0.15);
          color: var(--color-success);
        }
        .pressure-icon {
          background: rgba(168, 85, 247, 0.15);
          color: var(--color-purple);
        }
        .visibility-icon {
          background: rgba(251, 191, 36, 0.15);
          color: var(--color-accent);
        }
        .highlight-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .highlight-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          font-weight: 600;
        }
        .highlight-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .sun-times {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }
        .sun-time {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .sun-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
        }
        .sunrise-icon {
          background: linear-gradient(135deg, var(--color-accent), #f97316);
          color: white;
        }
        .sunset-icon {
          background: linear-gradient(135deg, #f97316, var(--color-danger));
          color: white;
        }
        .sun-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .sun-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          font-weight: 600;
        }
        .sun-time {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          font-family: var(--font-primary);
        }
        .sun-divider {
          width: 1px;
          height: 40px;
          background: linear-gradient(var(--color-border), transparent);
          margin: 0 1.5rem;
        }
        .weather-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 1024px) {
          .current-weather-card {
            padding: 1.5rem;
          }
          .city-name {
            font-size: 1.75rem;
          }
          .temperature-value {
            font-size: 4.5rem;
          }
          .weather-icon-wrapper {
            width: 120px;
            height: 120px;
          }
          .current-weather-highlights {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .current-weather-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
          }
          .weather-description {
            text-align: center;
          }
          .temperature-display {
            justify-content: center;
          }
          .current-weather-highlights {
            grid-template-columns: 1fr;
          }
          .sun-divider {
            display: none;
          }
          .sun-times {
            flex-direction: column;
            gap: 1rem;
          }
          .sun-time {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}