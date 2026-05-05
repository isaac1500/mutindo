const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const { authenticate, authorize } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP are allowed.'));
    }
  }
});

// Get all images (public)
router.get('/', async (req, res) => {
  try {
    const { category, isActive, limit = 50 } = req.query;
    
    let query = db.collection('images');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const images = [];
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images' });
  }
});

// Get single image by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('images').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    res.json({ success: true, image: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch image' });
  }
});

// Upload image (admin only)
router.post('/upload', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    const { title, description, category, tags, alt } = req.body;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mutindo-catering',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });
    
    // Save to Firestore
    const imageData = {
      title: title || 'Untitled',
      description: description || '',
      category: category || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      alt: alt || title || 'Gallery image',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('images').add(imageData);
    
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: { id: docRef.id, ...imageData }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
});

// Update image metadata (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, tags, alt, isActive } = req.body;
    
    // Check if image exists
    const imageDoc = await db.collection('images').doc(req.params.id).get();
    if (!imageDoc.exists) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(tags && { tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags }),
      ...(alt && { alt }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('images').doc(req.params.id).update(updateData);
    
    // Get updated image
    const updatedDoc = await db.collection('images').doc(req.params.id).get();
    
    res.json({ 
      success: true, 
      message: 'Image updated successfully',
      image: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ success: false, message: 'Failed to update image' });
  }
});

// Delete image (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doc = await db.collection('images').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    const imageData = doc.data();
    
    // Delete from Cloudinary
    if (imageData.publicId) {
      await cloudinary.uploader.destroy(imageData.publicId);
    }
    
    // Delete from Firestore
    await db.collection('images').doc(req.params.id).delete();
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// Bulk upload images (admin only)
router.post('/bulk-upload', authenticate, authorize('admin'), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }
    
    const { category, tags } = req.body;
    const uploadedImages = [];
    const errors = [];
    
    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'mutindo-catering',
              allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
              transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          uploadStream.end(file.buffer);
        });
        
        // Save to Firestore
        const imageData = {
          title: file.originalname.split('.')[0],
          description: '',
          category: category || 'general',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          alt: file.originalname.split('.')[0],
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('images').add(imageData);
        uploadedImages.push({ id: docRef.id, ...imageData });
      } catch (error) {
        errors.push({ file: file.originalname, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Uploaded ${uploadedImages.length} images successfully`,
      uploaded: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
});

// Get images by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const snapshot = await db.collection('images')
      .where('category', '==', category)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    const images = [];
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching images by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images' });
  }
});

// Toggle image active status (admin only)
router.patch('/:id/toggle', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doc = await db.collection('images').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    const currentStatus = doc.data().isActive;
    await db.collection('images').doc(req.params.id).update({
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: `Image ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: !currentStatus
    });
  } catch (error) {
    console.error('Error toggling image status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle image status' });
  }
});

module.exports = router;