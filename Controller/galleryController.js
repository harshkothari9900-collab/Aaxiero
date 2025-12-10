const { Gallery } = require('../Models/Gallery');
const fs = require('fs');
const path = require('path');

const MAX_IMAGES = 20;

const createOrAddGallery = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category id required' });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'At least one image required' });

    const existing = await Gallery.findOne({ categoryId });

    if (existing) {
      if (existing.images.length + files.length > MAX_IMAGES) {
        // cleanup uploaded files
        files.forEach(f => {
          const p = path.join(process.cwd(), 'uploads', f.filename);
          fs.unlink(p, () => {});
        });
        return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
      }
      const newPaths = files.map(f => `/uploads/${f.filename}`);
      existing.images.push(...newPaths);
      await existing.save();
      return res.status(200).json({ success: true, gallery: existing });
    }

    if (files.length > MAX_IMAGES) {
      // cleanup uploaded files
      files.forEach(f => {
        const p = path.join(process.cwd(), 'uploads', f.filename);
        fs.unlink(p, () => {});
      });
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    const images = files.map(f => `/uploads/${f.filename}`);
    const g = new Gallery({ categoryId, images });
    await g.save();
    return res.status(201).json({ success: true, gallery: g });
  } catch (err) {
    console.error('createOrAddGallery error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().populate('categoryId', 'name').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, galleries });
  } catch (err) {
    console.error('getGalleries error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getGalleryByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const g = await Gallery.findOne({ categoryId }).populate('categoryId', 'name');
    if (!g) return res.status(404).json({ success: false, message: 'Gallery not found for this category' });
    return res.json({ success: true, gallery: g });
  } catch (err) {
    console.error('getGalleryByCategory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const replaceImages = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'At least one image required' });
    if (files.length > MAX_IMAGES) {
      // cleanup
      files.forEach(f => fs.unlink(path.join(process.cwd(), 'uploads', f.filename), () => {}));
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    const existing = await Gallery.findOne({ categoryId });
    if (!existing) {
      // create new
      const images = files.map(f => `/uploads/${f.filename}`);
      const g = new Gallery({ categoryId, images });
      await g.save();
      return res.status(201).json({ success: true, gallery: g });
    }

    // delete old files
    existing.images.forEach(img => {
      const p = path.join(process.cwd(), img.replace(/^\//, ''));
      fs.unlink(p, () => {});
    });

    // set new images
    existing.images = files.map(f => `/uploads/${f.filename}`);
    await existing.save();
    return res.json({ success: true, gallery: existing });
  } catch (err) {
    console.error('replaceImages error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const existing = await Gallery.findOne({ categoryId });
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery not found' });

    // delete files
    existing.images.forEach(img => {
      const p = path.join(process.cwd(), img.replace(/^\//, ''));
      fs.unlink(p, () => {});
    });

    await Gallery.findByIdAndDelete(existing._id);
    return res.json({ success: true, message: 'Gallery deleted' });
  } catch (err) {
    console.error('deleteGallery error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addImagesToGallery = async (req, res) => {
  try {
    const galleryId = req.params.galleryId;
    const files = req.files || [];
    
    if (!files.length) return res.status(400).json({ success: false, message: 'At least one image required' });

    const existing = await Gallery.findById(galleryId);
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery not found' });

    if (existing.images.length + files.length > MAX_IMAGES) {
      // cleanup uploaded files
      files.forEach(f => {
        const p = path.join(process.cwd(), 'uploads', f.filename);
        fs.unlink(p, () => {});
      });
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    const newPaths = files.map(f => `/uploads/${f.filename}`);
    existing.images.push(...newPaths);
    await existing.save();
    return res.status(200).json({ success: true, gallery: existing });
  } catch (err) {
    console.error('addImagesToGallery error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteImageFromGallery = async (req, res) => {
  try {
    const galleryId = req.params.galleryId;
    const imageUrl = req.body.imageUrl;

    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image URL required' });

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });

    // Check if image exists in gallery
    const imageIndex = gallery.images.indexOf(imageUrl);
    if (imageIndex === -1) return res.status(404).json({ success: false, message: 'Image not found in gallery' });

    // Delete the physical file
    const p = path.join(process.cwd(), imageUrl.replace(/^\//, ''));
    fs.unlink(p, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Remove from array
    gallery.images.splice(imageIndex, 1);
    await gallery.save();

    return res.json({ success: true, message: 'Image deleted', gallery });
  } catch (err) {
    console.error('deleteImageFromGallery error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOrAddGallery,
  getGalleries,
  getGalleryByCategory,
  replaceImages,
  deleteGallery,
  addImagesToGallery,
  deleteImageFromGallery
};
