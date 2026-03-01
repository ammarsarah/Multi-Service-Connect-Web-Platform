import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'prestataire']),
  phone: z.string().optional(),
  terms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ROLES = [
  {
    value: 'client',
    label: 'Client',
    desc: 'I need services — I want to hire professionals for jobs.',
    icon: '🙋',
  },
  {
    value: 'prestataire',
    label: 'Service Provider',
    desc: 'I offer services — I want to find clients and grow my business.',
    icon: '🔧',
  },
];

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const defaultRole = searchParams.get('role') || 'client';
  const { register, handleSubmit, watch, setValue, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: defaultRole, phone: '', terms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authRegister({ name: data.name, email: data.email, password: data.password, role: data.role, phone: data.phone });
      setSuccess(true);
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <CheckCircle size={56} color="#10b981" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Check your email!</h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          We've sent a verification link to your email address.<br />
          Click the link to activate your account.
        </p>
        <Button onClick={() => navigate('/login')} fullWidth>Go to Login</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
        Create an account
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Already have one?{' '}
        <Link to="/login" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
      </p>

      {errors.root && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: '#dc2626', fontSize: '13px' }}>
          {errors.root.message}
        </div>
      )}

      {/* Role selection */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>I am a...</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {ROLES.map(role => (
            <button
              key={role.value}
              type="button"
              onClick={() => setValue('role', role.value)}
              style={{
                padding: '14px', borderRadius: '10px', textAlign: 'left',
                border: `2px solid ${selectedRole === role.value ? '#6366f1' : '#e2e8f0'}`,
                background: selectedRole === role.value ? '#f0f0ff' : '#ffffff',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>{role.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{role.label}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>{role.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input label="Full name" placeholder="John Doe" icon={User} required error={errors.name?.message} {...register('name')} />
        <Input label="Email address" type="email" placeholder="you@example.com" icon={Mail} required error={errors.email?.message} {...register('email')} />
        <Input label="Phone (optional)" type="tel" placeholder="+33 6 12 34 56 78" icon={Phone} error={errors.phone?.message} {...register('phone')} />
        <Input label="Password" type="password" placeholder="Min. 8 characters" icon={Lock} required error={errors.password?.message} {...register('password')} hint="Must include uppercase letter and number" />
        <Input label="Confirm password" type="password" placeholder="Repeat your password" icon={Lock} required error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" {...register('terms')} style={{ width: 16, height: 16, marginTop: '2px', accentColor: '#6366f1', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>
          </span>
        </label>
        {errors.terms && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px' }}>{errors.terms.message}</p>}

        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '6px' }}>
          Create Account
        </Button>
      </form>
    </div>
  );
}
