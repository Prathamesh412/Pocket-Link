const Link = require('../models/Link');
const { scrapeLink } = require('../utils/scraper');

/**
 * Handle PWA share target functionality
 */
exports.handleShareTarget = async (req, res) => {
  try {
    const { url, text, title } = req.query;

    if (!url) {
      return res.status(400).render('share-error', {
        error: 'URL is required',
      });
    }

    // Scrape metadata
    const metadata = await scrapeLink(url);

    // Render confirmation page
    res.render('quick-save', {
      url: metadata.url || url,
      title: metadata.title || title || 'Untitled',
      description: metadata.description || text || '',
      image: metadata.image,
      readingTime: metadata.readingTime,
      streamingService: metadata.streamingService,
    });
  } catch (error) {
    console.error('Share target error:', error);
    res.status(500).render('share-error', {
      error: 'Failed to process shared link',
    });
  }
};

/**
 * Save shared link from quick-save confirmation
 */
exports.saveSharedLink = async (req, res) => {
  try {
    const { url, title, description, bucket, tags } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Scrape metadata
    const metadata = await scrapeLink(url);

    // Create new link
    const link = new Link({
      ...metadata,
      title: title || metadata.title,
      description: description || metadata.description,
      bucket: bucket || 'Inbox',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    });

    await link.save();
    res.json({ success: true, link });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
