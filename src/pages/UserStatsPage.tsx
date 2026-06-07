// src/pages/UserStatsPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import { 
  Users,
  Search,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { useAuth } from '../hooks/useAuth';
import { getDeveloperStats } from '../services/mockData';
import type { DeveloperStat } from '../types/stats';
import { fadeInUp } from '../utils/animations';

export const UserStatsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh', 
          gap: '1rem', 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow)'
        }}
        className="login-card-container"
      >
        <ShieldAlert size={48} style={{ color: 'var(--accent-danger)' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Erişim Yetkisi Sınırlandırıldı</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          Bu istatistik sayfasını görüntülemek için <strong>Yönetici (admin)</strong> yetkilerine sahip olmanız gerekmektedir. Geliştirici (developer) ve Gözlemci (viewer) hesaplarının bu alana erişimi sınırlandırılmıştır.
        </p>
      </div>
    );
  }
  
  // Data states
  const [stats, setStats] = useState<DeveloperStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDeveloperStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load developer stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredStats = stats.filter(dev => 
    dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for avatar colors based on username
  const getAvatarBgColor = (name: string) => {
    const avatarColors = [
      '#2563EB', // Blue
      '#059669', // Green
      '#D97706', // Orange
      '#4F46E5', // Indigo
      '#DB2777', // Pink
      '#7C3AED', // Purple
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kullanıcı ve Geliştirici İstatistikleri</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Geliştiricilerin commit sayıları, AI kod inceleme kararları, LLM token tüketimleri ve bütçe maliyet analizleri.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="btn-transition flex-center"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            width: '38px',
            height: '38px'
          }}
          title="Verileri Yenile"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px', color: 'var(--accent-primary)' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.75rem' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>İstatistikler yükleniyor...</span>
        </div>
      ) : (
        <div className="animate-fade" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
          
          {/* Header info with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Geliştirici Performans Matrisi</h3>
            </div>

            {/* Search input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Geliştirici adına göre ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Polished Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>GELİŞTİRİCİ</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMMIT SAYISI</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TAMAMLANAN İNCELEME</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>KARAR DAĞILIMI (ONAY/RED)</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BAŞARI (ONAY) ORANI</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LLM TOKEN TÜKETİMİ</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AJAN MALİYETİ</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((dev) => {
                  const approvalRate = dev.reviewsCompleted > 0 
                    ? Math.round((dev.approvedCount / dev.reviewsCompleted) * 100)
                    : 0;
                  return (
                    <tr 
                      key={dev.id} 
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="btn-transition"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Developer Identity */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div 
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: getAvatarBgColor(dev.name),
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {dev.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dev.name}</span>
                        </div>
                      </td>

                      {/* Commits Count */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {dev.commitsCount}
                      </td>

                      {/* Reviews Completed */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {dev.reviewsCompleted}
                      </td>

                      {/* Approved vs Rejected inline badge */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>{dev.approvedCount} Onay</span>
                          <span style={{ color: 'var(--text-muted)' }}>/</span>
                          <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>{dev.rejectedCount} Red</span>
                        </div>
                      </td>

                      {/* Success Badge */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem' }}>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: approvalRate >= 85 ? 'var(--glow-green)' : approvalRate >= 70 ? 'var(--glow-warning)' : 'var(--glow-red)',
                            color: approvalRate >= 85 ? 'var(--accent-success)' : approvalRate >= 70 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                            border: `1px solid ${approvalRate >= 85 ? 'rgba(5, 150, 105, 0.2)' : approvalRate >= 70 ? 'rgba(217, 119, 6, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
                          }}
                        >
                          %{approvalRate} Başarı
                        </span>
                      </td>

                      {/* Token Usage */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {dev.tokenUsage.toLocaleString()} tokens
                      </td>

                      {/* Cost USD */}
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        ${dev.costUsd.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSS spin animation keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserStatsPage;
