import { useState, useEffect } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import requestService from '../../services/requestService';
import { formatRelativeTime, formatCurrency } from '../../utils/formatters';
import { Filter, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'pending', 'accepted', 'completed', 'rejected'];

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(filter !== 'all' && { status: filter }) };
      const { data } = await requestService.getProviderRequests(params);
      setRequests(data.requests || data.data || data);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    try {
      await requestService.updateRequestStatus(id, status);
      setRequests(p => p.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Request ${status}!`);
    } catch { toast.error('Failed to update request'); }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Client Requests</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{total} total incoming requests</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <Filter size={14} color="#64748b" />
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            border: `1.5px solid ${filter === s ? '#6366f1' : '#e2e8f0'}`,
            background: filter === s ? '#6366f1' : '#fff',
            color: filter === s ? '#fff' : '#64748b',
            cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
          }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📨</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No requests</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {filter === 'all' ? 'You haven\'t received any requests yet.' : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map((req) => (
              <div key={req._id} style={{
                background: '#fff', borderRadius: '10px', padding: '16px 20px',
                border: '1px solid #e2e8f0', transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '3px' }}>
                      {req.service?.title || 'Service Request'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      From: {req.client?.name || 'Client'} · {formatRelativeTime(req.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {req.price && <span style={{ fontSize: '14px', fontWeight: '700', color: '#6366f1' }}>{formatCurrency(req.price)}</span>}
                    <Badge status={req.status} />
                  </div>
                </div>

                {req.message && (
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', padding: '10px', background: '#f8fafc', borderRadius: '6px', lineHeight: 1.5 }}>
                    "{req.message}"
                  </p>
                )}

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => updateStatus(req._id, 'accepted')} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', background: '#d1fae5', color: '#065f46',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#d1fae5'}
                    >
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button onClick={() => updateStatus(req._id, 'rejected')} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', background: '#fee2e2', color: '#991b1b',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <XCircle size={14} /> Decline
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <button onClick={() => updateStatus(req._id, 'completed')} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '8px 16px', background: '#ede9fe', color: '#6366f1',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ede9fe'}
                  >
                    <CheckCircle size={14} /> Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
