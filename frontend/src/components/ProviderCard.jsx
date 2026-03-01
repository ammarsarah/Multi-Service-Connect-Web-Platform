import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import { MapPin, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();
  const {
    _id, id, name, bio, location, avatar,
    rating = 0, reviewCount = 0, serviceCount = 0, successRate = 0,
    skills = [],
  } = provider || {};

  const providerId = _id || id;
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PR';

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '18px', flexShrink: 0,
          overflow: 'hidden',
        }}>
          {avatar ? (
            <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initials}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{name}</h3>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>
              <MapPin size={11} /> {location}
            </div>
          )}
          <div style={{ marginTop: '4px' }}>
            <StarRating value={Math.round(rating)} size={13} readonly showValue />
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          {bio.length > 100 ? bio.substring(0, 100) + '…' : bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {skills.slice(0, 4).map(skill => (
            <span key={skill} style={{
              background: '#ede9fe', color: '#6366f1',
              fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
            }}>{skill}</span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
          <Briefcase size={13} color="#6366f1" />
          <span>{serviceCount} services</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
          <CheckCircle size={13} color="#10b981" />
          <span>{successRate}% success</span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => navigate(`/providers/${providerId}`)}
        style={{
          background: 'transparent', color: '#6366f1',
          border: '1.5px solid #6366f1', borderRadius: '8px',
          padding: '8px', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6366f1'; }}
      >
        View Profile <ArrowRight size={13} />
      </button>
    </div>
  );
}
