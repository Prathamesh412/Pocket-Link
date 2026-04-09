// Global state
const state = {
  allLinks: [],
  filteredLinks: [],
  visibleBucket: null,
  visibleTag: null,
  searchQuery: '',
  selectedLinks: new Set(),
  isSelectMode: false,
  editingLinkId: null,
};

const BUCKETS = [
  { id: 'Inbox', icon: '📮', label: 'Inbox' },
  { id: 'Watchlist', icon: '👁️', label: 'Watchlist' },
  { id: 'Kitchen', icon: '👨‍🍳', label: 'Kitchen' },
  { id: 'Reading', icon: '📖', label: 'Reading' },
  { id: 'Reference', icon: '📚', label: 'Reference' },
];

// Initialize app
async function initApp() {
  // Load links
  await loadAllLinks();
  
  // Load tag cloud
  await loadTags();
  
  // Render buckets
  renderBuckets();
  
  // Render links
  renderLinks();
  
  // Setup event listeners
  setupEventListeners();
}

// Load all links from API
async function loadAllLinks() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/links', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.allLinks = Array.isArray(data) ? data : [];
    applyFilters();
  } catch (error) {
    console.error('Error loading links:', error);
    state.allLinks = [];
    showToast('❌ Failed to load links');
  }
}

// Load tags for tag cloud
async function loadTags() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/links/tags/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const tags = await response.json();
    if (Array.isArray(tags)) {
      renderTagCloud(tags);
    } else {
      console.error('Tags is not an array:', tags);
      renderTagCloud([]);
    }
  } catch (error) {
    console.error('Error loading tags:', error);
    renderTagCloud([]);
  }
}

// Apply filters to links
function applyFilters() {
  let filtered = [...state.allLinks];

  // Filter by bucket
  if (state.visibleBucket) {
    filtered = filtered.filter(link => link.bucket === state.visibleBucket);
  }

  // Filter by tag
  if (state.visibleTag) {
    filtered = filtered.filter(link => link.tags.includes(state.visibleTag));
  }

  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(link =>
      link.title.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      link.tags.some(tag => tag.includes(query))
    );
  }

  state.filteredLinks = filtered;
}

// Render buckets in sidebar
function renderBuckets() {
  const bucketList = document.getElementById('bucketList');
  bucketList.innerHTML = BUCKETS.map(bucket => `
    <button class="bucket-btn ${state.visibleBucket === bucket.id ? 'active' : ''}" 
            onclick="selectBucket('${bucket.id}')">
      ${bucket.icon} <span>${bucket.label}</span>
      <span class="text-xs ml-auto opacity-75">(${countBucketLinks(bucket.id)})</span>
    </button>
  `).join('');
}

// Count links in a bucket
function countBucketLinks(bucket) {
  return state.allLinks.filter(link => link.bucket === bucket).length;
}

// Render tag cloud (now shows top 10 trending tags)
function renderTagCloud(tags) {
  const tagCloud = document.getElementById('tagCloud');
  const trendingLabel = document.getElementById('trendingLabel');
  
  // Show "Trending Tags" label
  if (trendingLabel) {
    trendingLabel.innerHTML = `<h3 class="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-300">📈 Trending Tags (${tags.length})</h3>`;
  }
  
  tagCloud.innerHTML = tags.map(tag => `
    <span class="tag ${state.visibleTag === tag._id ? 'active' : ''}" 
          onclick="selectTag('${tag._id}')" 
          title="${tag.count} links">
      ${tag._id} <span class="text-xs opacity-75">(${tag.count})</span>
    </span>
  `).join('');
}

