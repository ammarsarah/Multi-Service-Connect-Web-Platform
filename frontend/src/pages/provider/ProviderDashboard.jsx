import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, FileText, TrendingUp, Star, Plus, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import StatsCard from '../../components/StatsCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import requestService from '../../services/requestService';
import paymentService from '../../services/paymentService';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [stats, setStats] = useState({ pending: 0, activeServices: 0, earnings: 0, rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [reqRes, earnRes] = await Promise.all([
          requestService.getProviderRequests({ limit: 8 }),
          paymentService.getEarnings({ days: 7 }).catch(() => ({ data: { earnings: [], total: 0 } })),
        ]);
        const reqs = reqRes.data.requests || reqRes.data || [];
        setRequests(reqs);
        const pending = reqs.filter(r => r.status === 'pending').length;
        const earnings = earnRes.data.total || 0;
        const days = earnRes.data.earnings || generateMockEarnings();
        setEarningsData(days);
        setStats({ pending, activeServices: user?.serviceCount || 0, earnings, rating: user?.rating || 0 });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await requestService.updateRequestStatus(reqId, 'accepted');
      setRequests(p => p.map(r => r._id === reqId ? { ...r, status: 'accepted' } : r));
      toast.success('Request accepted!');
    } catch { toast.error('Failed to update request'); }
  };

  const handleReject = async (reqId) => {
    try {
      await requestService.updateRequestStatus(reqId, 'rejected');
      setRequests(p => p.map(r => r._id === reqId ? { ...r, status: 'rejected' } : r));
      toast.success('Request declined');
    } catch { toast.error('Failed to update request'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Provider Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0]}! Here's your activity summary.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatsCard icon={Clock} title="Pending Requests" value={stats.pending} color="#f59e0b" />
        <StatsCard icon={Package} title="Active Services" value={stats.activeServices} color="#6366f1" />
        <StatsCard icon={TrendingUp} title="Total Earnings" value={formatCurrency(stats.earnings)} color="#10b981" />
        <StatsCard icon={Star} title="Rating" value={stats.rating ? stats.rating.toFixed(1) + '★' : 'N/A'} color="#f59e0b" />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Button onClick={() => navigate('/provider/services')}>
          <Plus size={16} /> Add New Service
        </Button>
        <Button variant="outline" onClick={() => navigate('/provider/requests')}>
          <FileText size={16} /> All Requests
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Earnings chart */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Earnings (Last 7 Days)</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  formatter={v => [`€${v}`, 'Earnings']}
                />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending requests */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Pending Requests</h2>
            <Link to="/provider/requests" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No pending requests.
              </div>
            ) : (
              requests.filter(r => r.status === 'pending').slice(0, 5).map((req, i) => (
                <div key={req._id || i} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', marginBottom: '3px' }}>
                    {req.service?.title || 'Service Request'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                    {req.client?.name || 'Client'} · {formatRelativeTime(req.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAccept(req._id)} style={{
                      flex: 1, padding: '7px', background: '#d1fae5', color: '#065f46',
                      border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#d1fae5'}
                    >✓ Accept</button>
                    <button onClick={() => handleReject(req._id)} style={{
                      flex: 1, padding: '7px', background: '#fee2e2', color: '#991b1b',
                      border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                    >✗ Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockEarnings() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({ day, amount: Math.floor(Math.random() * 200) + 50 }));
}
