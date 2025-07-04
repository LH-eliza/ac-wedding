#!/bin/bash

# Pre-PR Testing Script
# This script helps ensure your changes are ready for a PR

set -e

echo "🧪 Pre-PR Testing Script"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting pre-PR testing..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm ci
print_success "Dependencies installed successfully"

# Step 2: Build the application
print_status "Building the application..."
npm run build
print_success "Application built successfully"

# Step 3: Start the application in background
print_status "Starting the application..."
npm start &
APP_PID=$!

# Wait for application to be ready
print_status "Waiting for application to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done'
print_success "Application is ready!"

# Step 4: Run e2e tests
print_status "Running e2e tests..."
if npm run test:e2e; then
    print_success "E2E tests passed!"
else
    print_error "E2E tests failed!"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# Step 5: Run visual tests
print_status "Running visual regression tests..."
if npx cypress run --spec "cypress/e2e/visual.cy.js"; then
    print_success "Visual tests passed!"
else
    print_error "Visual tests failed!"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# Step 6: Run linting
print_status "Running linting..."
if npm run lint; then
    print_success "Linting passed!"
else
    print_warning "Linting issues found. Please fix them before creating a PR."
fi

# Step 7: Check for uncommitted changes
print_status "Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them before creating a PR."
    git status --short
else
    print_success "No uncommitted changes found."
fi

# Step 8: Check if branch is up to date
print_status "Checking if branch is up to date..."
git fetch origin
if [ "$(git rev-list HEAD...origin/main --count)" != "0" ]; then
    print_warning "Your branch is behind origin/main. Please pull the latest changes."
else
    print_success "Branch is up to date with origin/main."
fi

# Cleanup
print_status "Stopping the application..."
kill $APP_PID 2>/dev/null || true

echo ""
echo "🎉 Pre-PR testing completed!"
echo "============================"
print_success "All tests passed!"
echo ""
echo "📋 Next steps:"
echo "1. Create a pull request"
echo "2. The GitHub Actions workflow will run automatically"
echo "3. Ensure all status checks pass before merging"
echo ""
echo "📚 Useful commands:"
echo "- npm run test:e2e:open    # Open Cypress runner"
echo "- npm run test:e2e         # Run e2e tests headless"
echo "- npm run lint             # Run linting"
echo "- git status               # Check git status"
echo "" 