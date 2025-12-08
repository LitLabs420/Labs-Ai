# LitLabs Mobile App

React Native mobile application for iOS and Android platforms. Provides mobile access to content generation, client management, and marketplace features.

## Features

- 📱 **Native Mobile Experience**: Built with React Native for smooth, native performance
- 🤖 **AI Content Generation**: Create captions, scripts, DMs, and image prompts on the go
- 👥 **Client Management**: Manage clients and projects from anywhere
- 💰 **Earnings Dashboard**: Track earnings and subscriptions in real-time
- 🎮 **Marketplace**: Browse and sell content through mobile marketplace
- 🔐 **Secure Authentication**: Firebase authentication with local persistence
- 🎨 **Dark Mode**: Optimized dark UI for comfortable viewing

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: NativeWind (Tailwind for React Native)
- **Icons**: Lucide React Native
- **HTTP Client**: Axios
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Installation

```bash
# Navigate to mobile app directory
cd mobile-app

# Run setup script
./setup.sh

# Or manually install
npm install
```

### Environment Variables

Create `.env.local`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
# Start development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device
npm run ios

# Run on web
npm run web
```

## Project Structure

```
mobile-app/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/            # Main app tabs
│       ├── index.tsx       # Home screen
│       ├── generate.tsx    # Content generation
│       ├── clients.tsx     # Client management
│       ├── marketplace.tsx # Marketplace
│       └── profile.tsx     # User profile
├── lib/                    # Utilities & services
│   ├── firebase-auth.ts
│   └── content-generation.ts
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── dashboard/        # Dashboard components
├── hooks/                # Custom hooks
├── context/              # React Context providers
├── assets/               # Images & icons
├── package.json
├── app.json              # Expo config
├── eas.json              # EAS build config
└── PLAY_STORE_GUIDE.md   # Deployment guide
```

## Key Features

### Authentication
- Email/password registration and login
- Firebase Auth integration
- Persistent authentication with AsyncStorage
- Automatic redirect to login if not authenticated

### Content Generation
- Multiple content types: captions, scripts, DMs, image prompts
- Tone selection: casual, professional, funny, inspirational
- Save generated content to library
- Copy content to clipboard

### Dashboard
- Quick stats overview (posts, clients, earnings)
- Recently generated content
- Quick action buttons
- Performance metrics

### Client Management
- View all clients
- Track project progress
- Communication history
- Billing information

## Building for Play Store

### Development Build
```bash
npm run build:android
```

### Production Build
```bash
eas build --platform android --build-type aab
```

### Submit to Play Store
```bash
eas submit --platform android
```

See [PLAY_STORE_GUIDE.md](./PLAY_STORE_GUIDE.md) for detailed instructions.

## Testing

### Unit Tests
```bash
npm test
```

### E2E Testing
```bash
# Use Detox or similar tool
```

## Performance Optimization

- Code splitting with Expo Router
- Image optimization with compression
- Lazy loading of screens
- Memoization of expensive components
- Efficient state management with Zustand

## Security

- Firebase security rules configured
- API requests use secure HTTPS
- Environment variables for sensitive data
- Input validation with Zod
- Rate limiting on API endpoints

## Troubleshooting

### Common Issues

**Metro bundler crashes**
```bash
npm start -- --reset-cache
```

**Dependency conflicts**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase connection issues**
- Verify .env.local is correctly filled
- Check Firebase project is active
- Confirm API key has correct permissions

**Expo connection issues**
```bash
eas logout
eas login
```

## Contributing

When adding new features:
1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript strict mode
3. Use existing component patterns
4. Add proper error handling
5. Test on both platforms
6. Submit PR for review

## Deployment Checklist

Before releasing to Play Store:
- [ ] All features tested on real devices
- [ ] App icon and screenshots ready
- [ ] Play Store listing completed
- [ ] Privacy policy added
- [ ] Terms of service reviewed
- [ ] Version number incremented
- [ ] Firebase production keys set
- [ ] Stripe production credentials configured
- [ ] Sentry error tracking enabled
- [ ] Analytics configured

## Support & Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Play Store Guidelines](https://developer.android.com/distribute/play-policies)

## License

Same as parent project - see LICENSE file

## Roadmap

- [ ] Push notifications (Expo Notifications)
- [ ] Offline support with local database
- [ ] Advanced analytics
- [ ] Video editing tools
- [ ] AR features
- [ ] Desktop sync
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Widget support (home screen widgets)
