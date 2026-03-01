import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import paymentService from '../services/paymentService';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const STATUSES = ['all', 'pending', 'success', 'failed', 'refunded'];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalSpent: 0, totalRefunded: 0, count: 0 });
  const limit = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit, ...(filter !== 'all' && { status: filter }) };
        const { data } = await paymentService.getMyTransactions(params);
        setTransactions(data.transactions || data.data || data);
        setTotal(data.total || 0);
        if (data.summary) setSummary(data.summary);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [filter, page]);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Payment History</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{total} total transactions</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Spent', value: formatCurrency(summary.totalSpent || 0), color: '#6366f1' },
          { label: 'Transactions', value: total, color: '#10b981' },
          { label: 'Refunded', value: formatCurrency(summary.totalRefunded || 0), color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} color="#64748b" />
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1.5px solid ${filter === s ? '#6366f1' : '#e2e8f0'}`, background: filter === s ? '#6366f1' : '#fff', color: filter === s ? '#fff' : '#64748b', cursor: 'pointer', textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Transaction ID', 'Service', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}><Spinner /></td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>💳</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>No transactions yet</div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={tx._id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{(tx._id || '').slice(-8).toUpperCase()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{tx.service?.title || tx.serviceName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: tx.status === 'refunded' ? '#f59e0b' : '#10b981' }}>{formatCurrency(tx.amount)}</td>
                    <td style={{ padding: '12px 16px' }}><Badge status={tx.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} onPageChange={setPage} />
    </div>
  );
}
