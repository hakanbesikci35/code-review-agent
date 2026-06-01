import React, { useState, useEffect } from 'react';
import { ShieldCheck, Brain, Server, TrendingUp } from 'lucide-react';
import type { DecisionItem } from '../types';

interface DashboardViewProps {
  telemetryActive: boolean;
  searchQuery: string;
}

const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'd1',
    title: 'Arbitraj Doğrulaması',
    subtitle: 'Ajan #492 BTC/USDT çiftinde fiyat farkı tespit etti. İşlem onaylandı.',
    status: 'OPTIMIZED',
    statusText: 'OPTİMİZE',
    value: '+$1,900',
    latency: '0.002s gecikme',
    timestamp: 'Az önce'
  },
  {
    id: 'd2',
    title: 'Tehdit Azaltma',
    subtitle: 'Güvenlik Ajanı #021 şüpheli giriş IP aralığını karantinaya aldı: 192.x.x.x',
    status: 'SECURED',
    statusText: 'GÜVENLİ',
    value: 'ENGELLEDİ',
    latency: 'Otomatik çözüldü',
    timestamp: '2 dk önce'
  },
  {
    id: 'd3',
    title: 'Envanter Yeniden Yönlendirme',
    subtitle: 'Lojistik Ajanı #881 tayfundan kaçınmak için "Atlas" kargo gemisini yönlendirdi.',
    status: 'OPTIMIZED',
    statusText: 'OPTİMİZE',
    value: 'Risk Faktörü 0.02',
    latency: '1.4s analiz',
    timestamp: '5 dk önce'
  },
  {
    id: 'd4',
    title: 'Veritabanı İndeksleme',
    subtitle: 'Performans Ajanı #104 sorgu sürelerini optimize etmek için indeksleme başlattı.',
    status: 'SUCCESS',
    statusText: 'BAŞARILI',
    value: '+45% Hız',
    latency: '0.8s yürütme',
    timestamp: '12 dk önce'
  }
];

export const DashboardView: React.FC<DashboardViewProps> = ({ telemetryActive, searchQuery }) => {
  const [decisions, setDecisions] = useState<DecisionItem[]>(INITIAL_DECISIONS);
  const [activeAgentsCount, setActiveAgentsCount] = useState(1284);

  // Periodic Telemetry Simulator
  useEffect(() => {
    if (!telemetryActive) return;

    const interval = setInterval(() => {
      // Occasionally add a new decision stream event
      if (Math.random() > 0.6) {
        const randomTitles = [
          { title: 'API Hız Sınırlama', desc: 'Güvenlik Ajanı #099 aşırı istek gönderen istemciye hız sınırı uyguladı.', status: 'SECURED' as const, statusText: 'GÜVENLİ', val: 'KORUNDU', lat: '0.01s yanıt' },
          { title: 'Sunucu Otomatik Ölçekleme', desc: 'Altyapı Ajanı #211 CPU yükünün artması nedeniyle 2 yeni node ayağa kaldırdı.', status: 'SUCCESS' as const, statusText: 'BAŞARILI', val: '+2 Node', lat: '45s hazırlık' },
          { title: 'Yük Dengeleme Optimizasyonu', desc: 'Yönlendirme Ajanı #340 trafiği düşük gecikmeli Avrupa sunucusuna kaydırdı.', status: 'OPTIMIZED' as const, statusText: 'OPTİMİZE', val: '-30ms Latency', lat: '0.2s geçiş' }
        ];
        const selected = randomTitles[Math.floor(Math.random() * randomTitles.length)];
        
        const newDecision: DecisionItem = {
          id: 'dyn_' + Date.now(),
          title: selected.title,
          subtitle: selected.desc,
          status: selected.status,
          statusText: selected.statusText,
          value: selected.val,
          latency: selected.lat,
          timestamp: 'Az önce'
        };

        setDecisions(prev => [newDecision, ...prev.slice(0, 5)]);
        setActiveAgentsCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [telemetryActive]);

  // Filter decisions based on search
  const filteredDecisions = decisions.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Sistem Genel Bakış</h1>
          <p>Yapay zeka ajanlarının gerçek zamanlı kararları ve sistem sağlığı.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Aktif Ajanlar</span>
            <span className="stat-value">{activeAgentsCount.toLocaleString()}</span>
            <span className="stat-trend trend-up">
              <TrendingUp size={14} />
              <span>Son 1 saatte +12.5%</span>
            </span>
          </div>
          <div className="stat-icon-wrapper primary">
            <Brain size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Karar Başarı Oranı</span>
            <span className="stat-value">99.82%</span>
            <span className="stat-trend trend-up">
              <ShieldCheck size={14} />
              <span>Optimal çalışma düzeyi</span>
            </span>
          </div>
          <div className="stat-icon-wrapper accent">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Core Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Decision Stream */}
        <div className="dashboard-left-col">
          <div className="panel-card" style={{ minHeight: 460 }}>
            <div className="panel-card-header">
              <span className="panel-card-title">Gerçek Zamanlı Karar Akışı</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: 0.5 }}>CANLI AKIŞ</span>
            </div>
            <div className="panel-card-body">
              {filteredDecisions.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Arama kriterlerinize uyan karar bulunamadı.
                </div>
              ) : (
                <div className="decision-stream-list">
                  {filteredDecisions.map((item) => (
                    <div className="decision-item" key={item.id}>
                      <div className="decision-left">
                        <div className={`decision-icon ${item.status.toLowerCase()}`}>
                          {item.status === 'SECURED' ? <ShieldCheck size={18} /> : <Brain size={18} />}
                        </div>
                        <div className="decision-info">
                          <span className="decision-title">{item.title}</span>
                          <span className="decision-subtitle">{item.subtitle}</span>
                        </div>
                      </div>
                      <div className="decision-right">
                        <span className="decision-value">{item.value}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="decision-latency">{item.latency}</span>
                          <span className={`decision-status-pill ${item.status.toLowerCase()}`}>
                            {item.statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Health */}
        <div className="dashboard-right-col">
          {/* System Health */}
          <div className="panel-card">
            <div className="panel-card-header">
              <span className="panel-card-title">Sistem Sağlığı</span>
              <Server size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="panel-card-body">
              <table className="health-table">
                <tbody>
                  <tr>
                    <td className="health-label">Birincil Küme</td>
                    <td className="health-value stable">Kararlı</td>
                  </tr>
                  <tr>
                    <td className="health-label">Yedeklilik (Düğüm)</td>
                    <td className="health-value">4/4 Çevrimiçi</td>
                  </tr>
                  <tr>
                    <td className="health-label">Ort. Yanıt Süresi</td>
                    <td className="health-value">24ms</td>
                  </tr>
                  <tr>
                    <td className="health-label">Bellek Tavan Limiti</td>
                    <td className="health-value warning">92% Uyarısı</td>
                  </tr>
                  <tr>
                    <td className="health-label">Son Yedekleme</td>
                    <td className="health-value">2 dk önce</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
