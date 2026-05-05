const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to your JSON files
const DATA_PATH = path.join(__dirname, '../../frontend/public/data');

// GET endpoints
router.get('/home', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_PATH, 'home.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Home content not found' });
  }
});

router.get('/about', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_PATH, 'about.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'About content not found' });
  }
});

router.get('/gallery', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_PATH, 'gallery.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Gallery content not found' });
  }
});

router.get('/catering', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_PATH, 'catering.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Catering content not found' });
  }
});

// PUT endpoints
router.put('/home', async (req, res) => {
  try {
    await fs.writeFile(path.join(DATA_PATH, 'home.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Home content saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save home content' });
  }
});

router.put('/about', async (req, res) => {
  try {
    await fs.writeFile(path.join(DATA_PATH, 'about.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'About content saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save about content' });
  }
});

router.put('/gallery', async (req, res) => {
  try {
    await fs.writeFile(path.join(DATA_PATH, 'gallery.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Gallery content saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save gallery content' });
  }
});

router.put('/catering', async (req, res) => {
  try {
    await fs.writeFile(path.join(DATA_PATH, 'catering.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Catering content saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save catering content' });
  }
});

module.exports = router;
