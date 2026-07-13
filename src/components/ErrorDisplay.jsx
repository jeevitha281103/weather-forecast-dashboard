import { AlertCircle, RefreshCw, X } from 'lucide-react';
import './ErrorDisplay.css';

export default function ErrorDisplay({ message, onRetry, onDismiss }) {
  return (
    <div className="error-display" role="alert">
      <div className="error-icon">
        <AlertCircle size={24} />
      </div>
      <div className="error-content">
        <p className="error-message">{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button className="error-btn error-btn-primary" onClick={onRetry} type="button">
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
          {onDismiss && (
            <button className="error-btn error-btn-ghost" onClick={onDismiss} type="button">
              <X size={16} />
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}