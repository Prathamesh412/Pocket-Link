# 🔗 BucketLink - AI-Powered Link Management PWA

A full-stack Progressive Web Application (PWA) for organizing, managing, and discovering web links with AI-powered features including automatic tag generation, link descriptions, and semantic content analysis.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **📚 Link Management** - Add, edit, delete, and organize web links
- **🏪 Bucket Organization** - Categorize links into 5 custom buckets (Inbox, Watchlist, Kitchen, Reading, Reference)
- **🏷️ Smart Tagging** - Manually add tags or let AI auto-generate relevant tags
- **🔍 Full-Text Search** - Search links by title, description, tags, or bucket
- **🎬 Streaming Service Detection** - Automatic detection of Netflix, YouTube, Crunchyroll links

### AI-Powered Features
- **🤖 AI Descriptions** - Automatic generation of concise link summaries using Google Generative AI
- **🏷️ AI Tag Generation** - AI-generated tag suggestions based on link content
- **🔄 Auto-Refresh Metadata** - Scrape and cache link titles, descriptions, and images
- **⏱️ Reading Time Estimation** - Calculate estimated reading time for articles

### User Experience
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🌙 Dark Mode** - Comfortable dark theme support
- **💾 PWA Support** - Install as a native app, works offline with service worker caching
- **🔐 JWT Authentication** - Secure user authentication with token-based access
- **✏️ In-Detail View Editing** - Edit links directly from the detail view modal

### Data Management
- **📊 Bucket Statistics** - View link count per bucket
- **🏷️ Tag Cloud** - Visual representation of trending tags
- **🔐 User Privacy** - Links are isolated per user with ownership verification
- **📦 Bulk Operations** - Multi-select mode for batch delete/move operations

## 🛠 Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Generative AI** - AI text generation
- **Metascraper** - Web scraping

### Frontend
- **HTML5** - Markup
- **CSS3 & TailwindCSS** - Styling
- **JavaScript (Vanilla)** - DOM manipulation
- **Service Workers** - Offline support and caching
- **Web Manifest** - PWA configuration

