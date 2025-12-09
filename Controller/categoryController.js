const { Category } = require('../Models/Category');

// Admin: Create a category
const createCategory = async (req, res) => {
  try {
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    const cat = new Category({ name });
    await cat.save();
    return res.status(201).json({ success: true, category: cat });
  } catch (err) {
    console.error('createCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin & User: Get all categories (public read)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, categories });
  } catch (err) {
    console.error('getCategories error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Get one category by id
const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, category: cat });
  } catch (err) {
    console.error('getCategoryById error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Update category
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const existing = await Category.findOne({ _id: { $ne: id }, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ success: false, message: 'Another category with this name exists' });

    const cat = await Category.findByIdAndUpdate(id, { name }, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, category: cat });
  } catch (err) {
    console.error('updateCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Delete category
const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findByIdAndDelete(id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('deleteCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
