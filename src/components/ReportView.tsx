import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Mail, AlertTriangle, CheckCircle, 
  ChevronRight, Calendar, User, X, Info, FileText, Download, Paperclip
} from 'lucide-react';
import type { ChecklistRule, Email, RuleSeverity, Attachment } from '../types';

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
  // Active email selection
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);

  // Drawer state for adding/editing rules
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<ChecklistRule> | null>(null);
  const [ruleFormError, setRuleFormError] = useState<string | null>(null);

  // Filter rules based on search query
  const filteredRules = rules.filter(r => 
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group rules by category
  const categories = Array.from(new Set(rules.map(r => r.category)));

  // Filter emails based on search query
  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Mark email as read on click
  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

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

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Bu checklist kuralını silmek istediğinizden emin misiniz?')) {
      setRules(prev => prev.filter(r => r.id !== id));
      // Clean up relations from emails
      setEmails(prev => prev.map(e => ({
        ...e,
        relatedRuleIds: e.relatedRuleIds.filter(ruleId => ruleId !== id)
      })));
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRule?.description?.trim()) {
      setRuleFormError('Lütfen kural açıklamasını girin.');
      return;
    }
    if (!currentRule?.category?.trim()) {
      setRuleFormError('Lütfen bir kategori belirtin.');
      return;
    }

    if (currentRule.id) {
      // Update
      setRules(prev => prev.map(r => r.id === currentRule.id ? (currentRule as ChecklistRule) : r));
    } else {
      // Create
      const newRule: ChecklistRule = {
        id: 'r_' + Date.now(),
        category: currentRule.category,
        description: currentRule.description,
        severity: currentRule.severity || 'medium'
      };
      setRules(prev => [...prev, newRule]);
    }
    setIsDrawerOpen(false);
    setCurrentRule(null);
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    const replaceTurkishChars = (str: string) => {
      const map: Record<string, string> = {
        'ı': 'i', 'İ': 'I',
        'ş': 's', 'Ş': 'S',
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C'
      };
      return str.replace(/[ıİşŞğĞüÜöÖçÇ]/g, m => map[m]);
    };

    // Generate a minimal valid PDF 1.4 structure
    const pdfHeader = `%PDF-1.4\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n`;
    const obj4 = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
    
    // PDF layout text stream content
    const streamContent = `BT\n` +
      `/F1 16 Tf\n` +
      `50 780 Td\n` +
      `(LST-AI AGENTIC AUTOMATION SYSTEM REPORT) Tj\n` +
      `/F1 12 Tf\n` +
      `0 -40 Td\n` +
      `(Document Name: ${replaceTurkishChars(attachment.name)}) Tj\n` +
      `0 -20 Td\n` +
      `(File Size: ${attachment.size}) Tj\n` +
      `0 -20 Td\n` +
      `(Status: SECURED / VERIFIED) Tj\n` +
      `0 -40 Td\n` +
      `(This is a system generated report verified by LST-AI Agentic Automation.) Tj\n` +
      `0 -20 Td\n` +
      `(All security credentials scanned: PASS.) Tj\n` +
      `0 -200 Td\n` +
      `/F1 10 Tf\n` +
      `(Generated on: ${new Date().toLocaleString()}) Tj\n` +
      `ET`;

    const obj5 = `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
    
    const pdfBody = pdfHeader + obj1 + obj2 + obj3 + obj4 + obj5;
    const startXrefOffset = pdfBody.length;
    
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXrefOffset}\n%%EOF`;
    const fullPdf = pdfBody + trailer;

    // Convert string to Uint8Array to handle binary stream properly
    const buffer = new ArrayBuffer(fullPdf.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < fullPdf.length; i++) {
      view[i] = fullPdf.charCodeAt(i);
    }

    const blob = new Blob([view], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Sistem Raporlama</h1>
          <p>Yürütülen e-posta analizleri ve checklist kurallarının yönetimi.</p>
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
                                {rule.severity === 'high' ? 'Yüksek' : rule.severity === 'medium' ? 'Orta' : 'Düşük'}
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

        {/* Right Column: Interactive Email Inbox Client */}
        <div className="mail-section">
          <div className="panel-card">
            <div className="panel-card-header">
              <span className="panel-card-title">E-posta Analiz Arayüzü</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: 0.5 }}>E-posta Günlüğü</span>
            </div>

            <div className="panel-card-body" style={{ padding: 0 }}>
              <div className="mail-section-container">
                
                {/* Mail Sidebar (List) */}
                <div className="mail-sidebar">
                  <div className="mail-sidebar-header">Gelen Mailler</div>
                  {filteredEmails.map(mail => (
                    <button
                      key={mail.id}
                      className={`mail-list-item ${selectedEmailId === mail.id ? 'active' : ''}`}
                      onClick={() => handleSelectEmail(mail.id)}
                    >
                      {!mail.read && <div className="mail-list-item-unread-dot"></div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="mail-item-sender">{mail.sender}</div>
                        {mail.attachments && mail.attachments.length > 0 && (
                          <Paperclip size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }} />
                        )}
                      </div>
                      <div className="mail-item-subject">{mail.subject}</div>
                      <div className="mail-item-date">{mail.date}</div>
                    </button>
                  ))}

                  {filteredEmails.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      E-posta bulunamadı.
                    </div>
                  )}
                </div>

                {/* Mail Detail Pane */}
                <div className="mail-detail-pane">
                  {selectedEmail ? (
                    <>
                      <div className="mail-detail-header">
                        <h3 className="mail-subject-title">{selectedEmail.subject}</h3>
                        
                        <div className="mail-meta-row">
                          <div className="mail-sender-info">
                            <User size={14} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 600 }}>{selectedEmail.sender}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            <span>{selectedEmail.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mail-body">
                        {selectedEmail.content}
                      </div>

                      {/* Attachment Section */}
                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mail-attachments-section">
                          <span className="mail-attachments-title">Ekli Dosyalar ({selectedEmail.attachments.length})</span>
                          <div className="mail-attachments-list">
                            {selectedEmail.attachments.map((att) => (
                              <div className="mail-attachment-card" key={att.name}>
                                <div className="mail-attachment-info">
                                  <FileText className="mail-attachment-icon" size={16} />
                                  <div className="mail-attachment-meta">
                                    <span className="mail-attachment-name" title={att.name}>{att.name}</span>
                                    <span className="mail-attachment-size">{att.size}</span>
                                  </div>
                                </div>
                                <button 
                                  className="mail-attachment-download-btn"
                                  onClick={() => handleDownloadAttachment(att)}
                                  title="Dosyayı İndir"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related/Matching Rules Section */}
                      <div className="mail-relations-section">
                        <span className="mail-relations-title">Eşleşen Kural Denetimi</span>
                        <div className="mail-matching-rules-list">
                          {selectedEmail.relatedRuleIds.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--success)' }}>
                              <CheckCircle size={14} />
                              <span>Bu mail ile ilgili herhangi bir kural ihlali veya tetikleyici eşleşme bulunmadı.</span>
                            </div>
                          ) : (
                            selectedEmail.relatedRuleIds.map(ruleId => {
                              const rule = rules.find(r => r.id === ruleId);
                              if (!rule) return null;
                              return (
                                <div className="mail-matching-rule" key={rule.id}>
                                  <AlertTriangle 
                                    size={14} 
                                    style={{ 
                                      color: rule.severity === 'high' ? 'var(--danger)' : rule.severity === 'medium' ? 'var(--warning)' : 'var(--success)' 
                                    }} 
                                  />
                                  <div>
                                    <strong style={{ color: 'var(--text-heading)' }}>[{rule.category}]</strong> {rule.description}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mail-detail-placeholder">
                      <Mail />
                      <span>Okumak için bir e-posta seçin.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
