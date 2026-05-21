import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { ReportView } from './components/ReportView';
import { LoginView } from './components/LoginView';
import type { User, Theme, ChecklistRule, Email } from './types';
import './App.css';

const DEFAULT_RULES: ChecklistRule[] = [
  {
    id: 'r1',
    category: 'Güvenlik',
    description: 'Tüm hassas API anahtarları çevre değişkenlerinde saklanmalı, kodda açık yazılmamalıdır.',
    severity: 'high'
  },
  {
    id: 'r2',
    category: 'Güvenlik',
    description: 'Giriş denemeleri IP başına dakikada maksimum 5 istek ile sınırlandırılmalıdır.',
    severity: 'high'
  },
  {
    id: 'r3',
    category: 'Performans',
    description: 'Veritabanı sorguları 100ms\'nin altında yanıt vermelidir.',
    severity: 'medium'
  },
  {
    id: 'r4',
    category: 'Performans',
    description: 'Görsel dosyaları yüklenmeden önce optimize edilmeli ve sıkıştırılmalıdır.',
    severity: 'low'
  },
  {
    id: 'r5',
    category: 'Veri Bütünlüğü',
    description: 'Veritabanı yedeklemesi her 12 saatte bir otomatik olarak gerçekleştirilmelidir.',
    severity: 'medium'
  }
];

const DEFAULT_EMAILS: Email[] = [
  {
    id: 'e1',
    sender: 'security-alert@aetherai.io',
    subject: 'Potansiyel API Sızıntısı Tespit Edildi',
    date: 'Bugün, 11:15',
    content: 'Merhaba Ekip,\n\nSon kod commit incelemesinde, src/config/keys.ts dosyası içerisinde test API anahtarının açık metin (cleartext) olarak yazıldığını fark ettik. Lütfen bu dosyayı temizleyin ve anahtarı .env dosyasından çekilecek şekilde güncelleyin.\n\nİyi çalışmalar,\nGüvenlik Botu',
    shortSummary: 'keys.ts içerisinde açık metin API anahtarı sızıntısı.',
    relatedRuleIds: ['r1'],
    read: false,
    attachments: [
      {
        name: 'güvenlik_tarama_raporu_e1.pdf',
        size: '1.4 MB',
        type: 'pdf'
      }
    ]
  },
  {
    id: 'e2',
    sender: 'monitor-system@aetherai.io',
    subject: 'Yüksek Sorgu Gecikmesi Raporu',
    date: 'Bugün, 09:30',
    content: 'Bilgilendirme,\n\n/api/v1/analytics uç noktası üzerindeki ortalama sorgu yanıt süresi 480ms seviyesine ulaştı. Bu durum genel sistem performansını olumsuz etkilemektedir. Veritabanı sorgularının incelenmesi ve indeksleme yapılması önerilir.\n\nSaygılarımızla,\nİzleme Servisi',
    shortSummary: '/api/v1/analytics uç noktasında 480ms sorgu gecikmesi.',
    relatedRuleIds: ['r3'],
    read: true,
    attachments: [
      {
        name: 'sorgu_gecikme_analizi.pdf',
        size: '620 KB',
        type: 'pdf'
      }
    ]
  },
  {
    id: 'e3',
    sender: 'backup-service@aetherai.io',
    subject: 'Yedekleme İşlemi Başarılı',
    date: 'Dün, 23:00',
    content: 'Sistem Bilgisi,\n\nPlanlanmış 12 saatlik veritabanı yedekleme işlemi başarıyla tamamlandı. Yedekleme boyutu: 4.8 GB. Hedef depolama alanı: S3 bucket-us-east-backup.\n\nServis Durumu: Aktif',
    shortSummary: 'Planlı 12 saatlik veritabanı yedeklemesi başarıyla tamamlandı.',
    relatedRuleIds: ['r5'],
    read: true
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rapor'>('dashboard');
  
  // Theme state defaulting to dark (Atmospheric Dark)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const [telemetryActive, setTelemetryActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Global State for Rules and Emails
  const [rules, setRules] = useState<ChecklistRule[]>(DEFAULT_RULES);
  const [emails, setEmails] = useState<Email[]>(DEFAULT_EMAILS);

  // Apply theme class to body
  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'dark') {
      bodyClass.add('dark');
    } else {
      bodyClass.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch reviews from FastAPI backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:8000/reviews');
        if (!response.ok) throw new Error('Sunucudan veriler alınamadı');
        const data = await response.json();
        
        // Map reviews to Email interface
        const mappedEmails: Email[] = data.map((review: any) => ({
          id: String(review.id),
          sender: review.author,
          subject: `${review.repo}: ${review.pushTitle}`,
          date: review.createdDate ? new Date(review.createdDate).toLocaleString('tr-TR') : 'Bilinmeyen Tarih',
          content: '', // Will fetch HTML detail dynamically on selection
          shortSummary: `${review.branch} - ${review.commitSha.substring(0, 7)}`,
          relatedRuleIds: [],
          read: true,
          attachments: [
            {
              name: `review_${review.id}.pdf`,
              size: 'PDF Raporu',
              type: 'pdf',
              url: `http://localhost:8000/reviews/${review.id}/pdf`
            }
          ]
        }));
        
        setEmails(mappedEmails);
      } catch (error) {
        console.error('FastAPI reviews listesi yüklenirken hata oluştu:', error);
      }
    };
    
    fetchReviews();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (window.confirm('Oturumu kapatmak istediğinizden emin misiniz?')) {
      setCurrentUser(null);
    }
  };

  // If not logged in, render the premium Login screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      />

      {/* Main Panel space */}
      <div className="main-panel">
        <Topbar 
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          telemetryActive={telemetryActive}
          setTelemetryActive={setTelemetryActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
        />

        {/* Scrollable View Area */}
        <main className="page-content">
          {activeTab === 'dashboard' ? (
            <DashboardView 
              telemetryActive={telemetryActive}
              searchQuery={searchQuery}
            />
          ) : (
            <ReportView 
              searchQuery={searchQuery}
              rules={rules}
              setRules={setRules}
              emails={emails}
              setEmails={setEmails}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
