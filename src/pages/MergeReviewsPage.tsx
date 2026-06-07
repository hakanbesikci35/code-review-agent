// src/pages/MergeReviewsPage.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  GitPullRequest,
  Search,
  ChevronLeft,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { useGSAP } from '../hooks/useGSAP';
import { getMergeReviews } from '../services/mockData';
import type { MergeReview } from '../types/review';
import { formatDate } from '../utils/formatters';
import { fadeInUp } from '../utils/animations';

export const MergeReviewsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [reviews, setReviews] = useState<MergeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = async (
    currentPage = page,
    currentSearch = search,
    start = startDate,
    end = endDate
  ) => {
    setLoading(true);
    try {
      const res = await getMergeReviews(currentPage, 10, currentSearch, start, end);
      setReviews(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, search, startDate, endDate);
  }, [page]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    fadeInUp(containerRef.current.querySelectorAll('.animate-fade'));
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search, startDate, endDate);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    loadData(1, '', '', '');
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
    loadData(1, search, start, end);
  };



  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Birleştirme İncelemeleri</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Branch birleştirme talepleri öncesinde LLM kod inceleme ajanlarının ürettiği analiz raporları ve kararları.
        </p>
      </div>

      {/* Filter and Search Bar */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="PR Başlığı, Task kodu veya Geliştirici ara..."
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
            }}
          >
            Ara
          </button>
        </form>

        {/* Date Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Başlangıç:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
              style={{
                padding: '0.4rem 0.5rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bitiş:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
              style={{
                padding: '0.4rem 0.5rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
          {(search || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="btn-transition"
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Reviews Table */}
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
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--accent-primary)' }}>
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>İncelemeler sorgulanıyor...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Hiçbir birleştirme inceleme raporu bulunamadı.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>KARAR (RESULT)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>GÖREV / PR (TASK/PR)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AKTÖR (ACTOR)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DALLAR (BRANCHES)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DEĞİŞİKLİKLER</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TARİH</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr
                  key={rev.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="btn-transition"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Status badge */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: rev.status === 'success' ? 'var(--glow-green)' : 'var(--glow-red)',
                        color: rev.status === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
                        border: rev.status === 'success' ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <GitPullRequest size={12} />
                      {rev.status === 'success' ? 'BAŞARILI' : rev.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Task ID and Title */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div>
                      {/* Project / Sprint Path Tag */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.3rem',
                          alignItems: 'center',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.25rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <span>{rev.projectName || 'LST AI Portal'}</span>
                        <span>/</span>
                        <span>{rev.sprintName || 'Sprint 2'}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginRight: '0.5rem' }}>
                        {rev.taskId}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rev.prTitle}
                      </span>
                    </div>
                  </td>

                  {/* Actor */}
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {rev.actor}
                  </td>

                  {/* Branch diff */}
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>{rev.sourceBranch}</span>
                      <GitBranch size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{rev.targetBranch}</span>
                    </div>
                  </td>

                  {/* Additions / Deletions */}
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--accent-success)', marginRight: '0.4rem' }}>+{rev.changesCount.additions}</span>
                    <span style={{ color: 'var(--accent-danger)' }}>-{rev.changesCount.deletions}</span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDate(rev.reviewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div
          className="animate-fade"
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
            Toplam <strong>{totalCount}</strong> kayıttan <strong>{(page - 1) * 10 + 1}-{Math.min(page * 10, totalCount)}</strong> arası gösteriliyor
          </span>

          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
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
              }}
            >
              <ChevronLeft size={16} />
            </button>

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
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CSS spin keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MergeReviewsPage;
