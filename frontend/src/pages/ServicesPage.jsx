import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard.jsx';
import SearchFilters from '../components/SearchFilters.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import aiService from '../services/aiService';
import { Sparkles, Grid3X3, List } from 'lucide-react';

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const initialParams = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    page: 1,
    limit: 12,
  };

  const { services, total, loading, error, params, updateParams } = useServices(initialParams);
  const totalPages = Math.ceil(total / params.limit);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadRecs = async () => {
      setLoadingRecs(true);
      try {
        const { data } = await aiService.getRecommendations();
        setRecommendations(data.recommendations || data.services || []);
      } catch { /* silent */ }
      finally { setLoadingRecs(false); }
    };
    loadRecs();
  }, [isAuthenticated]);

  const handleFilterChange = (filters) => {
    updateParams({
      search: filters.search,
      category: filters.category,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      page: 1,
    });
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '32px 20px' }}>
      {/* AI Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#6366f1" />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Recommended for you
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {recommendations.slice(0, 3).map(s => <ServiceCard key={s._id || s.id} service={s} />)}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
            All Services
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {loading ? 'Loading...' : `${total} services available`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['grid', Grid3X3], ['list', List]].map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '8px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
              background: viewMode === mode ? '#6366f1' : '#fff',
              color: viewMode === mode ? '#fff' : '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s',
            }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Filters sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <SearchFilters
            onChange={handleFilterChange}
            initialValues={{ search: initialParams.search, category: initialParams.category }}
          />
        </div>

        {/* Services grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: '340px', borderRadius: '12px', background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '16px' }}>Failed to load services. Please try again.</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                No services found
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(270px, 1fr))' : '1fr',
                gap: '20px',
              }}>
                {services.map(s => <ServiceCard key={s._id || s.id} service={s} />)}
              </div>
              <Pagination
                currentPage={params.page}
                totalPages={totalPages}
                totalItems={total}
                onPageChange={page => updateParams({ page })}
              />
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
