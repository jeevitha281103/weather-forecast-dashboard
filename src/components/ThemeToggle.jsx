import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ theme, onChange }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="theme-toggle">
      <div 
        className="theme-options"
        role="radiogroup"
        aria-label="Select theme"
      >
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={`theme-option ${theme === value ? 'active' : ''}`}
            onClick={() => onChange(value)}
            role="radio"
            aria-checked={theme === value}
            aria-label={label}
            type="button"
          >
            <Icon className="theme-icon" size={18} />
            <span className="theme-label">{label}</span>
            {theme === value && <span className="theme-check" />}
          </button>
        ))}
      </div>

      <style jsx>{`
        .theme-toggle {
          position: relative;
        }
        .theme-options {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 0.25rem;
        }
        .theme-option {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-full);
          color: var(--color-text-muted);
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .theme-option:hover {
          color: var(--color-text);
          background: var(--color-bg-card-hover);
        }
        .theme-option.active {
          color: var(--color-primary);
          background: var(--color-primary-glow);
        }
        .theme-option.active .theme-icon {
          color: var(--color-primary);
        }
        .theme-icon {
          flex-shrink: 0;
          transition: color var(--transition-fast);
        }
        .theme-label {
          display: none;
        }
        .theme-option.active .theme-label {
          display: inline;
        }
        .theme-check {
          display: none;
        }
        @media (min-width: 640px) {
          .theme-label {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}