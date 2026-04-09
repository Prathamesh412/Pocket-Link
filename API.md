# Web Links API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication required. Add basic auth or JWT for production.

---

## Links Endpoints

### Get All Links
**Endpoint:** `GET /links`

**Query Parameters:**
- `bucket` (string): Filter by bucket name (Inbox, Watchlist, Kitchen, Reading, Reference)
- `tag` (string): Filter by single tag (case-insensitive)
- `search` (string): Full-text search in title, description, tags

**Examples:**
```bash
# Get all links
curl http://localhost:3000/api/links

# Get links from Reading bucket
curl "http://localhost:3000/api/links?bucket=Reading"

# Get links tagged with 'javascript'
curl "http://localhost:3000/api/links?tag=javascript"

# Search for 'react'
curl "http://localhost:3000/api/links?search=react"

# Combine filters
curl "http://localhost:3000/api/links?bucket=Reading&tag=tutorial"
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "url": "https://mdn.org/docs",
    "title": "MDN Web Docs",
    "description": "The #1 resource for web development",
    "image": "https://example.com/image.jpg",
    "bucket": "Reference",
    "tags": ["mdn", "documentation", "web"],
    "readingTime": 15,
    "streamingService": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Single Link
**Endpoint:** `GET /links/:id`

**Parameters:**
- `id` (string, required): MongoDB ObjectId

**Example:**
```bash
curl http://localhost:3000/api/links/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://example.com",
  "title": "Example",
  "description": "Example link",
  "image": null,
  "bucket": "Inbox",
  "tags": [],
  "readingTime": 0,
  "streamingService": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Link doesn't exist

---

### Create Link (with Auto-Scraping)
**Endpoint:** `POST /links`

**Request Body:**
```json
{
  "url": "https://example.com",
  "bucket": "Inbox",
  "tags": ["tech", "tutorial"],
  "title": "Optional - will auto-fetch if empty",
  "description": "Optional custom description"
}
```

**Parameters:**
- `url` (string, required): Valid HTTP/HTTPS URL
- `bucket` (string, optional): One of [Inbox, Watchlist, Kitchen, Reading, Reference] (default: Inbox)
- `tags` (array, optional): Array of lowercase tag strings
- `title` (string, optional): Custom title (auto-fetched if empty)
- `description` (string, optional): Custom description

**Example:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://developer.mozilla.org/docs",
    "bucket": "Reference",
    "tags": ["web", "docs"],
  }'
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://developer.mozilla.org/docs",
  "title": "MDN Web Docs",
  "description": "The standard reference for web development",
  "image": "https://example.com/mdn-logo.png",
  "bucket": "Reference",
  "tags": ["web", "docs"],
  "readingTime": 25,
  "streamingService": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `400 Bad Request`: URL is required or invalid
- `500 Internal Server Error`: Scraping failed (still creates with minimal data)

---

### Update Link
**Endpoint:** `PUT /links/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "bucket": "Reading",
  "tags": ["updated", "tags"]
}
```

**Note:** Fields are optional. Only provided fields are updated.

**Example:**
```bash
curl -X PUT http://localhost:3000/api/links/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "Reading",
    "tags": ["documentation", "reference"]
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://developer.mozilla.org/docs",
  "title": "MDN Web Docs",
  "description": "The standard reference for web development",
  "image": "https://example.com/mdn-logo.png",
  "bucket": "Reading",
  "tags": ["documentation", "reference"],
  "readingTime": 25,
  "streamingService": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Link doesn't exist

---

### Delete Link
**Endpoint:** `DELETE /links/:id`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/links/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "message": "Link deleted successfully"
}
```

**Errors:**
- `404 Not Found`: Link doesn't exist

---

### Bulk Delete Links
**Endpoint:** `POST /links/bulk/delete`

**Request Body:**
```json
{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/links/bulk/delete \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }'
```

**Response (200 OK):**
```json
{
  "deletedCount": 2
}
```

**Errors:**
- `400 Bad Request`: ids must be non-empty array

---

### Bulk Move to Bucket
**Endpoint:** `POST /links/bulk/move`

**Request Body:**
```json
{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "bucket": "Reference"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/links/bulk/move \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439011"],
    "bucket": "Reading"
  }'
```

