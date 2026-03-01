import { useState, useEffect, useCallback } from 'react';
import serviceService from '../services/serviceService';
import toast from 'react-hot-toast';

export function useServices(initialParams = {}) {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await serviceService.getServices(params);
      setServices(data.services || data.data || data);
      setTotal(data.total || data.count || 0);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load services';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  }, []);

  return { services, total, loading, error, params, updateParams, refetch: fetchServices };
}

export function useMyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await serviceService.getMyServices();
      setServices(data.services || data.data || data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your services';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyServices();
  }, [fetchMyServices]);

  return { services, loading, error, refetch: fetchMyServices, setServices };
}

export default useServices;
