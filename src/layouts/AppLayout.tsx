// src/layouts/AppLayout.tsx
import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../hooks/useAuth';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ROUTES } from '../utils/constants';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--accent-primary)',
          gap: '1rem',
        }}
      >
        <span 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
          }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          Sistem yükleniyor...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar — fixed drawer on mobile, flex child on desktop */}
      <div
        style={isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 110,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
        } : {
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 105,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Header onMenuToggle={toggleSidebar} />
        
        {/* Page content scroll container */}
        <main 
          style={{
            flex: 1,
            padding: isMobile ? '1rem' : '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Add mobile CSS hacks */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
export default AppLayout;
