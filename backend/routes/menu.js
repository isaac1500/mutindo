const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuItem);

// Admin only routes
router.post('/', authenticate, authorize('admin'), menuController.createMenuItem);
router.put('/:id', authenticate, authorize('admin'), menuController.updateMenuItem);
router.delete('/:id', authenticate, authorize('admin'), menuController.deleteMenuItem);

module.exports = router;