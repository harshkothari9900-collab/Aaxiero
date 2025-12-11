const { Project } = require('../Models/Project');
const { SubCategory } = require('../Models/SubCategory');
const { uploadFile, deleteFile } = require('../Services/cloudinaryService');

const createProject = async (req, res) => {
  try {
    const projectName = req.body.projectName ? String(req.body.projectName).trim() : '';
    // Accept legacy `categoryId` as alias for `subCategoryId`
    const subCategoryId = req.body.subCategoryId || req.body.categoryId;
    const subsubCategoryId = req.body.subsubCategoryId;
    if (!projectName) return res.status(400).json({ success: false, message: 'Project Name required' });
    if (!subCategoryId && !subsubCategoryId) return res.status(400).json({ success: false, message: 'Category id or SubCategory id required' });

    // Handle cover image upload
    let coverImage = undefined;
    let coverImagePublicId = undefined;
    if (req.file) {
      const upload = await uploadFile(req.file.path, 'projects/cover');
      coverImage = upload.url;
      coverImagePublicId = upload.public_id;
    } else if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const upload = await uploadFile(req.files.coverImage[0].path, 'projects/cover');
      coverImage = upload.url;
      coverImagePublicId = upload.public_id;
    }

    // Collect image1..image8 if provided
    const images = {};
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      const publicIdKey = `${key}PublicId`;
      if (req.files && req.files[key] && req.files[key][0]) {
        const upload = await uploadFile(req.files[key][0].path, `projects/${key}`);
        images[key] = upload.url;
        images[publicIdKey] = upload.public_id;
      }
    }

    const projectData = { projectName, subCategoryId, subsubCategoryId };
    if (coverImage) projectData.coverImage = coverImage;
    if (coverImagePublicId) projectData.coverImagePublicId = coverImagePublicId;
    Object.assign(projectData, images);

    const p = new Project(projectData);
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
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
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

    const existing = await Project.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    // Handle cover image upload
    if (req.file) {
      if (existing.coverImagePublicId) {
        await deleteFile(existing.coverImagePublicId);
      }
      const upload = await uploadFile(req.file.path, 'projects/cover');
      update.coverImage = upload.url;
      update.coverImagePublicId = upload.public_id;
    } else if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      if (existing.coverImagePublicId) {
        await deleteFile(existing.coverImagePublicId);
      }
      const upload = await uploadFile(req.files.coverImage[0].path, 'projects/cover');
      update.coverImage = upload.url;
      update.coverImagePublicId = upload.public_id;
    }

    // Handle image1..image8 updates
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`;
      const publicIdKey = `${key}PublicId`;
      if (req.files && req.files[key] && req.files[key][0]) {
        // Delete old image if exists
        if (existing[publicIdKey]) {
          await deleteFile(existing[publicIdKey]);
        }
        const upload = await uploadFile(req.files[key][0].path, `projects/${key}`);
        update[key] = upload.url;
        update[publicIdKey] = upload.public_id;
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
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Project.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    // Delete cover image from Cloudinary if exists
    if (existing.coverImagePublicId) {
      await deleteFile(existing.coverImagePublicId);
    }

    // Delete image1..image8 from Cloudinary if exist
    for (let i = 1; i <= 8; i++) {
      const publicIdKey = `image${i}PublicId`;
      if (existing[publicIdKey]) {
        await deleteFile(existing[publicIdKey]);
      }
    }

    await Project.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Delete a specific image slot (image1..image8) for a project
const deleteProjectImageSlot = async (req, res) => {
  try {
    const id = req.params.id;
    const slot = Number(req.query.slot);
    if (!id || !slot || slot < 1 || slot > 8) {
      return res.status(400).json({ success: false, message: 'Valid slot (1-8) required' });
    }
    const key = `image${slot}`;
    const publicIdKey = `${key}PublicId`;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Delete from Cloudinary if public ID exists
    if (project[publicIdKey]) {
      await deleteFile(project[publicIdKey]);
    }
    
    project[key] = '';
    project[publicIdKey] = '';
    await project.save();
    return res.json({ success: true, message: `Deleted ${key} for project`, project });
  } catch (err) {
    console.error('deleteProjectImageSlot error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  deleteProjectImageSlot
};
