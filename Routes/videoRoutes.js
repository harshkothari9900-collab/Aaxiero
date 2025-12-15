const express = require('express');
const router = express.Router();
const { getVideos } = require('../Controller/videoController');

// Public endpoint for users to list videos
// Mounted under /aaxiero in server.js -> GET /aaxiero/videos
router.get('/videos', getVideos);

module.exports = router;