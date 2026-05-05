const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');

// GET - Public (no authentication needed - visitors can read content)
router.get('/:page', async (req, res) => {
  try {
    const doc = await db.collection('content').doc(req.params.page).get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Requires admin authentication (for Content Manager)
router.post('/:page', authenticate, authorize('admin'), async (req, res) => {
  try {
    const page = req.params.page;
    await db.collection('content').doc(page).set(req.body, { merge: true });
    console.log(`✅ Saved ${page} content to Firebase via POST`);
    res.json({ success: true, message: 'Content saved successfully' });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Requires admin authentication (for compatibility)
router.put('/:page', authenticate, authorize('admin'), async (req, res) => {
  try {
    const page = req.params.page;
    await db.collection('content').doc(page).set(req.body, { merge: true });
    console.log(`✅ Saved ${page} content to Firebase via PUT`);
    res.json({ success: true, message: 'Content saved successfully' });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;