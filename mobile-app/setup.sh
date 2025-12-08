#!/bin/bash

# LitLabs Mobile App Setup Script
# This script sets up the React Native development environment

echo "🚀 Setting up LitLabs Mobile App..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✓ npm version: $(npm --version)"

# Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    echo "Installing Expo CLI..."
    npm install -g expo-cli
fi

echo "✓ Expo CLI installed"

# Install EAS CLI globally if not present
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

echo "✓ EAS CLI installed"

# Navigate to mobile-app directory
cd "$(dirname "$0")" || exit 1

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EOF
    echo "⚠️  Please fill in .env.local with your Firebase credentials"
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p app/{(auth),(tabs)}
mkdir -p lib
mkdir -p components/{ui,dashboard}
mkdir -p hooks
mkdir -p context
mkdir -p utils
mkdir -p assets

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with Firebase credentials"
echo "2. Run 'npm start' to start development server"
echo "3. Press 'a' for Android, 'i' for iOS, 'w' for web"
echo ""
echo "For Play Store submission:"
echo "1. Run 'eas build --platform android --build-type aab'"
echo "2. Follow PLAY_STORE_GUIDE.md for submission instructions"
