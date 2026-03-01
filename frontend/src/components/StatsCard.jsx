import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon: Icon, title, value, trend, trendLabel, color = '#6366f1', loading = false }) {
  const isPositive = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '10px',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={22} color={color} />}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            color: isPositive ? '#10b981' : '#ef4444',
            fontSize: '12px', fontWeight: '600',
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {typeof trend === 'number' ? `${Math.abs(trend)}%` : trend}
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <div style={{ height: '28px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : (
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>
            {value}
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>{title}</div>
        {trendLabel && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{trendLabel}</div>}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
