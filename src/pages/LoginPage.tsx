// src/pages/LoginPage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Terminal, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGSAP } from '../hooks/useGSAP';
import { ROUTES } from '../utils/constants';
import { shakeElement } from '../utils/animations';
import { gsap } from 'gsap';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const terminalLinesRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      ease: 'power3.out',
    });
    
    // Stagger inputs
    if (formRef.current) {
      tl.from(formRef.current.querySelectorAll('.animate-input'), {
        opacity: 0,
        x: -20,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.3');
    }

    // Simulate logs typing in the left panel terminal
    if (terminalLinesRef.current) {
      const lines = terminalLinesRef.current.children;
      gsap.fromTo(lines, 
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.4, 
          duration: 0.3,
          ease: 'power1.out',
          repeat: -1,
          repeatDelay: 2
        }
      );
    }
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      
      // Shake animation on error
      if (formRef.current) {
        shakeElement(formRef.current);
      }
    }
  };

  // Hızlı giriş
  const handleAutofill = (role: 'developer' | 'admin' | 'viewer') => {
    setEmail(`${role}@lstai.co`);
    setPassword('demo1234');
  };

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        minHeight: '600px',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
        transition: 'border-color var(--transition-normal), background-color var(--transition-normal)',
      }}
      className="login-card-container"
    >
      {/* Left Panel: Automation Terminal (Desktop Only) */}
      <div 
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
          color: '#38BDF8',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'between',
          position: 'relative',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="hide-mobile"
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B', marginLeft: '0.5rem' }}>
            lstai-core-terminal v1.0.0
          </span>
        </div>

        {/* Simulated logs */}
        <div 
          ref={terminalLinesRef}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ color: '#64748B' }}>[08:14:22] INITIATING LST AI DAEMON...</div>
          <div style={{ color: '#38BDF8' }}>&gt; Webhook listeleniyor: port 8080 aktif</div>
          <div style={{ color: '#10B981' }}>&gt; Review Agent: LLM bağlantısı BAŞARILI</div>
          <div style={{ color: '#F59E0B' }}>&gt; Conflict Tracker: Bekleyen çakışma taraması başlatıldı</div>
          <div style={{ color: '#E2E8F0' }}>[08:14:25] DevMerge: 'main' branch koruma kuralları doğrulandı</div>
          <div style={{ color: '#10B981' }}>&gt; Test Agent: Jest & Playwright runner'lar hazır</div>
          <div style={{ color: '#6366F1' }}>&gt; Test PR Agent: Otomatik test PR şablonları yüklendi</div>
          <div style={{ color: '#A5B4FC' }}>&gt; WebSocket: Bağlantı kuruldu (tenant_id: default)</div>
        </div>

        {/* Technical Footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
            <Terminal size={16} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              SECURE AGENT PIPELINE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div 
        style={{
          width: '450px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)',
        }}
        className="login-form-panel"
      >
        <div style={{ marginBottom: '2rem' }}>
          <h2 
            style={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}
          >
            Tekrar Hoş Geldiniz
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            LST AI CI/CD Yönetici paneline giriş yapın
          </p>
        </div>

        {errorMsg && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--glow-red)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: 'var(--accent-danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
            className="glow-red"
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email field */}
          <div className="animate-input" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label 
              htmlFor="email"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              E-POSTA ADRESİ
            </label>
            <div style={{ position: 'relative' }}>
              <span 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                }}
              >
                <Mail size={16} />
              </span>
              <input
                id="email"
                type="email"
                required
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.25rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="animate-input" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label 
                htmlFor="password"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ŞİFRE
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Lütfen sistem yöneticinizle iletişime geçin.'); }}
                style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500 }}
              >
                Şifremi unuttum
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <span 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                }}
              >
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.25rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-transition animate-input"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--glow-blue)',
              marginTop: '0.5rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Doğrulanıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Quick Autofill Buttons for Testing */}
        <div 
          className="animate-input"
          style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border)',
          }}
        >
          <span 
            style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.5rem'
            }}
          >
            HIZLI DENEME GİRİŞİ
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleAutofill('admin')}
              style={{
                fontSize: '0.7rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-primary)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Yönetici (Admin) Girişi Yap
            </button>
          </div>
        </div>
      </div>
      
      {/* Responsive media overrides */}
      <style>{`
        @media (max-width: 768px) {
          .login-card-container {
            flex-direction: column !important;
            max-width: 450px !important;
            min-height: auto !important;
          }
          .login-form-panel {
            width: 100% !important;
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
