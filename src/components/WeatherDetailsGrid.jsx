import { Droplet, Wind, Gauge, Eye, Sunrise, Sunset, Cloud, Droplets, Thermometer, Maximize, Minimize } from 'lucide-react';

const DetailItems = [
  {
    key: 'humidity',
    label: 'Humidity',
    icon: Droplet,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: 'var(--color-primary)',
    getValue: (current, unit) => `${current.main.humidity}%`,
    getDetail: (current) => `Dew point: ${Math.round(current.main.temp - (100 - current.main.humidity) / 5)}°C`,
  },
  {
    key: 'wind',
    label: 'Wind',
    icon: Wind,
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: 'var(--color-success)',
    getValue: (current, unit) => {
      const speed = unit === 'imperial' 
        ? Math.round(current.wind.speed * 2.237) 
        : Math.round(current.wind.speed * 3.6);
      return `${speed} ${unit === 'imperial' ? 'mph' : 'km/h'}`;
    },
    getDetail: (current) => `${getWindDirection(current.wind.deg)} (${current.wind.deg}°)`,
  },
  {
    key: 'pressure',
    label: 'Pressure',
    icon: Gauge,
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: 'var(--color-purple)',
    getValue: (current) => `${current.main.pressure} hPa`,
    getDetail: () => 'Sea level',
  },
  {
    key: 'visibility',
    label: 'Visibility',
    icon: Eye,
    iconBg: 'rgba(251, 191, 36, 0.15)',
    iconColor: 'var(--color-accent)',
    getValue: (current) => {
      const vis = current.visibility || 10000;
      return vis >= 1000 ? `${(vis / 1000).toFixed(1)} km` : `${vis} m`;
    },
    getDetail: () => 'Clear',
  },
  {
    key: 'cloudiness',
    label: 'Cloudiness',
    icon: Cloud,
    iconBg: 'rgba(148, 163, 184, 0.15)',
    iconColor: 'var(--color-text-muted)',
    getValue: (current) => `${current.clouds?.all || 0}%`,
    getDetail: (current) => getCloudDescription(current.clouds?.all || 0),
  },
  {
    key: 'feelsLike',
    label: 'Feels Like',
    icon: Thermometer,
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: '#f97316',
    getValue: (current, unit) => {
      const temp = unit === 'imperial' 
        ? Math.round((current.main.feels_like - 273.15) * 9/5 + 32)
        : Math.round(current.main.feels_like - 273.15);
      return `${temp}°${unit === 'imperial' ? 'F' : 'C'}`;
    },
    getDetail: (current, unit) => {
      const actual = unit === 'imperial' 
        ? Math.round((current.main.temp - 273.15) * 9/5 + 32)
        : Math.round(current.main.temp - 273.15);
      const feels = unit === 'imperial' 
        ? Math.round((current.main.feels_like - 273.15) * 9/5 + 32)
        : Math.round(current.main.feels_like - 273.15);
      const diff = feels - actual;
      if (diff > 2) return `Warmer by ${diff}°`;
      if (diff < -2) return `Cooler by ${Math.abs(diff)}°`;
      return 'Similar to actual';
    },
  },
  {
    key: 'uvIndex',
    label: 'UV Index',
    icon: Sunrise,
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: 'var(--color-danger)',
    getValue: () => '--',
    getDetail: () => 'Data unavailable',
  },
  {
    key: 'sunrise',
    label: 'Sunrise',
    icon: Sunrise,
    iconBg: 'linear-gradient(135deg, var(--color-accent), #f97316)',
    iconColor: 'white',
    getValue: (current, unit, timezoneOffset) => formatTime(current.sys.sunrise, timezoneOffset),
    getDetail: () => 'Today',
  },
  {
    key: 'sunset',
    label: 'Sunset',
    icon: Sunset,
    iconBg: 'linear-gradient(135deg, #f97316, var(--color-danger))',
    iconColor: 'white',
    getValue: (current, unit, timezoneOffset) => formatTime(current.sys.sunset, timezoneOffset),
    getDetail: () => 'Today',
  },
];

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

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
          const isGradient = typeof item.iconBg === 'string' && item.iconBg.includes('gradient');
          
          return (
            <div key={item.key} className="detail-card">
              <div 
                className="detail-icon"
                style={{
                  background: isGradient ? item.iconBg : item.iconBg,
                  color: item.iconColor,
                }}
              >
                <Icon size={22} />
              </div>
              <div className="detail-content">
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{value}</div>
                <div className="detail-description">{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .weather-details-grid {
          width: 100%;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .detail-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all var(--transition-base);
        }
        .detail-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-strong);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .detail-content {
          flex: 1;
          min-width: 0;
        }
        .detail-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .detail-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
          font-family: var(--font-primary);
          margin-bottom: 0.125rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .detail-description {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 1200px) {
          .details-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 500px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .detail-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}