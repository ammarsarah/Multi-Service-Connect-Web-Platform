export default function Card({
  children,
  title,
  subtitle,
  actions,
  padding = '24px',
  style: extraStyle = {},
  headerStyle = {},
  bodyStyle = {},
  ...props
}) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      ...extraStyle,
    }} {...props}>
      {(title || actions) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `16px ${padding}`,
          borderBottom: '1px solid #f1f5f9',
          ...headerStyle,
        }}>
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
            )}
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>{subtitle}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={{ padding, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}
