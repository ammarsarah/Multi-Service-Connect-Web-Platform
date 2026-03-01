import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  max = 5,
  onChange,
  size = 18,
  showValue = false,
  readonly = false,
}) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars.map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          style={{
            background: 'none',
            border: 'none',
            padding: '1px',
            cursor: readonly ? 'default' : 'pointer',
            display: 'flex',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1.2)'; }}
          onMouseLeave={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Star
            size={size}
            fill={star <= value ? '#f59e0b' : 'none'}
            color={star <= value ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          />
        </button>
      ))}
      {showValue && (
        <span style={{ marginLeft: '6px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
