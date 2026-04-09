#!/bin/bash

# BucketLink Deployment Helper Script
# This script helps prepare the project for deployment

set -e  # Exit on error

echo "🚀 BucketLink Deployment Helper"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "${RED}❌ Node.js 14 or higher required (found v$(node -v))${NC}"
    exit 1
fi
echo "${GREEN}✅ Node.js version: $(node -v)${NC}"
echo ""

# Check if .env file exists
echo "${BLUE}Checking environment setup...${NC}"
if [ ! -f .env ]; then
    echo "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "${YELLOW}⚠️  Please edit .env with production values${NC}"
    echo ""
fi
echo "${GREEN}✅ .env file configured${NC}"
echo ""

# Check if node_modules exists
echo "${BLUE}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Build CSS
echo "${BLUE}Building CSS...${NC}"
npm run build
echo "${GREEN}✅ CSS compiled${NC}"
echo ""

# Verify required files
echo "${BLUE}Verifying project structure...${NC}"
REQUIRED_FILES=("server.js" "package.json" ".env.example" "public/index.html" "src/models/Link.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "${RED}❌ Missing required file: $file${NC}"
        exit 1
    fi
done
echo "${GREEN}✅ All required files present${NC}"
echo ""

# Check Git status
echo "${BLUE}Checking Git status...${NC}"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "${YELLOW}⚠️  Not a Git repository${NC}"
    echo "Initialize Git? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        git init
        git add .
        git commit -m "Initial commit - ready for deployment"
        echo "${GREEN}✅ Git initialized${NC}"
    fi
else
    UNCOMMITTED=$(git status --porcelain)
    if [ ! -z "$UNCOMMITTED" ]; then
        echo "${YELLOW}⚠️  Uncommitted changes:${NC}"
        git status --short
    else
        echo "${GREEN}✅ Working directory clean${NC}"
    fi
fi
echo ""

# Test server locally
echo "${BLUE}Testing server startup...${NC}"
timeout 5 npm start > /dev/null 2>&1 || true
echo "${GREEN}✅ Server startup test passed${NC}"
echo ""

# Deployment platform selection
echo "${BLUE}Select deployment platform:${NC}"
echo "1) Heroku"
echo "2) Railway"
echo "3) DigitalOcean"
echo "4) AWS Elastic Beanstalk"
echo "5) Docker"
echo "6) Skip"
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "${BLUE}Heroku Deployment Setup${NC}"
        echo "========================"
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Login: heroku login"
        echo "3. Create app: heroku create your-app-name"
        echo "4. Set environment variables:"
        echo "   heroku config:set MONGODB_URI='...'"
        echo "   heroku config:set JWT_SECRET='...'"
        echo "   heroku config:set GEMINI_API_KEY='...'"
        echo "5. Deploy: git push heroku main"
        echo "6. View logs: heroku logs --tail"
        echo ""
        echo "Procfile ready? Creating..."
        echo "web: npm run build && node server.js" > Procfile
        echo "${GREEN}✅ Procfile created${NC}"
        ;;
    2)
        echo ""
        echo "${BLUE}Railway Deployment Setup${NC}"
        echo "======================="
        echo "1. Go to https://railway.app"
        echo "2. Create new project"
        echo "3. Connect GitHub repository"
        echo "4. Add environment variables (see .env.example)"
        echo "5. Railway deploys automatically on git push"
        echo ""
        echo "${GREEN}Ready! Push to GitHub to deploy.${NC}"
        ;;
    3)
        echo ""
        echo "${BLUE}DigitalOcean Deployment Setup${NC}"
        echo "============================="
        echo "Option 1 - App Platform:"
        echo "1. Go to https://www.digitalocean.com"
        echo "2. Create new App"
        echo "3. Connect GitHub repository"
        echo "4. Configure build: npm run build"
        echo "5. Configure run: npm start"
        echo "6. Add environment variables"
        echo ""
        echo "Option 2 - VPS (see DEPLOYMENT.md for full instructions)"
        ;;
    4)
        echo ""
        echo "${BLUE}AWS Elastic Beanstalk Setup${NC}"
        echo "==========================="
        echo "1. Install AWS CLI and EB CLI"
        echo "2. Run: eb init -p node.js-16 my-app --region us-east-1"
        echo "3. Run: eb create production"
        echo "4. Run: eb setenv MONGODB_URI='...' JWT_SECRET='...' GEMINI_API_KEY='...'"
        echo "5. Run: git push origin main && eb deploy"
        echo ""
        echo "Procfile ready? Creating..."
        echo "web: npm start" > Procfile
        echo "${GREEN}✅ Procfile created${NC}"
        ;;
    5)
        echo ""
        echo "${BLUE}Docker Deployment Setup${NC}"
        echo "======================="
        echo "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm run build

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF
        echo "${GREEN}✅ Dockerfile created${NC}"
        
        echo "Creating docker-compose.yml..."
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
    restart: always
EOF
        echo "${GREEN}✅ docker-compose.yml created${NC}"
        
        echo ""
        echo "To deploy with Docker:"
        echo "1. docker build -t web-links ."
        echo "2. docker run -p 3000:3000 --env-file .env web-links"
        echo "Or:"
        echo "1. docker-compose up -d"
        ;;
    6)
        echo "Skipping platform setup"
        ;;
    *)
        echo "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "${BLUE}Deployment Checklist${NC}"
echo "===================="
echo "☐ All environment variables configured in .env"
echo "☐ .env file added to .gitignore"
echo "☐ node_modules added to .gitignore"
echo "☐ MongoDB cluster ready"
echo "☐ Google Generative AI API key obtained"
echo "☐ JWT_SECRET is strong (32+ characters)"
echo "☐ README.md is complete"
echo "☐ DEPLOYMENT.md reviewed"
echo "☐ CODE_DOCUMENTATION.md reviewed"
echo "☐ Git repository initialized and committed"
echo "☐ Domain name configured (if applicable)"
echo "☐ SSL/HTTPS ready"
echo ""

echo "${GREEN}✅ Deployment preparation complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "1. Review DEPLOYMENT.md for platform-specific instructions"
echo "2. Verify all environment variables in .env"
echo "3. Test locally: npm start"
echo "4. Push to GitHub/deploy as needed"
echo ""
echo "Need help? Check:"
echo "- README.md - Project overview and setup"
echo "- DEPLOYMENT.md - Detailed deployment guides"
echo "- CODE_DOCUMENTATION.md - Code architecture details"
echo ""
