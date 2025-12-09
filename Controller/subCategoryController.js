const { SubCategory } = require('../Models/SubCategory');

// Create subcategory (admin)
const createSubCategory = async (req, res) => {
  try {
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Subcategory name required' });

    const existing = await SubCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Subcategory already exists' });

    const sc = new SubCategory({ name });
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

    const sc = await SubCategory.findByIdAndUpdate(id, { name }, { new: true });
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
