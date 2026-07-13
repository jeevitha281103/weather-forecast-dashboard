import { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeatherType, getCardGradient } from '../utils/weatherHelpers';
import './HourlyForecast.css';

function getWeatherIcon(weatherId, isDay) {
  if (weatherId >= 200 && weatherId < 300) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.49 5.32a2 2 0 0 1 3.02 0l1.94 3.34a2 2 0 0 0 1.95 1.5h4.53a2 2 0 0 1 0 4H7.5a2 2 0 0 1 0-4h2.45l1.94-3.34z" /><path d="M12 17v4" /><path d="M8 21h8" /></svg>;
  if (weatherId >= 300 && weatherId < 400) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M8 14v6" /><path d="M16 14v6" /></svg>;
  if (weatherId >= 500 && weatherId < 600) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M8 14v6" /><path d="M16 14v6" /><path d="M12 14v6" /></svg>;
  if (weatherId >= 600 && weatherId < 700) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M8 14v6" /><path d="M16 14v6" /><path d="M12 14v6" /></svg>;
  if (weatherId >= 700 && weatherId < 800) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M4 14h16" /><path d="M4 18h16" /></svg>;
  if (weatherId === 800) return isDay
    ? (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" /></svg>
    : (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
  if (weatherId > 800) return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M4 14h16" /></svg>;
  return (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5" /></svg>;
}

export default function HourlyForecast({ hourly, unit, timezoneOffset }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const formattedHours = useMemo(() => {
    if (!hourly || !hourly.length) return [];
    return hourly.slice(0, 24).map((item, index) => {
      const utcMs = item.dt * 1000;
      const localDate = new Date(utcMs + timezoneOffset * 1000);
      const utcHours = localDate.getUTCHours();
      const isDay = utcHours >= 6 && utcHours < 18;
      const isNow = index === 0;
      const weather = Array.isArray(item.weather) ? item.weather[0] : item.weather;
      const dayName = localDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const monthDay = localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      const timeStr = localDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
      return {
        ...item,
        time: isNow ? 'Now' : timeStr,
        dayLabel: isNow ? 'Today' : dayName,
        dateLabel: monthDay,
        temp: Math.round(unit === 'imperial' ? (item.temp - 273.15) * 9 / 5 + 32 : item.temp - 273.15),
        tempC: Math.round(item.temp - 273.15),
        feelsLike: Math.round(unit === 'imperial' ? (item.feels_like - 273.15) * 9 / 5 + 32 : item.feels_like - 273.15),
        icon: weather?.id ?? 800,
        description: weather?.description ?? 'Clear sky',
        pop: Math.round((item.pop || 0) * 100),
        humidity: item.humidity,
        windSpeed: item.wind_speed,
        isNow,
        isDay,
        dateKey: localDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }),
      };
    });
  }, [hourly, unit, timezoneOffset]);

  const groupedByDay = useMemo(() => {
    const groups = [];
    let currentDay = null;
    formattedHours.forEach((hour) => {
      if (hour.dateKey !== currentDay) {
        currentDay = hour.dateKey;
        groups.push({ dateKey: hour.dateKey, dayLabel: hour.dayLabel, dateLabel: hour.dateLabel, hours: [] });
      }
      groups[groups.length - 1].hours.push(hour);
    });
    return groups;
  }, [formattedHours]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [formattedHours.length]);

  const scrollLeftFn = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollRightFn = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  if (!formattedHours.length) return null;

  return (
    <div className="hourly-forecast-container">
      <div className="hourly-forecast-header">
        <h2 className="section-title">24-Hour Forecast</h2>
        <div className="scroll-indicator" aria-hidden="true">
          <span className={`scroll-dot ${showLeftArrow ? 'visible' : ''}`}></span>
          <span className={`scroll-dot ${showRightArrow ? 'visible' : ''}`}></span>
        </div>
      </div>

      <div className="scroll-wrapper">
        <button
          className={`scroll-btn scroll-btn-left ${showLeftArrow ? 'visible' : ''}`}
          onClick={scrollLeftFn}
          aria-label="Scroll left"
          type="button"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="hourly-scroll"
          role="region"
          aria-label="Hourly forecast"
          tabIndex={0}
        >
          <div className="hourly-cards">
            {groupedByDay.map((group) => (
              <div key={group.dateKey} className="hourly-day-group">
                <div className="hourly-day-label">
                  <span className="hourly-day-name">{group.dayLabel}</span>
                  <span className="hourly-day-date">{group.dateLabel}</span>
                </div>
                <div className="hourly-day-cards">
                  {group.hours.map((hour, idx) => (
                    <HourlyCard key={hour.dt} hour={hour} unit={unit} index={idx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`scroll-btn scroll-btn-right ${showRightArrow ? 'visible' : ''}`}
          onClick={scrollRightFn}
          aria-label="Scroll right"
          type="button"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function HourlyCard({ hour, unit, index }) {
  const Icon = getWeatherIcon(hour.icon, hour.isDay);
  const weatherType = getWeatherType(hour.icon);
  const cardGradient = getCardGradient(weatherType, hour.isDay, hour.tempC);

  return (
    <div
      className={`hourly-card ${weatherType} ${hour.isNow ? 'current' : ''}`}
      style={{ animationDelay: `${index * 50}ms`, background: cardGradient }}
    >
      {hour.isNow && <div className="now-indicator">Now</div>}
      <div className="hour-time">{hour.time}</div>
      <div className="hour-icon-wrapper">
        <Icon className="hour-icon" size={36} />
      </div>
      <div className="hour-temp">{hour.temp}°{unit === 'metric' ? 'C' : 'F'}</div>
      {hour.pop > 0 && (
        <div className="hour-pop" title={`Precipitation: ${hour.pop}%`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span>{hour.pop}%</span>
        </div>
      )}
      <div className="hour-details">
        <span className="hour-detail-feels">FL {hour.feelsLike}°</span>
        <span className="hour-detail-humid">💧 {hour.humidity}%</span>
      </div>
    </div>
  );
}
