import { AlertCircle, RefreshCw, X } from 'lucide-react';

export default function ErrorDisplay({ message, onRetry, onDismiss }) {
  return (
    <div className="error-display card" role="alert">
      <div className="error-icon">
        <AlertCircle size={24} />
      </div>
      <div className="error-content">
        <p className="error-message">{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button className="btn btn-primary" onClick={onRetry} type="button">
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
          {onDismiss && (
            <button className="btn btn-ghost" onClick={onDismiss} type="button">
              <X size={16} />
              Dismiss
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-display {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--color-danger-glow);
          border-color: var(--color-danger);
          animation: slideDown 0.3s var(--transition-bounce);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-icon {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          padding-top: 0.125rem;
          color: var(--color-danger);
        }
        .error-content {
          flex: 1;
          min-width: 0;
        }
        .error-message {
          margin: 0 0 0.75rem;
          color: var(--color-text);
          line-height: 1.5;
        }
        .error-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          font-size: 0.8125rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .btn-primary {
          background: var(--color-danger);
          color: white;
        }
        .btn-primary:hover {
          background: #dc2626;
        }
        .btn-ghost {
          color: var(--color-text-muted);
        }
        .btn-ghost:hover {
          color: var(--color-text);
          background: var(--color-bg-card);
        }
      `}</style>
    </div>
  );
}