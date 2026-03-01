import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🔧', '⚡', '🌱', '🧹', '💻', '✂️', '📦', '👶', '📚', '🏗️', '🚚', '📷', '🍳', '⭐', '🎨', '🎵'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', emoji: '⭐', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.categories || data.data || data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm({ name: '', description: '', emoji: '⭐', color: '#6366f1' }); setModalOpen(true); };
  const openEdit = (cat) => { setEditId(cat._id); setForm({ name: cat.name, description: cat.description || '', emoji: cat.emoji || '⭐', color: cat.color || '#6366f1' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editId) {
        await adminService.updateCategory(editId, form);
        toast.success('Category updated!');
      } else {
        await adminService.createCategory(form);
        toast.success('Category created!');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Services with this category may be affected.')) return;
    try {
      await adminService.deleteCategory(id);
      setCategories(p => p.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete category'); }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Categories</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{categories.length} categories</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Category</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {categories.map(cat => (
            <div key={cat._id} style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '10px',
                  background: `${cat.color || '#6366f1'}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {cat.emoji || '⭐'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(cat)} style={{ padding: '5px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                  ><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(cat._id)} style={{ padding: '5px', background: '#fff0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#ef4444'; }}
                  ><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{cat.name}</div>
              {cat.description && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>{cat.description}</p>}
              {cat.serviceCount !== undefined && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>{cat.serviceCount} services</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editId ? 'Save Changes' : 'Create'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Category Name" placeholder="e.g. Plomberie" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => setForm(p => ({ ...p, emoji: e }))} style={{ width: 38, height: 38, fontSize: '20px', borderRadius: '8px', border: `2px solid ${form.emoji === e ? '#6366f1' : '#e2e8f0'}`, background: form.emoji === e ? '#f0f0ff' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 40, borderRadius: '8px', border: '1.5px solid #e2e8f0', cursor: 'pointer', padding: '2px' }} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>{form.color}</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={2} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
