const axios = require('axios');
const metascraper = require('metascraper');
const metascraperDescription = require('metascraper-description');
const metascraperImage = require('metascraper-image');
const metascraperTitle = require('metascraper-title');
const metascraperUrl = require('metascraper-url');

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
  metascraperUrl(),
]);

const STREAMING_SERVICES = {
  netflix: { name: 'Netflix', domain: 'netflix.com' },
  youtube: { name: 'YouTube', domain: 'youtube.com' },
  crunchyroll: { name: 'Crunchyroll', domain: 'crunchyroll.com' },
};

/**
 * Detect streaming service from URL
 */
function detectStreamingService(url) {
  const urlLower = url.toLowerCase();
  for (const [key, service] of Object.entries(STREAMING_SERVICES)) {
    if (urlLower.includes(service.domain)) {
      return service.name;
    }
  }
  return null;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

/**
 * Extract main text content from HTML
 */
function extractTextContent(html) {
  // Simple text extraction - remove scripts, styles, and tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text.slice(0, 5000); // Limit to first 5000 chars for performance
}

/**
 * Scrape metadata from a URL
 */
async function scrapeLink(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Get metadata using metascraper
    const metadata = await scraper({ html, url });

    // Extract text for reading time calculation
    const textContent = extractTextContent(html);
    const readingTime = calculateReadingTime(textContent);

    // Detect streaming service
    const streamingService = detectStreamingService(url);

    return {
      url: metadata.url || url,
      title: metadata.title || 'Untitled',
      description: metadata.description || '',
      image: metadata.image || null,
      readingTime,
      streamingService,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    
    // Return minimal metadata on error
    return {
      url,
      title: 'Untitled',
      description: '',
      image: null,
      readingTime: 0,
      streamingService: detectStreamingService(url),
    };
  }
}

module.exports = {
  scrapeLink,
  detectStreamingService,
  calculateReadingTime,
};
