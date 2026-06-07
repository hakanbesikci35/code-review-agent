// src/layouts/Header.tsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Cpu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '../utils/constants';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const [hasNotifications] = useState(true);



  const getBreadcrumb = () => {
    const path = location.pathname;
    let sectionName = 'Panel';
    
    if (path === ROUTES.DASHBOARD) sectionName = 'Dashboard';
    else if (path === ROUTES.INTEGRATIONS) sectionName = 'Entegrasyonlar';
    else if (path === ROUTES.REVIEW_RULES) sectionName = 'İnceleme Kuralları';
    else if (path === ROUTES.TEST_CONFIGS) sectionName = 'Test Yapılandırmaları';
    else if (path === ROUTES.EVENT_LOGS) sectionName = 'Olay Günlükleri';
    else if (path === ROUTES.MERGE_REVIEWS) sectionName = 'Birleştirme İncelemeleri';
    else if (path === ROUTES.FUNCTIONAL_TESTS) sectionName = 'Fonksiyonel Testler';
    else if (path === ROUTES.PROMOTIONS) sectionName = 'Dağıtımlar';
    else if (path === ROUTES.USER_STATS) sectionName = 'Kullanıcı İstatistikleri';
    else if (path.startsWith(ROUTES.SPRINT_DETAIL)) sectionName = 'Sprint Detayları';
    else if (path.includes('/pipeline')) sectionName = 'Task Pipeline';

    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>LST AI</span>
        <span>/</span>
        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{sectionName}</span>
      </div>
    );
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
      }}
    >
      {/* Mobile Burger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="btn-transition mobile-menu-btn"
            style={{
              display: 'none', // Toggle via CSS media query
              padding: '0.5rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <Cpu size={18} />
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {getBreadcrumb()}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="btn-transition flex-center"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          aria-label="Bildirimler"
        >
          <Bell size={18} />
          {hasNotifications && (
            <span 
              style={{
                position: 'absolute',
                top: '10px',
                right: '12px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-danger)',
                display: 'block',
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
