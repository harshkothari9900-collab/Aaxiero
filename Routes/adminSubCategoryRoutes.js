const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer setup to handle multipart/form-data (file + text fields)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

const upload = multer({ storage });
const {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} = require('../Controller/subCategoryController');

// Admin CRUD for subcategories (mounted under /aaxiero/admin/Subcatagories)
router.post('/', upload.single('image'), createSubCategory);
router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);
router.put('/:id', upload.single('image'), updateSubCategory);
router.delete('/:id', deleteSubCategory);

module.exports = router;
