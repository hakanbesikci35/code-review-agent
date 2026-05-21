import React, { useState } from 'react';
import { Lock, Mail, Terminal, ArrowRight } from 'lucide-react';
import type { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    setLoading(true);

    // Simulate authentication API call
    setTimeout(() => {
      setLoading(false);
      // Let anything pass, but mock a premium user
      onLoginSuccess({
        username: email.split('@')[0],
        email: email,
        role: '',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
      });
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow"></div>
      <div className="login-bg-glow-2"></div>

      <div className="login-card">
        <div className="login-logo">
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: 'var(--shadow-md)'
          }}>
            <Terminal size={26} />
          </div>
          <h1>LST-AI</h1>
          <p>Agentic Automation</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <div className="login-input-wrapper">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="isim@LST.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-form-group" style={{ marginBottom: 28 }}>
            <label htmlFor="password">Şifre</label>
            <div className="login-input-wrapper">
              <Lock size={16} />
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }}></span>
            ) : (
              <>
                Sisteme Giriş Yap <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Kullanıcı Adı: <strong>admin@LST.io</strong><br />
          Şifre: <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
};
