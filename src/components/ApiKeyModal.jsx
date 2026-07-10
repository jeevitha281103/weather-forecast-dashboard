import { useState, useEffect, useCallback } from 'react';
import { X, Key, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

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

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: var(--z-modal);
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-container {
          width: 100%;
          max-width: 480px;
          padding: 2rem;
          animation: scaleIn 0.3s var(--transition-bounce);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .modal-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          background: var(--color-primary-glow);
          color: var(--color-primary);
        }
        .modal-title {
          font-family: var(--font-primary);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 0.5rem;
        }
        .modal-subtitle {
          color: var(--color-text-muted);
          font-size: 0.9375rem;
          line-height: 1.5;
          margin: 0;
        }
        .modal-subtitle a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }
        .modal-subtitle a:hover {
          text-decoration: underline;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .form-input {
          width: 100%;
          padding: 0.875rem 3rem 0.875rem 1rem;
          font-size: 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text);
          transition: all var(--transition-base);
        }
        .form-input::placeholder {
          color: var(--color-text-dim);
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
          background: var(--color-bg-card-hover);
        }
        .form-input.input-error {
          border-color: var(--color-danger);
        }
        .form-input.input-error:focus {
          box-shadow: 0 0 0 3px var(--color-danger-glow);
        }
        .input-toggle {
          position: absolute;
          right: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: var(--color-text-dim);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .input-toggle:hover {
          color: var(--color-text);
        }
        .form-error {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--color-danger);
          font-size: 0.8125rem;
          margin-top: 0.5rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          box-shadow: var(--shadow-md), var(--shadow-glow);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--color-bg-card);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-strong);
        }
        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .modal-help {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }
        .modal-help h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 0.75rem;
        }
        .modal-help ol {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          line-height: 1.8;
        }
        .modal-help a {
          color: var(--color-primary);
        }
        .help-note {
          margin: 1rem 0 0;
          font-size: 0.8125rem;
          color: var(--color-text-dim);
        }
        @media (max-width: 640px) {
          .modal-container {
            padding: 1.5rem;
            margin: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}