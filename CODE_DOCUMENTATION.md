# 📖 BucketLink - Code Documentation

Comprehensive technical documentation of the BucketLink codebase architecture, components, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Authentication Flow](#authentication-flow)
6. [AI Integration](#ai-integration)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [Key Features Implementation](#key-features-implementation)
10. [Error Handling](#error-handling)

---

## Architecture Overview

BucketLink follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────┐
│              Frontend (PWA)                      │
│  HTML, CSS, Vanilla JS, Service Worker          │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/REST API
                  │
┌─────────────────▼───────────────────────────────┐
│           Backend (Express.js)                  │
│  Routes, Controllers, Middleware                │
└─────────────────┬───────────────────────────────┘
                  │ MongoDB Protocol
                  │
┌─────────────────▼───────────────────────────────┐
│         Database (MongoDB)                      │
│   Collections: Users, Links                     │
└─────────────────────────────────────────────────┘
```

### Tech Stack Rationale

| Component | Technology | Reason |
|-----------|-----------|--------|
| Runtime | Node.js | Async I/O, JavaScript ecosystem |
| Framework | Express.js | Lightweight, flexible routing |
| Database | MongoDB | Flexible schema, JSON-like documents |
| ODM | Mongoose | Schema validation, middleware support |
| Auth | JWT + bcryptjs | Stateless, secure password hashing |
| AI | Google Generative AI | State-of-art language models |
| Web Scraping | Metascraper | Reliable metadata extraction |
| Frontend | Vanilla JS | No dependencies, full control |
| CSS | TailwindCSS | Utility-first, production-ready |
| PWA | Service Worker | Offline support, native app feel |

---

## Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,                          // User's display name
  email: String (unique, lowercase),     // Unique email identifier
  password: String (hashed),             // bcryptjs hashed password
  avatar: String (default: null),        // User avatar URL
  createdAt: Date,                       // Account creation timestamp
  updatedAt: Date                        // Last update timestamp
}
```

**Indexes:**
- `email`: Unique, for fast authentication lookups
- `createdAt`: For sorting users by signup date

**Validation Rules:**
- Email must be valid format and unique
- Password must be hashed before storage
- Name must be between 2-50 characters

### Link Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),          // Link owner
  url: String (required, unique per user), // Full URL to resource
  title: String (required),              // Link title
  description: String,                   // User's personal notes
  aiDescription: String,                 // AI-generated summary
  image: String (default: null),         // Thumbnail/cover image URL
  bucket: String (enum),                 // Category: Inbox, Watchlist, Kitchen, Reading, Reference
  tags: [String],                        // User-assigned tags (lowercase)
  aiTags: [String],                      // AI-generated tag suggestions
  readingTime: Number,                   // Estimated reading time in minutes
  streamingService: String (enum),       // Netflix, YouTube, Crunchyroll, Other, null
  createdAt: Date,                       // When link was added
  updatedAt: Date                        // Last modification time
}
```

**Indexes:**
```javascript
{ userId: 1, bucket: 1 }                 // For filtering by bucket
{ userId: 1, title: 'text', description: 'text' } // Full-text search
```

**Field Explanations:**

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `url` | String | The actual link destination | `https://example.com` |
| `title` | String | Display name (auto-scraped if not provided) | `"Amazing JavaScript Tutorial"` |
| `description` | String | User's personal notes/thoughts | `"Read this for a deep dive into async/await"` |
| `aiDescription` | String | AI-generated 2-3 sentence summary | `"Comprehensive guide explaining..."` |
| `tags` | Array | User-created categories | `["javascript", "tutorial", "async"]` |
| `aiTags` | Array | AI-suggested tags saved to DB | `["web-development", "learning", "reference"]` |
| `bucket` | String | One of 5 predefined categories | `"Reading"` |
| `readingTime` | Number | Calculated from word count | `12` (minutes) |
| `streamingService` | String | Auto-detected from domain | `"Netflix"` |

---

## Backend Components

### 1. Server Entry Point (`server.js`)

**Responsibilities:**
- Initialize Express application
- Configure middleware (CORS, JSON, static files)
- Connect to MongoDB
- Register all routes
- Start HTTP server

**Key Code:**
```javascript
// Middleware setup
app.use(cors());                           // Enable cross-origin requests
app.use(express.json());                   // Parse JSON payloads
app.use(express.static('public'));        // Serve static files

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes registration
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/links', require('./src/routes/links'));
app.use('/api/ai', require('./src/routes/ai'));
// ... more routes

// Server startup
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
```

---

### 2. Controllers

#### `authController.js`

**Endpoints:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

**Register Flow:**
```
1. Validate email format and uniqueness
2. Check password strength (min 6 chars)
3. Hash password with bcryptjs (10 salt rounds)
4. Create User document in MongoDB
5. Generate JWT token with userId
6. Return user object and token
```

**Code Snippet:**
```javascript
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = new User({
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0]
  });

  await user.save();

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    user: { _id: user._id, email: user.email, name: user.name },
    token
  });
};
```

---

#### `linkController.js`

**Core Methods:**

**`getAllLinks()`**
- Fetches links for authenticated user
- Supports filtering by bucket, tag, search query
- Returns sorted array (newest first)

```javascript
exports.getAllLinks = async (req, res) => {
  const { bucket, tag, search } = req.query;
  let query = { userId: req.userId };  // Filter by user

  if (bucket) query.bucket = bucket;
  if (tag) query.tags = { $in: [tag.toLowerCase()] };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [search.toLowerCase()] } }
    ];
  }

  const links = await Link.find(query).sort({ createdAt: -1 });
  res.json(links);
};
```

**`createLink()`**
- Validates URL format
- Scrapes metadata from URL (title, description, image)
- Detects streaming services
- Calculates reading time
- Creates Link document

```javascript
exports.createLink = async (req, res) => {
  const { url, bucket, tags } = req.body;

  // Scrape metadata
  const metadata = await scrapeLink(url);

  // Create link
  const link = new Link({
    ...metadata,
    userId: req.userId,
    bucket: bucket || 'Inbox',
    tags: (tags || []).map(t => t.toLowerCase())
  });

  await link.save();
  res.status(201).json(link);
};
```

**`updateLink()`**
- Verifies user ownership before update
- Allows partial updates (description, tags, aiDescription, aiTags, bucket)
- Returns updated document

**`deleteLink()`**
- Checks ownership
- Removes link from database
- Returns success message

---

#### `aiController.js`

**AI Integration Methods:**

**`generateTags()`**
- Uses Google Generative AI (Gemini)
- Generates 5-8 relevant tags based on link content
- Returns array of tags

```javascript
exports.generateTags = async (req, res) => {
  const { title, description, url, existingTags } = req.body;

  const prompt = `Generate 5-8 relevant, lowercase tags for this content:
Title: ${title}
Description: ${description}
URL: ${url}

Return ONLY comma-separated tags, nothing else.`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = await result.response.text();

  const tags = text
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length < 30)
    .slice(0, 8);

  res.json({ success: true, tags, tagString: tags.join(', ') });
};
```

**`generateDescription()`**
- Creates 2-3 sentence AI summary
- Returns engaging description suitable for preview

---

### 3. Routes

Routes map HTTP requests to controller methods.

**`routes/links.js` Example:**
```javascript
router.get('/', authMiddleware, linkController.getAllLinks);        // List links
router.post('/', authMiddleware, linkController.createLink);        // Create
router.get('/:id', authMiddleware, linkController.getLinkById);     // Get one
router.put('/:id', authMiddleware, linkController.updateLink);      // Update
router.delete('/:id', authMiddleware, linkController.deleteLink);   // Delete
router.post('/bulk/delete', authMiddleware, linkController.bulkDeleteLinks);
router.post('/bulk/move', authMiddleware, linkController.bulkMoveToBucket);
```

---

### 4. Middleware

#### `middleware/auth.js`

**JWT Authentication Middleware**

Extracts and verifies JWT token from request headers or cookies:

```javascript
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // Attach userId to request
    req.user = decoded;            // Attach full user object
    next();                         // Continue to protected route
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Token Structure:**
```javascript
{
  userId: "64a5f2c8...",  // User ID
  email: "user@example.com",
  iat: 1234567890,        // Issued at timestamp
  exp: 1234654290         // Expiration timestamp (7 days)
}
```

---

### 5. Utilities

#### `utils/scraper.js`

**Web Scraping Service**

Extracts metadata from URLs using metascraper library:

```javascript
exports.scrapeLink = async (url) => {
  try {
    const { body } = await axios.get(url, { timeout: 5000 });
    const metadata = await scraper({ html: body, url });

    return {
      title: metadata.title || new URL(url).hostname,
      description: metadata.description || '',
      image: metadata.image || null,
      url: url,
      readingTime: calculateReadingTime(metadata.description),
      streamingService: detectStreamingService(url)
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return { title: new URL(url).hostname, url };
  }
};
```

**Key Functions:**
- `calculateReadingTime()` - Estimates reading time based on word count (200 words/min)
- `detectStreamingService()` - Identifies if URL is from Netflix, YouTube, or Crunchyroll
- `extractTextContent()` - Parses HTML to extract plain text

---

## Frontend Components

### 1. HTML Structure (`public/index.html`)

**Main Sections:**

```html
<!-- Sidebar Navigation -->
<aside id="sidebar">
  - Logo and branding
  - Quick action buttons (Add Link, Select Mode, Search)
  - Bucket list for filtering
  - Tag cloud for trending tags
</aside>

<!-- Main Content Area -->
<main>
  - Top bar with page title and stats
  - Search bar (hidden by default on mobile)
  - Links grid/masonry layout
</main>

<!-- Detail View Modal -->
<div id="detailViewModal">
  - Link title and URL
  - Your Notes (editable textarea)
  - AI Summary (auto-generated)
  - Your Tags (editable)
  - AI Suggested Tags (clickable)
  - Save Changes button
</div>

<!-- Add/Edit Link Modal -->
<div id="linkModal">
  - URL input field
  - Title input
  - Description textarea
  - Bucket selector
  - Tags input
  - Submit button
</div>
```

---

### 2. JavaScript Application (`public/js/app.js`)

**Global State Management:**
```javascript
const state = {
  allLinks: [],              // All links from server
  filteredLinks: [],         // Links after applying filters
  visibleBucket: null,       // Currently selected bucket
  visibleTag: null,          // Currently selected tag
  searchQuery: '',           // Current search text
  selectedLinks: new Set(),  // Selected links in select mode
  isSelectMode: false,       // Toggle select mode
  editingLinkId: null        // Link being edited
};
```

---

#### Key Functions

**`initApp()`**
- Entry point for application
- Calls: loadAllLinks(), loadTags(), renderBuckets(), renderLinks(), setupEventListeners()

**`loadAllLinks()`**
- Fetches all links from `/api/links`
- Stores in `state.allLinks`
- Calls `applyFilters()` to update `filteredLinks`

```javascript
async function loadAllLinks() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/links', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  state.allLinks = Array.isArray(data) ? data : [];
  applyFilters();
}
```

**`applyFilters()`**
- Filters `allLinks` based on state (bucket, tag, search)
- Returns filtered array to `filteredLinks`
- Triggers `renderLinks()`

```javascript
function applyFilters() {
  let filtered = [...state.allLinks];

  if (state.visibleBucket) {
    filtered = filtered.filter(link => link.bucket === state.visibleBucket);
  }

  if (state.visibleTag) {
    filtered = filtered.filter(link => link.tags.includes(state.visibleTag));
  }

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(link =>
      link.title.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      link.tags.some(tag => tag.includes(query))
    );
  }

  state.filteredLinks = filtered;
  renderLinks();
}
```

**`renderLinks()`**
- Transforms `filteredLinks` to HTML cards
- Maps each link to `createLinkCard()`
- Attaches event listeners
- Shows empty state if no links

```javascript
function renderLinks() {
  const linksList = document.getElementById('linksList');
  
  if (state.filteredLinks.length === 0) {
    linksList.classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    return;
  }

  linksList.innerHTML = state.filteredLinks
    .map((link, idx) => createLinkCard(link, idx))
    .join('');

  // Attach event listeners
  document.querySelectorAll('.link-card').forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (!state.isSelectMode && !e.target.closest('button')) {
        showDetailView(e, state.filteredLinks[idx]._id);
      }
    });
  });
}
```

**`createLinkCard(link, idx)`**
- Generates HTML for a single link card
- Includes: image, title, description, tags, action buttons
- Returns template string

```javascript
function createLinkCard(link, idx) {
  return `
    <div class="link-card card relative overflow-hidden group fade-in" data-id="${link._id}">
      ${link.image ? `<img src="${link.image}" alt="${link.title}" class="card-image">` : ''}
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-slate-900">${escapeHtml(link.title)}</h3>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100">
            <button class="btn-icon" onclick="editLink('${link._id}')">✎</button>
            <button class="btn-icon" onclick="deleteLink('${link._id}')">🗑️</button>
          </div>
        </div>
        <p class="text-xs text-gray-600 line-clamp-2 mb-3">${escapeHtml(link.description)}</p>
        ${link.tags.length > 0 ? `
          <div class="mt-3 flex flex-wrap gap-1">
            ${link.tags.slice(0, 3).map(tag => 
              `<span class="tag text-xs">${tag}</span>`
            ).join('')}
          </div>
        ` : ''}
        <div class="mt-3">
          <button class="btn-secondary text-xs w-full" onclick="showDetailView(event, '${link._id}')">View Details</button>
        </div>
      </div>
    </div>
  `;
}
```

**`showDetailView(event, linkId)`**
- Opens modal with full link details
- Populates form fields with current data
- Generates AI tags if not available
- Generates AI description if not cached

```javascript
async function showDetailView(event, linkId) {
  event.preventDefault();
  event.stopPropagation();
  
  const link = state.allLinks.find(l => l._id === linkId);
  state.currentDetailLinkId = linkId;

  // Populate fields
  document.getElementById('detailTitle').textContent = link.title;
  document.getElementById('detailUserNotes').value = link.description || '';
  
  // Show modal
  document.getElementById('detailViewModal').classList.remove('hidden');

  // Generate AI tags if missing
  if (!link.aiTags || link.aiTags.length === 0) {
    const response = await fetch('/api/ai/generate-tags', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: link.title, description: link.description })
    });
    const data = await response.json();
    // Save to DB and display
  }
}
```

**`saveDetailChanges()`**
- Collects all user changes from modal
- Sends PUT request to update link
- Refreshes link data from server
- Closes modal

```javascript
async function saveDetailChanges() {
  const linkId = state.currentDetailLinkId;
  const userNotes = document.getElementById('detailUserNotes').value.trim();
  const tagsInput = document.getElementById('detailTagsInput').value.trim();
  const aiDesc = document.getElementById('detailDescription').textContent.trim();

  const tags = tagsInput
    ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [];

  await fetch(`/api/links/${linkId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      description: userNotes,
      tags: tags,
      aiDescription: aiDesc
    })
  });

  await loadAllLinks();
  closeDetailView();
  showToast('✅ Changes saved successfully');
}
```

---

### 3. Service Worker (`public/service-worker.js`)

**Caching Strategy:**

```javascript
// Cache name - change to v5, v6, etc. to invalidate cache
const CACHE_NAME = 'web-links-v5';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/js/app.js',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

---

## Authentication Flow

### Registration Flow

```
User → Browser → Express Server → MongoDB
  1. POST /api/auth/register with email, password
  2. Server validates input
  3. Server hashes password with bcryptjs
  4. Server creates User document in MongoDB
  5. Server generates JWT token
  6. Server returns user object + token
  7. Browser stores token in localStorage
  8. Browser redirects to app
```

### Login Flow

```
User → Browser → Express Server → MongoDB
  1. POST /api/auth/login with email, password
  2. Server finds User by email
  3. Server compares password with bcryptjs.compare()
  4. If match: generate JWT token, return user object + token
  5. If no match: return 401 Unauthorized
  6. Browser stores token in localStorage
  7. All subsequent API calls include token in Authorization header
```

### Protected Route Flow

```
Authenticated Request:
  1. Browser sends: Authorization: Bearer <JWT_TOKEN>
  2. Middleware extracts token from header
  3. Middleware verifies token with jwt.verify()
  4. If valid: attach userId to request, call next()
  5. If invalid: return 401 Unauthorized
  6. Controller receives request with req.userId set
  7. Controller filters data by userId for privacy
```

**Token Storage:**
```javascript
// Save after login
localStorage.setItem('token', response.token);

// Retrieve for API calls
const token = localStorage.getItem('token');
fetch('/api/links', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Clear on logout
localStorage.removeItem('token');
```

---

## AI Integration

### AI Tag Generation

**Process:**
1. User views link details without AI tags
2. Frontend calls `POST /api/ai/generate-tags` with link metadata
3. AI receives prompt with title, description, URL
4. AI generates 5-8 relevant tags
5. Frontend saves tags to database via PUT request
6. Tags displayed in "Suggested Tags" section
7. User can click tags to add to personal tags

**Prompt Engineering:**
```
You are a helpful assistant that generates relevant tags for web content.

Content to tag:
Title: [link title]
Description: [link description]
URL: [link url]

Generate 5-8 relevant, lowercase tags that are:
- Single words or very short phrases (1-3 words max)
- Relevant to the content
- Useful for categorization
- Not duplicates of existing tags

Return ONLY the tags as comma-separated list.
```

### AI Description Generation

**Process:**
1. User opens link details
2. Frontend checks if `aiDescription` exists in database
3. If not, frontend calls `POST /api/ai/generate-description`
4. AI creates 2-3 sentence engaging summary
5. Frontend stores in database
6. Description displayed under "AI Summary" section

**Prompt Engineering:**
```
Create a SHORT 2-3 sentence description for this web content:

Title: [title]
Description: [user description]
URL: [url]
Tags: [tags]

Write ONLY the engaging description (2-3 sentences).
Make it sound like a product description.
```

---

## Data Flow

### Creating a Link

```
User Input → Form Submission
  ↓
Frontend POST /api/links with URL
  ↓
Server receives request
  ↓
Scrape URL metadata (title, image, description)
  ↓
Detect streaming service
  ↓
Calculate reading time
  ↓
Create Link document in MongoDB
  ↓
Return link object to frontend
  ↓
Frontend adds to state.allLinks
  ↓
Frontend re-renders links grid
  ↓
Show success toast
```

### Editing Link Details

```
User clicks "View Details"
  ↓
showDetailView() opens modal
  ↓
Modal populated with current data
  ↓
User edits notes, tags
  ↓
Frontend auto-generates AI tags if missing
  ↓
User clicks "Save Changes"
  ↓
saveDetailChanges() collects all data
  ↓
Frontend PUT /api/links/:id with updates
  ↓
Server verifies ownership
  ↓
Server updates Link document
  ↓
Frontend reloads all links
  ↓
Modal closes, success message shown
```

### Filtering Links

```
User clicks bucket/tag/search
  ↓
Frontend updates state (visibleBucket, visibleTag, searchQuery)
  ↓
applyFilters() processes state.allLinks
  ↓
Filtered results stored in state.filteredLinks
  ↓
renderLinks() creates HTML for filtered links
  ↓
Links grid updated with matching links
```

---

## Key Features Implementation

### 1. Full-Text Search

**Database:**
```javascript
// Text index on Link schema
linkSchema.index({ userId: 1, title: 'text', description: 'text' });
```

**Frontend:**
```javascript
const query = state.searchQuery.toLowerCase();
filtered = filtered.filter(link =>
  link.title.toLowerCase().includes(query) ||
  link.description.toLowerCase().includes(query) ||
  link.tags.some(tag => tag.includes(query))
);
```

### 2. Select Mode (Bulk Operations)

**State:**
```javascript
state.isSelectMode = false;
state.selectedLinks = new Set();
```

**Toggle:**
```javascript
function toggleSelectMode() {
  state.isSelectMode = !state.isSelectMode;
  renderLinks();  // Show checkboxes
}
```

**Bulk Delete:**
```javascript
async function bulkDelete() {
  const ids = Array.from(state.selectedLinks);
  await fetch('/api/links/bulk/delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
  await loadAllLinks();
  showToast('✅ Links deleted');
}
```

### 3. Dark Mode Toggle

**Implementation:**
```javascript
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Load preference on page load
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}
```

**CSS:**
```css
/* Light mode (default) */
body { background-color: white; color: black; }

/* Dark mode */
.dark body { background-color: #0f172a; color: white; }
```

### 4. PWA Installation

**Manifest (`public/manifest.json`):**
```json
{
  "name": "BucketLink",
  "short_name": "BucketLink",
  "description": "AI-powered link manager",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1e293b",
  "background_color": "#ffffff",
  "icons": [...]
}
```

**Installation Prompt:**
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
  }
});
```

---

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await fetch('/api/links');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Error:', error);
  showToast('❌ Failed to load links');
  // Graceful fallback
}
```

### Backend Error Handling

```javascript
// Route handler with try-catch
exports.getAllLinks = async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId });
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
};

