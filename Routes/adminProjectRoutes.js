const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../Controller/projectController');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Accept coverImage (legacy) plus image1..image8 fields
const uploadFields = [
  { name: 'coverImage', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 }
];

router.post('/', upload.fields(uploadFields), createProject);

// Admin list
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', upload.fields(uploadFields), updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
