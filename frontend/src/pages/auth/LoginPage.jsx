import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password, data.remember);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError('root', { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
        Welcome back
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>Sign up free</Link>
      </p>

      {errors.root && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '12px 14px', marginBottom: '20px',
          color: '#dc2626', fontSize: '13px', fontWeight: '500',
        }}>
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            required
            error={errors.password?.message}
            style={{ paddingRight: '40px' }}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: 'absolute', right: '10px', top: '34px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: '#64748b', padding: 0,
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" {...register('remember')} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Remember me</span>
          </label>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '6px' }}>
          Sign In
        </Button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          By signing in, you agree to our{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms</a> &amp;{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