### Development Tools
- **Nodemon** - Development server auto-reload
- **TailwindCSS** - Utility-first CSS framework

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - Local or cloud instance (MongoDB Atlas)
- **Git** - For version control
- **Google Generative AI API Key** - [Get it here](https://makersuite.google.com/app/apikey)

## ⚡ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bucketlink.git
cd bucketlink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/web-links

# JWT Secret (change to a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Google Generative AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Build CSS (Required)

```bash
npm run build
```

This compiles TailwindCSS from `src/input.css` to `public/styles.css`.

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | Any random string (use strong key in production) |
| `GEMINI_API_KEY` | Google Generative AI API Key | `AIza...` |

### Getting MongoDB Connection String

**Option 1: MongoDB Atlas (Recommended for Production)**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Under "Connect", get your connection string
4. Add username and password to the string

**Option 2: Local MongoDB**
```
mongodb://localhost:27017/web-links
```

### Getting Google Generative AI Key

1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy and paste into `.env`

## 🚀 Running Locally

### Development Mode (with auto-reload)

```bash
npm run dev
```

This uses Nodemon to automatically restart the server on file changes.

### Production Mode

```bash
npm start
```

Then visit: `http://localhost:3000`

### Watch CSS Changes

In a separate terminal, run:

```bash
npm run watch
```

This recompiles CSS whenever you modify `src/input.css`.

## 📦 Deployment

### Deploying to Heroku

1. **Create Heroku Account** - [heroku.com](https://www.heroku.com)

2. **Install Heroku CLI** - [Download](https://devcenter.heroku.com/articles/heroku-cli)

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_secret_key"
   heroku config:set GEMINI_API_KEY="your_api_key"
   heroku config:set NODE_ENV="production"
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Deploying to Other Platforms

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Railway:**
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically on push

**AWS/DigitalOcean:**
1. Push to GitHub
2. Connect repository to your hosting platform
3. Set environment variables
4. Deploy

## 📁 Project Structure

```
bucketlink/
├── public/                          # Static frontend files
│   ├── index.html                   # Main app page
│   ├── login.html                   # Login page
│   ├── register.html                # Registration page
│   ├── profile.html                 # User profile page
│   ├── styles.css                   # Compiled Tailwind CSS
│   ├── manifest.json                # PWA manifest
│   ├── service-worker.js            # Service worker for offline support
│   └── js/
│       ├── app.js                   # Main frontend logic
│       └── main.js                  # Utility functions
│
├── src/
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js        # Authentication logic
│   │   ├── linkController.js        # Link CRUD operations
│   │   ├── userController.js        # User profile operations
│   │   ├── aiController.js          # AI-powered features
│   │   └── shareTargetController.js # Web Share Target API
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # Auth endpoints
│   │   ├── links.js                 # Link endpoints
│   │   ├── user.js                  # User endpoints
│   │   ├── ai.js                    # AI endpoints
│   │   └── shareTarget.js           # Share target endpoints
│   │
│   ├── models/                      # Database schemas
│   │   ├── Link.js                  # Link schema
│   │   └── User.js                  # User schema
│   │
│   ├── middleware/                  # Express middleware
│   │   └── auth.js                  # JWT authentication middleware
│   │
│   ├── utils/                       # Utility functions
│   │   └── scraper.js               # Web scraping utilities
│   │
│   └── views/                       # EJS templates
│       └── *.ejs                    # Dynamic views
│
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── server.js                        # Express server entry point
├── tailwind.config.js               # Tailwind configuration
└── README.md                        # This file
```

## 🔌 API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`
- Register a new user
- Body: `{ email, password, name }`
- Returns: User object with JWT token

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: User object with JWT token

### Link Endpoints

**GET** `/api/links`
- Fetch all links (with optional filters)
- Query: `?bucket=Inbox&tag=tutorial&search=javascript`
- Returns: Array of link objects

**POST** `/api/links`
- Create new link
- Body: `{ url, tags }`
- Returns: Created link object

**GET** `/api/links/:id`
- Get single link
- Returns: Link object

**PUT** `/api/links/:id`
- Update link
- Body: `{ title, description, tags, aiDescription, aiTags, bucket }`
- Returns: Updated link object

**DELETE** `/api/links/:id`
- Delete link
- Returns: Success message

**POST** `/api/links/bulk/delete`
- Delete multiple links
- Body: `{ ids: [ linkId1, linkId2 ] }`
- Returns: Success message

**POST** `/api/links/bulk/move`
- Move multiple links to bucket
- Body: `{ ids: [ linkId1 ], bucket: "Watchlist" }`
- Returns: Success message

### AI Endpoints

**POST** `/api/ai/generate-description`
- Generate description using AI
- Body: `{ title, description, url, tags }`
- Returns: `{ description }`

**POST** `/api/ai/generate-tags`
- Generate tags using AI
- Body: `{ title, description, url, existingTags }`
- Returns: `{ tags: [] }`

### User Endpoints

**GET** `/api/user/profile`
- Get user profile
- Returns: User object

**PUT** `/api/user/profile`
- Update user profile
- Body: `{ name, ... }`
- Returns: Updated user object

## 🛠 Development

### Adding New Features

1. Create new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes and test locally:
   ```bash
   npm run dev
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

4. Create Pull Request on GitHub

### Database Scehma

See `CODE_DOCUMENTATION.md` for detailed database schema and data models.

## 📚 Additional Documentation

- [CODE_DOCUMENTATION.md](./CODE_DOCUMENTATION.md) - Detailed code architecture and component documentation
- [API.md](./API.md) - API response formats and examples
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guides

## 🐛 Troubleshooting

### Port Already in Use
```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Check MongoDB is running
- Verify connection string in `.env`
- Check network access in MongoDB Atlas (if cloud)

### AI Features Not Working
- Verify `GEMINI_API_KEY` in `.env`
- Check API key still valid at [makersuite.google.com](https://makersuite.google.com)
- Verify API quota not exceeded

### CSS Not Updating
- Run `npm run build` to recompile CSS
- Clear browser cache (Ctrl+Shift+Delete)
- Check `public/styles.css` file exists

## 📖 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [TailwindCSS](https://tailwindcss.com/)
- [Google Generative AI](https://ai.google.dev/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.


## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Check existing issues for solutions
- See [CODE_DOCUMENTATION.md](./CODE_DOCUMENTATION.md) for technical details

---

**Last Updated:** April 9, 2026
**Version:** 1.0.0
