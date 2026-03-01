import { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatsCard from '../../components/StatsCard.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import adminService from '../../services/adminService';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import Badge from '../../components/ui/Badge.jsx';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#10b981'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, actRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentActivity().catch(() => ({ data: { activities: [] } })),
        ]);
        setStats(statsRes.data.stats || statsRes.data);
        setActivity(actRes.data.activities || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>;

  const usersByRole = [
    { name: 'Clients', value: stats?.clientCount || 0 },
    { name: 'Providers', value: stats?.providerCount || 0 },
    { name: 'Admins', value: stats?.adminCount || 0 },
  ];

  const txChart = stats?.transactionsChart || MOCK_CHART;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Platform overview and management.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatsCard icon={Users} title="Total Users" value={stats?.totalUsers || 0} color="#6366f1" trend={stats?.userGrowth} trendLabel="vs last month" />
        <StatsCard icon={Users} title="Providers" value={stats?.providerCount || 0} color="#8b5cf6" />
        <StatsCard icon={CreditCard} title="Transactions" value={stats?.totalTransactions || 0} color="#10b981" />
        <StatsCard icon={TrendingUp} title="Revenue" value={formatCurrency(stats?.totalRevenue || 0)} color="#f59e0b" />
        {stats?.fraudAlerts > 0 && (
          <StatsCard icon={AlertTriangle} title="Fraud Alerts" value={stats.fraudAlerts} color="#ef4444" />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
        {/* Transactions chart */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Transactions (Last 7 Days)</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={txChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} formatter={v => [`€${v}`, 'Revenue']} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by role */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Users by Role</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {usersByRole.map((entry, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No recent activity.</div>
        ) : (
          <div>
            {activity.slice(0, 8).map((item, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: i < activity.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{item.description || item.type}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>{formatRelativeTime(item.createdAt)}</span>
                </div>
                {item.status && <Badge status={item.status} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_CHART = [
  { day: 'Mon', amount: 1200 }, { day: 'Tue', amount: 1800 }, { day: 'Wed', amount: 950 },
  { day: 'Thu', amount: 2200 }, { day: 'Fri', amount: 1700 }, { day: 'Sat', amount: 2800 }, { day: 'Sun', amount: 1400 },
];
