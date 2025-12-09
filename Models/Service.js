const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  iconId: { type: mongoose.Schema.Types.ObjectId, ref: 'Icon', required: true }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = { Service };