// Global error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
```

### Common Error Scenarios

| Scenario | Status | Response |
|----------|--------|----------|
| No token | 401 | `{ error: 'No token provided' }` |
| Invalid token | 401 | `{ error: 'Invalid token' }` |
| User not found | 404 | `{ error: 'User not found' }` |
| Duplicate email | 409 | `{ error: 'Email already registered' }` |
| Link not found | 404 | `{ error: 'Link not found' }` |
| Unauthorized access | 403 | `{ error: 'Not authorized' }` |
| Server error | 500 | `{ error: 'Internal Server Error' }` |

---

## Performance Optimizations

### Database Indexes

```javascript
// Link.js - Fast queries by user and bucket
linkSchema.index({ userId: 1, bucket: 1 });

// Full-text search on title and description
linkSchema.index({ userId: 1, title: 'text', description: 'text' });
```

### Frontend Caching

```javascript
// Service Worker caches static assets
const staticAssets = ['/', '/index.html', '/styles.css', '/js/app.js'];

// API responses cached as fallback
// Cache-first for assets, network-first for API
```

### Image Optimization

```javascript
// Links display images with lazy loading
<img src="${link.image}" lazy>

// Fallback if image fails to load
onerror="this.style.display='none'"
```

### Pagination (Potential Enhancement)

```javascript
// Add skip/limit to getAllLinks
const links = await Link.find(query)
  .sort({ createdAt: -1 })
  .skip(page * limit)
  .limit(limit);
