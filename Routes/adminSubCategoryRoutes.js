const express = require('express');
const router = express.Router();
const {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} = require('../Controller/subCategoryController');

// Admin CRUD for subcategories (mounted under /aaxiero/admin/Subcatagories)
router.post('/', createSubCategory);
router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);
router.put('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

module.exports = router;
