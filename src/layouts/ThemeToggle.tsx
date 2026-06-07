// src/layouts/ThemeToggle.tsx
import React, { useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { gsap } from 'gsap';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const iconRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // GSAP micro-animation for theme toggle
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotate: 0, scale: 0.8 },
        { rotate: 360, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="btn-transition flex-center"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        outline: 'none',
      }}
      aria-label="Temayı Değiştir"
    >
      <div ref={iconRef} className="flex-center">
        {theme === 'light' ? (
          <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
        ) : (
          <Sun size={18} style={{ color: 'var(--accent-warning)' }} />
        )}
      </div>
    </button>
  );
};