```

---

## Security Considerations

### Password Security

```javascript
// Hash with bcryptjs (10 salt rounds = slow hashing)
const hashedPassword = await bcrypt.hash(password, 10);

// Compare on login
const isValid = await bcrypt.compare(providedPassword, hashedPassword);
```

### JWT Security

```javascript
// Secret should be long, random string
JWT_SECRET=your_super_secret_jwt_key_change_in_production

// Token expires after 7 days
jwt.sign(payload, secret, { expiresIn: '7d' });
```

### Data Privacy

```javascript
// All queries filtered by userId
const links = await Link.find({ userId: req.userId });

// Prevents users from accessing other users' data
```

### Input Validation

```javascript
// Sanitize HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;  // textContent automatically escapes
  return div.innerHTML;
}

// Validate email format
if (!email.includes('@')) return error;
```

---

## Future Enhancements

1. **Sharing** - Allow users to share link collections
2. **Collaboration** - Multiple users can edit shared collections
3. **Export** - Download links as JSON or CSV
4. **Import** - Bulk import from browser bookmarks
5. **Analytics** - Track most-visited links, click statistics
6. **Recommendations** - AI-powered link suggestions
7. **Browser Extension** - Quick add links from anywhere
8. **Advanced Search** - Date range filters, tag combinations
9. **Comments** - Users can annotate links
10. **Webhooks** - Trigger actions on link events

---

## Troubleshooting Guide

### AI Features Not Working

**Issue:** AI tags/descriptions not generating

**Solutions:**
1. Check `GEMINI_API_KEY` in `.env`
2. Verify API key still active at [makersuite.google.com](https://makersuite.google.com)
3. Check API quota not exceeded
4. Review server logs for error messages

### Database Issues

**Issue:** MongoDB connection error

**Solutions:**
1. Verify MongoDB is running locally (`mongod`)
2. Check connection string format
3. Verify network access rules in MongoDB Atlas
4. Ensure credentials are correct

### Frontend Not Updating

**Issue:** Changes not reflected in UI

**Solutions:**
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache: DevTools → Application → Clear Site Data
3. Check browser console for JavaScript errors (F12)
4. Verify API responses in Network tab

---

## Testing Recommendations

### Unit Tests

```javascript
// Example test for escapeHtml utility
test('escapeHtml prevents XSS', () => {
  const input = '<script>alert("xss")</script>';
  const output = escapeHtml(input);
  expect(output).toContain('&lt;script&gt;');
});
```

### Integration Tests

```javascript
// Test API endpoint
test('POST /api/links creates link', async () => {
  const response = await request(app)
    .post('/api/links')
    .set('Authorization', `Bearer ${token}`)
    .send({ url: 'https://example.com' });
  
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('_id');
});
```

### E2E Tests

```javascript
// Test complete user flow
test('User can register, login, and add link', async () => {
  // Register
  // Login
  // Add link
  // Verify link appears in list
});
```

---

## Conclusion

BucketLink demonstrates modern full-stack development practices:
- RESTful API design
- JWT authentication
- MongoDB data modeling
- Vanilla JavaScript DOM manipulation
- PWA capabilities
- AI integration
- Responsive design

For detailed API documentation, see `API.md`.
For deployment instructions, see `DEPLOYMENT.md`.

**Last Updated:** April 9, 2026
**Version:** 1.0.0
