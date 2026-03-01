import { Outlet } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  inner: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '460px',
    overflow: 'hidden',
  },
  logoBar: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: '24px',
    textAlign: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    marginTop: '4px',
  },
  content: {
    padding: '32px',
  },
};

export default function AuthLayout() {
  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.card}>
          <div style={styles.logoBar}>
            <div style={styles.logoText}>Multi-Service Connect</div>
            <div style={styles.logoSub}>Your trusted service platform</div>
          </div>
          <div style={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
