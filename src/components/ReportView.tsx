import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2,
  ChevronRight, X, Info, Download, FileText, Search
} from 'lucide-react';
import type { ChecklistRule, Email, RuleSeverity } from '../types';

interface ReportViewProps {
  searchQuery: string;
  rules: ChecklistRule[];
  setRules: React.Dispatch<React.SetStateAction<ChecklistRule[]>>;
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
}

export const ReportView: React.FC<ReportViewProps> = ({
  searchQuery,
  rules,
  setRules,
  emails,
  setEmails
}) => {
  // Drawer state for adding/editing rules
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<ChecklistRule> | null>(null);
  const [ruleFormError, setRuleFormError] = useState<string | null>(null);

  // Filters
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Modal state for viewing report HTML
  const [modalEmail, setModalEmail] = useState<Email | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleOpenModal = async (email: Email) => {
    setModalEmail(email);
    if (!email.content) {
      setModalLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/reviews/${email.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const html = data.reportHtml || 'Rapor içeriği bulunamadı.';
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, content: html } : e));
        setModalEmail(prev => prev ? { ...prev, content: html } : prev);
      } catch {
        setModalEmail(prev => prev ? { ...prev, content: 'Rapor detayları yüklenirken hata oluştu.' } : prev);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleDownloadPdf = async (email: Email) => {
    let htmlContent = email.content;

    if (!htmlContent) {
      try {
        const res = await fetch(`http://localhost:8000/reviews/${email.id}`);
        const data = await res.json();
        htmlContent = data.reportHtml || '';
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, content: htmlContent } : e));
      } catch {
        alert('Rapor içeriği yüklenemedi.');
        return;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup engelleyici açık olabilir, lütfen izin verin.');
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Filter rules
  const filteredRules = rules.filter(r =>
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group rules by category
  const categories = Array.from(new Set(rules.map(r => r.category)));

  // Filter reports
  const filteredEmails = emails.filter(e => {
    if (filterAuthor && !e.sender.toLowerCase().includes(filterAuthor.toLowerCase())) return false;
    if (filterDateFrom && e.rawDate && e.rawDate < filterDateFrom) return false;
    if (filterDateTo && e.rawDate && e.rawDate > filterDateTo + 'T23:59:59') return false;
    if (searchQuery && !e.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.sender.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Rule actions
  const handleAddRuleClick = () => {
    setCurrentRule({
      id: '',
      category: 'Güvenlik',
      description: '',
      severity: 'medium'
    });
    setRuleFormError(null);
    setIsDrawerOpen(true);
  };

  const handleEditRuleClick = (rule: ChecklistRule) => {
    setCurrentRule({ ...rule });
    setRuleFormError(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Bu checklist kuralını silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`http://localhost:8000/checklist/${id}`, { method: 'DELETE' });
      setRules(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Kural silinemedi.');
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRule?.description?.trim()) {
      setRuleFormError('Lütfen kural açıklamasını girin.');
      return;
    }
    if (!currentRule?.category?.trim()) {
      setRuleFormError('Lütfen bir kategori belirtin.');
      return;
    }

    const payload = {
      category: currentRule.category,
      description: currentRule.description,
      severity: currentRule.severity || 'medium',
    };

    try {
      if (currentRule.id) {
        await fetch(`http://localhost:8000/checklist/${currentRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setRules(prev => prev.map(r => r.id === currentRule.id ? { ...r, ...payload } : r));
      } else {
        const res = await fetch('http://localhost:8000/checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const created: ChecklistRule = await res.json();
        setRules(prev => [...prev, created]);
      }
    } catch {
      alert('Kural kaydedilemedi.');
      return;
    }

    setIsDrawerOpen(false);
    setCurrentRule(null);
  };


  return (
    <div className="report-view-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Sistem Raporlama</h1>
          <p>Code review raporları ve checklist kural yönetimi.</p>
        </div>
      </div>

      <div className="report-grid">
        {/* Left Column: Checklist Rule Management */}
        <div className="checklist-section">
          <div className="panel-card">
            <div className="panel-card-header">
              <span className="panel-card-title">Checklist Kural Yönetimi</span>
              <button className="deploy-node-btn" style={{ margin: 0, padding: '6px 12px', width: 'auto' }} onClick={handleAddRuleClick}>
                <Plus size={14} />
                <span>Kural Ekle</span>
              </button>
            </div>
            
            <div className="panel-card-body" style={{ padding: '16px' }}>
              {categories.map(category => {
                const categoryRules = filteredRules.filter(r => r.category === category);
                if (categoryRules.length === 0) return null;

                return (
                  <div className="category-group" key={category}>
                    <div className="category-header">
                      <span>{category}</span>
                      <span className="category-count">{categoryRules.length} kural</span>
                    </div>
                    <div className="rules-list">
                      {categoryRules.map(rule => (
                        <div className="rule-item-row" key={rule.id}>
                          <div className="rule-item-left">
                            <span className="rule-desc">{rule.description}</span>
                            <div className="rule-meta">
                              <span className={`rule-severity-badge ${rule.severity}`}>
                                {rule.severity === 'critical' ? 'Kritik' : rule.severity === 'high' ? 'Yüksek' : rule.severity === 'medium' ? 'Orta' : 'Düşük'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="rule-actions">
                            <button className="rule-action-btn edit" onClick={() => handleEditRuleClick(rule)} title="Kuralı Düzenle">
                              <Edit />
                            </button>
                            <button className="rule-action-btn delete" onClick={() => handleDeleteRule(rule.id)} title="Kuralı Sil">
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {filteredRules.length === 0 && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Arama kriterlerinize uyan kural bulunamadı. Yeni bir kural ekleyerek başlayabilirsiniz.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Review Reports Table */}
        <div className="mail-section">
          <div className="panel-card">
            <div className="panel-card-header">
              <span className="panel-card-title">Code Review Raporları</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: 0.5 }}>
                {filteredEmails.length} Rapor
              </span>
            </div>

            {/* Filters */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı..."
                  value={filterAuthor}
                  onChange={e => setFilterAuthor(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: 28, padding: '6px 10px 6px 28px', fontSize: 12, width: '100%' }}
                />
              </div>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="form-control"
                style={{ width: 140, padding: '6px 10px', fontSize: 12 }}
                title="Başlangıç tarihi"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="form-control"
                style={{ width: 140, padding: '6px 10px', fontSize: 12 }}
                title="Bitiş tarihi"
              />
              {(filterAuthor || filterDateFrom || filterDateTo) && (
                <button
                  onClick={() => { setFilterAuthor(''); setFilterDateFrom(''); setFilterDateTo(''); }}
                  style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Filtreyi Temizle
                </button>
              )}
            </div>

            {/* Table */}
            <div className="panel-card-body" style={{ padding: 0, overflowX: 'auto' }}>
              {filteredEmails.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <FileText size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
                  <div>Henüz rapor bulunmuyor.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Yazar', 'Branch / Commit', 'Repo', 'Başlık', 'Tarih', ''].map(h => (
                        <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmails.map((email, i) => (
                      <tr
                        key={email.id}
                        style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-app)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.04))')}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-app)')}
                        onClick={() => handleOpenModal(email)}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
                          {email.sender}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                          {email.shortSummary}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {email.repo ?? '-'}
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {email.subject}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {email.date}
                        </td>
                        <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleDownloadPdf(email)}
                            title="PDF İndir"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, background: 'var(--bg-app)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer' }}
                          >
                            <Download size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {modalEmail && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 12, width: '100%', maxWidth: 960, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>{modalEmail.subject}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  {modalEmail.sender} · {modalEmail.shortSummary} · {modalEmail.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleDownloadPdf(modalEmail)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  <Download size={14} />
                  PDF İndir
                </button>
                <button
                  onClick={() => setModalEmail(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Rapor yükleniyor...</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: modalEmail.content }} style={{ whiteSpace: 'normal' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drawer Overlay for Add/Edit Rule */}
      {isDrawerOpen && currentRule && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div>
              <div className="drawer-header">
                <span className="drawer-title">
                  {currentRule.id ? 'Checklist Kuralını Düzenle' : 'Yeni Checklist Kuralı Ekle'}
                </span>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {ruleFormError && (
                <div className="login-error" style={{ marginBottom: 16 }}>
                  {ruleFormError}
                </div>
              )}

              <form onSubmit={handleSaveRule}>
                <div className="form-group">
                  <label htmlFor="rule-category">Üst Kategori</label>
                  <select
                    id="rule-category"
                    className="form-control"
                    value={currentRule.category}
                    onChange={e => setCurrentRule(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Güvenlik">Güvenlik</option>
                    <option value="Performans">Performans</option>
                    <option value="Veri Bütünlüğü">Veri Bütünlüğü</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rule-desc">Kural Açıklaması</label>
                  <textarea
                    id="rule-desc"
                    className="form-control"
                    rows={4}
                    placeholder="Örn: Sunucu hata kodları (5xx) 1% oranını geçmemelidir."
                    value={currentRule.description}
                    onChange={e => setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="rule-severity">Önem Düzeyi</label>
                  <select
                    id="rule-severity"
                    className="form-control"
                    value={currentRule.severity}
                    onChange={e => setCurrentRule(prev => ({ ...prev, severity: e.target.value as RuleSeverity }))}
                  >
                    <option value="critical">Kritik</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="form-btn cancel" onClick={() => setIsDrawerOpen(false)}>
                    İptal Et
                  </button>
                  <button type="submit" className="form-btn submit">
                    <span>{currentRule.id ? 'Değişiklikleri Kaydet' : 'Kuralı Oluştur'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: 14, backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: 12, alignItems: 'flex-start', color: 'var(--text-muted)', marginTop: 24 }}>
              <Info size={16} style={{ flexShrink: 0, color: 'var(--primary)', marginTop: 2 }} />
              <span>
                Yeni kurallar oluşturulduğunda sistem, gelen e-posta içeriklerinde kuralın geçerliliğini denetlemeye başlar.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
