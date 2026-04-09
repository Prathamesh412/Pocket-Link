const mongoose = require('mongoose');
const Link = require('../models/Link');
const { scrapeLink } = require('../utils/scraper');

/**
 * Get all links with optional filtering
 */
exports.getAllLinks = async (req, res) => {
  try {
    const { bucket, tag, search } = req.query;
    let query = { userId: req.userId };  // Filter by user

    if (bucket) {
      query.bucket = bucket;
    }

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [search.toLowerCase()] } },
      ];
    }

    const links = await Link.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single link by ID
 */
exports.getLinkById = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    // Check ownership
    if (link.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new link with metadata scraping
 */
exports.createLink = async (req, res) => {
  try {
    const { url, bucket, tags } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Scrape metadata from URL
    const metadata = await scrapeLink(url);

    // Create new link
    const link = new Link({
      ...metadata,
      userId: req.userId,  // Add user ID
      bucket: bucket || 'Inbox',
      tags: tags || [],
    });

    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update link
 */
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (link.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedLink = await Link.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete link
 */
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check ownership
    if (link.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Link.findByIdAndDelete(id);
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk delete links
 */
exports.bulkDeleteLinks = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    const result = await Link.deleteMany({ 
      _id: { $in: ids },
      userId: req.userId  // Ensure user owns these links
    });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk move links to different bucket
 */
exports.bulkMoveToBucket = async (req, res) => {
  try {
    const { ids, bucket } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    if (!bucket) {
      return res.status(400).json({ error: 'bucket is required' });
    }

    const result = await Link.updateMany(
      { 
        _id: { $in: ids },
        userId: req.userId  // Ensure user owns these links
      },
      { bucket }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all tags for tag cloud
 */
exports.getAllTags = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10; // Default to top 10 trending tags
    const tags = await Link.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },  // Filter by user
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get bucket statistics
 */
exports.getBucketStats = async (req, res) => {
  try {
    const stats = await Link.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },  // Filter by user
      {
        $group: {
          _id: '$bucket',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Watchlist: 0,
      Kitchen: 0,
      Reading: 0,
      Reference: 0,
      Inbox: 0,
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
