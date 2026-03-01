'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { categorySchema } = require('../utils/validators');

// GET /api/categories  (public)
router.get('/', categoryController.getCategories);

// GET /api/categories/:id  (public)
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories  (admin)
router.post('/', authenticate, authorize('admin'), validate(categorySchema), categoryController.createCategory);

// PUT /api/categories/:id  (admin)
router.put('/:id', authenticate, authorize('admin'), validate(categorySchema), categoryController.updateCategory);

// DELETE /api/categories/:id  (admin)
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
