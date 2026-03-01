'use strict';

const { Request, Service, Notification } = require('../models');
const { formatResponse, paginate } = require('../utils/helpers');

/**
 * POST /api/requests  (client)
 */
const createRequest = async (req, res, next) => {
  try {
    const { service_id, description, scheduled_date } = req.body;

    const service = await Service.findById(service_id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.provider_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot request your own service' });
    }

    const serviceRequest = await Request.create({
      client_id: req.user.id,
      service_id,
      description,
      scheduled_date,
    });

    // Notify provider
    await Notification.create(
      service.provider_id,
      'new_request',
      `New service request from ${req.user.name}`,
      { request_id: serviceRequest.id }
    );

    return res.status(201).json(formatResponse(serviceRequest, 'Request created'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests  (own)
 */
const getMyRequests = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = paginate(page, limit);

    let result;
    if (req.user.role === 'client') {
      result = await Request.findByClientId(req.user.id, pagination);
    } else if (req.user.role === 'prestataire') {
      result = await Request.findByProviderId(req.user.id, pagination);
    } else {
      result = await Request.getAll({}, pagination);
    }

    return res.json(
      formatResponse(result.data, 'Requests retrieved', {
        page: parseInt(page, 10) || 1,
        limit: pagination.limit,
        total: result.total,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requests/:id
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Only involved parties or admin can view
    const isClient = request.client_id === req.user.id;
    const isProvider = request.provider_id === req.user.id;
    if (!isClient && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json(formatResponse(request, 'Request retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/requests/:id/status
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const isClient = request.client_id === req.user.id;
    const isProvider = request.provider_id === req.user.id;

    // Access control
    if (!isClient && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Role-based status transitions
    const allowedForProvider = ['accepted', 'rejected'];
    const allowedForClient = ['cancelled'];
    const allowedForAdmin = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];

    if (isProvider && !allowedForProvider.includes(status)) {
      return res.status(400).json({ success: false, message: 'Providers can only accept or reject' });
    }
    if (isClient && !allowedForClient.includes(status)) {
      return res.status(400).json({ success: false, message: 'Clients can only cancel requests' });
    }

    const updated = await Request.updateStatus(req.params.id, status);

    // Notify the other party
    const notifyUserId = isProvider ? request.client_id : request.provider_id;
    await Notification.create(
      notifyUserId,
      'request_status_update',
      `Your request has been ${status}`,
      { request_id: request.id, status }
    );

    return res.json(formatResponse(updated, `Request ${status}`));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/requests/:id/complete
 */
const completeRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted requests can be completed' });
    }

    const isProvider = request.provider_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await Request.updateStatus(req.params.id, 'completed');

    await Notification.create(
      request.client_id,
      'request_completed',
      'Your service request has been marked as completed',
      { request_id: request.id }
    );

    return res.json(formatResponse(updated, 'Request completed'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  completeRequest,
};
