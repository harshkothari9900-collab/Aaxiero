const { Gallery } = require('../Models/Gallery');
const { uploadMultipleFiles, deleteFile, getPublicIdFromUrl } = require('../Services/cloudinaryService');

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
        return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
      }
      
      // Upload files to Cloudinary
      const filePaths = files.map(f => f.path);
      const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
      const imageUrls = uploadedImages.map(img => img.url);
      
      existing.images.push(...imageUrls);
      await existing.save();
      return res.status(200).json({ success: true, gallery: existing });
    }

    if (files.length > MAX_IMAGES) {
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    // Upload files to Cloudinary
    const filePaths = files.map(f => f.path);
    const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
    const imageUrls = uploadedImages.map(img => img.url);
    
    const g = new Gallery({ categoryId, images: imageUrls });
    await g.save();
    return res.status(201).json({ success: true, gallery: g });
  } catch (err) {
    console.error('createOrAddGallery error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
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
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    const existing = await Gallery.findOne({ categoryId });
    if (!existing) {
      // create new gallery
      const filePaths = files.map(f => f.path);
      const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
      const imageUrls = uploadedImages.map(img => img.url);
      
      const g = new Gallery({ categoryId, images: imageUrls });
      await g.save();
      return res.status(201).json({ success: true, gallery: g });
    }

    // Delete old images from Cloudinary
    for (const imageUrl of existing.images) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await deleteFile(publicId);
      }
    }

    // Upload new files to Cloudinary
    const filePaths = files.map(f => f.path);
    const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
    const imageUrls = uploadedImages.map(img => img.url);
    
    existing.images = imageUrls;
    await existing.save();
    return res.json({ success: true, gallery: existing });
  } catch (err) {
    console.error('replaceImages error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const existing = await Gallery.findOne({ categoryId });
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery not found' });

    // Delete all images from Cloudinary
    for (const imageUrl of existing.images) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await deleteFile(publicId);
      }
    }

    await Gallery.findByIdAndDelete(existing._id);
    return res.json({ success: true, message: 'Gallery deleted' });
  } catch (err) {
    console.error('deleteGallery error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
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
      return res.status(400).json({ success: false, message: `Max ${MAX_IMAGES} images allowed per category` });
    }

    // Upload files to Cloudinary
    const filePaths = files.map(f => f.path);
    const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${existing.categoryId}`);
    const imageUrls = uploadedImages.map(img => img.url);
    
    existing.images.push(...imageUrls);
    await existing.save();
    return res.status(200).json({ success: true, gallery: existing });
  } catch (err) {
    console.error('addImagesToGallery error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
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

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await deleteFile(publicId);
    }

    // Remove from array
    gallery.images.splice(imageIndex, 1);
    await gallery.save();

    return res.json({ success: true, message: 'Image deleted', gallery });
  } catch (err) {
    console.error('deleteImageFromGallery error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
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
