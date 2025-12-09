const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  coverImage: { type: String },
  image1: { type: String },
  image2: { type: String },
  image3: { type: String },
  image4: { type: String },
  image5: { type: String },
  image6: { type: String },
  image7: { type: String },
  image8: { type: String },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  subsubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };
