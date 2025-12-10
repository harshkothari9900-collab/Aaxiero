const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createOrAddGallery, getGalleries, getGalleryByCategory, replaceImages, deleteGallery, addImagesToGallery, deleteImageFromGallery } = require('../Controller/galleryController');

// Multer setup - store in uploads folder (already used by other controllers)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

// POST /admin/gallery -> create or add images for a category
router.post('/', upload.array('images', 20), createOrAddGallery);

// POST /admin/gallery/:galleryId -> add images to existing gallery
router.post('/:galleryId', upload.array('images', 20), addImagesToGallery);

// GET /admin/gallry -> list all galleries
router.get('/', getGalleries);

// GET /admin/gallry/:categoryId -> get gallery for a category
router.get('/:categoryId', getGalleryByCategory);

// PUT /admin/gallry/:categoryId -> replace images for a category
router.put('/:categoryId', upload.array('images', 20), replaceImages);

// DELETE /admin/gallery/:categoryId -> delete gallery for a category
router.delete('/:categoryId', deleteGallery);

// DELETE /admin/gallery/:galleryId/image -> delete specific image from gallery
router.delete('/:galleryId/image', deleteImageFromGallery);

module.exports = router;
