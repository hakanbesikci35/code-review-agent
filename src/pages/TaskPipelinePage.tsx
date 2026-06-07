import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Webhook,
  ShieldCheck,
  GitMerge,
  FlaskConical,
  GitPullRequest,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Lightbulb,
  GitCommit,
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getPipelineDetail } from '../services/sprintMockData';
import type { PipelineDetail } from '../types/task';
import { fadeInUp } from '../utils/animations';
import { formatDate } from '../utils/formatters';

const SPIN = `@keyframes spin { to { transform: rotate(360deg); } }`;

type StepKey = 'webhook' | 'review' | 'devmerge' | 'test' | 'testpr';

interface Step {
  key: StepKey;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { key: 'webhook', label: 'Webhook', sublabel: 'Tetikleyici', icon: <Webhook size={18} /> },
  { key: 'review', label: 'Review Agent', sublabel: 'Kod İnceleme', icon: <ShieldCheck size={18} /> },
  { key: 'devmerge', label: 'Dev Merge', sublabel: 'Otomatik Merge', icon: <GitMerge size={18} /> },
  { key: 'test', label: 'Test Agent', sublabel: 'Fonksiyonel Test', icon: <FlaskConical size={18} /> },
  { key: 'testpr', label: 'Test PR', sublabel: 'Staging Talebi', icon: <GitPullRequest size={18} /> },
];

type StepStatus = 'completed' | 'success' | 'failed' | 'conflict' | 'stale' | 'pending' | 'none';

const getStepStatus = (detail: PipelineDetail, key: StepKey): StepStatus => {
  switch (key) {
    case 'webhook':
      return detail.mergeEvent ? 'completed' : 'none';
    case 'review':
      if (!detail.review) return 'none';
      return detail.review.decision === 'approved' ? 'success' : 'failed';
    case 'devmerge':
      if (!detail.devMerge || detail.devMerge.status === 'none') return 'none';
      if (detail.devMerge.status === 'success' || detail.devMerge.status === 'manually_resolved') return 'success';
      if (detail.devMerge.status === 'conflict') return 'conflict';
      if (detail.devMerge.status === 'stale') return 'stale';
      return 'failed';
    case 'test':
      if (!detail.testRun) return 'none';
      return detail.testRun.decision === 'passed' ? 'success' : 'failed';
    case 'testpr':
      if (!detail.testPR) return 'none';
      return detail.testPR.status === 'merged' ? 'success' : 'completed';
    default:
      return 'none';
  }
};

const stepCircleStyle = (status: StepStatus, isActive: boolean) => {
  const base: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    transition: 'all 0.3s ease',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
    cursor: 'pointer',
  };
  if (status === 'none') return { ...base, backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-muted)' };
  if (status === 'success' || status === 'completed') return { ...base, backgroundColor: isActive ? 'var(--accent-success)' : 'var(--glow-green)', borderColor: 'var(--accent-success)', color: isActive ? '#fff' : 'var(--accent-success)' };
  if (status === 'failed') return { ...base, backgroundColor: isActive ? 'var(--accent-danger)' : 'var(--glow-red)', borderColor: 'var(--accent-danger)', color: isActive ? '#fff' : 'var(--accent-danger)' };
  if (status === 'conflict' || status === 'stale') return { ...base, backgroundColor: isActive ? 'var(--accent-warning)' : 'var(--glow-warning)', borderColor: 'var(--accent-warning)', color: isActive ? '#fff' : 'var(--accent-warning)' };
  if (status === 'pending') return { ...base, backgroundColor: 'var(--glow-blue)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' };
  return base;
};

const severityColor = (s: string) => {
  if (s === 'high') return { bg: 'var(--glow-red)', text: 'var(--accent-danger)', border: 'rgba(220,38,38,0.2)', label: 'Yüksek' };
  if (s === 'medium') return { bg: 'var(--glow-warning)', text: 'var(--accent-warning)', border: 'rgba(217,119,6,0.2)', label: 'Orta' };
  return { bg: 'var(--glow-blue)', text: 'var(--accent-primary)', border: 'rgba(37,99,235,0.2)', label: 'Düşük' };
};

