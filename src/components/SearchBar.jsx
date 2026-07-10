import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, History, X, Loader2 } from 'lucide-react';

export default function SearchBar({ 
  onSearch, 
  onGeolocation, 
  history = [], 
  loading = false, 
  disabled = false,
  placeholder = 'Search for a city...'
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const debouncedSearch = useRef(null);

  useEffect(() => {
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debouncedSearch.current);
  }, [query]);

  const fetchSuggestions = async (city) => {
    try {
      const key = import.meta.env.VITE_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key');
      if (!key) return;
      
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${key}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.map(c => ({
          name: c.name,
          country: c.country,
          state: c.state,
          lat: c.lat,
          lon: c.lon,
        })));
      }
    } catch (e) {
      console.warn('Suggestion fetch failed:', e);
    }
  };

  const handleSelect = (city) => {
    setQuery(`${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`);
    onSearch(city);
    setShowHistory(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleHistorySelect = (city) => {
    onSearch(city);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
      setSuggestions([]);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && !loading) {
      if (query.trim()) {
        onSearch(query.trim());
        setShowHistory(false);
        setSuggestions([]);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowHistory(true);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowHistory(false);
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <div className="search-wrapper">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); setShowHistory(history.length > 0); }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            autoComplete="off"
            aria-label="Search for a city"
            aria-expanded={showHistory || suggestions.length > 0}
            aria-controls="search-suggestions"
          />
          {loading && <Loader2 className="search-loader" size={20} />}
          {query && !loading && (
            <button 
              className="search-clear" 
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          className="search-geo-btn"
          onClick={onGeolocation}
          disabled={loading || disabled}
          aria-label="Use current location"
          title="Use current location"
        >
          <MapPin size={20} />
        </button>
      </div>

      {(showHistory || suggestions.length > 0) && (
        <div 
          className="search-dropdown"
          id="search-suggestions"
          role="listbox"
        >
          {suggestions.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-header">Suggestions</div>
              {suggestions.map((city, i) => (
                <button
                  key={`${city.lat}-${city.lon}-${i}`}
                  className="dropdown-item"
                  onClick={() => handleSelect(city)}
                  role="option"
                >
                  <MapPin className="dropdown-icon" size={16} />
                  <span>
                    {city.name}{city.state && `, ${city.state}`}, {city.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-header">
                <History className="dropdown-header-icon" size={14} />
                Recent Searches
              </div>
              {history.slice(0, 5).map((city, i) => (
                <button
                  key={i}
                  className="dropdown-item"
                  onClick={() => handleHistorySelect(city)}
                  role="option"
                >
                  <History className="dropdown-icon" size={16} />
                  <span>{city}</span>
                </button>
              ))}
            </div>
          )}

          {(suggestions.length === 0 && history.length === 0 && query.length >= 2) && (
            <div className="dropdown-empty">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .search-bar-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .search-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--color-text-dim);
          pointer-events: none;
          transition: color var(--transition-fast);
        }
        .search-input-wrapper:focus-within .search-icon {
          color: var(--color-primary);
        }
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          font-size: 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          color: var(--color-text);
          transition: all var(--transition-base);
        }
        .search-input::placeholder {
          color: var(--color-text-dim);
        }
        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
          background: var(--color-bg-card-hover);
        }
        .search-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .search-clear {
          position: absolute;
          right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .search-clear:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-danger);
          color: var(--color-danger);
        }
        .search-loader {
          position: absolute;
          right: 1rem;
          color: var(--color-primary);
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .search-geo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-base);
          flex-shrink: 0;
        }
        .search-geo-btn:hover:not(:disabled) {
          background: var(--color-bg-card-hover);
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .search-geo-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          z-index: var(--z-dropdown);
          animation: slideDown 0.2s var(--transition-bounce);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-section {
          border-bottom: 1px solid var(--color-border);
        }
        .dropdown-section:last-child {
          border-bottom: none;
        }
        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          background: var(--color-bg-card);
        }
        .dropdown-header-icon {
          flex-shrink: 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          text-align: left;
          color: var(--color-text);
          transition: background var(--transition-fast);
        }
        .dropdown-item:hover {
          background: var(--color-bg-card-hover);
        }
        .dropdown-icon {
          flex-shrink: 0;
          color: var(--color-text-dim);
        }
        .dropdown-empty {
          padding: 1.5rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}