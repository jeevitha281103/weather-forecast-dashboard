import { useState, useEffect } from 'react';
import { X, Key, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import './ApiKeyModal.css';

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey = '' }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentKey || '');
      setError('');
      setSuccess(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, currentKey]);

  const handleSave = async (e) => {
    e.preventDefault();
    const key = apiKey.trim();
    
    if (!key) {
      setError('Please enter an API key');
      return;
    }
    
    if (key.length < 32) {
      setError('API key appears to be invalid (too short)');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Test the API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}`
      );
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Invalid API key' }));
        throw new Error(error.message || 'Invalid API key');
      }

      setSaving(false);
      setSuccess(true);
      onSave(key);
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to validate API key. Please check and try again.');
    }
  };

  const handleKeyChange = (e) => {
    setApiKey(e.target.value);
    if (error) setError('');
  };

  const toggleVisibility = () => setShowKey(!showKey);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container card-strong animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <Key size={28} />
          </div>
          <h2 className="modal-title">OpenWeather API Key Required</h2>
          <p className="modal-subtitle">
            Enter your API key to access weather data. Get a free key at 
            <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener noreferrer">
              openweathermap.org
            </a>
          </p>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label htmlFor="api-key" className="form-label">API Key</label>
            <div className="input-wrapper">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                className={`form-input ${error ? 'input-error' : ''}`}
                value={apiKey}
                onChange={handleKeyChange}
                placeholder="Enter your OpenWeather API key..."
                autoComplete="off"
                disabled={saving || success}
                aria-describedby={error ? 'api-error' : undefined}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={toggleVisibility}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p id="api-error" className="form-error">{error}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || success}>
              {saving && <Loader2 size={18} className="btn-spinner" />}
              {success ? (
                <>
                  <Check size={18} />
                  Saved
                </>
              ) : (
                'Save & Continue'
              )}
            </button>
          </div>
        </form>

        <div className="modal-help">
          <h3>How to get your API key:</h3>
          <ol>
            <li>Go to <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener noreferrer">OpenWeather API Keys</a></li>
            <li>Sign up or log in to your account</li>
            <li>Create a new API key (or use existing)</li>
            <li>Copy and paste it above</li>
          </ol>
          <p className="help-note">Free tier includes 1,000 calls/day and 5-day/3-hour forecast data.</p>
        </div>
      </div>
    </div>
  );
}