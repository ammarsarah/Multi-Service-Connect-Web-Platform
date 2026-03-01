import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    hint,
    type = 'text',
    disabled = false,
    required = false,
    style: extraStyle = {},
    containerStyle = {},
    ...props
  },
  ref
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...containerStyle }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: '600', color: '#374151',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && iconPosition === 'left' && (
          <div style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: '#94a3b8', pointerEvents: 'none', display: 'flex',
          }}>
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          style={{
            width: '100%',
            padding: Icon && iconPosition === 'left'
              ? '10px 12px 10px 38px'
              : Icon && iconPosition === 'right'
              ? '10px 38px 10px 12px'
              : '10px 12px',
            border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1e293b',
            background: disabled ? '#f8fafc' : '#ffffff',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.15s',
            ...extraStyle,
          }}
          onFocus={e => { e.target.style.borderColor = error ? '#ef4444' : '#6366f1'; e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)'}`; }}
          onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '12px' }}>
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && <p style={{ fontSize: '12px', color: '#94a3b8' }}>{hint}</p>}
    </div>
  );
});

export default Input;
