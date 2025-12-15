const express = require('express');
const router = express.Router();
const {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo
} = require('../Controller/videoController');

// Admin CRUD for videos (mounted under /aaxiero/admin/videos)
router.post('/', createVideo); // Create
router.get('/', getVideos); // List (admin view)
router.get('/:id', getVideoById); // Read one
router.put('/:id', updateVideo); // Update
router.delete('/:id', deleteVideo); // Delete

module.exports = router;