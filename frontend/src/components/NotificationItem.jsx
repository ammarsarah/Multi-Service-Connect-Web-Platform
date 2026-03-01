import { Bell, CheckCircle, AlertCircle, Info, Package, CreditCard } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

const typeIcon = {
  request: Package,
  payment: CreditCard,
  alert: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const typeColor = {
  request: '#6366f1',
  payment: '#10b981',
  alert: '#ef4444',
  info: '#3b82f6',
  success: '#10b981',
};

export default function NotificationItem({ notification, onRead }) {
  const { _id, id, type = 'info', title, message, read, isRead, createdAt } = notification || {};
  const nId = _id || id;
  const isUnread = !read && !isRead;
  const Icon = typeIcon[type] || Bell;
  const color = typeColor[type] || '#64748b';

  return (
    <div
      onClick={() => isUnread && onRead?.(nId)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: isUnread ? '#f8faff' : '#ffffff',
        borderRadius: '10px',
        border: `1px solid ${isUnread ? '#ddd6fe' : '#e2e8f0'}`,
        cursor: isUnread ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (isUnread) e.currentTarget.style.background = '#f0effe'; }}
      onMouseLeave={e => { if (isUnread) e.currentTarget.style.background = '#f8faff'; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: '10px',
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px',
        }}>
          <div style={{ fontWeight: isUnread ? '700' : '600', fontSize: '14px', color: '#1e293b' }}>
            {title}
          </div>
          {isUnread && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#6366f1', flexShrink: 0, marginTop: '4px',
            }} />
          )}
        </div>
        {message && (
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
          {formatRelativeTime(createdAt)}
        </div>
      </div>
    </div>
  );
}