**Response (200 OK):**
```json
{
  "modifiedCount": 1
}
```

**Errors:**
- `400 Bad Request`: ids is required and must be non-empty array, or bucket is missing

---

### Get All Tags
**Endpoint:** `GET /links/tags/all`

**Response (200 OK):**
```json
[
  {
    "_id": "javascript",
    "count": 15
  },
  {
    "_id": "tutorial",
    "count": 12
  },
  {
    "_id": "web",
    "count": 10
  }
]
```

Returns top 50 most used tags, sorted by count (descending).

---

### Get Bucket Statistics
**Endpoint:** `GET /links/stats/buckets`

**Response (200 OK):**
```json
{
  "Inbox": 5,
  "Watchlist": 3,
  "Kitchen": 8,
  "Reading": 12,
  "Reference": 20
}
```

---

## Share Target Endpoints

### Get Share Target Page
**Endpoint:** `GET /api/share-target`

**Query Parameters:**
- `url` (string): URL to save
- `text` (string, optional): Description/text from share
- `title` (string, optional): Title from share

**Example:**
```bash
curl "http://localhost:3000/api/share-target?url=https://example.com&title=Example&text=A%20great%20example"
```

**Response (200 OK):**
HTML confirmation page with pre-filled form

**Errors:**
- `400 Bad Request`: URL is required
- `500 Internal Server Error`: Failed to process link

---

### Save Shared Link
**Endpoint:** `POST /api/share-target/save`

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example",
  "description": "Great website",
  "bucket": "Inbox",
  "tags": ["web", "example"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/share-target/save \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "bucket": "Reference",
    "tags": ["web"]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "link": {
    "_id": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "title": "Example",
    "description": "Great website",
    "image": null,
    "bucket": "Inbox",
    "tags": ["web", "example"],
    "readingTime": 3,
    "streamingService": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: URL is required
- `500 Internal Server Error`: Failed to save

---

## Data Types

### Link Object
```typescript
{
  _id: string;              // MongoDB ObjectId
  url: string;              // Valid HTTP/HTTPS URL
  title: string;            // Page title
  description: string;      // Meta description or article summary
  image: string | null;     // URL to preview image
  bucket: string;           // One of: Inbox, Watchlist, Kitchen, Reading, Reference
  tags: string[];           // Array of lowercase tags
  readingTime: number;      // Estimated minutes
  streamingService: string | null; // Netflix, YouTube, Crunchyroll, or null
  createdAt: ISO8601;       // Creation timestamp
  updatedAt: ISO8601;       // Last update timestamp
}
```

### Bucket Values
```
"Inbox"       - Default bucket for new links
"Watchlist"   - Videos or media to watch
"Kitchen"     - Recipes
"Reading"     - Articles to read
"Reference"   - Reference materials
```

### Tag Rules
- Lowercase (auto-converted)
- Whitespace trimmed
- Array of strings
- No size limit (recommended: <20 tags per link)

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200 OK`: Successful GET or POST/PUT/DELETE
- `201 Created`: Resource created successfully (POST)
- `400 Bad Request`: Invalid input or missing required fields
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error (check logs)

---

## Rate Limiting
Currently not implemented. Recommended for production:
- Add `express-rate-limit`
- Limit to 100 requests/minute per IP

---

## CORS
Enabled for all origins in development. For production:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Web Scraping Notes

### Supported Metadata
- Title (HTML title tag, Open Graph, Twitter Card)
- Description (meta description, Open Graph)
- Image (author image, Open Graph, Twitter Card)

### Streaming Service Detection
Automatically tags:
- Netflix (netflix.com)
- YouTube (youtube.com)  
- Crunchyroll (crunchyroll.com)

### Reading Time Calculation
- Extracts main text content from HTML
- Divides word count by 200 (standard speed)
- Minimum: 1 minute
- Maximum: based on actual content

### Performance
- Scraping timeout: 10 seconds
- Max text extraction: 5000 characters
- User-Agent header included (not blocked by most sites)

### Graceful Errors
If scraping fails, the API:
- Still creates the link with the URL
- Uses URL as fallback title
- Sets image to null
- Sets readingTime to 0
- Attempts to detect streaming service

---

Generated documentation for Web Links PWA v1.0
