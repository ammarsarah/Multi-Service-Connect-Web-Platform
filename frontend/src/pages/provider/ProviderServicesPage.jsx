import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useMyServices } from '../../hooks/useServices';
import serviceService from '../../services/serviceService';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatCurrency } from '../../utils/formatters';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', description: '', price: '', category: '', location: '', tags: '' };

export default function ProviderServicesPage() {
  const { services, loading, refetch, setServices } = useMyServices();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (svc) => {
    setEditId(svc._id);
    setForm({ title: svc.title || '', description: svc.description || '', price: svc.price || '', category: svc.category || '', location: svc.location || '', tags: (svc.tags || []).join(', ') });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.category) return toast.error('Title and category are required');
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) {
        await serviceService.updateService(editId, payload);
        toast.success('Service updated!');
      } else {
        await serviceService.createService(payload);
        toast.success('Service created!');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceService.deleteService(id);
      setServices(p => p.filter(s => s._id !== id));
      toast.success('Service deleted');
    } catch { toast.error('Failed to delete service'); }
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>My Services</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{services.length} services listed</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Service
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No services yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Add your first service to start getting clients.</p>
          <Button onClick={openAdd}><Plus size={16} /> Add Your First Service</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {services.map((svc) => (
            <div key={svc._id} style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                ⭐
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '3px' }}>{svc.title}</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{svc.category}</span>
                  {svc.location && <span style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {svc.location}</span>}
                  <Badge status={svc.isActive !== false ? 'active' : 'inactive'} />
                </div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '18px', color: '#6366f1', flexShrink: 0 }}>
                {svc.price != null ? formatCurrency(svc.price) : 'Sur devis'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => navigate(`/services/${svc._id}`)} style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                ><Eye size={15} /></button>
                <button onClick={() => openEdit(svc)} style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                ><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(svc._id)} style={{ padding: '8px', background: '#fff0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#ef4444'; }}
                ><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Service' : 'Add New Service'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editId ? 'Save Changes' : 'Create Service'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Service Title" placeholder="e.g. Professional Plumbing" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Category *</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...fieldStyle }}>
              <option value="">Select category</option>
              {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your service in detail..." rows={4} style={{ ...fieldStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Price (€)" type="number" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} min="0" />
            <Input label="Location" placeholder="City, Region" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <Input label="Tags (comma-separated)" placeholder="fast, professional, certified" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} hint="Help clients find your service" />
        </div>
      </Modal>
    </div>
  );
}
