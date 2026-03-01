export default function Spinner({ size = 'md', color = '#6366f1', style: extra = {} }) {
  const sizes = { sm: 16, md: 28, lg: 48 };
  const px = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...extra,
    }}>
      <div style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${Math.max(2, Math.floor(px / 8))}px solid ${color}22`,
        borderTopColor: color,
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
