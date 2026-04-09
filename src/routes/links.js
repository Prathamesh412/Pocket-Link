const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET tags (must come before /:id route)
router.get('/tags/all', linkController.getAllTags);

// GET bucket statistics
router.get('/stats/buckets', linkController.getBucketStats);

// GET all links with optional filtering
router.get('/', linkController.getAllLinks);

// GET single link
router.get('/:id', linkController.getLinkById);

// POST create new link
router.post('/', linkController.createLink);

// PUT update link
router.put('/:id', linkController.updateLink);

// DELETE link
router.delete('/:id', linkController.deleteLink);

// POST bulk delete
router.post('/bulk/delete', linkController.bulkDeleteLinks);

// POST bulk move to bucket
router.post('/bulk/move', linkController.bulkMoveToBucket);

module.exports = router;
