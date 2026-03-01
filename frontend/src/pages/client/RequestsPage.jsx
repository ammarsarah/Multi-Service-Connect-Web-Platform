import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import requestService from '../../services/requestService';
import { formatRelativeTime, formatCurrency } from '../../utils/formatters';
import { Filter } from 'lucide-react';

const STATUSES = ['all', 'pending', 'accepted', 'completed', 'cancelled', 'rejected'];

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit, ...(filter !== 'all' && { status: filter }) };
        const { data } = await requestService.getMyRequests(params);
        setRequests(data.requests || data.data || data);
        setTotal(data.total || 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [filter, page]);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>My Requests</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{total} total requests</p>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <Filter size={14} color="#64748b" />
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            border: `1.5px solid ${filter === s ? '#6366f1' : '#e2e8f0'}`,
            background: filter === s ? '#6366f1' : '#fff',
            color: filter === s ? '#fff' : '#64748b',
            cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
          }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No requests found</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {filter === 'all' ? 'You haven\'t made any requests yet.' : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map((req) => (
              <div
                key={req._id}
                onClick={() => navigate(`/request/${req._id}`)}
                style={{
                  background: '#fff', borderRadius: '10px', padding: '16px 20px',
                  border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>
                    {req.service?.title || 'Service Request'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                    <span>Provider: {req.provider?.name || 'Unknown'}</span>
                    <span>{formatRelativeTime(req.createdAt)}</span>
                  </div>
                  {req.message && (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                      {req.message}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <Badge status={req.status} />
                  {req.price && <span style={{ fontSize: '14px', fontWeight: '700', color: '#6366f1' }}>{formatCurrency(req.price)}</span>}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
