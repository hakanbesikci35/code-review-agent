import React from 'react';
import { LayoutDashboard, FileSpreadsheet, LogOut, Cpu } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'rapor';
  setActiveTab: (tab: 'dashboard' | 'rapor') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <h2>LST-AI</h2>
          <p>Agentic Automation</p>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`sidebar-menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-menu-btn ${activeTab === 'rapor' ? 'active' : ''}`}
            onClick={() => setActiveTab('rapor')}
          >
            <FileSpreadsheet />
            <span>Rapor</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">

        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};
