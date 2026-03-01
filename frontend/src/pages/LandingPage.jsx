import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, Star, Zap, Users, CheckCircle, TrendingUp, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard.jsx';
import serviceService from '../services/serviceService';
import { SERVICE_CATEGORIES } from '../utils/constants';

const HERO_STATS = [
  { value: '1,200+', label: 'Verified Providers' },
  { value: '8,500+', label: 'Completed Jobs' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Search & Discover',
    desc: 'Browse hundreds of verified service providers. Use smart filters to find exactly what you need, powered by AI recommendations.',
    color: '#6366f1',
  },
  {
    icon: Shield,
    title: 'Book Securely',
    desc: 'Send your request, discuss details with your provider, and pay securely through our protected payment system.',
    color: '#10b981',
  },
  {
    icon: CheckCircle,
    title: 'Get It Done',
    desc: 'Track your request in real-time, communicate directly with your provider, and leave a review when done.',
    color: '#f59e0b',
  },
];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoadingServices(true);
      try {
        const { data } = await serviceService.getFeaturedServices();
        setFeaturedServices(data.services || data.data || data || []);
      } catch {
        // Use fallback mock
        setFeaturedServices(MOCK_SERVICES);
      } finally {
        setLoadingServices(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        padding: '90px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', filter: 'blur(80px)' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
            padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
            fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(165,180,252,0.2)',
          }}>
            <Zap size={14} /> AI-Powered Service Matching
          </div>

          <h1 style={{
            color: '#ffffff', fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: '900', lineHeight: 1.1, marginBottom: '20px',
            letterSpacing: '-1px',
          }}>
            Find Trusted Service<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Professionals
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '18px',
            marginBottom: '40px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 40px',
          }}>
            Connect with verified experts for plumbing, cleaning, tutoring, IT and more.
            Secure payments, AI matching, real-time tracking.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '10px', maxWidth: '560px', margin: '0 auto 48px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            borderRadius: '14px', padding: '6px', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What service do you need?"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#ffffff', fontSize: '15px', padding: '10px 14px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '12px 24px', cursor: 'pointer', fontWeight: '700',
              fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'opacity 0.15s',
            }}>
              <Search size={16} /> Search
            </button>
          </form>

          {/* Quick category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {SERVICE_CATEGORIES.slice(0, 8).map(cat => (
              <button key={cat} onClick={() => navigate(`/services?category=${cat}`)} style={{
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px',
                padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          maxWidth: '900px', margin: '60px auto 0',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.1)',
          borderRadius: '14px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {HERO_STATS.map(stat => (
            <div key={stat.label} style={{
              padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)',
            }}>
              <div style={{ color: '#a78bfa', fontWeight: '900', fontSize: '26px', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ color: '#6366f1', fontWeight: '700', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Simple Process
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>
              How it works
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '12px auto 0' }}>
              Three simple steps to get any job done professionally
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
            {FEATURES.map((f, idx) => (
              <div key={f.title} style={{
                padding: '32px', borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: `linear-gradient(135deg, ${f.color}08, ${f.color}04)`,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 24, right: 24,
                  fontSize: '48px', fontWeight: '900', color: `${f.color}15`, lineHeight: 1,
                }}>
                  {idx + 1}
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: '12px',
                  background: `${f.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ color: '#6366f1', fontWeight: '700', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Popular
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>
                Featured Services
              </h2>
            </div>
            <Link to="/services" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#6366f1', fontWeight: '600', fontSize: '14px',
              textDecoration: 'none', transition: 'gap 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.gap = '10px'}
              onMouseLeave={e => e.currentTarget.style.gap = '6px'}
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loadingServices ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 360, borderRadius: '12px', background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {featuredServices.slice(0, 4).map(s => <ServiceCard key={s._id || s.id} service={s} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Provider */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <TrendingUp size={40} color="#a78bfa" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#ffffff', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '16px' }}>
            Are you a service professional?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', marginBottom: '36px', lineHeight: 1.6 }}>
            Join 1,200+ verified providers. Grow your client base, manage bookings,
            and get paid securely — all in one platform.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=prestataire" style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Join as Provider <ArrowRight size={16} />
            </Link>
            <Link to="/services" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ padding: '48px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '32px', alignItems: 'center',
          }}>
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: CheckCircle, text: 'Verified Providers' },
              { icon: Star, text: 'Reviewed & Rated' },
              { icon: Users, text: '10K+ Happy Clients' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                <Icon size={20} color="#6366f1" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

const MOCK_SERVICES = [
  { _id: '1', title: 'Professional Plumbing', category: 'Plomberie', price: 80, description: 'Expert plumbing services for homes and businesses.', rating: 4.8, reviewCount: 124, location: 'Paris', provider: { name: 'Jean Dupont' } },
  { _id: '2', title: 'House Cleaning', category: 'Ménage', price: 50, description: 'Thorough and reliable house cleaning service.', rating: 4.9, reviewCount: 87, location: 'Lyon', provider: { name: 'Marie Martin' } },
  { _id: '3', title: 'IT Support & Repair', category: 'Informatique', price: 60, description: 'Computer repair, setup, and IT consulting.', rating: 4.7, reviewCount: 56, location: 'Bordeaux', provider: { name: 'Paul Bernard' } },
  { _id: '4', title: 'Garden Landscaping', category: 'Jardinage', price: 70, description: 'Beautiful garden design and maintenance.', rating: 4.6, reviewCount: 43, location: 'Marseille', provider: { name: 'Sophie Lefèvre' } },
];
