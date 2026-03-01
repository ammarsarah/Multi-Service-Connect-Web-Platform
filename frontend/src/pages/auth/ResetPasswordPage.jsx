import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'This reset link is invalid or has expired.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <CheckCircle size={52} color="#10b981" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Password reset!</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
          Your password has been updated successfully. You can now log in.
        </p>
        <Button onClick={() => navigate('/login')} fullWidth>Go to Login</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Reset your password</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Choose a strong new password for your account.</p>

      {errors.root && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: '#dc2626', fontSize: '13px' }}>
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="New password" type="password" placeholder="Min. 8 characters" icon={Lock} required error={errors.password?.message} hint="Must include uppercase and number" {...register('password')} />
        <Input label="Confirm new password" type="password" placeholder="Repeat your password" icon={Lock} required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" fullWidth loading={loading} size="lg">Reset Password</Button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#6366f1', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
