const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Place your local images in backend/uploads/ folder first
async function uploadImages() {
  const images = [
    { name: 'hero-bg', file: 'hero-bg.jpg' },
    { name: 'rolex', file: 'rolex.jpg' },
    { name: 'matooke', file: 'matooke.jpg' },
    { name: 'pilau', file: 'pilau.jpg' }
  ];
  
  for (const image of images) {
    try {
      const result = await cloudinary.uploader.upload(
        path.join(__dirname, '../uploads', image.file),
        {
          folder: 'mutindo',
          public_id: image.name
        }
      );
      console.log(`✅ Uploaded ${image.name}: ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${image.name}:`, error.message);
    }
  }
}

uploadImages();