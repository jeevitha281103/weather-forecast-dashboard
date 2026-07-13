import { useState, useEffect } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Wind, CloudFog, CloudSun } from 'lucide-react';
import { getWeatherType, getWindDirection } from '../utils/weatherHelpers';
import './CurrentWeather.css';

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
  return weatherIcons[getWeatherType(weatherId)][isDay ? 'day' : 'night'];
}

export default function CurrentWeather({ data, unit = 'metric', timezoneOffset = 0 }) {
  const [isDay, setIsDay] = useState(true);
  const [animateIcon, setAnimateIcon] = useState(false);

  useEffect(() => {
    if (!data) return;
    const currentTime = Math.floor(Date.now() / 1000);
    setIsDay(currentTime >= data.sys.sunrise && currentTime < data.sys.sunset);
    
    setAnimateIcon(false);
    setTimeout(() => setAnimateIcon(true), 100);
  }, [data]);

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
  const cityName = data.name || 'Unknown';
  const country = data.sys.country || '';

  const IconComponent = getWeatherIcon(weatherId, isDay);
  const weatherType = getWeatherType(weatherId);

  return (
    <div className="current-weather-container">
      <div className="current-weather-card center-card-strong animate-slide-up">
        <div className="current-weather-header">
          <div className="location-info">
            <h1 className="city-name center-text">{cityName}{country && `, ${country}`}</h1>
            <div className="current-time center-text-muted">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="weather-badge center-badge-primary">{main}</div>
        </div>

        <div className="current-weather-main">
          <div className="temperature-section">
            <div className={`weather-icon-wrapper ${animateIcon ? 'animate' : ''} ${weatherType} ${isDay ? 'day' : 'night'}`}>
              <IconComponent 
                className="weather-main-icon" 
                size={120} 
                style={{ color: 'var(--center-accent)' }}
              />
            </div>
            <div className="temperature-display">
              <span className="temperature-value center-text">{Math.round(temp)}°</span>
              <span className="temperature-unit center-text-muted">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="feels-like center-text-muted">
              Feels like {Math.round(feelsLike)}°
            </div>
          </div>

          <div className="weather-description">
            <p className="description-main center-text">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p className="description-detail center-text-muted">
              H: {Math.round(tempMax)}° • L: {Math.round(tempMin)}°
            </p>
          </div>
        </div>

        <div className="current-weather-highlights">
          <div className="highlight-item center-card">
            <div className="highlight-icon humidity-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label center-text-dim">Humidity</span>
              <span className="highlight-value center-text">{humidity}%</span>
            </div>
          </div>
          <div className="highlight-item center-card">
            <div className="highlight-icon wind-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 14 19H2" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label center-text-dim">Wind</span>
              <span className="highlight-value center-text">{unit === 'metric' ? `${windSpeed} m/s` : `${Math.round(windSpeed * 2.237)} mph`} {getWindDirection(windDeg)}</span>
            </div>
          </div>
          <div className="highlight-item center-card">
            <div className="highlight-icon pressure-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label center-text-dim">Pressure</span>
              <span className="highlight-value center-text">{pressure} hPa</span>
            </div>
          </div>
          <div className="highlight-item center-card">
            <div className="highlight-icon visibility-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="highlight-info">
              <span className="highlight-label center-text-dim">Visibility</span>
              <span className="highlight-value center-text">
                {visibility >= 10000 ? '10+ km' : `${(visibility / 1000).toFixed(1)} km`}
              </span>
            </div>
          </div>
        </div>

        </div>
    </div>
  );
}
