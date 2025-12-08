# LitLabs Mobile App - Google Play Store Deployment Guide

## Overview
This guide covers building and deploying the LitLabs React Native mobile app to Google Play Store.

## Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Google Play Developer Account ($25 one-time fee)
- Android signing certificate (keystore file)

## Setup

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Create Google Play Developer Account
- Visit https://play.google.com/apps/publish/
- Create account and complete all required information
- Accept agreements

### 3. Generate Android Signing Certificate
```bash
# Create keystore (one-time)
keytool -genkey-and-selfcert-dname "CN=litlabs,O=litlabs,C=US" \
  -alias upload-key -keyalg RSA -keysize 2048 -validity 9125 \
  -keystore ./android-keystore.jks
```

### 4. Set Up EAS Build
```bash
# Login to EAS
eas login

# Configure project
eas build:configure --platform android

# Add Android keystore
eas credentials -p android
```

## Build & Submit Process

### Development Build (APK)
```bash
# Build for testing
eas build --platform android --build-type apk

# Install on emulator/device
adb install -r litlabs.apk
```

### Production Build (AAB)
```bash
# Build for Play Store
eas build --platform android --build-type aab

# Download the AAB file
```

### Submit to Play Store
```bash
# Automatic submission
eas submit --platform android --build 123

# Or manual submission:
# 1. Go to Google Play Console
# 2. Select LitLabs app
# 3. Upload AAB file to "Production" track
# 4. Fill in release notes
# 5. Review and submit
```

## App Store Listing

### Required Information
- **App Title**: LitLabs
- **Short Description**: Content creation and client management AI platform
- **Full Description**: 
  - Create social media content with AI
  - Manage clients and projects
  - Track earnings and subscriptions
  - Access exclusive marketplace
  - Available on iOS and Android

### Graphics & Media
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: 4-8 screenshots showing key features
- Preview Video: Optional YouTube link

### Category
- Category: Productivity / Business

### Content Rating
- Fill out Google Play Content Rating questionnaire
- Submit for review

### Pricing
- Default: Free (with in-app purchases)
- Markets: All available
- Content rating: For all ages

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
eas build:list --platform android --status errored

# Check build logs
eas build:view [BUILD_ID]
```

### Submission Issues
- Ensure all required fields in Play Console are filled
- Check for minimum version compatibility
- Verify signing certificate matches
- Review Google Play policies

### Common Issues

**Issue**: Keystore password incorrect
```bash
# Reset keystore credentials
eas credentials -p android --reset
```

**Issue**: App version conflict
```bash
# Update versionCode in app.json
# Must increment for each submission
```

**Issue**: Insufficient permissions
```bash
# Add required permissions in app.json
# Request user permissions at runtime
```

## Release Timeline
1. **Build**: 5-15 minutes
2. **Review**: 1-4 hours (typically)
3. **Rollout**: Begins after approval

## Monitoring

### Track Release Status
```bash
# Check deployment status
eas submit:list --platform android

# View app reviews
# Via Google Play Console > Ratings
```

### Analytics
- Unique installs
- Active users
- Crash metrics
- Performance data

## Updates & Versioning

### Semantic Versioning
- MAJOR.MINOR.PATCH format
- Increment versionCode for each build
- Update version in app.json and package.json

### Over-The-Air Updates (Expo Updates)
```bash
# Publish update without full rebuild
eas update --platform android
```

## Security Checklist
- [ ] Signing key backed up securely
- [ ] Environment variables set correctly
- [ ] API endpoints use HTTPS
- [ ] Firebase security rules configured
- [ ] Stripe credentials are production-ready
- [ ] Data encryption enabled for sensitive data

## Support & Resources
- Expo Docs: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/
- Play Store: https://developer.android.com/distribute
- React Native: https://reactnative.dev/

## Next Steps
1. Complete app store listing
2. Build and test APK locally
3. Submit AAB to internal test track
4. Internal testing phase (1-2 weeks)
5. Submit to production
6. Monitor reviews and crashes
7. Plan future updates
