const { SubCategory } = require('../Models/SubCategory');

// Create subcategory (admin)
const createSubCategory = async (req, res) => {
  try {
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Subcategory name required' });

    const existing = await SubCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Subcategory already exists' });

    // If multer stored a file, build a full URL for the image field
    let imagePath = '';
    if (req.file && req.file.filename) {
      // Build absolute URL so remote clients can access it directly.
      // Use req.protocol and host; when behind a reverse proxy (nginx) make sure
      // `app.set('trust proxy', true)` is enabled in server.js so protocol is correct.
      const proto = req.protocol || 'http';
      const host = req.get('host');
      imagePath = `${proto}://${host}/uploads/subcategories/${req.file.filename}`;
    }

    const sc = new SubCategory({ name, image: imagePath });
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

    const existing = await SubCategory.findOne({ _id: { $ne: id }, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Another subcategory with this name exists' });

    // If a new image file was uploaded, update the image path too
    const updateData = { name };
    if (req.file && req.file.filename) {
      const proto = req.protocol || 'http';
      const host = req.get('host');
      updateData.image = `${proto}://${host}/uploads/subcategories/${req.file.filename}`;
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
    const sc = await SubCategory.findByIdAndDelete(id);
    if (!sc) return res.status(404).json({ success: false, message: 'Subcategory not found' });
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
