const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} = require('../Controller/serviceController');

// Admin CRUD for services (mounted under /aaxiero/admin/service)
router.post('/', createService); // Create
router.get('/', getServices); // List
router.get('/:id', getServiceById); // Read one
router.put('/:id', updateService); // Update
router.delete('/:id', deleteService); // Delete

module.exports = router;
