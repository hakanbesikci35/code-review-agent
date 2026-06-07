import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck, 
  SlidersHorizontal,
  Terminal,
  Activity,
  User,
  ShieldCheck,
  Percent,
  X
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getFunctionalTestRuns, addFunctionalTestRun } from '../services/mockData';
import type { FunctionalTestRun, TestStatus } from '../types/test';
import { formatDate } from '../utils/formatters';
import { fadeInUp } from '../utils/animations';

export const FunctionalTestsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for data listing
  const [runs, setRuns] = useState<FunctionalTestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal and Drawer states
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<FunctionalTestRun | null>(null);

  // Test Runner Simulation State
  const [selectedRunner, setSelectedRunner] = useState<'playwright' | 'jest' | 'vitest'>('playwright');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  const loadData = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    try {
      const res = await getFunctionalTestRuns(currentPage, 10, currentSearch);
      
      // Client-side status filtering on top of paginated mock response
      let filteredData = res.data;
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(r => r.status === statusFilter);
      }
      
      setRuns(filteredData);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load test runs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search);
  }, [page, statusFilter]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search);
  };

  // Simulate execution of a test suite
  const startSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimLogs([]);

    const runnerName = selectedRunner === 'playwright' ? 'Playwright E2E Run' : selectedRunner === 'jest' ? 'Jest Unit Test Run' : 'Vitest Component Run';
    const totalTests = selectedRunner === 'playwright' ? 24 : selectedRunner === 'jest' ? 145 : 68;
    const isSuccess = Math.random() > 0.15; // 85% success rate
    const failedTests = isSuccess ? 0 : Math.floor(Math.random() * 3) + 1;
    const passedTests = totalTests - failedTests;
    const duration = selectedRunner === 'playwright' ? 42 + Math.floor(Math.random() * 10) : 12 + Math.floor(Math.random() * 5);
    const coverage = 85 + Math.floor(Math.random() * 12); // 85% - 97%

    const logsList = [
      `[SYSTEM] ${runnerName} başlatılıyor...`,
      `[SYSTEM] Konfigürasyon dosyaları yüklendi.`,
      `[SYSTEM] Ortam değişkenleri doğrulanıyor: NODE_ENV=test, CI=true`,
      `[RUNNER] Test havuzu taranıyor... ${totalTests} test bulundu.`,
      `[RUNNER] Paralel iş parçacıkları (workers) ayağa kaldırılıyor...`,
      `[SUITE] 📂 auth/login-flow.spec.ts çalıştırılıyor...`,
      `[TEST]  ✓ Kullanıcı arayüzü form elemanları görünürlüğü (0.8s)`,
      `[TEST]  ✓ Geçersiz kimlik bilgileriyle hata yönetimi (1.2s)`,
      `[SUITE] 📂 dashboard/widgets-display.spec.ts çalıştırılıyor...`,
      `[TEST]  ✓ Grafik ve metriklerin render süresi (1.5s)`,
      isSuccess 
        ? `[TEST]  ✓ Hızlı tema geçiş animasyonları (0.9s)`
        : `[TEST]  ✗ Temanın yenilenme durumunda sıfırlanması (1.8s) - HATA: Durum korunamadı`,
      `[SUITE] 📂 integrations/webhooks-config.spec.ts çalıştırılıyor...`,
      `[TEST]  ✓ Webhook URL kopyalama ve yönerge görünümü (2.1s)`,
      `[REPORT] Test koşumu tamamlandı.`,
      `[REPORT] Sonuç: ${isSuccess ? 'GEÇTİ (PASSED)' : 'BAŞARISIZ (FAILED)'}`,
      `[REPORT] Toplam Test: ${totalTests} | Başarılı: ${passedTests} | Başarısız: ${failedTests}`,
      `[REPORT] Çalışma Süresi: ${duration} saniye.`,
      `[REPORT] Kod Kapsama Oranı (Coverage): %${coverage}`,
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logsList.length) {
        setSimLogs(prev => [...prev, logsList[currentStep]]);
        setSimProgress(Math.floor(((currentStep + 1) / logsList.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Add to Mock Store
        addFunctionalTestRun({
          name: runnerName,
          status: isSuccess ? 'passed' : 'failed',
          passedCount: passedTests,
          failedCount: failedTests,
          durationSeconds: duration,
          coveragePercent: coverage,
          executedBy: 'Geliştirici (Simüle)',
        }).then(() => {
          setIsSimulating(false);
          // Auto close modal after brief delay and reload
          setTimeout(() => {
            setIsRunModalOpen(false);
            setPage(1);
            loadData(1, search);
          }, 1500);
        });
      }
    }, 400);
  };

  const getStatusStyle = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return {
          bgColor: 'var(--glow-green)',
          textColor: 'var(--accent-success)',
          borderColor: 'rgba(5, 150, 105, 0.2)',
          label: 'BAŞARILI'
        };
      case 'failed':
        return {
          bgColor: 'var(--glow-red)',
          textColor: 'var(--accent-danger)',
          borderColor: 'rgba(220, 38, 38, 0.2)',
          label: 'BAŞARISIZ'
        };
      default:
        return {
          bgColor: 'var(--bg-elevated)',
          textColor: 'var(--text-secondary)',
          borderColor: 'var(--border)',
          label: 'BİLİNMİYOR'
        };
    }
  };

  const getCoverageColor = (percent: number) => {
    if (percent >= 90) return 'var(--accent-success)';
    if (percent >= 75) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  // Metrics calculations for the summaries
  const totalPassed = runs.reduce((acc, r) => acc + (r.status === 'passed' ? 1 : 0), 0);
  const totalFailed = runs.reduce((acc, r) => acc + (r.status === 'failed' ? 1 : 0), 0);
  const totalTestsCount = runs.length;
  const avgCoverage = runs.length > 0 
    ? Math.round(runs.reduce((acc, r) => acc + r.coveragePercent, 0) / runs.length) 
    : 0;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Fonksiyonel Test Raporları</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Playwright, Jest ve Vitest test suitlerinin koşum sonuçları, başarı oranları ve test coverage metrikleri.
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsRunModalOpen(true);
            setSimLogs([]);
            setSimProgress(0);
            setIsSimulating(false);
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
          <Play size={15} fill="currentColor" />
          Test Koşumu Başlat
        </button>
      </div>

      {/* Summary Cards Row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Pass Rate Card */}
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
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-green)', color: 'var(--accent-success)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>BAŞARI ORANI</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalTestsCount > 0 ? Math.round((totalPassed / totalTestsCount) * 100) : 0}%
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ({totalPassed}/{totalTestsCount} Koşum)
              </span>
            </div>
          </div>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, color: 'var(--text-primary)' }}>
            <Activity size={90} />
          </div>
        </div>

        {/* Coverage Card */}
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
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-blue)', color: 'var(--accent-primary)' }}>
            <Percent size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ORTALAMA KAPSAMA</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                %{avgCoverage}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                (Statik Analiz)
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${avgCoverage}%`, height: '100%', backgroundColor: getCoverageColor(avgCoverage), borderRadius: '2px', transition: 'width 0.8s ease-in-out' }} />
            </div>
          </div>
        </div>

        {/* Total Assertions Run Card */}
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
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: totalFailed > 0 ? 'var(--glow-red)' : 'var(--glow-warning)', color: totalFailed > 0 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>TEST DURUMU</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalFailed > 0 ? `${totalFailed} Hata` : 'Stabil'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {totalFailed > 0 ? 'Müdahale Gerekli' : 'Tüm testler temiz'}
              </span>
            </div>
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
              placeholder="Test suite adı veya koşturan ara..." 
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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <SlidersHorizontal size={14} />
            Durum Filtresi:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.4rem 1.5rem 0.4rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tümü</option>
            <option value="passed">Sadece Başarılı</option>
            <option value="failed">Sadece Başarısız</option>
          </select>
        </div>
      </div>

      {/* Runs Table */}
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Test sonuçları yükleniyor...</span>
          </div>
        ) : runs.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Hiçbir test koşum kaydı bulunamadı.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KOŞUM NO</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TEST SUITE</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DURUM</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TEST BAŞARISI (PASSED/FAILED)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KOD KAPSAMA (COVERAGE)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SÜRE</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KOŞTURAN</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TAMAMLANMA TARİHİ</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const statusStyle = getStatusStyle(run.status);
                return (
                  <tr 
                    key={run.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="btn-transition"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Run Number */}
                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{run.runNumber}
                    </td>

                    {/* Suite Name */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {run.name}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span 
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: statusStyle.bgColor,
                          color: statusStyle.textColor,
                          border: `1px solid ${statusStyle.borderColor}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {run.status === 'passed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Test success metrics & bar */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ width: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>{run.passedCount} geçti</span>
                          {run.failedCount > 0 && <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>{run.failedCount} hata</span>}
                        </div>
                        {/* Stacked Progress Bar */}
                        <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--border)', borderRadius: '2.5px', display: 'flex', overflow: 'hidden' }}>
                          <div style={{ width: `${(run.passedCount / (run.passedCount + run.failedCount)) * 100}%`, height: '100%', backgroundColor: 'var(--accent-success)' }} />
                          {run.failedCount > 0 && (
                            <div style={{ width: `${(run.failedCount / (run.passedCount + run.failedCount)) * 100}%`, height: '100%', backgroundColor: 'var(--accent-danger)' }} />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Coverage */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: getCoverageColor(run.coveragePercent),
                            fontSize: '0.85rem',
                          }}
                        >
                          %{run.coveragePercent}
                        </span>
                        <div style={{ width: '50px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${run.coveragePercent}%`, height: '100%', backgroundColor: getCoverageColor(run.coveragePercent) }} />
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {run.durationSeconds} sn
                      </span>
                    </td>

                    {/* Executed By */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} style={{ color: 'var(--text-muted)' }} />
                        {run.executedBy}
                      </span>
                    </td>

                    {/* Completed At */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(run.completedAt)}
                    </td>

                    {/* Detail button */}
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="btn-transition"
                        style={{
                          padding: '0.3rem 0.75rem',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Detaylar
                      </button>
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

      {/* 1. TEST SUITE RUNNER MODAL */}
      {isRunModalOpen && (
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
              maxWidth: '650px',
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
                <Activity size={18} className={isSimulating ? 'spin-anim' : ''} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Test Koşum Simülasyonu</h3>
              </div>
              <button 
                onClick={() => !isSimulating && setIsRunModalOpen(false)}
                disabled={isSimulating}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isSimulating ? 'not-allowed' : 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              
              {/* Form Config (Disable when simulating) */}
              {!isSimulating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>TEST RUNNER SEÇİN</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      {(['playwright', 'jest', 'vitest'] as const).map((runner) => (
                        <button
                          key={runner}
                          onClick={() => setSelectedRunner(runner)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--border-radius-sm)',
                            border: selectedRunner === runner ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                            backgroundColor: selectedRunner === runner ? 'var(--glow-blue)' : 'var(--bg-primary)',
                            color: selectedRunner === runner ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Terminal size={16} />
                          {runner}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Simüle Edilecek Komut:</h4>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-info)' }}>
                      {selectedRunner === 'playwright' && 'npx playwright test --project=chromium --reporter=line'}
                      {selectedRunner === 'jest' && 'npm run test:unit -- --coverage'}
                      {selectedRunner === 'vitest' && 'npx vitest run --coverage.enabled=true'}
                    </code>
                  </div>
                </div>
              )}

              {/* Simulation Logging Screen */}
              {(isSimulating || simLogs.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KOŞUM LOGLARI:</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>%{simProgress}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${simProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '3px', transition: 'width 0.2s ease' }} />
                  </div>

                  {/* Terminal Log Console */}
                  <div 
                    style={{
                      flex: 1,
                      backgroundColor: '#0F172A',
                      color: '#38BDF8',
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
                    {simLogs.map((log, idx) => {
                      let color = '#E2E8F0';
                      if (log.startsWith('[SYSTEM]')) color = '#94A3B8';
                      else if (log.startsWith('[RUNNER]')) color = '#38BDF8';
                      else if (log.includes('✓')) color = '#34D399';
                      else if (log.includes('✗') || log.includes('HATA')) color = '#F87171';
                      
                      return (
                        <div key={idx} style={{ color, marginBottom: '0.2rem', whiteSpace: 'pre-wrap' }}>
                          {log}
                        </div>
                      );
                    })}
                    {isSimulating && (
                      <span style={{ display: 'inline-block', width: '8px', height: '14px', backgroundColor: '#38BDF8', marginLeft: '2px', animation: 'blink 0.8s infinite' }} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
              {!isSimulating && simLogs.length === 0 && (
                <>
                  <button 
                    onClick={() => setIsRunModalOpen(false)}
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
                    onClick={startSimulation}
                    style={{
                      padding: '0.45rem 1.25rem',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'var(--accent-success)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    Simülasyonu Başlat
                  </button>
                </>
              )}
              {isSimulating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                  <span className="spin-anim" style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent-primary)' }} />
                  Testler koşturuluyor, lütfen bekleyin...
                </div>
              )}
              {!isSimulating && simLogs.length > 0 && (
                <button
                  onClick={() => setIsRunModalOpen(false)}
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
                  Tamamlandı
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TEST DETAIL DRAWER (SIDE MODAL) */}
      {selectedRun && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRun(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
              width: '100%',
              maxWidth: '550px',
              height: '100%',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideLeft 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>KOŞUM DETAYLARI #{selectedRun.runNumber}</span>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{selectedRun.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedRun(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }} className="custom-scroll">
              
              {/* Status Section */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1rem', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: selectedRun.status === 'passed' ? 'var(--glow-green)' : 'var(--glow-red)',
                  border: `1px solid ${selectedRun.status === 'passed' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedRun.status === 'passed' 
                    ? <CheckCircle2 size={24} style={{ color: 'var(--accent-success)' }} />
                    : <XCircle size={24} style={{ color: 'var(--accent-danger)' }} />
                  }
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedRun.status === 'passed' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {selectedRun.status === 'passed' ? 'TÜM TESTLER GEÇTİ' : 'TEST HATA VERDİ'}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {selectedRun.passedCount} Assertions başarılı oldu, {selectedRun.failedCount} hata alındı.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ÇALIŞMA SÜRESİ</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{selectedRun.durationSeconds} Saniye</span>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>KOD KAPSAMA</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: getCoverageColor(selectedRun.coveragePercent), fontFamily: 'var(--font-mono)' }}>%{selectedRun.coveragePercent}</span>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>TETİKLEYEN AKTÖR</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedRun.executedBy}</span>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>BİTİŞ ZAMANI</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{formatDate(selectedRun.completedAt)}</span>
                </div>
              </div>

              {/* Coverage breakdown per package simulation */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Kapsama Detayları (Coverage Report)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}>
                  {[
                    { path: 'src/components/*', pct: selectedRun.coveragePercent + 2 },
                    { path: 'src/pages/*', pct: selectedRun.coveragePercent - 4 },
                    { path: 'src/services/*', pct: selectedRun.coveragePercent + 1 },
                    { path: 'src/utils/*', pct: 100 }
                  ].map((pkg, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.6rem 0.75rem', 
                        borderBottom: idx === 3 ? 'none' : '1px solid var(--border)',
                        backgroundColor: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{pkg.path}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: getCoverageColor(pkg.pct) }}>%{pkg.pct}</span>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pkg.pct}%`, height: '100%', backgroundColor: getCoverageColor(pkg.pct) }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Assertions Logs */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Test Sonucu Çıktıları (Assertions Console)</h4>
                <div 
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#E2E8F0',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ color: '#94A3B8', marginBottom: '0.4rem' }}>$ {selectedRun.name.toLowerCase().replace(/\s+/g, '-')} --run</div>
                  <div style={{ color: '#34D399' }}>✓ PASS  src/__tests__/authentication.test.ts</div>
                  <div style={{ color: '#34D399' }}>✓ PASS  src/__tests__/dashboard-widgets.test.ts</div>
                  {selectedRun.status === 'failed' ? (
                    <>
                      <div style={{ color: '#F87171' }}>✗ FAIL  src/__tests__/theme-persistence.test.ts</div>
                      <div style={{ color: '#F87171', paddingLeft: '1rem' }}>→ AssertionError: expected localStorage to retain theme after reload</div>
                    </>
                  ) : (
                    <div style={{ color: '#34D399' }}>✓ PASS  src/__tests__/theme-toggle.test.ts</div>
                  )}
                  <div style={{ color: '#E2E8F0', marginTop: '0.5rem', borderTop: '1px solid #475569', paddingTop: '0.5rem' }}>
                    Test Suites: {selectedRun.status === 'failed' ? '2 passed, 1 failed, 3 total' : '3 passed, 3 total'}
                  </div>
                  <div style={{ color: '#E2E8F0' }}>
                    Tests: {selectedRun.passedCount} passed, {selectedRun.failedCount} failed, {selectedRun.passedCount + selectedRun.failedCount} total
                  </div>
                  <div style={{ color: '#E2E8F0' }}>
                    Snapshots: 0 total
                  </div>
                  <div style={{ color: '#38BDF8' }}>
                    Time: {selectedRun.durationSeconds}s
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedRun(null)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global & inline styles for animations and blinkers */}
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
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default FunctionalTestsPage;
