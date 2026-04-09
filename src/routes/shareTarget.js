const express = require('express');
const router = express.Router();
const shareTargetController = require('../controllers/shareTargetController');

// GET share target confirmation page
router.get('/', shareTargetController.handleShareTarget);

// POST save shared link
router.post('/save', shareTargetController.saveSharedLink);

module.exports = router;
