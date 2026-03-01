import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import { MapPin, DollarSign, ArrowRight } from 'lucide-react';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const {
    _id, id, title, description, category, price, currency = 'EUR',
    location, provider, rating = 0, reviewCount = 0,
  } = service || {};

  const serviceId = _id || id;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
    }}
      onClick={() => navigate(`/services/${serviceId}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      {/* Image placeholder */}
      <div style={{
        height: '160px',
        background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: '48px' }}>
          {categoryEmoji(category)}
        </span>
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          fontSize: '11px', fontWeight: '700',
          padding: '4px 10px', borderRadius: '20px',
          letterSpacing: '0.3px',
        }}>
          {category || 'Service'}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', lineHeight: 1.3 }}>
          {title || 'Untitled Service'}
        </h3>

        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
          {description ? description.substring(0, 80) + (description.length > 80 ? '…' : '') : 'No description available.'}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
              <MapPin size={12} />
              <span>{location}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
            {provider?.name && <span>by {provider.name}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <StarRating value={Math.round(rating)} size={13} readonly showValue />
            {reviewCount > 0 && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '12px', borderTop: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={14} color="#6366f1" />
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#6366f1' }}>
              {price != null ? `${Number(price).toLocaleString('fr-FR')} ${currency}` : 'Sur devis'}
            </span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/services/${serviceId}`); }}
            style={{
              background: '#6366f1', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '7px 14px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
          >
            View <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function categoryEmoji(category) {
  const map = {
    'Plomberie': '🔧', 'Électricité': '⚡', 'Jardinage': '🌱',
    'Ménage': '🧹', 'Informatique': '💻', 'Coiffure': '✂️',
    'Livraison': '📦', 'Babysitting': '👶', 'Cours particuliers': '📚',
    'Rénovation': '🏗️', 'Déménagement': '🚚', 'Photographie': '📷',
    'Cuisine': '🍳', 'Autre': '⭐',
  };
  return map[category] || '⭐';
}
