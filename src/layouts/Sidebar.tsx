// src/layouts/Sidebar.tsx
import React, { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Link2,
  ShieldCheck,
  Sliders,
  Terminal,
  GitPullRequest,
  Activity,
  ArrowUpCircle,
  UserCheck,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGSAP } from '../hooks/useGSAP';
import { ROUTES } from '../utils/constants';
import { gsap } from 'gsap';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Hover states for links
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [logoutHovered, setLogoutHovered] = useState(false);

  // GSAP animation when sidebar mounts
  useGSAP(() => {
    gsap.from(sidebarRef.current, {
      x: -60,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, { scope: sidebarRef });

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: ROUTES.INTEGRATIONS, label: 'Entegrasyonlar', icon: <Link2 size={18} /> },
    { path: ROUTES.REVIEW_RULES, label: 'İnceleme Kuralları', icon: <ShieldCheck size={18} /> },
    { path: ROUTES.TEST_CONFIGS, label: 'Test Yapılandırmaları', icon: <Sliders size={18} /> },
    { path: ROUTES.EVENT_LOGS, label: 'Olay Günlükleri', icon: <Terminal size={18} /> },
    { path: ROUTES.MERGE_REVIEWS, label: 'Birleştirme İncelemeleri', icon: <GitPullRequest size={18} /> },
    { path: ROUTES.FUNCTIONAL_TESTS, label: 'Fonksiyonel Testler', icon: <Activity size={18} /> },
    { path: ROUTES.PROMOTIONS, label: 'Dağıtımlar (Promotions)', icon: <ArrowUpCircle size={18} /> },
    { path: `${ROUTES.SPRINT_DETAIL}/sprint_2`, label: 'Sprint Detayları', icon: <Layers size={18} /> },
    ...(user?.role === 'admin' ? [
      { path: ROUTES.USER_STATS, label: 'Kullanıcı İstatistikleri', icon: <UserCheck size={18} /> },
    ] : []),
  ];

  // Translate role to Turkish
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'developer': return 'Geliştirici';
      case 'viewer': return 'Gözlemci';
      default: return role;
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
      }}
    >
      {/* Brand Header */}
      <div 
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--border)',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Terminal size={16} />
          </div>
          <div>
            <span 
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                display: 'block',
              }}
            >
              LST AI
            </span>
            <span 
              style={{
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'block',
                marginTop: '-2px',
              }}
            >
              CI/CD Otomasyonu
            </span>
          </div>
        </div>

        {/* Online Status Dot */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '0.2rem 0.4rem',
            borderRadius: '10px',
            backgroundColor: 'var(--glow-green)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
          }}
          title="Sistem Çevrimiçi"
        >
          <span 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-success)',
              display: 'inline-block',
              boxShadow: '0 0 8px var(--accent-success)',
            }} 
          />
          <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--accent-success)', textTransform: 'uppercase' }}>Live</span>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        style={{
          flex: 1,
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
        }}
        className="custom-scroll"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => setHoveredPath(item.path)}
            onMouseLeave={() => setHoveredPath(null)}
            style={({ isActive }) => {
              const isHovered = hoveredPath === item.path;
              return {
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: isActive 
                  ? '#ffffff' 
                  : (isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'),
                background: isActive 
                  ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4F46E5 100%)' 
                  : (isHovered ? 'var(--bg-elevated)' : 'transparent'),
                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                transform: isHovered && !isActive ? 'translateX(3px)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              };
            }}
            className="sidebar-link"
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Area */}
      {user && (
        <div 
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} 
              alt={user.name} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div 
                style={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </div>
              <span 
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
          
          {/* Sleek Logout Button next to name */}
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            className="btn-transition flex-center"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: logoutHovered ? 'var(--glow-red)' : 'transparent',
              color: logoutHovered ? 'var(--accent-danger)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
