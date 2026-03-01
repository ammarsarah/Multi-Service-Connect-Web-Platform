import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Calendar, MessageSquare, ArrowLeft, User } from 'lucide-react';
import serviceService from '../services/serviceService';
import requestService from '../services/requestService';
import aiService from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import StarRating from '../components/StarRating.jsx';
import ProviderCard from '../components/ProviderCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [matching, setMatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({ message: '', scheduledDate: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [svcRes, revRes] = await Promise.all([
          serviceService.getServiceById(id),
          serviceService.getServiceReviews(id).catch(() => ({ data: [] })),
        ]);
        setService(svcRes.data.service || svcRes.data);
        setReviews(revRes.data.reviews || revRes.data || []);
        if (isAuthenticated) {
          aiService.getMatching(id).then(r => setMatching(r.data.providers || [])).catch(() => {});
        }
      } catch {
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, navigate]);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBookingLoading(true);
    try {
      await requestService.createRequest({
        service: id,
        message: bookingData.message,
        scheduledDate: bookingData.scheduledDate,
      });
      toast.success('Request sent successfully!');
      setBookingOpen(false);
      navigate('/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size="lg" /></div>;
  }
  if (!service) return null;

  const { title, description, price, currency = 'EUR', category, location, provider, rating = 0, reviewCount = 0 } = service;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#64748b', fontSize: '14px', marginBottom: '24px',
      }}>
        <ArrowLeft size={16} /> Back to Services
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Service hero */}
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{
              height: '260px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              {categoryEmoji(category)}
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{
                    background: '#ede9fe', color: '#6366f1', fontSize: '12px',
                    fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                  }}>{category}</span>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '10px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    {title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <StarRating value={Math.round(rating)} size={16} readonly showValue />
                    <span style={{ color: '#64748b', fontSize: '13px' }}>({reviewCount} reviews)</span>
                    {location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '13px' }}>
                        <MapPin size={13} /> {location}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#6366f1' }}>
                    {price != null ? formatCurrency(price, currency) : 'Sur devis'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>per service</div>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, marginTop: '20px' }}>
                {description}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', margin: '0 0 16px' }}>
              Reviews ({reviewCount})
            </h2>
            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No reviews yet. Be the first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
              </div>
            )}
          </div>

          {/* Matching providers */}
          {matching.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', margin: '0 0 16px' }}>
                Similar Providers
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
                {matching.slice(0, 3).map((p, i) => <ProviderCard key={p._id || i} provider={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Book */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#6366f1', marginBottom: '4px' }}>
              {price != null ? formatCurrency(price, currency) : 'Sur devis'}
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>No hidden fees. Pay only when done.</p>
            <Button
              fullWidth
              size="lg"
              onClick={() => { if (!isAuthenticated) navigate('/login'); else if (user?.role === 'prestataire') toast.error('Providers cannot book services'); else setBookingOpen(true); }}
            >
              <Calendar size={16} /> Book this Service
            </Button>
            <button
              onClick={() => navigate(`/providers/${provider?._id || provider?.id}`)}
              style={{
                width: '100%', marginTop: '10px', padding: '10px',
                background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                cursor: 'pointer', color: '#6366f1', fontSize: '14px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <MessageSquare size={15} /> Contact Provider
            </button>
          </div>

          {/* Provider mini card */}
          {provider && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '14px', margin: '0 0 14px' }}>
                About the Provider
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '16px',
                }}>
                  {provider?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>{provider?.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{provider?.location || 'Location not specified'}</div>
                </div>
              </div>
              <Link
                to={`/providers/${provider?._id || provider?.id}`}
                style={{
                  display: 'block', textAlign: 'center', padding: '8px',
                  color: '#6366f1', fontSize: '13px', fontWeight: '600',
                  textDecoration: 'none', borderRadius: '8px',
                  background: '#f0f0ff', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e0e0ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0f0ff'}
              >
                View Full Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book this Service"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button loading={bookingLoading} onClick={handleBook}>Send Request</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Send a booking request to <strong>{provider?.name}</strong>. They will review and accept or decline.
          </p>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Preferred Date
            </label>
            <input
              type="date"
              value={bookingData.scheduledDate}
              onChange={e => setBookingData(p => ({ ...p, scheduledDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Message to Provider *
            </label>
            <textarea
              value={bookingData.message}
              onChange={e => setBookingData(p => ({ ...p, message: e.target.value }))}
              placeholder="Describe your needs, location, availability..."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function categoryEmoji(category) {
  const map = { 'Plomberie': '🔧', 'Électricité': '⚡', 'Jardinage': '🌱', 'Ménage': '🧹', 'Informatique': '💻', 'Coiffure': '✂️', 'Livraison': '📦', 'Babysitting': '👶', 'Cours particuliers': '📚', 'Rénovation': '🏗️', 'Déménagement': '🚚', 'Photographie': '📷', 'Cuisine': '🍳', 'Autre': '⭐' };
  return map[category] || '⭐';
}
