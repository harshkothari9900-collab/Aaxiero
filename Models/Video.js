const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  youtubeId: { type: String, required: true, trim: true }
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

module.exports = { Video };