const express = require('express');
const router = express.Router();
const { login } = require('../Controller/adminController');
const adminCategoryRoutes = require('./adminCategoryRoutes');
const adminSubCategoryRoutes = require('./adminSubCategoryRoutes');
const adminProjectRoutes = require('./adminProjectRoutes');
const adminIconRoutes = require('./adminIconRoutes');
const adminServiceRoutes = require('./adminServiceRoutes');
const adminGalleryRoutes = require('./adminGalleryRoutes');

// Endpoint base will be mounted under /aaxiero in server.js
router.post('/admin/login', login);

// Mount admin category endpoints under /admin/endpoints/categories
router.use('/admin/categories', adminCategoryRoutes);
// Mount admin subcategory endpoints under /admin/Subcatagories (as requested)
router.use('/admin/Subcatagories', adminSubCategoryRoutes);
// Mount admin project endpoints under /admin/project
router.use('/admin/project', adminProjectRoutes);
// Mount admin icon endpoints under /admin/icons
router.use('/admin/icons', adminIconRoutes);
// Mount admin service endpoints under /admin/service
router.use('/admin/service', adminServiceRoutes);
// Mount admin gallery endpoints under /admin/gallery
router.use('/admin/gallery', adminGalleryRoutes);

module.exports = router;
