const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  // Cloudinary URLs
  coverImage: { type: String },
  coverImagePublicId: { type: String }, // Store public ID for deletion
  image1: { type: String },
  image1PublicId: { type: String },
  image2: { type: String },
  image2PublicId: { type: String },
  image3: { type: String },
  image3PublicId: { type: String },
  image4: { type: String },
  image4PublicId: { type: String },
  image5: { type: String },
  image5PublicId: { type: String },
  image6: { type: String },
  image6PublicId: { type: String },
  image7: { type: String },
  image7PublicId: { type: String },
  image8: { type: String },
  image8PublicId: { type: String },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  subsubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };
