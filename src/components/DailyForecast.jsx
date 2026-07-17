import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getWeatherType, getCardGradient, getWindDirection } from '../utils/weatherHelpers';
import './DailyForecast.css';

function getWeatherEmoji(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return '⛈️';
  if (weatherId >= 300 && weatherId < 400) return '🌦️';
  if (weatherId >= 500 && weatherId < 600) return '🌧️';
  if (weatherId >= 600 && weatherId < 700) return '❄️';
  if (weatherId >= 700 && weatherId < 800) return '🌫️';
  if (weatherId === 800) return '☀️';
  if (weatherId === 801) return '🌤️';
  if (weatherId === 802) return '⛅';
  if (weatherId > 802) return '☁️';
  return '☀️';
}

export default function DailyForecast({ daily, unit, timezoneOffset }) {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const formattedDays = useMemo(() => {
    if (!daily || !daily.length) return [];
    return daily.map((day, index) => {
      const utcMs = day.dt * 1000;
      const localDate = new Date(utcMs + timezoneOffset * 1000);
      const utcHours = localDate.getUTCHours();
      const isDay = utcHours >= 6 && utcHours < 18;
      const isToday = index === 0;
      const dayName = isToday ? 'Today' : localDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const fullDate = localDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
      const emoji = getWeatherEmoji(day.weather.id);
      const tempMin = Math.round(unit === 'imperial' ? (day.temp_min - 273.15) * 9 / 5 + 32 : day.temp_min - 273.15);
      const tempMax = Math.round(unit === 'imperial' ? (day.temp_max - 273.15) * 9 / 5 + 32 : day.temp_max - 273.15);
      return {
        ...day,
        dayName,
        fullDate,
        tempMin,
        tempMax,
        emoji,
        weatherType: getWeatherType(day.weather.id),
        description: day.weather.description,
        isDay,
        humidity: day.humidity,
        windSpeed: unit === 'imperial' ? (day.wind_speed * 2.237).toFixed(1) : (day.wind_speed * 3.6).toFixed(1),
        windUnit: unit === 'imperial' ? 'mph' : 'km/h',
        windDeg: day.wind_deg,
        pop: Math.round((day.pop || 0) * 100),
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
    </div>
  );
}

function DailyCard({ day, expanded, onToggle, unit }) {
  const { dayName, fullDate, tempMin, tempMax, emoji, description, weatherType, isDay, humidity, windSpeed, windUnit, windDeg, pop, index } = day;
  const cardGradient = getCardGradient(weatherType, isDay);

  return (
    <div
      className={`daily-card ${weatherType} ${expanded ? 'expanded' : ''}`}
      style={{ background: cardGradient }}
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
        <div className="day-emoji-wrapper">
          <span className="day-emoji">{emoji}</span>
        </div>
        <div className="day-description">{description.charAt(0).toUpperCase() + description.slice(1)}</div>
        <div className="day-temps">
          <span className="temp-max">{tempMax}°</span>
          <span className="temp-min">{tempMin}°</span>
        </div>
        <div className="day-pop">
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
        >
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-badge detail-badge-humidity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                {humidity}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-badge detail-badge-wind">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 14 19H2" />
                </svg>
                {windSpeed} {windUnit} {getWindDirection(windDeg)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Precipitation</span>
              <span className="detail-badge detail-badge-precip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                {pop}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
