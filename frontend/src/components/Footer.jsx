import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Browse Services', to: '/services' },
      { label: 'Find Providers', to: '/providers' },
      { label: 'How It Works', to: '/#how-it-works' },
    ],
    Account: [
      { label: 'Sign Up', to: '/register' },
      { label: 'Log In', to: '/login' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
    Support: [
      { label: 'Help Center', to: '#' },
      { label: 'Contact Us', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  };

  return (
    <footer style={{ background: '#1e293b', color: '#94a3b8', paddingTop: '60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={20} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: '800', fontSize: '15px' }}>
                Multi-Service Connect
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, maxWidth: '240px' }}>
              Connecting clients with trusted service professionals through secure AI-powered matchmaking.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 34, height: 34, borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', transition: 'all 0.15s', textDecoration: 'none',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.to} style={{
                      color: '#94a3b8', textDecoration: 'none', fontSize: '13px', transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: Mail, text: 'contact@multiservice.com' },
                { icon: Phone, text: '+33 1 23 45 67 89' },
                { icon: MapPin, text: 'Paris, France' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Icon size={14} color="#6366f1" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0', flexWrap: 'wrap', gap: '10px',
        }}>
          <p style={{ fontSize: '13px' }}>
            © {year} Multi-Service Connect. All rights reserved.
          </p>
          <p style={{ fontSize: '13px' }}>
            Made with ❤️ for connecting communities
          </p>
        </div>
      </div>
    </footer>
  );
}
