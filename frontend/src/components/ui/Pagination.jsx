import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (i === left - 1 || i === right + 1) {
      pages.push('...');
    }
  }

  const btnStyle = (active, disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: active ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
    background: active ? '#6366f1' : '#ffffff',
    color: active ? '#ffffff' : disabled ? '#cbd5e1' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: active ? '700' : '500',
    transition: 'all 0.15s',
    fontFamily: 'Inter, sans-serif',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '16px 0' }}>
      <button
        style={btnStyle(false, currentPage === 1)}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '14px' }}>…</span>
        ) : (
          <button
            key={page}
            style={btnStyle(page === currentPage, false)}
            onClick={() => onPageChange(page)}
            onMouseEnter={e => { if (page !== currentPage) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#6366f1'; } }}
            onMouseLeave={e => { if (page !== currentPage) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
          >
            {page}
          </button>
        )
      )}

      <button
        style={btnStyle(false, currentPage === totalPages)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>

      {totalItems && (
        <span style={{ marginLeft: '12px', fontSize: '13px', color: '#64748b' }}>
          {totalItems} results
        </span>
      )}
    </div>
  );
}
