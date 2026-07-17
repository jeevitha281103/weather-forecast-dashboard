import { Droplet, Wind, Gauge, Eye, Sunrise, Sunset, Cloud, Thermometer } from 'lucide-react';
import { getWindDirection } from '../utils/weatherHelpers';
import './WeatherDetailsGrid.css';

function toCelsius(kelvin) {
  return kelvin - 273.15;
}

function toFahrenheit(kelvin) {
  return (kelvin - 273.15) * 9 / 5 + 32;
}

function formatTemp(kelvin, unit) {
  if (unit === 'imperial') {
    return `${toFahrenheit(kelvin).toFixed(1)}°F`;
  }
  return `${toCelsius(kelvin).toFixed(1)}°C`;
}

const DetailItems = [
  {
    key: 'humidity',
    label: 'Humidity',
    icon: Droplet,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: 'var(--center-primary)',
    getValue: (current) => `${current.main.humidity}%`,
    getDetail: (current) => {
      const tempC = toCelsius(current.main.temp);
      const humidity = current.main.humidity;
      const dewPointC = tempC - (100 - humidity) / 5;
      return `Dew point: ${dewPointC.toFixed(1)}°C`;
    },
  },
  {
    key: 'wind',
    label: 'Wind',
    icon: Wind,
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: 'var(--center-success)',
    getValue: (current, unit) => {
      const speed = unit === 'imperial'
        ? (current.wind.speed * 2.237).toFixed(1)
        : (current.wind.speed * 3.6).toFixed(1);
      return `${speed} ${unit === 'imperial' ? 'mph' : 'km/h'}`;
    },
    getDetail: (current) => `${getWindDirection(current.wind.deg)} (${current.wind.deg}°)`,
  },
  {
    key: 'pressure',
    label: 'Pressure',
    icon: Gauge,
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: 'var(--center-purple)',
    getValue: (current) => `${current.main.pressure} hPa`,
    getDetail: () => 'Sea level',
  },
  {
    key: 'visibility',
    label: 'Visibility',
    icon: Eye,
    iconBg: 'rgba(251, 191, 36, 0.15)',
    iconColor: 'var(--center-accent)',
    getValue: (current) => {
      const vis = current.visibility || 10000;
      return vis >= 1000 ? `${(vis / 1000).toFixed(1)} km` : `${vis} m`;
    },
    getDetail: () => 'Surface',
  },
  {
    key: 'cloudiness',
    label: 'Cloudiness',
    icon: Cloud,
    iconBg: 'rgba(148, 163, 184, 0.15)',
    iconColor: 'var(--center-text-muted)',
    getValue: (current) => `${current.clouds?.all || 0}%`,
    getDetail: (current) => getCloudDescription(current.clouds?.all || 0),
  },
  {
    key: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: '#f97316',
    getValue: (current, unit) => formatTemp(current.main.temp, unit),
    getDetail: (current, unit) => {
      const feels = unit === 'imperial'
        ? toFahrenheit(current.main.feels_like).toFixed(1)
        : toCelsius(current.main.feels_like).toFixed(1);
      return `Feels like ${feels}°`;
    },
  },
  {
    key: 'uvIndex',
    label: 'UV Index',
    icon: Sunrise,
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: 'var(--center-danger)',
    getValue: (current) => {
      const uvi = current.uvi;
      if (uvi == null) return '--';
      return uvi.toFixed(1);
    },
    getDetail: (current) => {
      const uvi = current.uvi;
      if (uvi == null) return 'Estimated';
      if (uvi <= 2) return 'Low';
      if (uvi <= 5) return 'Moderate';
      if (uvi <= 7) return 'High';
      if (uvi <= 10) return 'Very High';
      return 'Extreme';
    },
  },
  {
    key: 'sunrise',
    label: 'Sunrise',
    icon: Sunrise,
    iconBg: 'linear-gradient(135deg, var(--center-accent), #f97316)',
    iconColor: 'white',
    getValue: (current, unit, timezoneOffset) => formatTime(current.sys.sunrise, timezoneOffset),
    getDetail: () => 'Today',
  },
  {
    key: 'sunset',
    label: 'Sunset',
    icon: Sunset,
    iconBg: 'linear-gradient(135deg, #f97316, var(--center-danger))',
    iconColor: 'white',
    getValue: (current, unit, timezoneOffset) => formatTime(current.sys.sunset, timezoneOffset),
    getDetail: () => 'Today',
  },
];

function getCloudDescription(percent) {
  if (percent <= 10) return 'Clear sky';
  if (percent <= 30) return 'Few clouds';
  if (percent <= 50) return 'Scattered clouds';
  if (percent <= 70) return 'Broken clouds';
  return 'Overcast';
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

export default function WeatherDetailsGrid({ current, unit, timezoneOffset }) {
  return (
    <div className="weather-details-grid">
      <div className="details-grid">
        {DetailItems.map((item) => {
          const Icon = item.icon;
          const value = item.getValue(current, unit, timezoneOffset);
          const detail = item.getDetail(current, unit, timezoneOffset);
          return (
            <div key={item.key} className="detail-card">
              <div 
                className="detail-icon"
                style={{
                  background: item.iconBg,
                  color: item.iconColor,
                }}
              >
                <Icon size={22} />
              </div>
              <div className="detail-content">
                <div className="detail-label text-dim">{item.label}</div>
                <div className="detail-value">{value}</div>
                <div className="detail-description text-muted">{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
