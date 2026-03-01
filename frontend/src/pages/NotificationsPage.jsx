import { useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: '10px', background: '#6366f1', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '14px' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Bell size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>You have no notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <NotificationItem key={n._id || n.id} notification={n} onRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
