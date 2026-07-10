import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Droplet, Wind, Maximize } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';

function getWeatherType(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800) return 'clouds';
  return 'clear';
}

function getDayIcon(weatherId, isDay) {
  const type = getWeatherType(weatherId);
  const icons = {
    clear: { day: '☀️', night: '🌙' },
    clouds: { day: '⛅', night: '☁️' },
    rain: { day: '🌧️', night: '🌧️' },
    drizzle: { day: '🌦️', night: '🌦️' },
    thunderstorm: { day: '⛈️', night: '⛈️' },
    snow: { day: '❄️', night: '❄️' },
    mist: { day: '🌫️', night: '🌫️' },
  };
  return icons[type]?.[isDay ? 'day' : 'night'] || icons.clear[isDay ? 'day' : 'night'];
}

function formatDayName(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString([], { weekday: 'short' });
}

function formatFullDate(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTemp(temp, unit) {
  return unit === 'imperial' 
    ? `${Math.round((temp - 273.15) * 9/5 + 32)}°F`
    : `${Math.round(temp - 273.15)}°C`;
}

function formatWind(speed, unit) {
  return unit === 'imperial' 
    ? `${Math.round(speed * 2.237)} mph`
    : `${Math.round(speed * 3.6)} km/h`;
}

export default function DailyForecast({ daily, unit, timezoneOffset }) {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const formattedDays = useMemo(() => {
    if (!daily || !daily.length) return [];
    return daily.map((day, index) => {
      const date = new Date((day.dt + timezoneOffset) * 1000);
      const isDay = date.getHours() >= 6 && date.getHours() < 18;
      return {
        ...day,
        dayName: formatDayName(day.dt, timezoneOffset),
        fullDate: formatFullDate(day.dt, timezoneOffset),
        tempMin: formatTemp(day.temp_min, unit),
        tempMax: formatTemp(day.temp_max, unit),
        icon: day.weather.id,
        description: day.weather.description,
        weatherType: getWeatherType(day.weather.id),
        isDay,
        humidity: day.humidity,
        windSpeed: formatWind(day.wind_speed, unit),
        pop: Math.round(day.pop * 100),
        index,
      };
    });
  }, [daily, unit, timezoneOffset]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  if (!formattedDays.length) return null;

  return (
    <div className="daily-forecast-container">
      <div className="daily-forecast-header">
        <h2 className="section-title">5-Day Forecast</h2>
      </div>
      
      <div className="daily-cards">
        {formattedDays.map((day) => (
          <DailyCard
            key={day.dt}
            day={day}
            expanded={expandedIndex === day.index}
            onToggle={() => toggleExpand(day.index)}
            unit={unit}
          />
        ))}
      </div>

      <style jsx>{`
        .daily-forecast-container {
          width: 100%;
        }
        .daily-forecast-header {
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: var(--font-primary);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }
        .daily-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .section-title { font-size: 1.125rem; }
        }
      `}</style>
    </div>
  );
}

function DailyCard({ day, expanded, onToggle, unit }) {
  const { dayName, fullDate, tempMin, tempMax, icon, description, weatherType, isDay, humidity, windSpeed, pop, index } = day;

  const getWeatherColors = (type) => {
    const colors = {
      clear: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)', text: 'var(--color-accent)' },
      clouds: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)', text: 'var(--color-text-muted)' },
      rain: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: 'var(--color-primary)' },
      drizzle: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: 'var(--color-primary)' },
      thunderstorm: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', text: 'var(--color-accent)' },
      snow: { bg: 'rgba(226, 232, 240, 0.15)', border: 'rgba(226, 232, 240, 0.3)', text: '#e2e8f0' },
      mist: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)', text: 'var(--color-text-dim)' },
    };
    return colors[type] || colors.clear;
  };

  const colors = getWeatherColors(weatherType);

  return (
    <div 
      className={`daily-card ${weatherType} ${expanded ? 'expanded' : ''}`}
      style={{ 
        '--card-bg': colors.bg, 
        '--card-border': colors.border,
        '--card-text': colors.text 
      }}
    >
      <button 
        className="daily-main"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`daily-details-${index}`}
      >
        <div className="day-info">
          <span className="day-name">{dayName}</span>
          <span className="day-date">{fullDate}</span>
        </div>
        <div className="day-icon-wrapper" style={{ background: colors.bg, borderColor: colors.border }}>
          <span className="day-icon" role="img" aria-label={description}>{icon}</span>
        </div>
        <div className="day-temps">
          <span className="temp-max">{tempMax}</span>
          <span className="temp-min">{tempMin}</span>
        </div>
        <div className="day-pop" style={{ color: colors.text }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span>{pop}%</span>
        </div>
        <div className="expand-trigger">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {expanded && (
        <div 
          id={`daily-details-${index}`}
          className="daily-details"
          style={{ borderColor: colors.border }}
        >
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">Condition</span>
              <span className="detail-value">{description.charAt(0).toUpperCase() + description.slice(1)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{windSpeed}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Precipitation</span>
              <span className="detail-value">{pop}%</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .daily-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-base);
        }
        .daily-card:hover {
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-md);
        }
        .daily-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1rem 1.25rem;
          gap: 1rem;
          background: transparent;
          border: none;
          color: var(--color-text);
          text-align: left;
          cursor: pointer;
        }
        .day-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 80px;
        }
        .day-name {
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--color-text);
        }
        .day-date {
          font-size: 0.75rem;
          color: var(--color-text-dim);
        }
        .day-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
        }
        .day-icon {
          font-size: 1.75rem;
          line-height: 1;
        }
        .day-temps {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.125rem;
          min-width: 70px;
        }
        .temp-max {
          font-family: var(--font-primary);
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .temp-min {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        .day-pop {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.25rem 0.625rem;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-full);
          white-space: nowrap;
        }
        .expand-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          color: var(--color-text-dim);
          transition: transform var(--transition-fast);
        }
        .daily-card.expanded .expand-trigger {
          transform: rotate(180deg);
        }
        .daily-details {
          padding: 0 1.25rem 1rem;
          border-top: 1px solid var(--card-border);
          animation: slideDown 0.3s var(--transition-bounce);
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
        .detail-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding-top: 1rem;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .detail-label {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--color-text-dim);
        }
        .detail-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text);
        }
        @media (max-width: 900px) {
          .detail-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .daily-main {
            padding: 0.875rem 1rem;
          }
          .day-info { min-width: 70px; }
          .day-icon-wrapper { width: 44px; height: 44px; }
          .day-icon { font-size: 1.5rem; }
          .temp-max { font-size: 1.25rem; }
          .day-temps { min-width: 60px; }
          .day-pop { font-size: 0.75rem; padding: 0.1875rem 0.5rem; }
          .detail-row { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        }
      `}</style>
    </div>
  );
}