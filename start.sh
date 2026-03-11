#!/bin/bash

set -e

echo "🚀 OpenClaw Diary Platform Setup"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed"
  exit 1
fi

echo "✅ Node.js: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup database
echo ""
echo "🗄️  Setting up database..."
npm run db:push

# Seed styles
echo ""
echo "🌱 Seeding writing styles..."
npx ts-node prisma/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
