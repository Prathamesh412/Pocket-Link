const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// AI endpoints
router.post('/generate-tags', aiController.generateTags);
router.post('/generate-description', aiController.generateDescription);

module.exports = router;
