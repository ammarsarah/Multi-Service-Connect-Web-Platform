import StarRating from './StarRating.jsx';
import { formatRelativeTime } from '../utils/formatters';

export default function ReviewCard({ review }) {
  const { reviewer, user, rating = 0, comment, createdAt, date } = review || {};
  const reviewerName = reviewer?.name || user?.name || 'Anonymous';
  const initials = reviewerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      padding: '16px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{reviewerName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatRelativeTime(createdAt || date)}</div>
          </div>
        </div>
        <StarRating value={rating} size={14} readonly />
      </div>
      {comment && (
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
          "{comment}"
        </p>
      )}
    </div>
  );
}