// Render links grid
function renderLinks() {
  const linksList = document.getElementById('linksList');
  const emptyState = document.getElementById('emptyState');

  if (state.filteredLinks.length === 0) {
    linksList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  linksList.classList.remove('hidden');
  emptyState.classList.add('hidden');

  linksList.innerHTML = state.filteredLinks.map((link, idx) => createLinkCard(link, idx)).join('');
  
// Add checkboxes if in select mode
  if (state.isSelectMode) {
    document.querySelectorAll('.link-card').forEach((card, idx) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'link-checkbox absolute top-2 left-2 w-5 h-5 cursor-pointer';
      checkbox.checked = state.selectedLinks.has(state.filteredLinks[idx]._id);
      checkbox.onchange = () => toggleLinkSelection(idx);
      card.appendChild(checkbox);
    });
  }
}

// Create individual link card
function createLinkCard(link, idx) {
  const faviconUrl = getFaviconUrl(link.url);
  
  return `
    <div class="link-card card relative overflow-hidden group fade-in" data-id="${link._id}">
      ${link.image ? `<img src="${link.image}" alt="${link.title}" class="card-image" onerror="this.style.display='none'">` : ''}
      
      ${link.streamingService ? `
        <div class="streaming-badge">
          🎬 ${link.streamingService}
        </div>
      ` : ''}

      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-slate-900 dark:text-gray-50 line-clamp-2 flex-1 text-sm">${escapeHtml(link.title)}</h3>
          <div class="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="btn-icon" onclick="editLink('${link._id}'); event.stopPropagation()">✎</button>
            <button class="btn-icon" onclick="deleteLink('${link._id}'); event.stopPropagation()">🗑️</button>
          </div>
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">${escapeHtml(link.description || link.url)}</p>

        <div class="flex flex-wrap items-center justify-between">
          <div class="flex items-center gap-2 text-xs">
            ${link.readingTime > 0 ? `<span>⏱️ ${link.readingTime} min</span>` : ''}
            ${link.tags.length > 0 ? `<span>🏷️ ${link.tags.length}</span>` : ''}
          </div>
        </div>

        ${link.tags.length > 0 ? `
          <div class="mt-3 flex flex-wrap gap-1">
            ${link.tags.slice(0, 3).map(tag => 
              `<span class="tag text-xs" onclick="selectTag('${tag}'); event.stopPropagation()">${tag}</span>`
            ).join('')}
            ${link.tags.length > 3 ? `<span class="text-xs text-gray-500 dark:text-gray-400">+${link.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}

        <div class="mt-3">
          <button class="btn-secondary text-xs w-full" onclick="showDetailView(event, '${link._id}')">View Details</button>
        </div>
      </div>
    </div>
  `;
}

// Get favicon URL for a domain
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Select bucket
function selectBucket(bucket) {
  state.visibleBucket = state.visibleBucket === bucket ? null : bucket;
  state.visibleTag = null;
  state.searchQuery = '';
  document.getElementById('searchInput').value = '';
  applyFilters();
  updatePageTitle();
  renderBuckets();
  renderLinks();
}

// Select tag
function selectTag(tag) {
  state.visibleTag = state.visibleTag === tag ? null : tag;
  state.visibleBucket = null;
  state.searchQuery = '';
  document.getElementById('searchInput').value = '';
  applyFilters();
  updatePageTitle();
  renderBuckets();
  renderLinks();
}

// Update page title
function updatePageTitle() {
  const titleEl = document.getElementById('pageTitle');
  const statsEl = document.getElementById('statsText');

  if (state.visibleBucket) {
    const bucket = BUCKETS.find(b => b.id === state.visibleBucket);
    titleEl.textContent = `${bucket.icon} ${bucket.label}`;
  } else if (state.visibleTag) {
    titleEl.textContent = `🏷️ ${state.visibleTag}`;
  } else if (state.searchQuery) {
    titleEl.textContent = `🔍 Search: "${state.searchQuery}"`;
  } else {
    titleEl.textContent = 'All Links';
  }

  statsEl.textContent = `${state.filteredLinks.length} link${state.filteredLinks.length !== 1 ? 's' : ''}`;
}

// Toggle link selection
function toggleLinkSelection(idx) {
  const linkId = state.filteredLinks[idx]._id;
  if (state.selectedLinks.has(linkId)) {
    state.selectedLinks.delete(linkId);
  } else {
    state.selectedLinks.add(linkId);
  }
  updateSelectionUI();
  renderLinks();
}

// Update selection UI
function updateSelectionUI() {
  const selectionStats = document.getElementById('selectionStats');
  const bulkActions = document.getElementById('bulkActions');
  const selectedCount = document.getElementById('selectedCount');

  if (state.selectedLinks.size > 0) {
    selectionStats.classList.remove('hidden');
    bulkActions.classList.remove('hidden');
    selectedCount.textContent = state.selectedLinks.size;
  } else {
    selectionStats.classList.add('hidden');
    bulkActions.classList.add('hidden');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Add link button
  document.getElementById('addLinkBtn').addEventListener('click', openAddLinkModal);

  // Select mode button
  document.getElementById('selectModeBtn').addEventListener('click', toggleSelectMode);

  // Search functionality
  document.getElementById('searchToggleBtn').addEventListener('click', () => {
    document.getElementById('searchBar').classList.toggle('hidden');
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    state.visibleBucket = null;
    state.visibleTag = null;
    applyFilters();
    updatePageTitle();
    renderBuckets();
    renderLinks();
  });

  document.getElementById('clearSearchBtn').addEventListener('click', () => {
    state.searchQuery = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
    updatePageTitle();
    renderBuckets();
    renderLinks();
  });

  // Link form submission
  document.getElementById('linkForm').addEventListener('submit', handleLinkSubmit);

  // Bulk actions
  document.getElementById('deleteBtn').addEventListener('click', bulkDeleteLinks);
  document.getElementById('moveBucketBtn').addEventListener('click', () => {
    document.getElementById('moveBucketModal').classList.remove('hidden');
  });

  // Mobile menu button
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
  });

  // Close sidebar when selecting a bucket on mobile
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('bucket-btn')) {
      if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('hidden');
      }
    }
  });
}

