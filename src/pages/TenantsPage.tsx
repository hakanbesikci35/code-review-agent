// src/pages/TenantsPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, User, Globe, Tag, X } from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getTenants, addTenant, toggleTenantStatus } from '../services/mockData';
import type { Tenant } from '../types/tenant';
import { formatDate } from '../utils/formatters';
import { fadeInUp } from '../utils/animations';

export const TenantsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [plan, setPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants', err);
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

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleTenantStatus(id);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      alert('İşlem başarısız oldu.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subdomain) return;
    setIsSubmitting(true);

    try {
      await addTenant({
        name,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9]/g, ''),
        plan,
        status: 'active',
      });
      setName('');
      setSubdomain('');
      setPlan('basic');
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      alert('Ekleme işlemi başarısız.');
    } finally {
      setIsSubmitting(false);
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Kiracı listesi alınıyor...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Panel */}
      <div className="animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Müşteri Organizasyonları</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sisteme entegre olan multi-tenant kiracı firmaların listesi ve durum yönetimi.
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
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showAddForm ? 'Kapat' : 'Yeni Kiracı'}</span>
        </button>
      </div>

      {/* Add Tenant Form Card */}
      {showAddForm && (
        <form 
          onSubmit={handleCreate}
          className="animate-fade"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>FİRMA ADI</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Initech Corp"
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
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ALT ALAN ADI (SUBDOMAIN)</label>
            <input 
              type="text" 
              required
              placeholder="Örn: initech"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
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
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>HİZMET PAKETİ</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
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
              <option value="basic">Basic (Temel)</option>
              <option value="pro">Pro (Profesyonel)</option>
              <option value="enterprise">Enterprise (Kurumsal)</option>
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
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      {/* Tenants Table Section */}
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>FİRMA ADI</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SUBDOMAIN</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PAKET</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KULLANICILAR</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ENTEGRASYONLAR</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KAYIT TARİHİ</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DURUM</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr 
                key={tenant.id}
                style={{ borderBottom: '1px solid var(--border)' }}
                className="btn-transition"
              >
                <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {tenant.name}
                </td>
                <td style={{ padding: '1rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-info)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={14} />
                    <span>{tenant.subdomain}.lstai.co</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                  <span 
                    style={{
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {tenant.plan}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{tenant.userCount} Kullanıcı</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{tenant.integrationsCount} Bağlantı</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatDate(tenant.createdAt)}
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span 
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: tenant.status === 'active' ? 'var(--glow-green)' : 'var(--glow-red)',
                      color: tenant.status === 'active' ? 'var(--accent-success)' : 'var(--accent-danger)',
                      border: tenant.status === 'active' ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
                    }}
                  >
                    {tenant.status === 'active' ? 'AKTİF' : 'ASKIDA'}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleStatus(tenant.id)}
                    className="btn-transition"
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: tenant.status === 'active' ? 'var(--accent-danger)' : 'var(--accent-success)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {tenant.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    <span>{tenant.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantsPage;
