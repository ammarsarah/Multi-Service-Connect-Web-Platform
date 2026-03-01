'use strict';

const { Service } = require('../models');
const { formatResponse, paginate } = require('../utils/helpers');

/**
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const { page, limit, category_id, location, min_price, max_price, min_rating } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const filters = {};
    if (category_id) filters.category_id = category_id;
    if (location) filters.location = location;
    if (min_price) filters.min_price = parseFloat(min_price);
    if (max_price) filters.max_price = parseFloat(max_price);
    if (min_rating) filters.min_rating = parseFloat(min_rating);

    const { data, total } = await Service.getAll(filters, { limit: lim, offset });
    return res.json(
      formatResponse(data, 'Services retrieved', {
        page: parseInt(page, 10) || 1,
        limit: lim,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/search
 */
const searchServices = async (req, res, next) => {
  try {
    const { q, page, limit, category_id, location, min_price, max_price } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const { limit: lim, offset } = paginate(page, limit);
    const filters = { search: q };
    if (category_id) filters.category_id = category_id;
    if (location) filters.location = location;
    if (min_price) filters.min_price = parseFloat(min_price);
    if (max_price) filters.max_price = parseFloat(max_price);

    const { data, total } = await Service.getAll(filters, { limit: lim, offset });
    return res.json(
      formatResponse(data, 'Search results', {
        page: parseInt(page, 10) || 1,
        limit: lim,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/:id
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.getWithProviderInfo(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json(formatResponse(service, 'Service retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/services  (prestataire)
 */
const createService = async (req, res, next) => {
  try {
    const service = await Service.create({ ...req.body, provider_id: req.user.id });
    return res.status(201).json(formatResponse(service, 'Service created'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/services/:id  (prestataire, own)
 */
const updateService = async (req, res, next) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });
    if (existing.provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const updated = await Service.update(req.params.id, req.body);
    return res.json(formatResponse(updated, 'Service updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/services/:id  (prestataire, own)
 */
const deleteService = async (req, res, next) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });
    if (existing.provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await Service.delete(req.params.id);
    return res.json(formatResponse(null, 'Service deleted'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/my-services  (prestataire)
 */
const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.findByProviderId(req.user.id);
    return res.json(formatResponse(services, 'Your services'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  searchServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
};
