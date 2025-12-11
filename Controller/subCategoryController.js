const { SubCategory } = require('../Models/SubCategory');
const { uploadFile, deleteFile } = require('../Services/cloudinaryService');

// Create subcategory (admin)
const createSubCategory = async (req, res) => {
  try {
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Subcategory name required' });

    const existing = await SubCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Subcategory already exists' });

    // If multer stored a file, upload it to Cloudinary and store the URL + public id
    let imagePath = '';
    let imagePublicId = '';
    if (req.file && req.file.path) {
      const upload = await uploadFile(req.file.path, 'subcategories');
      imagePath = upload.url;
      imagePublicId = upload.public_id;
    }

    const sc = new SubCategory({ name, image: imagePath, imagePublicId });
    await sc.save();
    return res.status(201).json({ success: true, subcategory: sc });
  } catch (err) {
    console.error('createSubCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// List subcategories (admin)
const getSubCategories = async (req, res) => {
  try {
    const list = await SubCategory.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, subcategories: list });
  } catch (err) {
    console.error('getSubCategories error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get one subcategory
const getSubCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const sc = await SubCategory.findById(id);
    if (!sc) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    return res.json({ success: true, subcategory: sc });
  } catch (err) {
    console.error('getSubCategoryById error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update subcategory
const updateSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Subcategory name required' });

    const existingByName = await SubCategory.findOne({ _id: { $ne: id }, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingByName) return res.status(409).json({ success: false, message: 'Another subcategory with this name exists' });

    // Load existing to handle Cloudinary deletion if needed
    const existing = await SubCategory.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    const updateData = { name };
    if (req.file && req.file.path) {
      // Remove old image from Cloudinary if present
      if (existing.imagePublicId) {
        try { await deleteFile(existing.imagePublicId); } catch (e) { console.warn('Failed to delete old subcategory image from Cloudinary', e); }
      }
      const upload = await uploadFile(req.file.path, 'subcategories');
      updateData.image = upload.url;
      updateData.imagePublicId = upload.public_id;
    }

    const sc = await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
    if (!sc) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    return res.json({ success: true, subcategory: sc });
  } catch (err) {
    console.error('updateSubCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete subcategory
const deleteSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const scExisting = await SubCategory.findById(id);
    if (!scExisting) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    // Delete image from Cloudinary if present
    if (scExisting.imagePublicId) {
      try { await deleteFile(scExisting.imagePublicId); } catch (e) { console.warn('Failed to delete subcategory image from Cloudinary', e); }
    }

    await SubCategory.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    console.error('deleteSubCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
};
