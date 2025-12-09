const express = require('express');
const router = express.Router();
const { getCategories } = require('../Controller/categoryController');

// Public endpoint for users to list categories
// Mounted under /aaxiero in server.js -> GET /aaxiero/categories
router.get('/categories', getCategories);

module.exports = router;