// ─── Component ──────────────────────────────────────────────────────────────
const TaskPipelinePage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [detail, setDetail] = useState<PipelineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<StepKey>('webhook');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPipelineDetail(taskId || '');
        setDetail(data ?? null);
        // Auto-focus on the last reached step
        if (data) {
          const order: StepKey[] = ['webhook', 'review', 'devmerge', 'test', 'testpr'];
          let last: StepKey = 'webhook';
          for (const k of order) {
            if (getStepStatus(data, k) !== 'none') last = k;
          }
          setActiveStep(last);
        }
      } catch (err) {
        console.error('Failed to load pipeline detail', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--accent-primary)' }}>
        <span style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.75rem' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Pipeline yükleniyor...</span>
        <style>{SPIN}</style>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        Görev bulunamadı.
      </div>
    );
  }

  const { task } = detail;

  const renderStepDetail = () => {
    switch (activeStep) {
      case 'webhook':
        return detail.mergeEvent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'COMMIT HASH', value: detail.mergeEvent.commitHash, mono: true },
                { label: 'KAYNAK BRANCH', value: detail.mergeEvent.sourceBranch, mono: true },
                { label: 'AKTÖR', value: detail.mergeEvent.actor, mono: false },
                { label: 'MERGE TARİHİ', value: formatDate(detail.mergeEvent.mergedAt), mono: false },
              ].map((item) => (
                <div key={item.label} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: item.mono ? 'var(--font-mono)' : 'inherit' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Webhook olayı henüz alınmadı.</p>;

      case 'review':
        return detail.review ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Score + Decision */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--border-radius-md)', backgroundColor: detail.review.decision === 'approved' ? 'var(--glow-green)' : 'var(--glow-red)', border: `1px solid ${detail.review.decision === 'approved' ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
              {detail.review.decision === 'approved' ? <CheckCircle2 size={28} style={{ color: 'var(--accent-success)', flexShrink: 0 }} /> : <XCircle size={28} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: detail.review.decision === 'approved' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {detail.review.decision === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {detail.review.score}/100
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{detail.review.summary}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div>{detail.review.promptTokens.toLocaleString()} prompt tok.</div>
                <div>{detail.review.completionTokens.toLocaleString()} output tok.</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${detail.review.costUsd.toFixed(4)}</div>
              </div>
            </div>

            {/* Issues */}
            {detail.review.issues.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--accent-warning)' }} /> Tespit Edilen Sorunlar ({detail.review.issues.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detail.review.issues.map((issue, i) => {
                    const sc = severityColor(issue.severity);
                    return (
                      <div key={i} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{sc.label}</span>
                        <div style={{ flex: 1 }}>
                          <code style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{issue.file}:{issue.line}</code>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{issue.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {detail.review.suggestions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lightbulb size={14} style={{ color: 'var(--accent-warning)' }} /> Öneriler
                </h4>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {detail.review.suggestions.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review Agent henüz çalışmadı.</p>;

      case 'devmerge':
        return detail.devMerge ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>DURUM</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ['success', 'manually_resolved'].includes(detail.devMerge.status) ? 'var(--accent-success)' : detail.devMerge.status === 'conflict' || detail.devMerge.status === 'stale' ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                  {detail.devMerge.status === 'success' ? '✓ Başarılı' : detail.devMerge.status === 'manually_resolved' ? '✓ Manuel Çözüldü' : detail.devMerge.status === 'conflict' ? '⚠ Conflict' : detail.devMerge.status === 'stale' ? '⚠ Stale' : '✗ Hata'}
                </span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>HEDEF BRANCH</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{detail.devMerge.targetBranch}</span>
              </div>
              {detail.devMerge.mergedAt && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>MERGE TARİHİ</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{formatDate(detail.devMerge.mergedAt)}</span>
                </div>
              )}
            </div>

            {detail.devMerge.conflictDetails && (
              <div style={{ padding: '1rem', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--glow-red)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} /> Çakışan Dosyalar
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  {detail.devMerge.conflictDetails.files.map((f, i) => (
                    <code key={i} style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(220,38,38,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'block' }}>{f}</code>
                  ))}
                </div>
                <a
                  href={detail.devMerge.conflictDetails.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-danger)', textDecoration: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={13} /> Platform'da Çöz
                </a>
              </div>
            )}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dev merge henüz gerçekleşmedi.</p>;

      case 'test':
        return detail.testRun ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--border-radius-md)', backgroundColor: detail.testRun.decision === 'passed' ? 'var(--glow-green)' : 'var(--glow-red)', border: `1px solid ${detail.testRun.decision === 'passed' ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
              {detail.testRun.decision === 'passed' ? <CheckCircle2 size={28} style={{ color: 'var(--accent-success)', flexShrink: 0 }} /> : <XCircle size={28} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: detail.testRun.decision === 'passed' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {detail.testRun.decision === 'passed' ? 'TESTLER GEÇTİ' : 'TESTLER BAŞARISIZ'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.testRun.score}/100</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {detail.testRun.durationSeconds}sn
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{detail.testRun.summary}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div>{detail.testRun.coverageEstimate}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>${detail.testRun.costUsd.toFixed(4)}</div>
              </div>
            </div>

            {detail.testRun.passedCases.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '0.5rem' }}>✓ Geçen Senaryolar ({detail.testRun.passedCases.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {detail.testRun.passedCases.map((c, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', backgroundColor: 'var(--glow-green)', border: '1px solid rgba(5,150,105,0.1)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ✓ {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.testRun.failedCases.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: '0.5rem' }}>✗ Başarısız Senaryolar ({detail.testRun.failedCases.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {detail.testRun.failedCases.map((c, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', backgroundColor: 'var(--glow-red)', border: '1px solid rgba(220,38,38,0.1)', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>{c.name}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{c.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Test Agent henüz çalışmadı.</p>;

      case 'testpr':
        return detail.testPR ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'PR DURUMU', value: detail.testPR.status === 'merged' ? '✓ Merge Edildi' : detail.testPR.status === 'open' ? 'Açık' : 'Kapalı', color: detail.testPR.status === 'merged' ? 'var(--accent-success)' : 'var(--accent-primary)' },
                { label: 'HEDEF BRANCH', value: detail.testPR.targetBranch, color: 'var(--accent-primary)', mono: true },
                { label: 'OLUŞTURMA TARİHİ', value: formatDate(detail.testPR.createdAt), color: 'var(--text-primary)' },
              ].map((item) => (
                <div key={item.label} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.color, fontFamily: (item as any).mono ? 'var(--font-mono)' : 'inherit' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <a
              href={detail.testPR.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', width: 'fit-content' }}
            >
              <ExternalLink size={14} /> Pull Request'e Git
            </a>
          </div>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Test PR henüz açılmadı.</p>;

      default:
        return null;
    }
  };

  const activeStepData = STEPS.find((s) => s.key === activeStep)!;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          <ChevronLeft size={14} /> Sprint'e Dön
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: 'var(--glow-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(37,99,235,0.2)' }}>{task.externalTaskId}</span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <GitCommit size={13} />
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{task.branchName}</code>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.assignee}</span>
        </div>
      </div>

      {/* Pipeline Step Bar */}
      <div className="animate-fade" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', padding: '1.75rem 2rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, overflowX: 'auto', padding: '0.5rem 0' }}>
          {STEPS.map((step, idx) => {
            const status = getStepStatus(detail, step.key);
            const isActive = activeStep === step.key;
            return (
              <React.Fragment key={step.key}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '90px' }}
                  onClick={() => setActiveStep(step.key)}
                >
                  <div
                    style={{
                      ...stepCircleStyle(status, isActive),
                      boxShadow: isActive ? '0 0 0 3px var(--accent-primary)33' : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                    className={status === 'pending' ? 'pulse-step-blue' : ''}
                  >
                    {step.icon}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{step.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{step.sublabel}</div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ height: '2px', flex: 1, minWidth: '32px', maxWidth: '80px', backgroundColor: getStepStatus(detail, STEPS[idx + 1].key) !== 'none' || status !== 'none' ? 'var(--accent-primary)' : 'var(--border)', margin: '0 0.25rem', marginBottom: '1.5rem', opacity: getStepStatus(detail, STEPS[idx + 1].key) !== 'none' || status !== 'none' ? 1 : 0.3 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Detail Panel */}
      <div className="animate-fade" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--accent-primary)' }}>{activeStepData.icon}</div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeStepData.label}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— {activeStepData.sublabel}</span>
        </div>
        {renderStepDetail()}
      </div>

      <style>{SPIN}</style>
    </div>
  );
};

export default TaskPipelinePage;
