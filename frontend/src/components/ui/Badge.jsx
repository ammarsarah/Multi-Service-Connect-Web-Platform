import { getStatusColor, getStatusBg } from '../../utils/formatters';
import { capitalize } from '../../utils/formatters';

export default function Badge({ status, label, size = 'sm', style: extra = {} }) {
  const text = label || status || '';
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  const fontSize = size === 'sm' ? '11px' : '13px';
  const padding = size === 'sm' ? '3px 8px' : '5px 12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding,
      borderRadius: '20px',
      background: bg,
      color,
      fontSize,
      fontWeight: '600',
      fontFamily: 'Inter, sans-serif',
      whiteSpace: 'nowrap',
      ...extra,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      {capitalize(text)}
    </span>
  );
}
