import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../../components/ui/Button.jsx';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
      }
    };
    if (token) verify();
    else { setStatus('error'); setMessage('No verification token provided.'); }
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      {status === 'loading' && (
        <>
          <Loader2 size={48} color="#6366f1" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Verifying your email...
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Please wait a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle size={56} color="#10b981" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Email Verified!
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>{message}</p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Continue to Login
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle size={56} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Verification Failed
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>{message}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button onClick={() => navigate('/register')} fullWidth>Try Again</Button>
            <Link to="/login" style={{ color: '#6366f1', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
