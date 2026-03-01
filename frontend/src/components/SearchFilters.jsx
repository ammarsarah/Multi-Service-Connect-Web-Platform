import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../utils/constants';

export default function SearchFilters({ onChange, initialValues = {} }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    ...initialValues,
  });

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onChange?.(next);
  };

  const clear = () => {
    const reset = { search: '', category: '', location: '', minPrice: '', maxPrice: '', minRating: '' };
    setFilters(reset);
    onChange?.(reset);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', color: '#1e293b', background: '#fff',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block',
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} color="#6366f1" />
          <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clear}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ef4444', fontSize: '12px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label style={labelStyle}>Search</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search services..."
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            style={{ ...inputStyle, paddingLeft: '32px' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <select
          value={filters.category}
          onChange={e => update('category', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        >
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label style={labelStyle}>Location</label>
        <input
          type="text"
          placeholder="City or region..."
          value={filters.location}
          onChange={e => update('location', e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Price range */}
      <div>
        <label style={labelStyle}>Price Range (€)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => update('minPrice', e.target.value)}
            style={inputStyle}
            min={0}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => update('maxPrice', e.target.value)}
            style={inputStyle}
            min={0}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label style={labelStyle}>Minimum Rating</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3, 4].map(r => (
            <button
              key={r}
              onClick={() => update('minRating', r === 0 ? '' : String(r + 1))}
              style={{
                flex: 1, padding: '7px 0',
                border: `1.5px solid ${filters.minRating == (r === 0 ? '' : r + 1) ? '#6366f1' : '#e2e8f0'}`,
                borderRadius: '6px',
                background: filters.minRating == (r === 0 ? '' : r + 1) ? '#6366f1' : '#fff',
                color: filters.minRating == (r === 0 ? '' : r + 1) ? '#fff' : '#374151',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {r === 0 ? 'Any' : `${r + 1}★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