// Open add link modal
function openAddLinkModal() {
  state.editingLinkId = null;
  document.getElementById('modalTitle').textContent = 'Add New Link';
  document.getElementById('linkForm').reset();
  document.getElementById('linkModal').classList.remove('hidden');
  document.getElementById('linkUrl').focus();
}

// Edit link
function editLink(linkId) {
  const link = state.allLinks.find(l => l._id === linkId);
  if (!link) return;

  state.editingLinkId = linkId;
  document.getElementById('modalTitle').textContent = 'Edit Link';
  document.getElementById('linkUrl').value = link.url;
  document.getElementById('linkTitle').value = link.title;
  document.getElementById('linkDescription').value = link.description;
  document.getElementById('linkBucket').value = link.bucket;
  document.getElementById('linkTags').value = link.tags.join(', ');
  document.getElementById('linkModal').classList.remove('hidden');
}

// Handle link form submission
async function handleLinkSubmit(e) {
  e.preventDefault();

  const url = document.getElementById('linkUrl').value.trim();
  if (!url) {
    showToast('❌ URL is required');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const payload = {
      url,
      title: document.getElementById('linkTitle').value || undefined,
      description: document.getElementById('linkDescription').value,
      bucket: document.getElementById('linkBucket').value,
      tags: document.getElementById('linkTags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
    };

    if (state.editingLinkId) {
      // Update existing link
      const response = await fetch(`/api/links/${state.editingLinkId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update link');
      showToast('✅ Link updated');
    } else {
      // Create new link
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create link');
      showToast('✅ Link saved');
    }

    closeModal();
    await loadAllLinks();
    await loadTags();
    renderBuckets();
    renderLinks();
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ ' + error.message);
  }
}

// Delete link
async function deleteLink(linkId) {
  if (!confirm('Delete this link?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/links/${linkId}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete');
    
    showToast('✅ Link deleted');
    await loadAllLinks();
    await loadTags();
    renderBuckets();
    renderLinks();
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Failed to delete link');
  }
}

// Bulk delete links
async function bulkDeleteLinks() {
  if (state.selectedLinks.size === 0) return;
  if (!confirm(`Delete ${state.selectedLinks.size} link(s)?`)) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/links/bulk/delete', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ ids: Array.from(state.selectedLinks) }),
    });

    if (!response.ok) throw new Error('Failed to delete');
    
    state.selectedLinks.clear();
    updateSelectionUI();
    showToast('✅ Links deleted');
    
    await loadAllLinks();
    await loadTags();
    renderBuckets();
    renderLinks();
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Failed to delete links');
  }
}

// Move selected links to bucket
async function moveToAndClose(bucket) {
  if (state.selectedLinks.size === 0) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/links/bulk/move', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        ids: Array.from(state.selectedLinks),
        bucket,
      }),
    });

    if (!response.ok) throw new Error('Failed to move links');
    
    state.selectedLinks.clear();
    updateSelectionUI();
    showToast(`✅ Moved to ${bucket}`);
    
    document.getElementById('moveBucketModal').classList.add('hidden');
    
    await loadAllLinks();
    renderBuckets();
    renderLinks();
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Failed to move links');
  }
}

// Toggle select mode
function toggleSelectMode() {
  state.isSelectMode = !state.isSelectMode;
  document.getElementById('selectModeBtn').classList.toggle('active', state.isSelectMode);
  
  if (!state.isSelectMode) {
    state.selectedLinks.clear();
    updateSelectionUI();
  }

  renderLinks();
}

// Close modal
function closeModal() {
  document.getElementById('linkModal').classList.add('hidden');
  state.editingLinkId = null;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Show detail view for a link (product detail page)
async function showDetailView(event, linkId) {
  event.preventDefault();
  event.stopPropagation();
  
  const link = state.allLinks.find(l => l._id === linkId);
  if (!link) return;

  // Store current link for saving
  state.currentDetailLinkId = linkId;

  // Populate basic info
  document.getElementById('detailTitle').textContent = link.title;
  document.getElementById('detailUrl').textContent = link.url;
  document.getElementById('detailLinkBtn').href = link.url;

  // Populate user notes
  document.getElementById('detailUserNotes').value = link.description || '';

  // Populate existing tags
  if (link.tags.length > 0) {
    document.getElementById('detailTags').innerHTML = link.tags
      .map(tag => `<span class="tag text-xs">${escapeHtml(tag)}</span>`)
      .join('');
    document.getElementById('detailTagsInput').value = link.tags.join(', ');
  } else {
    document.getElementById('detailTags').innerHTML = '<span class="text-xs text-gray-500 dark:text-gray-400">No tags</span>';
    document.getElementById('detailTagsInput').value = '';
  }

  // Populate AI tags if available
  if (link.aiTags && link.aiTags.length > 0) {
    document.getElementById('aiTagsSection').classList.remove('hidden');
    document.getElementById('detailAiTags').innerHTML = link.aiTags
      .map(tag => `<span class="tag text-xs bg-blue-200 dark:bg-blue-900 cursor-pointer hover:bg-blue-300" onclick="addTagFromAI('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`)
      .join('');
  } else {
    document.getElementById('aiTagsSection').classList.add('hidden');
  }

  // Show modal
  document.getElementById('detailViewModal').classList.remove('hidden');

  // Show AI description from DB or generate new one
  if (link.aiDescription) {
    document.getElementById('detailDescription').textContent = link.aiDescription;
  } else {
    document.getElementById('detailDescription').innerHTML = '<span class="inline-block animate-pulse">Generating AI summary...</span>';
    
    // Generate AI description
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: link.title,
          description: link.description || '',
          url: link.url,
          tags: link.tags
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiDesc = data.description || 'No description available';
        document.getElementById('detailDescription').textContent = aiDesc;
      } else {
        document.getElementById('detailDescription').textContent = 'Could not generate AI summary';
      }
    } catch (error) {
      console.error('Error generating description:', error);
      document.getElementById('detailDescription').textContent = 'Could not load AI summary';
    }
  }

  // Generate AI tags if not available
  if (!link.aiTags || link.aiTags.length === 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-tags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: link.title,
          description: link.description || '',
          url: link.url,
          existingTags: link.tags
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiTags = data.tags || [];
        
        // Save AI tags to database
        if (aiTags.length > 0) {
          await fetch(`/api/links/${linkId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ aiTags: aiTags })
          });

          // Display AI tags
          document.getElementById('aiTagsSection').classList.remove('hidden');
          document.getElementById('detailAiTags').innerHTML = aiTags
            .map(tag => `<span class="tag text-xs bg-blue-200 dark:bg-blue-900 cursor-pointer hover:bg-blue-300" onclick="addTagFromAI('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`)
            .join('');
        }
      }
    } catch (error) {
      console.error('Error generating AI tags:', error);
    }
  }
}

