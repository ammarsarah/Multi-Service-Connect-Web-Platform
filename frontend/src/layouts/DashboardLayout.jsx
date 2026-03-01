import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import {
  LayoutDashboard, Package, FileText, CreditCard, Bell, User,
  Users, Settings, BarChart2, LogOut, ChevronLeft, ChevronRight,
  MessageSquare, Shield, Tag, TrendingUp,
} from 'lucide-react';

const COLORS = {
  primary: '#6366f1',
  bg: '#f8fafc',
  sidebar: '#1e293b',
  sidebarActive: '#6366f1',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.6)',
};

function SidebarItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        color: isActive ? '#ffffff' : COLORS.muted,
        background: isActive ? COLORS.sidebarActive : 'transparent',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.15s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        justifyContent: collapsed ? 'center' : 'flex-start',
      })}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const clientNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/requests', icon: FileText, label: 'My Requests' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/notifications', icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const providerNav = [
    { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/provider/services', icon: Package, label: 'My Services' },
    { to: '/provider/requests', icon: FileText, label: 'Requests' },
    { to: '/payments', icon: TrendingUp, label: 'Earnings' },
    { to: '/notifications', icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminNav = [
    { to: '/admin', icon: BarChart2, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
    { to: '/admin/categories', icon: Tag, label: 'Categories' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const navMap = {
    client: clientNav,
    prestataire: providerNav,
    admin: adminNav,
  };

  const navItems = navMap[user?.role] || clientNav;
  const sidebarW = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarW,
        minHeight: '100vh',
        background: COLORS.sidebar,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36, background: COLORS.primary,
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Shield size={20} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>
              Multi-Service<br />Connect
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <SidebarItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {!collapsed && (
            <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: COLORS.muted, fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              color: COLORS.muted, background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '14px', justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{
            position: 'absolute', top: '50%', right: -12,
            transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: COLORS.primary, border: '2px solid #f8fafc',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 101,
          }}
        >
          {collapsed
            ? <ChevronRight size={12} color="#fff" />
            : <ChevronLeft size={12} color="#fff" />}
        </button>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: sidebarW, flex: 1, transition: 'margin-left 0.2s', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
            {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'prestataire' ? 'Provider Portal' : 'Client Portal'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/notifications')}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
            >
              <Bell size={20} color="#64748b" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#ef4444', color: '#fff',
                  fontSize: '10px', fontWeight: '700',
                  borderRadius: '10px', minWidth: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: COLORS.primary, border: 'none',
                cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>
        </header>

        <main style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
