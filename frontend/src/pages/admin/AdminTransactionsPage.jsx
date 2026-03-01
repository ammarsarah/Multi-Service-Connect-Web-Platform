import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import adminService from '../../services/adminService';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const STATUSES = ['all', 'pending', 'success', 'failed', 'refunded'];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          page, limit,
          ...(search && { search }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        };
        const { data } = await adminService.getTransactions(params);
        setTransactions(data.transactions || data.data || data);
        setTotal(data.total || 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [search, statusFilter, dateFrom, dateTo, page]);

  const inputStyle = { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff' };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Transactions</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{total} total transactions</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." style={{ ...inputStyle, paddingLeft: '32px', width: '200px' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={13} color="#64748b" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1.5px solid ${statusFilter === s ? '#6366f1' : '#e2e8f0'}`, background: statusFilter === s ? '#6366f1' : '#fff', color: statusFilter === s ? '#fff' : '#64748b', cursor: 'pointer', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} title="From date" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} title="To date" />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Client', 'Provider', 'Service', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}><Spinner /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No transactions found</td></tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={tx._id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{(tx._id || tx.id || '').slice(-8).toUpperCase()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{tx.client?.name || tx.clientName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{tx.provider?.name || tx.providerName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.service?.title || tx.serviceName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#10b981' }}>{formatCurrency(tx.amount)}</td>
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
