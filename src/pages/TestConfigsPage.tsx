import React, { useRef, useState, useEffect } from 'react';
import {
  Settings2,
  Clock,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getTestConfigs, toggleTestConfig, updateTestConfig, deleteTestConfig } from '../services/mockData';
import type { TestConfig, TestRunner } from '../types/test';
import { fadeInUp } from '../utils/animations';

export const TestConfigsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [configs, setConfigs] = useState<TestConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [search, setSearch] = useState('');
  const [runnerFilter, setRunnerFilter] = useState('');

  // Configure modal state
  const [editingConfig, setEditingConfig] = useState<TestConfig | null>(null);
  const [envKey, setEnvKey] = useState('');
  const [envVal, setEnvVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);

  const loadData = async (
    currentPage = page,
    currentSearch = search,
    currentRunner = runnerFilter
  ) => {
    setLoading(true);
    try {
      const res = await getTestConfigs(currentPage, 5, currentSearch, currentRunner);
      setConfigs(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      if (res.activeCount !== undefined) {
        setActiveCount(res.activeCount);
      }
    } catch (err) {
      console.error('Failed to load configs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search, runnerFilter);
  }, [page]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.config-row-animate'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search, runnerFilter);
  };

  const handleFilterChange = (newRunner: string) => {
    setRunnerFilter(newRunner);
    setPage(1);
    loadData(1, search, newRunner);
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTestConfig(id);
      loadData(page, search, runnerFilter);
    } catch (err) {
      alert('İşlem başarısız.');
    }
  };

  const startEdit = (cfg: TestConfig) => {
    setEditingConfig({ ...cfg, envVariables: { ...cfg.envVariables } });
    setEnvKey('');
    setEnvVal('');
  };

  const handleSave = async () => {
    if (!editingConfig) return;
    setIsSaving(true);
    try {
      await updateTestConfig(editingConfig);
      setEditingConfig(null);
      loadData(page, search, runnerFilter);
    } catch (err) {
      alert('Güncelleme başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cfg: TestConfig) => {
    const confirmed = window.confirm(`"${cfg.name}" yapılandırması kaldırılsın mı? Bu işlem geri alınamaz.`);
    if (!confirmed) return;

    setDeletingConfigId(cfg.id);
    try {
      await deleteTestConfig(cfg.id);
      const nextTotal = Math.max(totalCount - 1, 0);
      const nextTotalPages = Math.max(Math.ceil(nextTotal / 5), 1);
      const nextPage = Math.min(page, nextTotalPages);
      setPage(nextPage);
      loadData(nextPage, search, runnerFilter);
    } catch (err) {
      alert('Yapılandırma kaldırılamadı.');
    } finally {
      setDeletingConfigId(null);
    }
  };

  const addEnvVar = () => {
    if (!envKey || !editingConfig) return;
    setEditingConfig((c) => c && ({ ...c, envVariables: { ...c.envVariables, [envKey]: envVal } }));
    setEnvKey('');
    setEnvVal('');
  };

  const removeEnvVar = (key: string) => {
    setEditingConfig((c) => {
      if (!c) return c;
      const copy = { ...c.envVariables };
      delete copy[key];
      return { ...c, envVariables: copy };
    });
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Test Yapılandırmaları</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Fonksiyonel Test Ajanı tarafından çalıştırılacak test suitlerinin koşum komutları, ortam değişkenleri ve timeout limitleri.
        </p>
      </div>

      {/* Active summary */}
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Settings2 size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {totalCount} Yapılandırmadan <span style={{ color: 'var(--accent-primary)' }}>{activeCount}</span> tanesi aktif durumda
          </span>
        </div>
      </div>

      {/* Search and Filters */}
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
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Yapılandırmalarda arama yapın..." 
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
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Ara
          </button>
        </form>

        {/* Runner filter */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          
          <select
            value={runnerFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tüm Runner'lar</option>
            <option value="jest">JEST</option>
            <option value="playwright">PLAYWRIGHT</option>
            <option value="vitest">VITEST</option>
            <option value="cypress">CYPRESS</option>
          </select>
        </div>
      </div>

      {/* Configurations Table Wrapper */}
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow)',
          overflowX: 'auto',
          position: 'relative'
        }}
      >
        {loading && configs.length === 0 && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '20vh', color: 'var(--accent-primary)' }}>
            <span 
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent-primary)',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginRight: '0.5rem',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Yükleniyor...</span>
          </div>
        )}

        {loading && configs.length > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(1px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 0.5rem', width: '80px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DURUM</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '220px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>YAPILANDIRMA ADI</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '250px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KOŞUM KOMUTU</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '120px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ZAMAN AŞIMI</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ORTAM DEĞİŞKENLERİ (ENV)</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '250px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                  Kriterlere uygun yapılandırma bulunamadı.
                </td>
              </tr>
            ) : (
              configs.map((cfg) => (
                <tr
                  key={cfg.id}
                  className="config-row-animate"
                  style={{ borderBottom: '1px solid var(--border)', opacity: cfg.isActive ? 1 : 0.55, transition: 'opacity var(--transition-fast)' }}
                >
                  {/* Status Toggle */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <button onClick={() => handleToggle(cfg.id)} className="btn-transition flex-center" style={{ color: cfg.isActive ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} title={cfg.isActive ? 'Devre Dışı Bırak' : 'Etkinleştir'}>
                      {cfg.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </td>

                  {/* Name & Runner */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cfg.name}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{cfg.runner} Runner</span>
                    </div>
                  </td>

                  {/* Command */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <code style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-primary)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>{cfg.command}</code>
                  </td>

                  {/* Timeout */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cfg.timeoutSeconds} sn</span>
                    </div>
                  </td>

                  {/* ENV Variables */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {Object.entries(cfg.envVariables).map(([key, val]) => (
                        <span key={key} style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          <strong>{key}</strong>={val}
                        </span>
                      ))}
                      {Object.keys(cfg.envVariables).length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={() => startEdit(cfg)} className="btn-transition flex-center" style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, gap: '0.25rem', cursor: 'pointer' }}>
                        <Settings2 size={12} />
                        <span>Yapılandır</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cfg)}
                        disabled={deletingConfigId === cfg.id}
                        className="btn-transition flex-center"
                        style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(220, 38, 38, 0.24)', backgroundColor: 'var(--glow-red)', color: 'var(--accent-danger)', fontSize: '0.75rem', fontWeight: 600, gap: '0.25rem', cursor: deletingConfigId === cfg.id ? 'not-allowed' : 'pointer', opacity: deletingConfigId === cfg.id ? 0.65 : 1 }}
                      >
                        <Trash2 size={12} />
                        <span>{deletingConfigId === cfg.id ? 'Kaldırılıyor...' : 'Kaldır'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div 
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
            Toplam <strong>{totalCount}</strong> kayıttan <strong>{(page - 1) * 5 + 1}-{Math.min(page * 5, totalCount)}</strong> arası gösteriliyor
          </span>

          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {/* Prev button */}
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page indices */}
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

            {/* Next button */}
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CONFIGURE MODAL */}
      {editingConfig && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '580px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Yapılandırmayı Düzenle</h3>
              </div>
              <button type="button" onClick={() => !isSaving && setEditingConfig(null)} disabled={isSaving} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }} className="custom-scroll">
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>YAPILANDIRMA ADI</label>
                <input type="text" value={editingConfig.name} onChange={(e) => setEditingConfig((c) => c && ({ ...c, name: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
              </div>

              {/* Runner + Timeout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>TEST RUNNER</label>
                  <select value={editingConfig.runner} onChange={(e) => setEditingConfig((c) => c && ({ ...c, runner: e.target.value as TestRunner }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                    <option value="jest">JEST</option>
                    <option value="playwright">PLAYWRIGHT</option>
                    <option value="vitest">VITEST</option>
                    <option value="cypress">CYPRESS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>ZAMAN AŞIMI (sn)</label>
                  <input type="number" value={editingConfig.timeoutSeconds} onChange={(e) => setEditingConfig((c) => c && ({ ...c, timeoutSeconds: parseInt(e.target.value, 10) || 0 }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
                </div>
              </div>

              {/* Command */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>KOŞUM KOMUTU</label>
                <input type="text" value={editingConfig.command} onChange={(e) => setEditingConfig((c) => c && ({ ...c, command: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
              </div>

              {/* ENV Variables */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>ORTAM DEĞİŞKENLERİ (ENV)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {Object.entries(editingConfig.envVariables).map(([key, val]) => (
                    <span key={key} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong>{key}</strong>={val}
                      <button type="button" onClick={() => removeEnvVar(key)} style={{ color: 'var(--accent-danger)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex' }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {Object.keys(editingConfig.envVariables).length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Henüz değişken eklenmedi</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="text" placeholder="KEY" value={envKey} onChange={(e) => setEnvKey(e.target.value.toUpperCase())} style={{ width: '90px', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none' }} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>=</span>
                  <input type="text" placeholder="VALUE" value={envVal} onChange={(e) => setEnvVal(e.target.value)} style={{ flex: 1, padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none' }} />
                  <button type="button" onClick={addEnvVar} disabled={!envKey} style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', backgroundColor: envKey ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: envKey ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: envKey ? 'pointer' : 'not-allowed' }}>
                    + Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
              <button type="button" onClick={() => setEditingConfig(null)} disabled={isSaving} style={{ padding: '0.45rem 1rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                Vazgeç
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving || !editingConfig.name.trim()} style={{ padding: '0.45rem 1.25rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--accent-primary)', border: 'none', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: (isSaving || !editingConfig.name.trim()) ? 'not-allowed' : 'pointer', opacity: (isSaving || !editingConfig.name.trim()) ? 0.6 : 1 }}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS spinner rule */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TestConfigsPage;
