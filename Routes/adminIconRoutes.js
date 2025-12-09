const express = require('express');
const router = express.Router();
const { createIcon, getIcons } = require('../Controller/iconController');

// Admin endpoints for icons (mounted under /aaxiero/admin/icons)
router.post('/', createIcon);
router.get('/', getIcons);

module.exports = router;
