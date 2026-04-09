// Utility functions for the app

/**
 * Format date to readable string
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Share via Web Share API if available
 */
async function shareLink(link) {
  if (!navigator.share) {
    // Fall back to copying URL
    if (await copyToClipboard(link.url)) {
      showToast('📋 Link copied to clipboard');
    }
    return;
  }

  try {
    await navigator.share({
      title: link.title,
      text: link.description,
      url: link.url,
    });
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error sharing:', err);
    }
  }
}

/**
 * Open link card menu
 */
function openLinkCardMenu(link) {
  // For now, navigate to the link
  window.open(link.url, '_blank');
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if URL is valid
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get browser language
 */
function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage;
}

/**
 * Detect if device is mobile
 */
function isMobile() {
  return window.innerWidth < 768;
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    copyToClipboard,
    shareLink,
    debounce,
    isValidUrl,
    getBrowserLanguage,
    isMobile,
  };
}
