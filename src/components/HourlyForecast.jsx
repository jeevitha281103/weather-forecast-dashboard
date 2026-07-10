import { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';

export default function HourlyForecast({ hourly, unit, timezoneOffset }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const formattedHours = useMemo(() => {
    if (!hourly || !hourly.length) return [];
    return hourly.slice(0, 24).map((item, index) => {
      const date = new Date((item.dt + timezoneOffset) * 1000);
      const isNow = index === 0;
      return {
        ...item,
        time: isNow ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        temp: Math.round(unit === 'imperial' ? (item.temp - 273.15) * 9/5 + 32 : item.temp - 273.15),
        feelsLike: Math.round(unit === 'imperial' ? (item.feelsLike - 273.15) * 9/5 + 32 : item.feelsLike - 273.15),
        icon: item.weather[0].id,
        description: item.weather[0].description,
        pop: Math.round((item.pop || 0) * 100),
        humidity: item.humidity,
        windSpeed: item.wind.speed,
        isNow,
      };
    });
  }, [hourly, unit, timezoneOffset]);

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

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
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
      
      <div className="scroll-wrapper" onWheel={(e) => {
        if (e.deltaY !== 0) {
          e.currentTarget.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }}>
        <button 
          className={`scroll-btn scroll-btn-left ${showLeftArrow ? 'visible' : ''}`}
          onClick={scrollLeft}
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
            {formattedHours.map((hour, index) => (
              <HourlyCard key={hour.dt} hour={hour} unit={unit} index={index} />
            ))}
          </div>
        </div>
        
        <button 
          className={`scroll-btn scroll-btn-right ${showRightArrow ? 'visible' : ''}`}
          onClick={scrollRight}
          aria-label="Scroll right"
          type="button"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .hourly-forecast-container {
          width: 100%;
        }
        .hourly-forecast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: var(--font-primary);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }
        .scroll-indicator {
          display: flex;
          gap: 0.375rem;
        }
        .scroll-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-border);
          transition: all var(--transition-fast);
        }
        .scroll-dot.visible {
          background: var(--color-primary);
          transform: scale(1.2);
        }
        .scroll-wrapper {
          position: relative;
        }
        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all var(--transition-fast);
          z-index: 10;
        }
        .scroll-btn:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .scroll-btn.visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        .scroll-btn-left { left: -50px; }
        .scroll-btn-right { right: -50px; }
        .hourly-scroll {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hourly-scroll::-webkit-scrollbar { display: none; }
        .hourly-cards {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .scroll-btn { display: none; }
        }
        @media (max-width: 640px) {
          .hourly-forecast-header { margin-bottom: 0.75rem; }
          .section-title { font-size: 1.125rem; }
          .scroll-indicator { display: none; }
        }
      `}</style>
    </div>
  );
}

function HourlyCard({ hour, unit, index }) {
  const isDay = hour.isNow || (new Date().getHours() >= 6 && new Date().getHours() < 18);
  const Icon = getHourlyIcon(hour.icon, isDay);
  const weatherType = getWeatherType(hour.icon);

  return (
    <div className={`hourly-card ${weatherType} ${hour.isNow ? 'current' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
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
        <span title={`Feels like ${hour.feelsLike}°`}>FL:{hour.feelsLike}°</span>
        <span title={`Humidity ${hour.humidity}%`}>💧{hour.humidity}%</span>
      </div>
      {hour.isNow && <div className="now-indicator">Now</div>}
    </div>
  );
}

function getHourlyIcon(weatherId, isDay) {
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

<style jsx>{`
  .hourly-card {
    flex-shrink: 0;
    width: 72px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    scroll-snap-align: start;
    transition: all var(--transition-base);
    animation: slideIn 0.4s var(--transition-bounce) backwards;
  }
  .hourly-card:hover {
    background: var(--color-bg-card-hover);
    border-color: var(--color-border-strong);
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .hourly-card.current {
    border-color: var(--color-primary);
    background: linear-gradient(180deg, var(--color-primary-glow) 0%, var(--color-bg-card) 100%);
  }
  .hourly-card.current::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hour-time {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .hourly-card.current .hour-time {
    color: var(--color-primary);
  }
  .hour-icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
  }
  .hourly-card.clear .hour-icon-wrapper {
    background: rgba(251, 191, 36, 0.15);
  }
  .hourly-card.rain .hour-icon-wrapper,
  .hourly-card.drizzle .hour-icon-wrapper {
    background: rgba(59, 130, 246, 0.15);
  }
  .hourly-card.thunderstorm .hour-icon-wrapper {
    background: rgba(251, 191, 36, 0.2);
  }
  .hourly-card.snow .hour-icon-wrapper {
    background: rgba(226, 232, 240, 0.2);
  }
  .hourly-card.clouds .hour-icon-wrapper {
    background: rgba(148, 163, 184, 0.15);
  }
  .hourly-card.mist .hour-icon-wrapper {
    background: rgba(148, 163, 184, 0.1);
  }
  .hour-icon {
    color: var(--color-text);
  }
  .hourly-card.clear .hour-icon { color: var(--color-accent); }
  .hourly-card.rain .hour-icon,
  .hourly-card.drizzle .hour-icon { color: var(--color-primary); }
  .hourly-card.thunderstorm .hour-icon { color: var(--color-accent); }
  .hourly-card.snow .hour-icon { color: #e2e8f0; }
  .hourly-card.clouds .hour-icon { color: var(--color-text-muted); }
  .hourly-card.mist .hour-icon { color: var(--color-text-dim); }
  .hour-temp {
    font-family: var(--font-primary);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }
  .hour-pop {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-primary-glow);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
  }
  .hour-details {
    display: flex;
    gap: 0.5rem;
    font-size: 0.625rem;
    color: var(--color-text-dim);
    width: 100%;
    justify-content: center;
  }
  .now-indicator {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary);
    background: var(--color-primary-glow);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
  }
`}</style>