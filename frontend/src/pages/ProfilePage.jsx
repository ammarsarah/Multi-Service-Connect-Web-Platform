import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, Lock, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { SERVICE_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio max 500 chars').optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Must include uppercase').regex(/[0-9]/, 'Must include number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const { register: rProfile, handleSubmit: hsProfile, formState: { errors: pe }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      skills: (user?.skills || []).join(', '),
    },
  });

  const { register: rPwd, handleSubmit: hsPwd, formState: { errors: pwe }, reset: resetPwd, setError: setPwdError } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, email: user.email, phone: user.phone || '', bio: user.bio || '', location: user.location || '', skills: (user.skills || []).join(', ') });
    }
  }, [user]);

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean) };
      const { data: res } = await authService.updateProfile(payload);
      updateUser(res.user || res);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed!');
      resetPwd();
    } catch (err) {
      setPwdError('root', { message: err.response?.data?.message || 'Failed to change password' });
    } finally { setChangingPassword(false); }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'password', label: 'Password' },
    ...(user?.role === 'prestataire' ? [{ id: 'professional', label: 'Professional' }] : []),
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>My Profile</h1>

      {/* Avatar section */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '26px', flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{user?.name}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px', textTransform: 'capitalize' }}>{user?.role} · {user?.email}</div>
          {user?.isValidated && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', marginTop: '6px' }}>✓ Verified</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none',
            background: activeTab === tab.id ? '#fff' : 'transparent',
            color: activeTab === tab.id ? '#1e293b' : '#64748b',
            fontWeight: activeTab === tab.id ? '700' : '500', fontSize: '13px', cursor: 'pointer',
            boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Personal Info */}
      {activeTab === 'personal' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', margin: '0 0 20px' }}>Personal Information</h2>
          <form onSubmit={hsProfile(onSaveProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Full Name" icon={User} required error={pe.name?.message} {...rProfile('name')} />
              <Input label="Email" type="email" icon={Mail} required error={pe.email?.message} {...rProfile('email')} />
            </div>
            <Input label="Phone" type="tel" icon={Phone} placeholder="+33 6 12 34 56 78" error={pe.phone?.message} {...rProfile('phone')} />
            <Button type="submit" loading={saving} size="lg">Save Changes</Button>
          </form>
        </div>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', margin: '0 0 20px' }}>Change Password</h2>
          {pwe.root && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
              {pwe.root.message}
            </div>
          )}
          <form onSubmit={hsPwd(onChangePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Current Password" type="password" icon={Lock} required error={pwe.currentPassword?.message} {...rPwd('currentPassword')} />
            <Input label="New Password" type="password" icon={Lock} required error={pwe.newPassword?.message} hint="Min 8 chars, uppercase and number" {...rPwd('newPassword')} />
            <Input label="Confirm New Password" type="password" icon={Lock} required error={pwe.confirmPassword?.message} {...rPwd('confirmPassword')} />
            <Button type="submit" loading={changingPassword} size="lg">Update Password</Button>
          </form>
        </div>
      )}

      {/* Professional (provider only) */}
      {activeTab === 'professional' && user?.role === 'prestataire' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', margin: '0 0 20px' }}>Professional Profile</h2>
          <form onSubmit={hsProfile(onSaveProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Location" icon={MapPin} placeholder="City, Region" error={pe.location?.message} {...rProfile('location')} />
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Bio / About</label>
              <textarea
                placeholder="Describe your expertise and experience..."
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                {...rProfile('bio')}
              />
              {pe.bio && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{pe.bio.message}</p>}
            </div>
            <Input label="Skills (comma-separated)" icon={Briefcase} placeholder="Plumbing, Installation, Repair" error={pe.skills?.message} hint="Help clients find you" {...rProfile('skills')} />
            <Button type="submit" loading={saving} size="lg">Save Professional Profile</Button>
          </form>
        </div>
      )}
    </div>
  );
}
