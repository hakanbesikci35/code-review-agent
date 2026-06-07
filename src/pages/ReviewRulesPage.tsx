import React, { useRef, useState, useEffect } from 'react';
import {
  Edit3,
  Flame,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
  FileCode,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { 
  getReviewRules, 
  toggleReviewRule, 
  updateReviewRule, 
  bulkToggleReviewRules,
  addReviewRule,
  deleteReviewRule
} from '../services/mockData';
import type { ReviewRule, RuleSeverity, RuleType } from '../types/review';
import { fadeInUp } from '../utils/animations';

export const ReviewRulesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [rules, setRules] = useState<ReviewRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Edit modal state
  const [editingRule, setEditingRule] = useState<ReviewRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  // Add rule modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newSeverity, setNewSeverity] = useState<RuleSeverity>('info');
  const [newType, setNewType] = useState<RuleType>('security');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async (
    currentPage = page,
    currentSearch = search,
    currentSeverity = severityFilter,
    currentType = typeFilter
  ) => {
    setLoading(true);
    try {
      const res = await getReviewRules(currentPage, 5, currentSearch, currentSeverity, currentType);
      setRules(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      if (res.activeCount !== undefined) {
        setActiveCount(res.activeCount);
      }
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search, severityFilter, typeFilter);
  }, [page]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.rule-row-animate'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search, severityFilter, typeFilter);
  };

  const handleFilterChange = (newSeverity: string, newType: string) => {
    setSeverityFilter(newSeverity);
    setTypeFilter(newType);
    setPage(1);
    loadData(1, search, newSeverity, newType);
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleReviewRule(id);
      loadData(page, search, severityFilter, typeFilter);
    } catch (err) {
      alert('İşlem başarısız.');
    }
  };

  const handleBulkToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      await bulkToggleReviewRules(enabled);
      loadData(page, search, severityFilter, typeFilter);
    } catch (err) {
      alert('Toplu güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (rule: ReviewRule) => {
    setEditingRule({ ...rule });
  };

  const handleSave = async () => {
    if (!editingRule) return;
    setIsSaving(true);
    try {
      await updateReviewRule(editingRule);
      setEditingRule(null);
      loadData(page, search, severityFilter, typeFilter);
    } catch (err) {
      alert('Güncelleme başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rule: ReviewRule) => {
    const confirmed = window.confirm(`"${rule.name}" kuralı kaldırılsın mı? Bu işlem geri alınamaz.`);
    if (!confirmed) return;

    setDeletingRuleId(rule.id);
    try {
      await deleteReviewRule(rule.id);
      const nextTotal = Math.max(totalCount - 1, 0);
      const nextTotalPages = Math.max(Math.ceil(nextTotal / 5), 1);
      const nextPage = Math.min(page, nextTotalPages);
      setPage(nextPage);
      loadData(nextPage, search, severityFilter, typeFilter);
    } catch (err) {
      alert('Kural kaldırılamadı.');
    } finally {
      setDeletingRuleId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    setIsSubmitting(true);
    try {
      await addReviewRule({
        name: newName,
        description: newDesc,
        customPrompt: newPrompt,
        severity: newSeverity,
        type: newType
      });
      setIsModalOpen(false);
      
      // Reset form
      setNewName('');
      setNewDesc('');
      setNewPrompt('');
      setNewSeverity('info');
      setNewType('security');

      // Clear filters/search and go back to page 1 to see the new rule
      setSearch('');
      setSeverityFilter('');
      setTypeFilter('');
      setPage(1);
      loadData(1, '', '', '');
    } catch (err) {
      alert('Yeni kural eklenirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: RuleSeverity) => {
    let color = 'var(--text-secondary)';
    let bg = 'var(--bg-elevated)';
    let label = 'Bilgi';

    if (sev === 'critical') {
      color = 'var(--accent-danger)';
      bg = 'var(--glow-red)';
      label = 'Kritik';
    } else if (sev === 'warning') {
      color = 'var(--accent-warning)';
      bg = 'var(--glow-warning)';
      label = 'Uyarı';
    }

    return (
      <span 
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: bg,
          color,
          border: `1px solid ${color}30`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          whiteSpace: 'nowrap'
        }}
      >
        {sev === 'critical' ? <Flame size={12} /> : <AlertCircle size={12} />}
        {label}
      </span>
    );
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Yapay Zekâ İnceleme Kuralları</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            LLM Kod İnceleme Ajanının PR analizleri yaparken denetleyeceği kurallar ve prompt yönergeleri.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Plus size={15} />
          Yeni Kural Ekle
        </button>
      </div>

      {/* Bulk actions and summary */}
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {totalCount} Kuraldan <span style={{ color: 'var(--accent-primary)' }}>{activeCount}</span> tanesi aktif durumda
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleBulkToggle(true)}
            className="btn-transition"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--accent-success)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tümünü Etkinleştir
          </button>
          <button
            onClick={() => handleBulkToggle(false)}
            className="btn-transition"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--accent-danger)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tümünü Devre Dışı Bırak
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Kurallarda arama yapın..." 
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
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Ara
          </button>
        </form>

        {/* Severity & Type filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          
          <select
            value={severityFilter}
            onChange={(e) => handleFilterChange(e.target.value, typeFilter)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="info">Bilgi (Info)</option>
            <option value="warning">Uyarı (Warning)</option>
            <option value="critical">Kritik (Critical)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => handleFilterChange(severityFilter, e.target.value)}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tüm Tipler</option>
            <option value="security">Güvenlik (Security)</option>
            <option value="performance">Performans (Performance)</option>
            <option value="style">Kod Stili (Style)</option>
            <option value="doc">Dokümantasyon (Doc)</option>
          </select>
        </div>
      </div>

      {/* Rules Table Wrapper */}
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow)',
          overflowX: 'auto',
          position: 'relative'
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(1px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 0.5rem', width: '50px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DURUM</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '250px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KURAL ADI</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '300px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AÇIKLAMA</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AI PROMPT YÖNERGESİ</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '100px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ÖNCELİK</th>
              <th style={{ padding: '0.75rem 0.5rem', width: '230px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                  Kriterlere uygun kural bulunamadı.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="rule-row-animate"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    opacity: rule.enabled ? 1 : 0.55,
                    transition: 'opacity var(--transition-fast)',
                  }}
                >
                  {/* Enabled Checkbox */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <div
                      onClick={() => handleToggle(rule.id)}
                      style={{ display: 'inline-flex', cursor: 'pointer', color: rule.enabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                      {rule.enabled ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </td>

                  {/* Rule Name */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: rule.enabled ? 'none' : 'line-through' }}>
                      {rule.name}
                    </span>
                  </td>

                  {/* Description */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rule.description}</span>
                  </td>

                  {/* Custom Prompt */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    {rule.customPrompt ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <FileCode size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '0.15rem' }} />
                        <code style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-primary)', padding: '0.1rem 0.3rem', borderRadius: '3px', display: 'block', maxHeight: '60px', overflowY: 'auto', whiteSpace: 'pre-wrap', width: '100%' }}>
                          {rule.customPrompt}
                        </code>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Tanımlı yönerge yok</span>
                    )}
                  </td>

                  {/* Severity */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle' }}>
                    {getSeverityBadge(rule.severity)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => startEdit(rule)}
                        className="btn-transition flex-center"
                        style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, gap: '0.25rem', cursor: 'pointer' }}
                      >
                        <Edit3 size={12} />
                        <span>Düzenle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule)}
                        disabled={deletingRuleId === rule.id}
                        className="btn-transition flex-center"
                        style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(220, 38, 38, 0.24)', backgroundColor: 'var(--glow-red)', color: 'var(--accent-danger)', fontSize: '0.75rem', fontWeight: 600, gap: '0.25rem', cursor: deletingRuleId === rule.id ? 'not-allowed' : 'pointer', opacity: deletingRuleId === rule.id ? 0.65 : 1 }}
                      >
                        <Trash2 size={12} />
                        <span>{deletingRuleId === rule.id ? 'Kaldırılıyor...' : 'Kaldır'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div 
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
            Toplam <strong>{totalCount}</strong> kayıttan <strong>{(page - 1) * 5 + 1}-{Math.min(page * 5, totalCount)}</strong> arası gösteriliyor
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none'
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '550px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Edit3 size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Kuralı Düzenle</h3>
              </div>
              <button onClick={() => !isSaving && setEditingRule(null)} disabled={isSaving} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }} className="custom-scroll">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>KURAL ADI</label>
                <input type="text" value={editingRule.name} onChange={(e) => setEditingRule((r) => r && ({ ...r, name: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AÇIKLAMA</label>
                <textarea value={editingRule.description} onChange={(e) => setEditingRule((r) => r && ({ ...r, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AI PROMPT YÖNERGESİ</label>
                <textarea value={editingRule.customPrompt || ''} onChange={(e) => setEditingRule((r) => r && ({ ...r, customPrompt: e.target.value }))} rows={3} placeholder="Örn: SQL Injection kontrolü için prompt..." style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>ÖNCELİK</label>
                  <select value={editingRule.severity} onChange={(e) => setEditingRule((r) => r && ({ ...r, severity: e.target.value as RuleSeverity }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                    <option value="info">Bilgi (Info)</option>
                    <option value="warning">Uyarı (Warning)</option>
                    <option value="critical">Kritik (Critical)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>DURUM</label>
                  <select value={editingRule.enabled ? 'true' : 'false'} onChange={(e) => setEditingRule((r) => r && ({ ...r, enabled: e.target.value === 'true' }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
              <button type="button" onClick={() => setEditingRule(null)} disabled={isSaving} style={{ padding: '0.45rem 1rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                Vazgeç
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving || !editingRule.name.trim()} style={{ padding: '0.45rem 1.25rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--accent-primary)', border: 'none', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: (isSaving || !editingRule.name.trim()) ? 'not-allowed' : 'pointer', opacity: (isSaving || !editingRule.name.trim()) ? 0.6 : 1 }}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW RULE MODAL */}
      {isModalOpen && (
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
              maxWidth: '550px',
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
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Yeni İnceleme Kuralı Ekle</h3>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: 0 }}>
              
              <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh' }} className="custom-scroll">
                
                {/* Rule Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>KURAL ADI</label>
                  <input 
                    type="text"
                    placeholder="Örn: SQL Injection Koruması"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AÇIKLAMA</label>
                  <textarea 
                    placeholder="Kuralın neyi denetlediğine dair kısa bir açıklama..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Prompt */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AI PROMPT YÖNERGESİ (LLM PROMPT)</label>
                  <textarea 
                    placeholder="Yapay zekanın inceleme esnasında kuralı denetlemesi için verilecek prompt..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Severity & Type Selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>ÖNCELİK DERCESİ</label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as RuleSeverity)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="info">BİLGİ (INFO)</option>
                      <option value="warning">UYARI (WARNING)</option>
                      <option value="critical">KRİTİK (CRITICAL)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>KURAL TİPİ</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as RuleType)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="security">GÜVENLİK (SECURITY)</option>
                      <option value="performance">PERFORMANS (PERFORMANCE)</option>
                      <option value="style">KOD STİLİ (STYLE)</option>
                      <option value="doc">DOKÜMANTASYON (DOC)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newName.trim() || !newDesc.trim()}
                  style={{
                    padding: '0.45rem 1.25rem',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--accent-primary)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: (isSubmitting || !newName.trim() || !newDesc.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || !newName.trim() || !newDesc.trim()) ? 0.6 : 1,
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Kuralı Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Global CSS spinner rule */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReviewRulesPage;
