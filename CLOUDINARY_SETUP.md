# Cloudinary Integration Guide

## ✅ Installation Complete

Cloudinary image upload functionality has been successfully integrated into your Aaxiero backend.

## 📦 What's Been Done

1. **Cloudinary Package Installed** - `npm install cloudinary`
2. **Cloudinary Service Created** - `Services/cloudinaryService.js`
3. **Gallery Controller Updated** - Uses Cloudinary for all image operations
4. **Environment Template Created** - `.env.example` with Cloudinary config

## 🔧 Setup Instructions

### Step 1: Get Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console/dashboard)
2. Sign up for a free account or log in
3. Copy your credentials:
   - **Cloud Name**: From the top of the dashboard
   - **API Key**: From Account Settings > API Keys
   - **API Secret**: From Account Settings > API Keys

### Step 2: Configure Environment Variables

1. Create a `.env` file in your project root (if you don't have one)
2. Add your Cloudinary credentials:

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aaxiero

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

⚠️ **NEVER commit `.env` file to GitHub!** Use `.env.example` instead.

## 📚 Available Functions in cloudinaryService.js

### 1. **uploadFile(filePath, folder, publicId)**
Upload a single file to Cloudinary
```javascript
const { uploadFile } = require('../Services/cloudinaryService');

const result = await uploadFile('/path/to/image.jpg', 'gallery/category123');
// Returns: { success: true, url, public_id, width, height, size, format }
```

### 2. **uploadMultipleFiles(files, folder)**
Upload multiple files at once
```javascript
const { uploadMultipleFiles } = require('../Services/cloudinaryService');

const results = await uploadMultipleFiles(filePaths, 'gallery/category123');
// Returns: Array of upload results
```

### 3. **deleteFile(publicId, resourceType)**
Delete a file from Cloudinary
```javascript
const { deleteFile } = require('../Services/cloudinaryService');

await deleteFile('gallery/category123/image-id');
```

### 4. **getOptimizedUrl(publicId, options)**
Generate optimized image URL
```javascript
const { getOptimizedUrl } = require('../Services/cloudinaryService');

const url = getOptimizedUrl('gallery/shoes', {
  fetch_format: 'auto',
  quality: 'auto'
});
```

### 5. **getThumbnailUrl(publicId, width, height, gravity)**
Generate thumbnail URLs
```javascript
const { getThumbnailUrl } = require('../Services/cloudinaryService');

const thumbUrl = getThumbnailUrl('gallery/shoes', 200, 200, 'auto');
```

### 6. **getResponsiveUrl(publicId, width, height)**
Generate responsive image URLs
```javascript
const { getResponsiveUrl } = require('../Services/cloudinaryService');

const respUrl = getResponsiveUrl('gallery/shoes', 500, 500);
```

### 7. **getPublicIdFromUrl(url)**
Extract public ID from Cloudinary URL
```javascript
const { getPublicIdFromUrl } = require('../Services/cloudinaryService');

const publicId = getPublicIdFromUrl('https://res.cloudinary.com/...');
```

## 🎯 How It Works in Gallery Controller

### Creating/Adding Gallery
```javascript
// Old: Local file storage
// New: Uploads to Cloudinary and stores URLs in database

const filePaths = files.map(f => f.path);
const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
const imageUrls = uploadedImages.map(img => img.url);

existing.images.push(...imageUrls);
await existing.save();
```

### Replacing Images
```javascript
// Deletes old images from Cloudinary and uploads new ones
const filePaths = files.map(f => f.path);
const uploadedImages = await uploadMultipleFiles(filePaths, `gallery/${categoryId}`);
const imageUrls = uploadedImages.map(img => img.url);

existing.images = imageUrls;
await existing.save();
```

### Deleting Images
```javascript
// Extracts public_id from URL and deletes from Cloudinary
const publicId = getPublicIdFromUrl(imageUrl);
if (publicId) {
  await deleteFile(publicId);
}
gallery.images.splice(imageIndex, 1);
```

## 🚀 Use in Other Controllers

To use Cloudinary in other controllers (icon, service, project, etc.):

```javascript
const { uploadFile, uploadMultipleFiles, deleteFile } = require('../Services/cloudinaryService');

// In your controller function:
const result = await uploadFile(req.files[0].path, 'icons');
const iconUrl = result.url;

// Save to database
const icon = new Icon({ 
  name: req.body.name,
  image: iconUrl,
  publicId: result.public_id  // Store for later deletion
});
await icon.save();
```

## 📝 Example Integration for Icon Controller

```javascript
const { Icon } = require('../Models/Icon');
const { uploadFile, deleteFile } = require('../Services/cloudinaryService');

const createIcon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image required' });
    }

    // Upload to Cloudinary
    const upload = await uploadFile(req.file.path, 'icons');
    
    const icon = new Icon({
      name: req.body.name,
      image: upload.url,
      publicId: upload.public_id
    });

    await icon.save();
    return res.status(201).json({ success: true, icon });
  } catch (err) {
    console.error('createIcon error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteIcon = async (req, res) => {
  try {
    const icon = await Icon.findById(req.params.iconId);
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });

    // Delete from Cloudinary
    if (icon.publicId) {
      await deleteFile(icon.publicId);
    }

    await Icon.findByIdAndDelete(req.params.iconId);
    return res.json({ success: true, message: 'Icon deleted' });
  } catch (err) {
    console.error('deleteIcon error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createIcon, deleteIcon };
```

## 🎨 Image Transformations

Cloudinary supports powerful image transformations. Examples:

```javascript
// Auto-crop to square
const squareUrl = cloudinary.url('shoes', {
  crop: 'auto',
  gravity: 'auto',
  width: 500,
  height: 500,
  fetch_format: 'auto',
  quality: 'auto'
});

// Face detection and crop
const faceUrl = cloudinary.url('shoes', {
  crop: 'fill',
  gravity: 'face',
  width: 300,
  height: 300,
  fetch_format: 'auto',
  quality: 'auto'
});

// Blur background
const blurUrl = cloudinary.url('shoes', {
  crop: 'fill',
  width: 400,
  height: 400,
  effect: 'blur:300',
  fetch_format: 'auto'
});
```

## 📊 Folder Structure in Cloudinary

Your images will be organized as:
```
gallery/
  ├── category123/
  │   ├── image1.jpg
  │   └── image2.jpg
  └── category456/
      └── image3.jpg

icons/
  ├── icon1.png
  └── icon2.png

services/
  └── service1.jpg
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** - Keep API keys private
3. **Enable CORS** - Configure allowed origins in Cloudinary
4. **Set resource limits** - Restrict max file size in routes

Example for multer middleware:
```javascript
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

## 🧪 Testing the Setup

```bash
# 1. Start your server
npm run dev

# 2. Test upload via API
# POST /aaxiero/gallery
# Body: {
#   "categoryId": "your-category-id"
# }
# Files: [image1.jpg, image2.jpg]

# 3. Check Cloudinary dashboard
# All images should appear in your cloud media library
```

## 🆘 Troubleshooting

### Images not uploading
- Check Cloudinary credentials in `.env`
- Verify `CLOUDINARY_CLOUD_NAME` is correct
- Check file permissions for temporary uploads

### "ENOENT: no such file or directory" error
- Ensure multer is configured to save files to disk
- Check path permissions for uploads directory

### Images deleted but still showing
- Clear browser cache
- Add cache-busting parameter to URL: `?v=${Date.now()}`

## 📖 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformation_reference)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)

## ✨ Next Steps

1. Add Cloudinary config to `.env`
2. Test gallery upload functionality
3. Update other controllers (icon, service, project) similarly
4. Consider adding image optimization on the frontend
5. Set up cloudinary folder cleanup (optional advanced setup)

---

**Happy uploading! 🎉**
