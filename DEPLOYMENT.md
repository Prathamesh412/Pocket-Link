# 🚀 BucketLink - Deployment Guide

Complete guide for deploying BucketLink to various hosting platforms.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Heroku Deployment](#heroku-deployment)
3. [Railway Deployment](#railway-deployment)
4. [DigitalOcean Deployment](#digitalocean-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Vercel Deployment](#vercel-deployment)
7. [Self-Hosted Deployment](#self-hosted-deployment)
8. [Environment Configuration](#environment-configuration)
9. [Database Setup](#database-setup)
10. [Monitoring & Logging](#monitoring--logging)
11. [Security Checklist](#security-checklist)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All features tested locally
- [ ] No console.log() statements in production code
- [ ] Error handling implemented
- [ ] Git repository is clean and up-to-date
- [ ] `.env` file added to `.gitignore`
- [ ] `node_modules/` in `.gitignore`
- [ ] README.md and documentation complete
- [ ] Version number updated in package.json
- [ ] Build script tested: `npm run build`
- [ ] CSS compiles correctly

### Environment Setup

- [ ] `.env.example` file created with all required variables
- [ ] Node.js version specified (14+)
- [ ] MongoDB cluster created (if using cloud)
- [ ] Google Generative AI API key obtained
- [ ] JWT secret generated (min 32 random characters)
- [ ] Port configuration ready

### Security

- [ ] Passwords hashed with bcryptjs
- [ ] JWT tokens have expiration
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevention (N/A for MongoDB)
- [ ] XSS prevention with HTML escaping
- [ ] Rate limiting considered
- [ ] HTTPS enabled (production)

### Database

- [ ] MongoDB Atlas connection string ready
- [ ] Database indexes created
- [ ] Backup strategy planned
- [ ] Data migration plan (if applicable)

---

## Heroku Deployment

**Platform:**  Free and paid tiers available
**Best For:**  Quick deployment, small-medium projects

### Step 1: Create Heroku Account

1. Sign up at [heroku.com](https://www.heroku.com)
2. Install Heroku CLI: [Download](https://devcenter.heroku.com/articles/heroku-cli)
3. Install Git if not already installed

### Step 2: Prepare Application

```bash
# Create Procfile (tells Heroku how to run app)
echo "web: npm run build && node server.js" > Procfile

# Add start script to package.json if not present
# "start": "node server.js"

# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

### Step 3: Initialize Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit for Heroku deployment"
```

### Step 4: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Or connect existing app:
# heroku git:remote -a your-app-name
```

### Step 5: Set Environment Variables

```bash
# Set each variable
heroku config:set PORT=3000
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/web-links"
heroku config:set JWT_SECRET="your_super_secret_random_string_min_32_chars"
heroku config:set GEMINI_API_KEY="your_gemini_api_key"

# View all variables
heroku config
```

### Step 6: Deploy

```bash
# Push to Heroku
git push heroku main

# (or 'master' if that's your branch name)
```

### Step 7: Verify Deployment

```bash
# Open app in browser
heroku open

# View logs
heroku logs --tail

# Scale dynos if needed
heroku ps:scale web=1
```

### Heroku Buildpacks

Heroku automatically detects Node.js from `package.json`. If needed:

```bash
# Set buildpack explicitly
heroku buildpacks:set heroku/nodejs
```

### Costs

- **Free Tier:** Limited dyno hours, inactive app sleeps
- **Paid:** $7/month per dyno (recommended)
- **Database:** MongoDB Atlas free tier up to 5GB

---

## Railway Deployment

**Platform:** Modern alternative to Heroku
**Best For:** GitHub integration, simple deployment

### Step 1: Create Railway Account

1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub account

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize GitHub
4. Select your BucketLink repository
5. Click "Deploy"

### Step 3: Add Environment Variables

1. Go to Variables tab
2. Click "Add Variable"
3. Add each environment variable:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
   - `PORT=3000`

### Step 4: Configure Database

Option 1: Use existing MongoDB Atlas
- Add `MONGODB_URI` connection string

Option 2: Add MongoDB plugin
1. In project, click "Add"
2. Select "MongoDB"
3. Railway creates hosted MongoDB automatically

### Step 5: Monitor Deployment

1. Logs appear in real-time
2. Status shows live
3. Deployments triggered on git push

### Costs

- Pay per resource usage
- MongoDB plugin: ~$5-10/month
- Generally cheaper than Heroku

---

## DigitalOcean Deployment

**Platform:** VPS/App Platform
**Best For:** Full control, scalability

### Using DigitalOcean App Platform (Recommended)

#### Step 1: Prepare GitHub Repository

```bash
# Ensure all files committed
git add .
git commit -m "Ready for DigitalOcean deployment"
git push origin main
```

#### Step 2: Create App Platform

1. Go to [DigitalOcean.com](https://www.digitalocean.com)
2. Create account or login
3. Click "Create" → "Apps"
4. Connect GitHub account
5. Select repository and branch
6. Click "Next"

#### Step 3: Configure App

1. Set name
2. Configure build and run commands:
   - **Build:** `npm run build`
   - **Run:** `npm start`
3. Click "Next"

#### Step 4: Set Environment Variables

1. Add each variable:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_api_key
   NODE_ENV=production
   PORT=8080
   ```
2. Click "Next"

#### Step 5: Finalize and Deploy

1. Review all settings
2. Click "Create Resources"
3. Wait for deployment (2-5 minutes)
4. Access app at provided URL

### Using DigitalOcean VPS (Advanced)

#### Deploy to Ubuntu Droplet

```bash
# 1. SSH into droplet
ssh root@your_droplet_ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install Git
apt install -y git

# 5. Clone repository
git clone https://github.com/your-username/bucketlink.git
cd bucketlink

# 6. Install dependencies
npm install

# 7. Build CSS
npm run build

# 8. Create .env file with production values
nano .env

# 9. Install PM2 (process manager)
npm install -g pm2

# 10. Start application
pm2 start server.js --name "bucketlink"

# 11. Make PM2 start on boot
pm2 startup
pm2 save

# 12. Setup Nginx reverse proxy
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/bucketlink
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bucketlink /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Costs

- App Platform: $12/month minimum
- Droplet: $6/month (2GB RAM) to $48/month (16GB RAM)
- Managed Database: $12/month+

---

## AWS Deployment

**Platform:** Elastic Beanstalk (simplest) or EC2 (advanced)
**Best For:** Enterprise, high-scale projects

### Using Elastic Beanstalk (Recommended)

#### Step 1: Install AWS CLI

```bash
# macOS
brew install awscli

# Windows (pip)
pip install awsebcli

# Verify installation
aws --version
eb --version
```

#### Step 2: Configure AWS Credentials

```bash
aws configure

# Enter:
# AWS Access Key ID
# AWS Secret Access Key
# Default region (e.g., us-east-1)
# Default output format: json
```

#### Step 3: Initialize Elastic Beanstalk

```bash
# In project root
eb init -p node.js-16 my-app --region us-east-1
```

#### Step 4: Create Environment

```bash
# Create and deploy
eb create production --instance-type t3.small

# View status
eb status

# View logs
eb logs
```

#### Step 5: Set Environment Variables

```bash
# Set variables
eb setenv MONGODB_URI="mongodb+srv://..." JWT_SECRET="..." GEMINI_API_KEY="..."

# Verify
eb printenv
```

#### Step 6: Deploy Application

```bash
# Deploy current code
git add .
git commit -m "Deploy to AWS"
eb deploy

# Open application
eb open
```

### Scale and Monitor

```bash
# Scale instances
eb scale 3

# Monitor health
eb health

# View logs
eb logs --stream

# SSH into instance
eb ssh
```

### Costs

- Micro instance: ~$46/month (free tier first year)
- Load balancer: ~$20/month
- Data transfer: Variable

---

## Vercel Deployment

**Platform:** Serverless functions (requires refactoring)
**Best For:** Next.js projects (original use case)

Vercel is optimized for Next.js. For traditional Express.js:

#### Option: Use API Routes Only

Limited by Vercel's serverless architecture. If converting to serverless:

```javascript
// pages/api/[proxy].js
export default function handler(req, res) {
  // Forward requests to backend
}
```

**Not recommended for BucketLink.** Better to use Railway or DigitalOcean.

---

## Self-Hosted Deployment

**Best For:** Full control, custom hardware

### Linux Server Setup

```bash
# 1. Rent server from:
# - Linode, DigitalOcean, Vultr, AWS EC2, etc.

# 2. SSH into server
ssh root@server_ip

# 3. Update system
apt update && apt upgrade -y

# 4. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# 5. Install MongoDB (optional if using cloud)
# Using MongoDB Atlas is recommended instead

# 6. Install Git
apt install -y git

# 7. Clone repository
cd /var/www
git clone https://github.com/your-username/bucketlink.git
cd bucketlink

# 8. Install dependencies
npm install
npm run build

# 9. Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/web-links
JWT_SECRET=your_secret_here
GEMINI_API_KEY=your_key_here
EOF

# 10. Install PM2 (process manager)
npm install -g pm2

# 11. Start app with PM2
pm2 start server.js --name "web-links"

# 12. Save PM2 config
pm2 startup
pm2 save

# 13. Install Nginx
apt install -y nginx

# 14. Configure Nginx (see config above)

# 15. Setup SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### Docker Deployment

**Create Dockerfile:**

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production
RUN npm run build

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb+srv://...
      - JWT_SECRET=...
      - GEMINI_API_KEY=...
      - NODE_ENV=production
    restart: always
```

**Deploy:**

```bash
# Build image
docker build -t web-links .

# Run container
docker run -p 3000:3000 --env-file .env web-links

# Or use docker-compose
docker-compose up -d
```

---

## Environment Configuration

### Production .env Template

```env
# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=generate_32_character_random_string_here
JWT_EXPIRY=7d

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/web-links?retryWrites=true&w=majority

# AI
GEMINI_API_KEY=AIza_your_api_key_here

# Optional: CORS
CORS_ORIGIN=https://yourdomain.com

# Optional: Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Generating Secure Secrets

```bash
# Generate JWT secret (32 chars)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variables by Platform

**Heroku:**
```bash
heroku config:set KEY=value
```

**Railway:**
- Via dashboard → Variables tab

**DigitalOcean:**
- Via dashboard → Environment tab

**AWS EB:**
```bash
eb setenv KEY=value
```

---

## Database Setup

### MongoDB Atlas (Cloud)

#### Step 1: Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create account/login
3. Click "Create" → "New Project"
4. Create cluster (Free tier available)
5. Wait for cluster to initialize

#### Step 2: Configure Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (or specific IPs)
4. Click "Confirm"

#### Step 3: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username/password
4. Assign "Read and write to any database" role
5. Click "Create User"

#### Step 4: Get Connection String

1. Go to "Clusters"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy connection string
5. Replace `<password>` with user password
6. Replace `database-name` with `web-links`

**Example:**
```
mongodb+srv://username:password@cluster0.mongodb.net/web-links?retryWrites=true&w=majority
```

#### Step 5: Add to .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/web-links?retryWrites=true&w=majority
```

### Self-Hosted MongoDB (Linux)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu" $(lsb_release -sc)"/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Verify
mongosh

# Connection string
mongodb://localhost:27017/web-links
```

### Database Backup

```bash
# MongoDB Atlas: Automatic backups included (paid tier)

# Manual backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/web-links"

# Restore
mongorestore dump/
```

---

## Monitoring & Logging

### Application Logs

**Heroku:**
```bash
heroku logs --tail
heroku logs --dyno web
```

**Railway:**
- View in dashboard real-time

**Digital Ocean:**
```bash
pm2 logs bucketlink
pm2 save
```

### Error Tracking

**Sentry Integration (Optional):**

```javascript
// server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

**Tools:**
- New Relic
- Datadog
- CloudWatch (AWS)
- PM2 Plus

### Health Check Endpoint

```javascript
// server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

---

## Security Checklist

### Production Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured for specific origins
- [ ] JWT secret is strong (32+ characters)
- [ ] Passwords hashed with bcryptjs
- [ ] No sensitive data in logs
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTML escaping on client side
- [ ] Database backups configured
- [ ] API keys rotated periodically
- [ ] Monitoring/alerting in place
- [ ] Security updates applied
- [ ] Dependencies up to date
- [ ] Secrets not exposed in code

### HTTPS/SSL Setup

**Let's Encrypt (Free):**

```bash
# Using Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

**Certificate Renewal:**

```bash
# Test renewal
certbot renew --dry-run

# Renew
certbot renew
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
ufw enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw default deny incoming
ufw default allow outgoing
```

---

## Performance Optimization

### Database Optimization

```javascript
// Add indexes
db.links.createIndex({ userId: 1, bucket: 1 });
db.links.createIndex({ userId: 1, createdAt: -1 });
```

### Caching

```javascript
// Redis caching (optional)
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

app.get('/api/links', async (req, res) => {
  const cacheKey = `links:${req.userId}`;
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch and cache
  const links = await Link.find({ userId: req.userId });
  await client.setEx(cacheKey, 3600, JSON.stringify(links));
  res.json(links);
});
```

### Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### CDN for Static Assets

Consider uploading images/CSS to CloudFront or Cloudflare for faster delivery.

---

## Troubleshooting Deployment Issues

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=8000 npm start
```

#### 2. MongoDB Connection Failed

```bash
# Check connection string format
# Should be: mongodb+srv://user:pass@cluster...

# Verify network access in MongoDB Atlas
# Check IP whitelist includes server IP

# Test connection locally
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/web-links"
```

#### 3. Build Fails

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild CSS
npm run build
```

#### 4. API Requests Timeout

### Increase timeout
```javascript
// axios request
axios.get(url, { timeout: 10000 });

// fetch
fetch(url, { signal: AbortSignal.timeout(10000) });
```

#### 5. CORS Errors

```javascript
// Verify CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

#### 6. Out of Memory

```bash
# Increase Node heap size
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Debug Commands

```bash
# Check server status
curl -i http://localhost:3000

# Database connection test
mongosh "your_connection_string"

# View environment variables
echo $MONGODB_URI
env | grep MONGO

# Check disk space
df -h

# Check memory usage
free -h

# Process monitoring
ps aux | grep node
```

---

## Post-Deployment

### Testing Production

```bash
# Test API endpoints
curl https://yourdomain.com/api/links

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test health check
curl https://yourdomain.com/health
```

### Monitoring Setup

1. Set up error tracking (Sentry)
2. Configure uptime monitoring (UptimeRobot)
3. Setup performance monitoring
4. Configure alerts for critical issues

### Backup Strategy

```bash
# Weekly database backup
0 2 * * 0 mongodump --uri "..." --out /backups/$(date +\%Y-\%m-\%d)

# Backup to AWS S3
aws s3 sync /backups s3://my-bucket/backups/
```

### CI/CD Pipeline (Optional but Recommended)

**GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm test  # If tests exist
      - name: Deploy
        run: |
          # Deploy command (Heroku, Railway, etc.)
```

---

## Production Checklist

- [ ] Application tested locally
- [ ] All environment variables configured
- [ ] Database migrated and verified
- [ ] SSL/HTTPS enabled
- [ ] Monitoring and logging active
- [ ] Backups configured
- [ ] Domain properly configured
- [ ] Email notifications working
- [ ] Rate limiting active
- [ ] API keys secured
- [ ] Documentation updated
- [ ] Runbook for troubleshooting created
- [ ] Team notified of deployment
- [ ] Performance baseline established
- [ ] Incident response plan ready

---

## Support

For deployment issues:
1. Check application logs
2. Review platform documentation
3. Check MongoDB Atlas status
4. Verify environment variables
5. Test locally with production config

**Last Updated:** April 9, 2026
**Version:** 1.0.0
