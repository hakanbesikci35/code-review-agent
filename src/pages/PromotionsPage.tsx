import React, { useRef, useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Rocket, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  X,
  Server
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getPromotions, createPromotion } from '../services/mockData';
import type { Promotion, Environment } from '../types/promotion';
import { formatDate } from '../utils/formatters';
import { fadeInUp } from '../utils/animations';

export const PromotionsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Listing state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal and simulation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [sourceEnv, setSourceEnv] = useState<Environment>('testing');
  const [targetEnv, setTargetEnv] = useState<Environment>('staging');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  const loadData = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    try {
      const res = await getPromotions(currentPage, 10, currentSearch);
      setPromotions(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load promotions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search);
  }, [page]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search);
  };

  const handleTriggerDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    setIsDeploying(true);
    setDeployProgress(0);
    setDeployLogs([]);

    const targetVersion = `v${Math.floor(Math.random() * 2) + 2}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}`;
    const logs = [
      `[SYSTEM] Dağıtım işlemi başlatıldı: ${promoTitle}`,
      `[SYSTEM] Kaynak Ortam: ${sourceEnv.toUpperCase()} | Hedef Ortam: ${targetEnv.toUpperCase()}`,
      `[BUILD] Kod paketi oluşturuluyor...`,
      `[BUILD] Bağımlılıklar indiriliyor ve önbellekten yükleniyor...`,
      `[BUILD] TypeScript derleniyor (tsc)...`,
      `[BUILD] Vite production paketi başarıyla derlendi. Versiyon: ${targetVersion}`,
      `[DEPLOY] Hedef sunucularla bağlantı kuruluyor...`,
      `[DEPLOY] '${targetEnv}' Docker konteynerleri güncelleniyor...`,
      `[DEPLOY] Çevre yapılandırması ve port yönlendirmeleri doğrulanıyor...`,
      `[TEST] Hızlı duman (smoke) testleri koşturuluyor...`,
      `[TEST] ✓ Healthcheck API endpoint'i başarılı yanıt verdi (200 OK)`,
      `[SYSTEM] Dağıtım başarıyla tamamlandı! Trafik yeni sürüme yönlendiriliyor.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setDeployLogs(prev => [...prev, logs[step]]);
        setDeployProgress(Math.min(Math.floor(((step + 1) / logs.length) * 100), 100));
        step++;
      } else {
        clearInterval(interval);

        createPromotion({
          title: promoTitle,
          sourceEnv,
          targetEnv,
          actor: 'Geliştirici (Simüle)'
        }).then(() => {
          setIsDeploying(false);
          setTimeout(() => {
            setIsModalOpen(false);
            setPromoTitle('');
            setPage(1);
            loadData(1, search);
          }, 1500);
        });
      }
    }, 450);
  };

  const getEnvBadgeColor = (env: Environment) => {
    switch (env) {
      case 'production':
        return { bg: 'var(--glow-red)', text: 'var(--accent-danger)', border: 'rgba(220, 38, 38, 0.2)' };
      case 'staging':
        return { bg: 'var(--glow-warning)', text: 'var(--accent-warning)', border: 'rgba(217, 119, 6, 0.2)' };
      case 'testing':
        return { bg: 'var(--glow-blue)', text: 'var(--accent-primary)', border: 'rgba(37, 99, 235, 0.2)' };
      default:
        return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'success':
        return { bg: 'var(--glow-green)', text: 'var(--accent-success)', border: 'rgba(5, 150, 105, 0.2)', label: 'TAMAMLANDI' };
      case 'failed':
        return { bg: 'var(--glow-red)', text: 'var(--accent-danger)', border: 'rgba(220, 38, 38, 0.2)', label: 'HATA' };
      default:
        return { bg: 'var(--glow-blue)', text: 'var(--accent-primary)', border: 'rgba(37, 99, 235, 0.2)', label: 'YÜKLENİYOR' };
    }
  };

  // Quick stats calculations
  const totalSuccess = promotions.filter(p => p.status === 'success').length;
  const avgDuration = promotions.length > 0
    ? Math.round(promotions.reduce((sum, p) => sum + p.durationSeconds, 0) / promotions.length)
    : 0;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dağıtım ve Ortam Terfileri (Promotions)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Başarılı test ve kod incelemelerinden geçen sürümlerin üst ortamlara (Staging, Production) dağıtım kayıtları ve takibi.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setPromoTitle('');
            setDeployLogs([]);
            setDeployProgress(0);
            setIsDeploying(false);
          }}
          className="btn-transition"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            borderRadius: 'var(--border-radius-sm)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Rocket size={15} />
          Yeni Sürüm Dağıt
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Deploys */}
        <div 
          className="animate-fade"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-green)', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>BAŞARILI DAĞITIMLAR</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalSuccess} / {promotions.length}
            </span>
          </div>
        </div>

        {/* Card 2: Average Duration */}
        <div 
          className="animate-fade"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-blue)', color: 'var(--accent-primary)' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ORT. DAĞITIM SÜRESİ</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {avgDuration} sn
            </span>
          </div>
        </div>

        {/* Card 3: Active Production version */}
        <div 
          className="animate-fade"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-warning)', color: 'var(--accent-warning)' }}>
            <Server size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>AKTİF PROD SÜRÜMÜ</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {promotions.find(p => p.targetEnv === 'production' && p.status === 'success')?.version || 'v2.1.2'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Versiyon, dağıtım adı veya geliştirici ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
          <button 
            type="submit"
            className="btn-transition"
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Ara
          </button>
        </form>
      </div>

      {/* Promotions Table */}
      <div 
        className="animate-fade"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow)',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--accent-primary)' }}>
            <span 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--accent-primary)',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginRight: '0.75rem',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Dağıtımlar sorgulanıyor...</span>
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Hiçbir dağıtım kaydı bulunamadı.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DURUM</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>VERSİYON</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DAĞITIM AÇIKLAMASI</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AKTARIM (ENV)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SÜRE</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TETİKLEYEN</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TARİH</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => {
                const sStyle = getStatusBadgeStyle(promo.status);
                const sourceBadge = getEnvBadgeColor(promo.sourceEnv);
                const targetBadge = getEnvBadgeColor(promo.targetEnv);
                return (
                  <tr 
                    key={promo.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="btn-transition"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Status */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span 
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: sStyle.bg,
                          color: sStyle.text,
                          border: `1px solid ${sStyle.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {promo.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {sStyle.label}
                      </span>
                    </td>

                    {/* Version */}
                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {promo.version}
                    </td>

                    {/* Title */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {promo.title}
                    </td>

                    {/* Env transition */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: sourceBadge.bg, color: sourceBadge.text, border: `1px solid ${sourceBadge.border}` }}>
                          {promo.sourceEnv.toUpperCase()}
                        </span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: targetBadge.bg, color: targetBadge.text, border: `1px solid ${targetBadge.border}` }}>
                          {promo.targetEnv.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {promo.durationSeconds} sn
                    </td>

                    {/* Actor */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} style={{ color: 'var(--text-muted)' }} />
                        {promo.actor}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(promo.promotedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div 
          className="animate-fade"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '0.75rem 1rem',
            boxShadow: 'var(--shadow)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Toplam <strong>{totalCount}</strong> kayıttan <strong>{(page - 1) * 10 + 1}-{Math.min(page * 10, totalCount)}</strong> arası gösteriliyor
          </span>

          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="btn-transition flex-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const active = page === idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: active ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="btn-transition flex-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TRIGGER PROMOTION MODAL */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius-lg)',
              width: '100%',
              maxWidth: '600px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Rocket size={18} className={isDeploying ? 'spin-anim' : ''} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Sürüm Dağıtım Paneli</h3>
              </div>
              <button 
                onClick={() => !isDeploying && setIsModalOpen(false)}
                disabled={isDeploying}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isDeploying ? 'not-allowed' : 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form & Simulation Log */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              
              {!isDeploying && deployLogs.length === 0 ? (
                <form onSubmit={handleTriggerDeploy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>DAĞITIM AÇIKLAMASI</label>
                    <input 
                      type="text"
                      placeholder="Örn: v2.2.0 Production Terfi Koşumu"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Environments Transition Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>KAYNAK ORTAM (SOURCE)</label>
                      <select
                        value={sourceEnv}
                        onChange={(e) => setSourceEnv(e.target.value as Environment)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: 'var(--border-radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="development">DEVELOPMENT</option>
                        <option value="testing">TESTING</option>
                        <option value="staging">STAGING</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
                      <ArrowRight size={18} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>HEDEF ORTAM (TARGET)</label>
                      <select
                        value={targetEnv}
                        onChange={(e) => setTargetEnv(e.target.value as Environment)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: 'var(--border-radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="testing">TESTING</option>
                        <option value="staging">STAGING</option>
                        <option value="production">PRODUCTION</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-blue)', border: '1px solid rgba(37,99,235,0.1)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Zap size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '0.1rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      <strong>Not:</strong> Dağıtım başlatıldığında sistem otomatik olarak kod paketini derleyecek, duman testlerini (smoke tests) çalıştıracak ve hedef sunucu kümesine entegrasyonu tamamlayacaktır.
                    </span>
                  </div>

                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DAĞITIM AŞAMALARI VE LOGLARI:</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>%{deployProgress}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${deployProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '3px', transition: 'width 0.25s ease' }} />
                  </div>

                  {/* Log console */}
                  <div 
                    style={{
                      flex: 1,
                      backgroundColor: '#0F172A',
                      color: '#34D399',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '1rem',
                      borderRadius: 'var(--border-radius-sm)',
                      height: '240px',
                      overflowY: 'auto',
                      border: '1px solid #1E293B',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                      lineHeight: '1.4'
                    }}
                  >
                    {deployLogs.map((log, idx) => {
                      let color = '#34D399';
                      if (log.startsWith('[SYSTEM]')) color = '#94A3B8';
                      else if (log.startsWith('[BUILD]')) color = '#38BDF8';
                      else if (log.includes('✓')) color = '#34D399';
                      else if (log.includes('HATA')) color = '#F87171';
                      
                      return (
                        <div key={idx} style={{ color, marginBottom: '0.25rem' }}>
                          {log}
                        </div>
                      );
                    })}
                    {isDeploying && (
                      <span style={{ display: 'inline-block', width: '8px', height: '14px', backgroundColor: '#34D399', marginLeft: '2px', animation: 'blink 0.8s infinite' }} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
              {!isDeploying && deployLogs.length === 0 ? (
                <>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={handleTriggerDeploy}
                    disabled={!promoTitle.trim()}
                    style={{
                      padding: '0.45rem 1.25rem',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'var(--accent-primary)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: !promoTitle.trim() ? 'not-allowed' : 'pointer',
                      opacity: !promoTitle.trim() ? 0.6 : 1,
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    Dağıtımı Başlat
                  </button>
                </>
              ) : isDeploying ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                  <span className="spin-anim" style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent-primary)' }} />
                  Dağıtım devam ediyor...
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.45rem 1.25rem',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--accent-primary)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS rules for blinking cursor and animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PromotionsPage;
