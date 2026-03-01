import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Menu, X, ChevronDown, User, LayoutDashboard, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardLink = {
    client: '/dashboard',
    prestataire: '/provider/dashboard',
    admin: '/admin',
  }[user?.role] || '/dashboard';

  const navLinks = [
    { to: '/services', label: 'Services' },
    { to: '/providers', label: 'Providers' },
  ];

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.3px' }}>
            Multi-Service Connect
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', '@media(max-width:768px)': { display: 'none' } }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 14px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              color: '#64748b', transition: 'color 0.15s, background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#f0f0ff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '8px', borderRadius: '8px',
                  color: '#64748b', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    background: '#ef4444', color: '#fff',
                    fontSize: '10px', fontWeight: '700',
                    borderRadius: '10px', minWidth: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', lineHeight: 1,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', padding: '6px 12px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '12px',
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {userMenuOpen && (
                  <>
                    <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div style={{
                      position: 'absolute', top: '110%', right: 0,
                      background: '#fff', borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                      border: '1px solid #e2e8f0',
                      minWidth: '200px', zIndex: 999,
                      overflow: 'hidden',
                      animation: 'slideDown 0.15s ease',
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{user?.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
                      </div>
                      {[
                        { to: dashboardLink, icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/profile', icon: User, label: 'Profile' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 16px', textDecoration: 'none',
                          color: '#374151', fontSize: '14px', transition: 'background 0.1s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <item.icon size={15} color="#6366f1" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '10px 16px', border: 'none',
                          background: 'none', cursor: 'pointer',
                          color: '#ef4444', fontSize: '14px',
                          borderTop: '1px solid #f1f5f9', transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '8px 18px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600', color: '#6366f1',
                border: '1.5px solid #6366f1', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6366f1'; }}
              >Log in</Link>
              <Link to="/register" style={{
                padding: '8px 18px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600', color: '#fff',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: '8px', color: '#64748b',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{
              padding: '10px', borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', fontWeight: '500', color: '#374151',
            }}>{link.label}</Link>
          ))}
        </div>
      )}

      <style>{`@keyframes slideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </nav>
  );
}
