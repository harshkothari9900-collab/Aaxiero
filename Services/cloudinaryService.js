const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

// Initialize Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path to upload
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Public ID for the resource (optional)
 * @returns {Promise<object>} Upload result with URL and public_id
 */
const uploadFile = async (filePath, folder, publicId = null) => {
    try {
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            overwrite: true,
            quality: 'auto',
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const result = await cloudinary.uploader.upload(filePath, uploadOptions);

        // Delete local file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
            format: result.format
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Clean up local file on error
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }
        throw new Error(`Upload failed: ${error.message}`);
    }
};

/**
 * Upload multiple files to Cloudinary
 * @param {array} files - Array of file paths
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<array>} Array of upload results
 */
const uploadMultipleFiles = async (files, folder) => {
    try {
        const uploadPromises = files.map(filePath =>
            uploadFile(filePath, folder)
        );

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Multiple file upload error:', error);
        throw error;
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the resource to delete
 * @param {string} resourceType - Type of resource (image, video, etc.)
 * @returns {Promise<object>} Deletion result
 */
const deleteFile = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });

        return {
            success: result.result === 'ok',
            message: result.result
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
    }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {object} options - Transformation options
 * @returns {string} Transformed image URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        fetch_format: 'auto',
        quality: 'auto',
        ...options
    };

    return cloudinary.url(publicId, defaultOptions);
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Public ID of the image
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {string} gravity - Gravity for cropping (auto, center, face, etc.)
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (publicId, width = 200, height = 200, gravity = 'auto') => {
    return cloudinary.url(publicId, {
        crop: 'fill',
        gravity: gravity,
        width: width,
        height: height,
        fetch_format: 'auto',
        quality: 'auto'
    });
};

/**
 * Generate responsive image URL
 * @param {string} publicId - Public ID of the image
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} Responsive image URL
 */
const getResponsiveUrl = (publicId, width, height) => {
    return cloudinary.url(publicId, {
        crop: 'auto',
        gravity: 'auto',
        width: width,
        height: height,
        fetch_format: 'auto',
        quality: 'auto'
    });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
const getPublicIdFromUrl = (url) => {
    try {
        // Extract public_id from URL like: https://res.cloudinary.com/{cloud}/image/upload/{public_id}.{ext}
        const match = url.match(/\/upload\/(?:.*\/)?([^/]+)\.[^.]+$/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getOptimizedUrl,
    getThumbnailUrl,
    getResponsiveUrl,
    getPublicIdFromUrl,
    cloudinary
};
