#!/bin/bash

echo "🚀 Preparing OpenClaw Diary for Vercel Deployment"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing Git repository..."
  git init
fi

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
  echo "📝 Creating .gitignore..."
  cat > .gitignore << EOF
node_modules
.next
.env
.env.local
*.db
*.log
.DS_Store
EOF
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit - OpenClaw Diary Platform"

# Check if remote exists
if ! git remote | grep -q origin; then
  echo ""
  echo "🔗 Please create a GitHub repository first:"
  echo "   1. Visit: https://github.com/new"
  echo "   2. Repository name: openclaw-diary"
  echo "   3. Choose Public or Private"
  echo "   4. Click 'Create repository'"
  echo ""
  read -p "Enter your GitHub username: " GITHUB_USER
  git remote add origin https://github.com/$GITHUB_USER/openclaw-diary.git
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Visit: https://vercel.com/new"
echo "   2. Import your 'openclaw-diary' repository"
echo "   3. Add environment variable: DATABASE_URL"
echo "   4. Click Deploy"
echo ""
