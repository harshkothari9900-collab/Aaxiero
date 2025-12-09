const mongoose = require('mongoose');

const iconSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, required: true, trim: true }
}, { timestamps: true });

const Icon = mongoose.model('Icon', iconSchema);

module.exports = { Icon };
