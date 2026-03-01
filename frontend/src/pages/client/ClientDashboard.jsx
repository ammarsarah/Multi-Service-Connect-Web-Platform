import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, CreditCard, CheckCircle, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import StatsCard from '../../components/StatsCard.jsx';
import ServiceCard from '../../components/ServiceCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import requestService from '../../services/requestService';
import paymentService from '../../services/paymentService';
import aiService from '../../services/aiService';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, totalSpent: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [reqRes, txRes] = await Promise.all([
          requestService.getMyRequests({ limit: 5 }),
          paymentService.getMyTransactions({ limit: 1 }),
        ]);
        const reqs = reqRes.data.requests || reqRes.data || [];
        setRequests(reqs);
        const active = reqs.filter(r => ['pending', 'accepted'].includes(r.status)).length;
        const completed = reqs.filter(r => r.status === 'completed').length;
        setStats({ active, completed, totalSpent: txRes.data.total || 0 });

        aiService.getRecommendations().then(r => setRecommendations(r.data.services || r.data.recommendations || [])).catch(() => {});
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>;

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Here's what's happening with your services.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatsCard icon={FileText} title="Active Requests" value={stats.active} color="#6366f1" />
        <StatsCard icon={CheckCircle} title="Completed" value={stats.completed} color="#10b981" />
        <StatsCard icon={CreditCard} title="Total Spent" value={formatCurrency(stats.totalSpent)} color="#f59e0b" />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/services')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#6366f1', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '11px 20px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} /> Find a Service
        </button>
        <button
          onClick={() => navigate('/requests')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fff', color: '#6366f1', border: '1.5px solid #6366f1',
            borderRadius: '10px', padding: '11px 20px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6366f1'; }}
        >
          <FileText size={16} /> View All Requests
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Recent requests */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Recent Requests</h2>
            <Link to="/requests" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {requests.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No requests yet. <Link to="/services" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>Find a service!</Link>
              </div>
            ) : (
              requests.map((req, i) => (
                <div
                  key={req._id || i}
                  onClick={() => navigate(`/request/${req._id}`)}
                  style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: i < requests.length - 1 ? '1px solid #f8fafc' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      {req.service?.title || req.serviceTitle || 'Service Request'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                      {formatRelativeTime(req.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {req.price && <span style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1' }}>{formatCurrency(req.price)}</span>}
                    <Badge status={req.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#6366f1" />
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Recommended for You</h2>
          </div>
          {recommendations.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Browse services to get personalized recommendations.
            </div>
          ) : (
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations.slice(0, 3).map((svc, i) => (
                <div
                  key={svc._id || i}
                  onClick={() => navigate(`/services/${svc._id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                  }}>⭐</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.title}</div>
                    <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700' }}>{formatCurrency(svc.price)}</div>
                  </div>
                </div>
              ))}
              <Link to="/services" style={{ display: 'block', textAlign: 'center', padding: '8px', color: '#6366f1', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: '#f0f0ff', borderRadius: '8px' }}>
                View all services
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
