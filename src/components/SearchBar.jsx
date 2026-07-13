import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, X, Loader2 } from 'lucide-react';
import './SearchBar.css';

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
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const debouncedSearch = useRef(null);
  const geoFailed = useRef(false);

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
    if (geoFailed.current) return;
    try {
      const key = import.meta.env.VITE_OPENWEATHER_API_KEY || localStorage.getItem('openweather_api_key');
      if (!key) return;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${key}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
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
      geoFailed.current = true;
      setSuggestions([]);
    }
  };

  const handleSelect = (city) => {
    onSearch(city.name || city);
    setQuery('');
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
        setQuery('');
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
            onFocus={() => { setShowHistory(history.length > 0); }}
            onBlur={() => {}}
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
    </div>
  );
}