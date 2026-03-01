import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Failed to send reset email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <CheckCircle size={52} color="#10b981" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Check your inbox</h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
          We've sent password reset instructions to:
        </p>
        <p style={{ color: '#6366f1', fontWeight: '600', fontSize: '15px', marginBottom: '28px' }}>{getValues('email')}</p>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px' }}>
          Didn't receive it? Check your spam folder or try again.
        </p>
        <Link to="/login" style={{ color: '#6366f1', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Forgot your password?</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
        No worries! Enter your email and we'll send you a link to reset your password.
      </p>

      {errors.root && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: '#dc2626', fontSize: '13px' }}>
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Email address" type="email" placeholder="you@example.com" icon={Mail} required error={errors.email?.message} {...register('email')} />
        <Button type="submit" fullWidth loading={loading} size="lg">Send Reset Link</Button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#6366f1', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
