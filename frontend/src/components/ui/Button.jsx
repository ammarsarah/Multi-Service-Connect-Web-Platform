import { Loader2 } from 'lucide-react';

const variants = {
  primary: {
    background: '#6366f1',
    color: '#ffffff',
    border: '2px solid #6366f1',
  },
  secondary: {
    background: '#8b5cf6',
    color: '#ffffff',
    border: '2px solid #8b5cf6',
  },
  danger: {
    background: '#ef4444',
    color: '#ffffff',
    border: '2px solid #ef4444',
  },
  outline: {
    background: 'transparent',
    color: '#6366f1',
    border: '2px solid #6366f1',
  },
  ghost: {
    background: 'transparent',
    color: '#64748b',
    border: '2px solid transparent',
  },
  success: {
    background: '#10b981',
    color: '#ffffff',
    border: '2px solid #10b981',
  },
};

const sizes = {
  sm: { padding: '6px 14px', fontSize: '13px', borderRadius: '6px' },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '8px' },
  lg: { padding: '13px 28px', fontSize: '16px', borderRadius: '10px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  style: extraStyle = {},
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        ...v,
        ...s,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        outline: 'none',
        ...extraStyle,
      }}
      onMouseEnter={e => {
        if (!isDisabled) e.currentTarget.style.opacity = '0.85';
      }}
      onMouseLeave={e => {
        if (!isDisabled) e.currentTarget.style.opacity = '1';
      }}
      {...props}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
