'use strict';

const { Category } = require('../models');
const { formatResponse } = require('../utils/helpers');

/**
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    return res.json(formatResponse(categories, 'Categories retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json(formatResponse(category, 'Category retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories  (admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json(formatResponse(category, 'Category created'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id  (admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const updated = await Category.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json(formatResponse(updated, 'Category updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id  (admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await Category.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json(formatResponse(null, 'Category deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
