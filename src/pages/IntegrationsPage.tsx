// src/pages/IntegrationsPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import { 
  Plus, 
  Link2, 
  Check, 
  Copy, 
  XCircle,
  Database,
  GitBranch,
  MessageSquare,
  Info
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getIntegrations, toggleIntegration, addIntegration } from '../services/mockData';
import type { Integration, IntegrationProvider } from '../types/integration';
import { formatDate } from '../utils/formatters';
import { staggerCards } from '../utils/animations';

export const IntegrationsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<IntegrationProvider>('github');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    staggerCards(containerRef.current.querySelectorAll('.integration-card'));
  }, [loading]);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleIntegration(id);
      setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      alert('İşlem başarısız.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);

    try {
      await addIntegration({
        name,
        provider,
        status: 'connected',
      });
      setName('');
      setProvider('github');
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      alert('Ekleme başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProviderIcon = (prov: IntegrationProvider) => {
    switch (prov) {
      case 'github': return <GitBranch size={22} />;
      case 'slack': return <MessageSquare size={22} />;
      case 'jira': return <Database size={22} />;
      default: return <Link2 size={22} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--accent-primary)' }}>
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Entegrasyonlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Platform Entegrasyonları</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Geliştirici platformlarınızı ve bildirim kanallarınızı webhooklar aracılığıyla buraya bağlayın.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-transition flex-center"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: showAddForm ? 'var(--accent-danger)' : 'var(--accent-primary)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 600,
            gap: '0.4rem',
            boxShadow: 'var(--shadow)',
          }}
        >
          {showAddForm ? <XCircle size={16} /> : <Plus size={16} />}
          <span>{showAddForm ? 'Kapat' : 'Yeni Bağlantı'}</span>
        </button>
      </div>

      {/* Add Integration Form */}
      {showAddForm && (
        <form 
          onSubmit={handleCreate}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BAĞLANTI ADI</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Kurumsal GitHub Hesabı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PLATFORM SAĞLAYICISI</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as IntegrationProvider)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            >
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
              <option value="jira">Jira (Atlassian)</option>
              <option value="slack">Slack Channel</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-transition"
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--accent-success)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Bağlanıyor...' : 'Bağlantı Kur'}
          </button>
        </form>
      )}

      {/* Integrations Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {integrations.map((item) => (
          <div 
            key={item.id}
            className="integration-card btn-transition"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow)',
              position: 'relative',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: item.status === 'connected' ? 'var(--glow-green)' : 'var(--bg-elevated)',
                  color: item.status === 'connected' ? 'var(--accent-success)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                {getProviderIcon(item.provider)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.name}
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  {item.provider}
                </span>
              </div>

              {/* Status Badge */}
              <span 
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  backgroundColor: item.status === 'connected' ? 'var(--glow-green)' : 'var(--bg-elevated)',
                  color: item.status === 'connected' ? 'var(--accent-success)' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {item.status === 'connected' ? 'BAĞLI' : 'PASİF'}
              </span>
            </div>

            {/* Webhook details if connected */}
            {item.status === 'connected' && (
              <div 
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WEBHOOK ALICI URL</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={item.webhookUrl} 
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                    />
                    <button 
                      onClick={() => handleCopy(item.webhookUrl, item.id + '_url')}
                      style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="URL Kopyala"
                    >
                      {copiedId === item.id + '_url' ? <Check size={14} style={{ color: 'var(--accent-success)' }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WEBHOOK SECRET</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="password" 
                      readOnly 
                      value={item.webhookSecret} 
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                    />
                    <button 
                      onClick={() => handleCopy(item.webhookSecret, item.id + '_sec')}
                      style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Anahtarı Kopyala"
                    >
                      {copiedId === item.id + '_sec' ? <Check size={14} style={{ color: 'var(--accent-success)' }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Guide expand button */}
                <button
                  type="button"
                  onClick={() => setOpenGuideId(openGuideId === item.id ? null : item.id)}
                  style={{
                    alignSelf: 'start',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Info size={12} />
                  <span>{openGuideId === item.id ? 'Kurulum Kılavuzunu Gizle' : 'Kurulum Kılavuzunu Göster'}</span>
                </button>

                {/* Step-by-step integration guide */}
                {openGuideId === item.id && (
                  <div 
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45',
                    }}
                  >
                    {item.provider === 'github' && (
                      <>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>GitHub Depo Webhook Kurulumu:</strong>
                        <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <li>GitHub deponuzda üst menüden <strong>Settings (Ayarlar) &gt; Webhooks</strong> sayfasına gidin.</li>
                          <li>Sağ üstteki <strong>Add webhook</strong> butonuna tıklayın.</li>
                          <li><strong>Payload URL</strong> alanına kopyaladığınız webhook alıcı URL'sini yapıştırın.</li>
                          <li><strong>Content type</strong> listesinden <code>application/json</code> seçeneğini işaretleyin.</li>
                          <li><strong>Secret</strong> alanına kopyaladığınız webhook secret değerini yapıştırın.</li>
                          <li>Tetikleyici olarak <code>Just the push event.</code> seçin, <strong>Add webhook</strong> butonuna tıklayın.</li>
                        </ol>
                      </>
                    )}
                    {item.provider === 'gitlab' && (
                      <>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>GitLab Proje Webhook Kurulumu:</strong>
                        <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <li>GitLab projenizde sol menüden <strong>Settings (Ayarlar) &gt; Webhooks</strong> sayfasına gidin.</li>
                          <li><strong>URL</strong> alanına kopyaladığınız webhook alıcı URL'sini yapıştırın.</li>
                          <li><strong>Secret token</strong> alanına kopyaladığınız webhook secret değerini yapıştırın.</li>
                          <li>Tetikleyicilerden <code>Push events</code> kutucuğunu işaretli bırakın.</li>
                          <li>Aşağıdaki <strong>Add webhook</strong> butonuna tıklayarak kurulumu tamamlayın.</li>
                        </ol>
                      </>
                    )}
                    {item.provider !== 'github' && item.provider !== 'gitlab' && (
                      <>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Webhook Bağlantı Adımları:</strong>
                        <p style={{ margin: 0 }}>Yukarıda üretilen Webhook Alıcı URL ve Secret Token değerlerini ilgili platformun Webhook veya Integration ayarlarına yapıştırarak kaydedin.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {item.lastSyncAt ? `Eşleşme: ${formatDate(item.lastSyncAt)}` : 'Hiç senkronize edilmedi'}
              </span>
              
              <button
                onClick={() => handleToggle(item.id)}
                className="btn-transition"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: item.status === 'connected' ? 'var(--bg-elevated)' : 'var(--accent-primary)',
                  color: item.status === 'connected' ? 'var(--accent-danger)' : '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: item.status === 'connected' ? '1px solid var(--border)' : 'none',
                }}
              >
                {item.status === 'connected' ? 'Bağlantıyı Kes' : 'Bağlantıyı Kur'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;
