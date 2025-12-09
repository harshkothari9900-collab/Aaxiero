const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = { Gallery: mongoose.model('Gallery', GallerySchema) };
