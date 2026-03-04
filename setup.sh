#!/bin/bash
# Setup script for CarrotView development environment
# Ensures proper Node version and dependencies

set -e

echo "🥕 Setting up CarrotView development environment..."

# Check if nvm is available
if command -v nvm >/dev/null 2>&1; then
    echo "✅ nvm found - using project Node version"
    nvm use
else
    echo "⚠️  nvm not found - please ensure Node.js v18.19.0+ is installed"
fi

# Check Node version
NODE_VERSION=$(node --version)
echo "📦 Using Node.js $NODE_VERSION"

# Install dependencies based on available package manager
if command -v bun >/dev/null 2>&1; then
    echo "🚀 Installing dependencies with Bun..."
    bun install
    echo "🎯 Start development with: bun dev"
elif command -v npm >/dev/null 2>&1; then
    echo "📦 Installing dependencies with npm..."
    npm install
    echo "🎯 Start development with: npm run dev"
else
    echo "❌ No package manager found. Please install Node.js or Bun"
    exit 1
fi

echo "✅ Setup complete! Run your start command and visit http://localhost:8080"