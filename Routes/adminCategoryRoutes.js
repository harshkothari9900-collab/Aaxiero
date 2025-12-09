const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../Controller/categoryController');

// Admin CRUD for categories (mounted under /aaxiero/admin/endpoints/categories)
router.post('/', createCategory); // Create
router.get('/', getCategories); // List (admin view)
router.get('/:id', getCategoryById); // Read one
router.put('/:id', updateCategory); // Update
router.delete('/:id', deleteCategory); // Delete

module.exports = router;
