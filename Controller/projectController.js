const { Project } = require('../Models/Project');
const { SubCategory } = require('../Models/SubCategory');
const fs = require('fs');
const path = require('path');

const createProject = async (req, res) => {
  try {
    const projectName = req.body.projectName ? String(req.body.projectName).trim() : '';
    // Accept legacy `categoryId` as alias for `subCategoryId`
    const subCategoryId = req.body.subCategoryId || req.body.categoryId;
    const subsubCategoryId = req.body.subsubCategoryId;
    if (!projectName) return res.status(400).json({ success: false, message: 'Project Name required' });
    if (!subCategoryId && !subsubCategoryId) return res.status(400).json({ success: false, message: 'Category id or SubCategory id required' });

    // Support both legacy single-file (`req.file`) and new multi-field (`req.files`)
    const coverImage = req.file ? `/uploads/${req.file.filename}` : (req.files && req.files.coverImage ? `/uploads/${req.files.coverImage[0].filename}` : undefined);

    // Collect image1..image8 if provided
    const images = {};
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      if (req.files && req.files[key] && req.files[key][0]) {
        images[key] = `/uploads/${req.files[key][0].filename}`;
      }
    }

    const p = new Project(Object.assign({ projectName, subCategoryId, subsubCategoryId, coverImage }, images));
    await p.save();
    const out = p.toObject ? p.toObject() : p;
    // Normalize legacy field name (if older records used `categoryId`)
    if ((!out.subCategoryId || typeof out.subCategoryId === 'string') && out.categoryId) {
      const sub = await SubCategory.findById(out.categoryId).lean();
      if (sub) out.subCategoryId = sub;
      else out.subCategoryId = out.categoryId;
    }
    if (out.categoryId) delete out.categoryId;
    return res.status(201).json({ success: true, project: out });
  } catch (err) {
    console.error('createProject error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('subCategoryId', 'name image').populate('subsubCategoryId', 'name image').sort({ createdAt: -1 }).lean();
    // Normalize legacy `categoryId` to `subCategoryId` for older documents
    const legacyIds = projects.filter(p => (!p.subCategoryId || typeof p.subCategoryId === 'string') && p.categoryId).map(p => p.categoryId);
    if (legacyIds.length) {
      const subs = await SubCategory.find({ _id: { $in: legacyIds } }).lean();
      const map = {};
      subs.forEach(s => { map[String(s._id)] = s; });
      projects.forEach((proj) => {
        if ((!proj.subCategoryId || typeof proj.subCategoryId === 'string') && proj.categoryId) {
          proj.subCategoryId = map[String(proj.categoryId)] || proj.categoryId;
        }
        if (proj.categoryId) delete proj.categoryId;
      });
    } else {
      projects.forEach((proj) => { if (proj.categoryId) delete proj.categoryId; });
    }
    return res.json({ success: true, projects });
  } catch (err) {
    console.error('getProjects error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Project.findById(id).populate('subCategoryId', 'name image').populate('subsubCategoryId', 'name image');
    if (!p) return res.status(404).json({ success: false, message: 'Project not found' });
    const out = p.toObject ? p.toObject() : p;
    if ((!out.subCategoryId || typeof out.subCategoryId === 'string') && out.categoryId) {
      const sub = await SubCategory.findById(out.categoryId).lean();
      if (sub) out.subCategoryId = sub;
      else out.subCategoryId = out.categoryId;
    }
    if (out.categoryId) delete out.categoryId;
    return res.json({ success: true, project: out });
  } catch (err) {
    console.error('getProjectById error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const id = req.params.id;
    const projectName = req.body.projectName ? String(req.body.projectName).trim() : undefined;
    // Accept legacy `categoryId` as alias for `subCategoryId`
    const subCategoryId = req.body.subCategoryId || req.body.categoryId;
    const subsubCategoryId = req.body.subsubCategoryId;

    const update = {};
    if (projectName) update.projectName = projectName;
    if (subCategoryId) update.subCategoryId = subCategoryId;
    if (subsubCategoryId) update.subsubCategoryId = subsubCategoryId;
    // Support single and multi-file uploads
    if (req.file) update.coverImage = `/uploads/${req.file.filename}`;
    if (req.files && req.files.coverImage && req.files.coverImage[0]) update.coverImage = `/uploads/${req.files.coverImage[0].filename}`;

    // Handle image1..image8 updates
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      if (req.files && req.files[key] && req.files[key][0]) {
        update[key] = `/uploads/${req.files[key][0].filename}`;
      }
    }

    const existing = await Project.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    // If new file uploaded, delete old file
    if ((req.file || (req.files && req.files.coverImage)) && existing.coverImage) {
      const oldPath = path.join(process.cwd(), existing.coverImage.replace(/^\//, ''));
      fs.unlink(oldPath, (err) => { if (err) console.warn('failed to delete old file', err); });
    }

    // Delete old image1..image8 when replaced
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      if (update[key] && existing[key]) {
        const oldPath = path.join(process.cwd(), existing[key].replace(/^\//, ''));
        fs.unlink(oldPath, (err) => { if (err) console.warn(`failed to delete old ${key}`, err); });
      }
    }

    const updated = await Project.findByIdAndUpdate(id, update, { new: true }).populate('subCategoryId', 'name image').populate('subsubCategoryId', 'name image');
    const out = updated ? (updated.toObject ? updated.toObject() : updated) : null;
    if (out) {
      if ((!out.subCategoryId || typeof out.subCategoryId === 'string') && out.categoryId) {
        const sub = await SubCategory.findById(out.categoryId).lean();
        if (sub) out.subCategoryId = sub;
        else out.subCategoryId = out.categoryId;
      }
      if (out.categoryId) delete out.categoryId;
    }
    return res.json({ success: true, project: out });
  } catch (err) {
    console.error('updateProject error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Project.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    // Delete cover image file if exists
    if (existing.coverImage) {
      const p = path.join(process.cwd(), existing.coverImage.replace(/^\//, ''));
      fs.unlink(p, (err) => { if (err) console.warn('failed to delete file', err); });
    }

    // Delete image1..image8 if exist
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      if (existing[key]) {
        const p = path.join(process.cwd(), existing[key].replace(/^\//, ''));
        fs.unlink(p, (err) => { if (err) console.warn(`failed to delete ${key}`, err); });
      }
    }

    await Project.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
