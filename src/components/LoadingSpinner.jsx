export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizes = {
    small: { spinner: 24, gap: 0.75, fontSize: '0.875rem' },
    medium: { spinner: 40, gap: 1, fontSize: '1rem' },
    large: { spinner: 56, gap: 1.5, fontSize: '1.125rem' },
  };

  const { spinner, gap, fontSize } = sizes[size];

  return (
    <div className="loading-container">
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

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: calc(${gap} * 1rem);
        }
        .spinner {
          animation: rotate 1.2s linear infinite;
        }
        .spinner-track {
          stroke: var(--color-border);
        }
        .spinner-path {
          stroke: var(--color-primary);
          stroke-dashoffset: 0;
          animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes dash {
          0% { stroke-dashoffset: 0; stroke-dasharray: 1, 125; }
          50% { stroke-dashoffset: -30; stroke-dasharray: 80, 125; }
          100% { stroke-dashoffset: -125; stroke-dasharray: 80, 125; }
        }
        .loading-message {
          margin: 0;
          color: var(--color-text-muted);
          font-weight: 500;
          text-align: center;
        }
      `}</style>
    </div>
  );
}