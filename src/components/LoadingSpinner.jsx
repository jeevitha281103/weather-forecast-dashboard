import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizes = {
    small: { spinner: 24, gap: 0.75, fontSize: '0.875rem' },
    medium: { spinner: 40, gap: 1, fontSize: '1rem' },
    large: { spinner: 56, gap: 1.5, fontSize: '1.125rem' },
  };

  const { spinner, gap, fontSize } = sizes[size];

  return (
    <div className="loading-container" style={{ '--gap': gap }}>
      <div 
        className="spinner" 
        style={{ width: spinner, height: spinner }}
        role="status"
        aria-label="Loading"
      >
        <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
          <circle
            className="spinner-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="spinner-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80, 125"
          />
        </svg>
      </div>
      {message && (
        <p className="loading-message" style={{ fontSize }}>{message}</p>
      )}
    </div>
  );
}