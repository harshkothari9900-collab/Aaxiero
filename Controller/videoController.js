const { Video } = require('../Models/Video');

// Admin: Create a video
const createVideo = async (req, res) => {
  try {
    const { title, youtubeId } = req.body;
    if (!title || !youtubeId) return res.status(400).json({ success: false, message: 'Video title and YouTube ID are required' });

    const existing = await Video.findOne({ youtubeId: youtubeId.trim() });
    if (existing) return res.status(409).json({ success: false, message: 'Video with this YouTube ID already exists' });

    const video = new Video({ title: title.trim(), youtubeId: youtubeId.trim() });
    await video.save();
    return res.status(201).json({ success: true, video });
  } catch (err) {
    console.error('createVideo error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin & User: Get all videos (public read)
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, videos });
  } catch (err) {
    console.error('getVideos error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Get one video by id
const getVideoById = async (req, res) => {
  try {
    const id = req.params.id;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    return res.json({ success: true, video });
  } catch (err) {
    console.error('getVideoById error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Update video
const updateVideo = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, youtubeId } = req.body;
    if (!title || !youtubeId) return res.status(400).json({ success: false, message: 'Video title and YouTube ID are required' });

    const existingById = await Video.findOne({ _id: { $ne: id }, youtubeId: youtubeId.trim() });
    if (existingById) return res.status(409).json({ success: false, message: 'Another video with this YouTube ID exists' });

    const video = await Video.findByIdAndUpdate(id, { title: title.trim(), youtubeId: youtubeId.trim() }, { new: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    return res.json({ success: true, video });
  } catch (err) {
    console.error('updateVideo error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Delete video
const deleteVideo = async (req, res) => {
  try {
    const id = req.params.id;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    await Video.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    console.error('deleteVideo error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo
};