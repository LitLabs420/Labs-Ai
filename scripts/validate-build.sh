#!/bin/bash
# Build Validation Script for LitLabs AI
# This script validates the build process and environment setup

set -e

echo "🚀 LitLabs AI Build Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "\n📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"
if [[ ! "$NODE_VERSION" =~ ^v(18|20|22) ]]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK${NC}"

# Check npm version
echo -e "\n📦 Checking npm version..."
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"
echo -e "${GREEN}✅ npm OK${NC}"

# Check if package.json exists
echo -e "\n📄 Checking package.json..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ package.json exists${NC}"

# Check environment variables (optional but recommended)
echo -e "\n🔐 Checking environment variables..."
REQUIRED_ENV_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
)

MISSING_VARS=()
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo -e "${YELLOW}ℹ️  Build will continue but runtime features may be limited${NC}"
else
    echo -e "${GREEN}✅ All required environment variables present${NC}"
fi

# Install dependencies
echo -e "\n📥 Installing dependencies..."
npm ci --quiet
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Run linter
echo -e "\n🔍 Running linter..."
if npm run lint; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed${NC}"
    exit 1
fi

# Run type check
echo -e "\n🔍 Running type check..."
if npm run typecheck; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi

# Build the application
echo -e "\n🏗️  Building application..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check build output
echo -e "\n📊 Checking build output..."
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next | cut -f1)
    echo "Build size: $BUILD_SIZE"
    echo -e "${GREEN}✅ Build output exists${NC}"
else
    echo -e "${RED}❌ Build output directory not found${NC}"
    exit 1
fi

# Summary
echo -e "\n================================"
echo -e "${GREEN}🎉 Build validation completed successfully!${NC}"
echo -e "================================"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: vercel --prod"
echo "  2. Or push to master/main branch for automatic deployment"
echo ""
