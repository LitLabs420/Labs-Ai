# LitLabs AI

LitLabs AI is an AI-powered platform for content creators, beauty professionals, and small businesses to generate content, manage clients, and monetize their services.

This is a [Next.js](https://nextjs.org) project built with TypeScript, Firebase, Stripe, and Google Generative AI.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

**Note**: Fill in your environment variables in `.env.local`. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for details.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- **[README_LITLABS.md](README_LITLABS.md)** - Detailed project documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Comprehensive development guidelines
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Environment setup guide
- **[SECURITY.md](SECURITY.md)** - Security policies
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **AI**: Google Generative AI
- **Payments**: Stripe
- **Deployment**: Vercel

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

For detailed development standards and patterns, see [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Working with GitHub Copilot

This repository is configured to work with GitHub Copilot coding agents:

- Assign issues to `@copilot` on GitHub.com
- Copilot will automatically create a branch and open a PR
- See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed guidelines

## License

See LICENSE file for details.
