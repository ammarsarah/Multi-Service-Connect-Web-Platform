import { useState, useEffect } from 'react';
import { CheckCircle, Ban, Search, Filter } from 'lucide-react';
import adminService from '../../services/adminService';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ROLES = ['all', 'client', 'prestataire', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(search && { search }), ...(roleFilter !== 'all' && { role: roleFilter }) };
      const { data } = await adminService.getUsers(params);
      setUsers(data.users || data.data || data);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, roleFilter, page]);

  const handleValidate = async (userId) => {
    try {
      await adminService.validateProvider(userId);
      setUsers(p => p.map(u => u._id === userId ? { ...u, isValidated: true } : u));
      toast.success('Provider validated!');
    } catch { toast.error('Failed to validate'); }
  };

  const handleBan = async (userId, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      if (isBanned) {
        await adminService.unbanUser(userId);
      } else {
        await adminService.banUser(userId, 'Policy violation');
      }
      setUsers(p => p.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
      toast.success(`User ${action}ned successfully`);
    } catch { toast.error(`Failed to ${action} user`); }
  };

  const userStatus = (u) => {
    if (u.isBanned) return 'banned';
    if (u.role === 'prestataire' && !u.isValidated) return 'pending';
    return 'active';
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Users Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{total} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={13} color="#64748b" />
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1.5px solid ${roleFilter === r ? '#6366f1' : '#e2e8f0'}`, background: roleFilter === r ? '#6366f1' : '#fff', color: roleFilter === r ? '#fff' : '#64748b', cursor: 'pointer', textTransform: 'capitalize' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}><Spinner /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge status={userStatus(u)} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {u.role === 'prestataire' && !u.isValidated && !u.isBanned && (
                          <button onClick={() => handleValidate(u._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#d1fae5'}
                          >
                            <CheckCircle size={12} /> Validate
                          </button>
                        )}
                        <button onClick={() => handleBan(u._id, u.isBanned)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: u.isBanned ? '#d1fae5' : '#fee2e2', color: u.isBanned ? '#065f46' : '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'background 0.15s' }}>
                          <Ban size={12} /> {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} onPageChange={setPage} />
    </div>
  );
}
