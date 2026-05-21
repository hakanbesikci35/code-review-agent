import React from 'react';
import { Search, Sun, Moon, ToggleLeft, ToggleRight } from 'lucide-react';
import type { User, Theme } from '../types';

interface TopbarProps {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: User;
  telemetryActive: boolean;
  setTelemetryActive: (active: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'dashboard' | 'rapor';
}

export const Topbar: React.FC<TopbarProps> = ({
  theme,
  toggleTheme,
  currentUser,
  telemetryActive,
  setTelemetryActive,
  searchQuery,
  setSearchQuery,
  activeTab
}) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="topbar-search"
            placeholder={
              activeTab === 'dashboard' 
                ? "Ajanlar, kararlar veya telemetri ara..." 
                : "Kurallar veya e-postalar içinde ara..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Telemetry Indicator */}
        <div 
          className="telemetry-badge" 
          onClick={() => setTelemetryActive(!telemetryActive)}
          title="Canlı Veri Akışını Aç/Kapa"
        >
          <div className={`telemetry-dot ${telemetryActive ? '' : 'inactive'}`}></div>
          <span>Canlı Veri Akışı: {telemetryActive ? 'Açık' : 'Kapalı'}</span>
          {telemetryActive ? (
            <ToggleRight size={16} style={{ color: 'var(--primary)' }} />
          ) : (
            <ToggleLeft size={16} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        <div className="topbar-actions">
          {/* Theme Toggle Button */}
          <button 
            className="topbar-action-btn" 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
          >
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
        </div>

        {/* Profile Info */}
        <div className="profile-widget">
          <div className="avatar-container" title={currentUser.email}>
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.username} 
                className="avatar-image" 
              />
            ) : (
              currentUser.username.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">
              {currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)}
            </span>
            <span className="profile-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
