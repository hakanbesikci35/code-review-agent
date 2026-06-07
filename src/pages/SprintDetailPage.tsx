import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Calendar,
  ChevronRight,
  User,
  ShieldCheck,
  GitMerge,
  FlaskConical,
  GitPullRequest,
  Layers,
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getSprints, getSprintById, getSprintTasks } from '../services/sprintMockData';
import type { Sprint } from '../types/sprint';
import type { Task, ReviewDecision, ReviewStatus, DevMergeStatus, TaskTestStatus, TestPRStatus } from '../types/task';
import { fadeInUp } from '../utils/animations';

const SPIN = `@keyframes spin { to { transform: rotate(360deg); } }`;

// ─── Badge helpers ──────────────────────────────────────────────────────────
const badge = (
  label: string,
  bg: string,
  color: string,
  border: string
) => (
  <span
    style={{
      fontSize: '0.68rem',
      fontWeight: 700,
      padding: '0.15rem 0.45rem',
      borderRadius: '4px',
      backgroundColor: bg,
      color,
      border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

const dash = () => (
  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
);

const reviewBadge = (decision: ReviewDecision, status: ReviewStatus, score?: number) => {
  if (status === 'none') return dash();
  if (status === 'pending') return badge('Bekliyor', 'var(--glow-blue)', 'var(--accent-primary)', 'rgba(37,99,235,0.2)');
  if (status === 'error') return badge('Hata', 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
  if (decision === 'approved') return badge(`✓ Onay${score ? ` (${score})` : ''}`, 'var(--glow-green)', 'var(--accent-success)', 'rgba(5,150,105,0.2)');
  if (decision === 'rejected') return badge(`✗ Red${score ? ` (${score})` : ''}`, 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
  return dash();
};

const mergeBadge = (status: DevMergeStatus) => {
  switch (status) {
    case 'none': return dash();
    case 'success': return badge('✓ Başarılı', 'var(--glow-green)', 'var(--accent-success)', 'rgba(5,150,105,0.2)');
    case 'conflict': return badge('⚠ Conflict', 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
    case 'stale': return badge('⚠ Stale', 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
    case 'manually_resolved': return badge('✓ Çözüldü', 'var(--glow-green)', 'var(--accent-success)', 'rgba(5,150,105,0.2)');
    case 'failed': return badge('✗ Hata', 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
    default: return dash();
  }
};

const testBadge = (status: TaskTestStatus) => {
  switch (status) {
    case 'none': return dash();
    case 'pending': return badge('Bekliyor', 'var(--glow-blue)', 'var(--accent-primary)', 'rgba(37,99,235,0.2)');
    case 'passed': return badge('✓ Geçti', 'var(--glow-green)', 'var(--accent-success)', 'rgba(5,150,105,0.2)');
    case 'failed': return badge('✗ Hata', 'var(--glow-red)', 'var(--accent-danger)', 'rgba(220,38,38,0.2)');
    default: return dash();
  }
};

const testPRBadge = (status: TestPRStatus) => {
  switch (status) {
    case 'none': return dash();
    case 'open': return badge('Açık PR', 'var(--glow-blue)', 'var(--accent-primary)', 'rgba(37,99,235,0.2)');
    case 'merged': return badge('✓ Merge', 'var(--glow-green)', 'var(--accent-success)', 'rgba(5,150,105,0.2)');
    case 'closed': return badge('Kapalı', 'var(--bg-elevated)', 'var(--text-muted)', 'var(--border)');
    default: return dash();
  }
};

const sprintStatusStyle = (status: string) => {
  switch (status) {
    case 'active': return { bg: 'var(--glow-green)', text: 'var(--accent-success)', border: 'rgba(5,150,105,0.2)', label: 'AKTİF' };
    case 'completed': return { bg: 'var(--glow-blue)', text: 'var(--accent-primary)', border: 'rgba(37,99,235,0.2)', label: 'TAMAMLANDI' };
    case 'planning': return { bg: 'var(--glow-warning)', text: 'var(--accent-warning)', border: 'rgba(217,119,6,0.2)', label: 'PLANLAMA' };
    case 'cancelled': return { bg: 'var(--glow-red)', text: 'var(--accent-danger)', border: 'rgba(220,38,38,0.2)', label: 'İPTAL' };
    default: return { bg: 'var(--bg-elevated)', text: 'var(--text-muted)', border: 'var(--border)', label: status };
  }
};

// ─── Component ──────────────────────────────────────────────────────────────
const SprintDetailPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = sprintId || 'sprint_2';
        const [allSprints, sprintData, sprintTasks] = await Promise.all([
          getSprints(),
          getSprintById(id),
          getSprintTasks(id),
        ]);
        setSprints(allSprints);
        setSprint(sprintData ?? null);
        setTasks(sprintTasks);
      } catch (err) {
        console.error('Failed to load sprint data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sprintId]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--accent-primary)' }}>
        <span style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.75rem' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Sprint yükleniyor...</span>
        <style>{SPIN}</style>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        Sprint bulunamadı.
      </div>
    );
  }

  const ss = sprintStatusStyle(sprint.status);
  const completionPct = sprint.taskCount > 0 ? Math.round((sprint.completedTaskCount / sprint.taskCount) * 100) : 0;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sprint.name}</h2>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
              {ss.label}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {sprint.projectName} — <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{sprint.branchName}</code>
          </p>
        </div>

        <select
          value={sprintId || 'sprint_2'}
          onChange={(e) => navigate(`/sprints/${e.target.value}`)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
        >
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.status === 'active' ? 'Aktif' : 'Tamamlandı'})</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Dates */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-md)', padding: '1rem', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-blue)', color: 'var(--accent-primary)', flexShrink: 0 }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.04em' }}>TARİH ARALIĞI</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {sprint.startDate} → {sprint.endDate}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-md)', padding: '1rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>İLERLEME</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {sprint.completedTaskCount}/{sprint.taskCount} Görev
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>%{completionPct} tamamlandı</span>
        </div>

        {/* Branch */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-md)', padding: '1rem', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--glow-green)', color: 'var(--accent-success)', flexShrink: 0 }}>
            <GitBranch size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.04em' }}>SPRINT BRANCH</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{sprint.branchName}</span>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="animate-fade" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Görev Pipeline Durumları ({tasks.length} görev)
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              {[
                { icon: null, label: 'GÖREV' },
                { icon: null, label: 'BAŞLIK / BRANCH' },
                { icon: <User size={11} />, label: 'GELİŞTİRİCİ' },
                { icon: <ShieldCheck size={11} />, label: 'İNCELEME' },
                { icon: <GitMerge size={11} />, label: 'DEV MERGE' },
                { icon: <FlaskConical size={11} />, label: 'TEST' },
                { icon: <GitPullRequest size={11} />, label: 'TEST PR' },
                { icon: null, label: '' },
              ].map((col, i) => (
                <th key={i} style={{ padding: '0.75rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {col.icon}{col.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => navigate(`/tasks/${task.id}/pipeline`)}
              >
                <td style={{ padding: '0.9rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {task.externalTaskId}
                </td>
                <td style={{ padding: '0.9rem 0.5rem', maxWidth: '240px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>{task.branchName}</div>
                </td>
                <td style={{ padding: '0.9rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={12} style={{ color: 'var(--text-muted)' }} />{task.assignee}
                  </div>
                </td>
                <td style={{ padding: '0.9rem 0.5rem' }}>{reviewBadge(task.reviewDecision, task.reviewStatus, task.reviewScore)}</td>
                <td style={{ padding: '0.9rem 0.5rem' }}>{mergeBadge(task.devMergeStatus)}</td>
                <td style={{ padding: '0.9rem 0.5rem' }}>{testBadge(task.testStatus)}</td>
                <td style={{ padding: '0.9rem 0.5rem' }}>{testPRBadge(task.testPrStatus)}</td>
                <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    Pipeline <ChevronRight size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{SPIN}</style>
    </div>
  );
};

export default SprintDetailPage;
