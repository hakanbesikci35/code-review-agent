// src/pages/EventLogsPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Filter, 
  Play, 
  Square
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getEventLogs, addEventLog } from '../services/mockData';
import type { EventLog, LogLevel } from '../types/event';
import { formatDate } from '../utils/formatters';
import { fadeInUp } from '../utils/animations';

export const EventLogsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  
  // States
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [source, setSource] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Simulator State
  const [simulatorActive, setSimulatorActive] = useState(true);

  // Load paginated data
  const loadLogs = async (currentPage = page, currentSearch = search, currentLevel = level, currentSource = source) => {
    setLoading(true);
    try {
      const res = await getEventLogs(currentPage, 10, currentSearch, currentLevel, currentSource);
      setLogs(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(page, search, level, source);
  }, [page]);

  // Handle live logs simulator
  useEffect(() => {
    if (!simulatorActive) return;

    // Simulated event lists
    const mockEvents = [
      { level: 'info' as LogLevel, source: 'webhook' as const, message: "GitHub webhook tetiklendi: 'push' olayı alındı." },
      { level: 'info' as LogLevel, source: 'review_agent' as const, message: 'AI Review Agent dosyaları analiz etmeye başladı...' },
      { level: 'success' as LogLevel, source: 'review_agent' as const, message: 'AI Review Agent: Güvenlik kontrolü tamamlandı, kritik hata bulunamadı.' },
      { level: 'warning' as LogLevel, source: 'system' as const, message: 'LLM Token kotası %85 doluluk oranına ulaştı.' },
      { level: 'info' as LogLevel, source: 'dev_merge' as const, message: 'Otomatik merge işlemi için dal entegrasyonu başlandı.' },
      { level: 'success' as LogLevel, source: 'dev_merge' as const, message: 'Merge başarılı! main dalı güncellendi.' },
      { level: 'info' as LogLevel, source: 'test_runner' as const, message: 'Fonksiyonel test runner Playwright ayağa kalkıyor...' },
      { level: 'success' as LogLevel, source: 'test_runner' as const, message: 'E2E Testler tamamlandı: 24 passed, 0 failed.' },
      { level: 'error' as LogLevel, source: 'system' as const, message: 'Jira API bağlantısında zaman aşımı hatası (Timeout: 5000ms).' },
    ];

    const interval = setInterval(() => {
      // Pick random event
      const randEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      addEventLog(randEvent);
      
      // Re-fetch current logs silently to update lists
      loadLogs(page, search, level, source);
    }, 6000); // Push log every 6 seconds

    return () => clearInterval(interval);
  }, [simulatorActive, page, search, level, source]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs(1, search, level, source);
  };

  const handleFilterChange = (newLevel: LogLevel | '', newSource: string) => {
    setLevel(newLevel);
    setSource(newSource);
    setPage(1);
    loadLogs(1, search, newLevel, newSource);
  };

  const getLevelColor = (lvl: LogLevel) => {
    switch (lvl) {
      case 'error': return '#EF4444'; // Red
      case 'warning': return '#F59E0B'; // Orange
      case 'success': return '#10B981'; // Green
      case 'debug': return '#8B5CF6'; // Purple
      default: return '#38BDF8'; // Light Blue (info)
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      
      {/* Title section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sistem Olay Günlükleri</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Tüm CI/CD adımlarını, AI analiz sonuçlarını ve sistem akışlarını terminal arayüzünden canlı izleyin.
          </p>
        </div>

        {/* Simulator controls */}
        <button
          onClick={() => setSimulatorActive(!simulatorActive)}
          className="btn-transition flex-center"
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: simulatorActive ? 'var(--glow-green)' : 'var(--bg-elevated)',
            border: `1px solid ${simulatorActive ? 'rgba(5, 150, 105, 0.3)' : 'var(--border)'}`,
            color: simulatorActive ? 'var(--accent-success)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          {simulatorActive ? <Square size={14} /> : <Play size={14} />}
          <span>{simulatorActive ? 'Simülatörü Durdur' : 'Canlı Akışı Başlat'}</span>
        </button>
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
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Loglarda arama yapın..." 
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

        {/* Source Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={source}
            onChange={(e) => handleFilterChange(level, e.target.value)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="">Tüm Kaynaklar</option>
            <option value="webhook">Webhook</option>
            <option value="review_agent">Review Agent</option>
            <option value="dev_merge">Dev Merge</option>
            <option value="test_runner">Test Runner</option>
            <option value="system">Sistem</option>
          </select>

          {/* Level Filter */}
          <select
            value={level}
            onChange={(e) => handleFilterChange(e.target.value as any, source)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="">Tüm Seviyeler</option>
            <option value="info">Bilgi (Info)</option>
            <option value="success">Başarılı (Success)</option>
            <option value="warning">Uyarı (Warning)</option>
            <option value="error">Hata (Error)</option>
          </select>
        </div>
      </div>

      {/* Terminal logs screen */}
      <div 
        className="terminal-3d-card"
        style={{
          flex: 1,
          backgroundColor: '#090D16',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid #1E293B',
          padding: '1.5rem',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '450px',
        }}
      >
        {/* Console titlebar */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid #1E293B', 
            paddingBottom: '0.75rem',
            marginBottom: '1rem' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TerminalIcon size={16} style={{ color: '#64748B' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              LST_AI_LOGGER@CONSOLE:~
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
        </div>

        {/* Console stream viewport */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            paddingRight: '0.5rem',
          }}
          className="custom-scroll"
        >
          {loading && logs.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <RefreshCw size={16} className="pulse-step-blue" style={{ animation: 'spin 1.5s linear infinite', marginRight: '0.5rem' }} />
              <span>Log dosyaları taranıyor...</span>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#64748B', fontStyle: 'italic' }}>
              Kriterlere uyan hiçbir olay günlüğü kaydı bulunamadı.
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="animate-fade"
                style={{ 
                  display: 'flex', 
                  alignItems: 'start', 
                  gap: '0.75rem',
                  borderBottom: '1px solid #1e293b20',
                  paddingBottom: '0.4rem',
                }}
              >
                {/* Timestamp */}
                <span style={{ color: '#475569', userSelect: 'none' }}>
                  [{formatDate(log.timestamp).split(' ')[3] || 'Canlı'}]
                </span>
                
                {/* Source tag */}
                <span 
                  style={{ 
                    color: '#64748B', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    userSelect: 'none',
                    minWidth: '100px',
                    display: 'inline-block'
                  }}
                >
                  [{log.source}]
                </span>
                
                {/* Level badge */}
                <span 
                  style={{ 
                    color: getLevelColor(log.level),
                    fontWeight: 700,
                    minWidth: '65px',
                    display: 'inline-block'
                  }}
                >
                  {log.level.toUpperCase()}
                </span>
                
                {/* Message */}
                <span style={{ color: '#E2E8F0', flex: 1, wordBreak: 'break-all' }}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={terminalBottomRef} />
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
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
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CSS spin keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EventLogsPage;
