import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Briefcase, CheckCircle, ArrowLeft, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import serviceService from '../services/serviceService';
import ReviewCard from '../components/ReviewCard.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StarRating from '../components/StarRating.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/providers/${id}`),
          serviceService.getServices({ provider: id }),
        ]);
        setProvider(pRes.data.provider || pRes.data);
        setServices(sRes.data.services || sRes.data || []);
        setReviews(pRes.data.reviews || []);
      } catch {
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size="lg" /></div>;
  if (!provider) return null;

  const { name, bio, location, avatar, email, phone, rating = 0, reviewCount = 0, serviceCount = 0, successRate = 0, skills = [], joinedAt, isValidated } = provider;
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PR';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left: Profile card */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {/* Banner */}
            <div style={{ height: '80px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <div style={{ padding: '0 24px 24px', marginTop: '-40px' }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: '4px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '700', fontSize: '28px',
                marginBottom: '14px', overflow: 'hidden',
              }}>
                {avatar ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>{name}</h1>
                  {isValidated && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
              </div>

              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px', marginTop: '10px' }}>
                  <MapPin size={13} /> {location}
                </div>
              )}

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <StarRating value={Math.round(rating)} size={15} readonly />
                <span style={{ fontSize: '13px', color: '#64748b' }}>{rating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
                {[
                  { icon: Briefcase, label: 'Services', value: serviceCount },
                  { icon: CheckCircle, label: 'Success', value: `${successRate}%` },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <stat.icon size={18} color="#6366f1" style={{ marginBottom: '4px' }} />
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skills.map(s => (
                      <span key={s} style={{ background: '#ede9fe', color: '#6366f1', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {email && (
                  <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
                    <Mail size={14} color="#6366f1" /> {email}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
                    <Phone size={14} color="#6366f1" /> {phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* About */}
          {bio && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', margin: '0 0 12px' }}>About</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{bio}</p>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>Services ({services.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {services.map(s => <ServiceCard key={s._id || s.id} service={s} />)}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', margin: '0 0 16px' }}>
              Reviews ({reviewCount})
            </h2>
            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.slice(0, 6).map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
