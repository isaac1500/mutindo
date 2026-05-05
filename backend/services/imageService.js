const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'mutindo') => {
  try {
    let uploadResult;
    
    if (file.buffer) {
      const base64String = file.buffer.toString('base64');
      const dataUri = 'data:' + file.mimetype + ';base64,' + base64String;
      uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      });
    } else if (file.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      });
    } else {
      throw new Error('No file data provided');
    }
    
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image delete failed: ' + error.message);
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
