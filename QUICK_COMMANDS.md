# 🚀 Quick Launch Commands

## Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

## Production Build
```bash
# Clean cache
rm -rf .next node_modules/.cache

# Build
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Docker
```bash
# Build image
docker build -t labs-ai-studio .

# Run container
docker run -p 3000:3000 labs-ai-studio
```

### PM2 (Self-Hosted)
```bash
# Install PM2
npm i -g pm2

# Start app
pm2 start npm --name "labs-ai" -- start

# Save config
pm2 save

# Auto-start on boot
pm2 startup
```

## Environment Setup
```bash
# Copy template
cp .env.production.template .env.local

# Edit with your credentials
nano .env.local

# Required variables:
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL  
# - FIREBASE_PRIVATE_KEY
# - STRIPE_SECRET_KEY
# - GOOGLE_GENERATIVE_AI_API_KEY
```

## Database (Firestore)
```bash
# Create indexes (if needed)
firebase deploy --only firestore:indexes

# Set security rules
firebase deploy --only firestore:rules
```

## Stripe Setup
```bash
# Create products in dashboard
# Then set these env vars:
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_CREATOR=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx

# Configure webhook
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.updated
```

## Monitoring
```bash
# Vercel logs
vercel logs

# PM2 logs
pm2 logs labs-ai

# Docker logs  
docker logs <container_id>

# Follow logs
pm2 logs --lines 100
```

## Git Workflow
```bash
# Check status
git status

# Stage changes
git add -A

# Commit
git commit -m "your message"

# Push
git push origin master

# View history
git log --oneline -10
```

## Troubleshooting
```bash
# Check Node version (needs 18+)
node --version

# Check npm version
npm --version

# Clear everything and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build

# Test API routes
curl http://localhost:3000/api/verify-admin

# Check env vars loaded
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
```

## Health Checks
```bash
# Homepage
curl https://yourdomain.com/

# Admin endpoint
curl https://yourdomain.com/api/verify-admin

# Test AI generation (requires auth token)
curl -X POST https://yourdomain.com/api/ai/generate-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"Test","type":"instagram"}'
```

## Performance Testing
```bash
# Install Artillery
npm i -g artillery

# Load test
artillery quick --count 10 --num 100 https://yourdomain.com/
```

## Security Scan
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check outdated packages
npm outdated
```

## Backup
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backup

# Backup env vars
cat .env.local > backup/.env.backup.$(date +%Y%m%d)
```

## Quick Fixes

### Build fails with Firebase error
```bash
# Ensure Admin SDK env vars are set
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
```

### Rate limiting not working
```bash
# Check Redis connection or use in-memory
# Already configured to fall back to memory
```

### Stripe webhook fails
```bash
# Verify webhook secret matches Stripe dashboard
# Check signature validation in route.ts
```

### Type errors after npm install
```bash
# Reinstall types
npm install --save-dev @types/node @types/react @types/react-dom
```

## One-Command Deploy
```bash
# Build, test, and deploy
npm run build && npm test && vercel --prod
```

## Emergency Rollback
```bash
# Vercel
vercel rollback

# PM2
pm2 restart labs-ai

# Docker
docker stop <container> && docker start <previous_container>
```

---

**Pro Tip:** Save these commands in a `Makefile` for quick access:
```makefile
dev:
	npm run dev

build:
	npm run build

deploy:
	vercel --prod

logs:
	vercel logs -f
```

Then use: `make dev`, `make build`, `make deploy`, etc.