// Add tag from AI suggestions to user tags
function addTagFromAI(tag) {
  const input = document.getElementById('detailTagsInput');
  const currentTags = input.value ? input.value.split(',').map(t => t.trim()) : [];
  
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    input.value = currentTags.join(', ');
  }
}

// Save all changes from detail view
async function saveDetailChanges() {
  try {
    const linkId = state.currentDetailLinkId;
    const userNotes = document.getElementById('detailUserNotes').value.trim();
    const tagsInput = document.getElementById('detailTagsInput').value.trim();
    const aiDesc = document.getElementById('detailDescription').textContent.trim();
    
    // Parse tags
    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
      : [];

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/links/${linkId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: userNotes,
        tags: tags,
        aiDescription: aiDesc
      })
    });

    if (response.ok) {
      showToast('✅ Changes saved successfully');
      // Reload the link data
      await loadAllLinks();
      closeDetailView();
    } else {
      showToast('❌ Failed to save changes');
    }
  } catch (error) {
    console.error('Error saving changes:', error);
    showToast('❌ Error saving changes');
  }
}

// Generate AI Tags for current link
async function generateAITags() {
  try {
    const linkId = state.currentDetailLinkId;
    const link = state.allLinks.find(l => l._id === linkId);
    if (!link) return;

    const token = localStorage.getItem('token');
    const response = await fetch('/api/ai/generate-tags', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: link.title,
        description: link.description || '',
        url: link.url,
        existingTags: link.tags
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiTags = data.tags || [];
      
      // Save AI tags to database
      await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aiTags: aiTags })
      });

      // Display AI tags
      if (aiTags.length > 0) {
        document.getElementById('aiTagsSection').classList.remove('hidden');
        document.getElementById('detailAiTags').innerHTML = aiTags
          .map(tag => `<span class="tag text-xs bg-blue-200 dark:bg-blue-900 cursor-pointer hover:bg-blue-300" onclick="addTagFromAI('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`)
          .join('');
        showToast('🤖 AI tags generated!');
      } else {
        showToast('No AI tags generated');
      }
    } else {
      showToast('❌ Failed to generate AI tags');
    }
  } catch (error) {
    console.error('Error generating AI tags:', error);
    showToast('❌ Error generating AI tags');
  }
}

// Close detail view
function closeDetailView() {
  document.getElementById('detailViewModal').classList.add('hidden');
  state.currentDetailLinkId = null;
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', initApp);

// Close modals when clicking outside
document.getElementById('linkModal').addEventListener('click', (e) => {
  if (e.target.id === 'linkModal') closeModal();
});

document.getElementById('detailViewModal').addEventListener('click', (e) => {
  if (e.target.id === 'detailViewModal') closeDetailView();
});

document.getElementById('moveBucketModal').addEventListener('click', (e) => {
  if (e.target.id === 'moveBucketModal') {
    e.target.classList.add('hidden');
  }
});
