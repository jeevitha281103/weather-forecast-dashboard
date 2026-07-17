import { useState, useEffect } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Wind, CloudFog, CloudSun } from 'lucide-react';
import { getWeatherType } from '../utils/weatherHelpers';
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

function formatTemp(kelvin, unit) {
  if (unit === 'imperial') {
    return Math.round((kelvin - 273.15) * 9 / 5 + 32);
  }
  return Math.round(kelvin - 273.15);
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
  const temp = formatTemp(data.main.temp, unit);
  const feelsLike = formatTemp(data.main.feels_like, unit);
  const tempMin = formatTemp(data.main.temp_min, unit);
  const tempMax = formatTemp(data.main.temp_max, unit);
  const cityName = data.name || 'Unknown';
  const country = data.sys.country || '';
  const unitSymbol = unit === 'imperial' ? 'F' : 'C';

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
              <span className="temperature-value center-text">{temp}°</span>
              <span className="temperature-unit center-text-muted">°{unitSymbol}</span>
            </div>
            <div className="feels-like center-text-muted">
              Feels like {feelsLike}°
            </div>
          </div>

          <div className="weather-description">
            <p className="description-main center-text">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p className="description-detail center-text-muted">
              H: {tempMax}° • L: {tempMin}°
            </p>
          </div>
        </div>

        </div>
    </div>
  );
}
