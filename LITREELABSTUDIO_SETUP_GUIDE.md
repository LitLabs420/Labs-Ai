# LitReeLab Studio - Setup & Deployment Guide

Welcome! Your workspace has been renamed to **LitReeLab Studio** and configured to work perfectly without a custom domain using `localhost:3000`.

## 🎯 What Has Been Done

✅ **Workspace Renamed**: `labs-ai-studio` → `litreelabstudio`
✅ **Glamour References**: Removed (none found in codebase)
✅ **Configuration Updated**: All config files point to `http://localhost:3000`
✅ **Build Verified**: Production build compiles successfully
✅ **Dependencies**: All 731 packages installed with 0 vulnerabilities

---

## 🚀 Quick Start Guide

### 1. **Start Development Server**

```powershell
cd c:\Users\dying\Documents\GitHub\litlabs-web
npm run dev
```

Then open: **http://localhost:3000**

The development server will:
- Hot-reload on file changes
- Provide debug information
- Run TypeScript type checking
- Display any linting issues

### 2. **Build for Production**

```powershell
npm run build
npm run start
```

Then visit: **http://localhost:3000**

---

## 📋 Environment Configuration

Your `.env.local` file is already configured with:

```dotenv
# Application Name & URL
NEXT_PUBLIC_APP_NAME=LitReeLab Studio
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Firebase (Required for authentication & database)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6082148059-d1fec
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6082148059-d1fec.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://studio-6082148059-d1fec.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6082148059-d1fec.appspot.com

# Stripe (For payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Google AI (For content generation)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key

# OpenAI (For voice transcription - optional)
OPENAI_API_KEY=your_openai_api_key_here

# Microsoft 365 / Azure AD (For Office 365 integration - optional)
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft
```

### 🔧 Setting Up Required Services

#### **1. Firebase Setup (Required)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing: `studio-6082148059-d1fec`
3. Copy your credentials to `.env.local`:
   - Project ID
   - API Key
   - Auth Domain
   - Storage Bucket

#### **2. Stripe Setup (Required for Payments)**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API Keys from: Dashboard → API Keys
3. Get Webhook Secret from: Webhooks section
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Local Webhook Testing:**
```powershell
# Install Stripe CLI (one time)
# From: https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

#### **3. Google AI (Optional - for content generation)**

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_key_here
   ```

#### **4. Microsoft 365 Integration (Optional)**

1. Register app in [Azure Portal](https://portal.azure.com/)
2. Get credentials and update `.env.local`
3. No custom domain needed - uses `http://localhost:3000/api/auth/callback/microsoft`

---

## 🧪 Testing & Development

### Run Linting
```powershell
npm run lint
```

### Run Type Checking
```powershell
npm run typecheck
```

### Run All Tests
```powershell
npm run lint
npm run typecheck
npm run build
```

### Development Workflow

```powershell
# Terminal 1: Start dev server
npm run dev

# Terminal 2 (in another PowerShell): Run linting watch (if available)
npm run lint

# Open browser
# http://localhost:3000
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - No Custom Domain)

Vercel gives you a free `.vercel.app` domain:

1. **Connect to Vercel**:
   ```powershell
   npm install -g vercel
   vercel
   ```

2. **Vercel will ask**:
   - Project name: `litreelabstudio`
   - Framework: Next.js (auto-detected)
   - Root directory: ./
   - Build command: `npm run build` (auto-detected)

3. **Set Environment Variables**:
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_FIREBASE_*` variables
     - All other API keys

4. **Update Redirect URIs**:
   - Stripe: Add `https://litreelabstudio.vercel.app/api/webhooks/stripe`
   - Microsoft: Update to `https://litreelabstudio.vercel.app/api/auth/callback/microsoft`

5. **Deploy**:
   ```powershell
   vercel --prod
   ```

Your app will be live at: `https://litreelabstudio.vercel.app`

---

### Option 2: Docker (For Any Hosting)

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:24-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   ENV NODE_ENV=production
   CMD ["npm", "start"]
   ```

2. **Build and Run**:
   ```powershell
   docker build -t litreelabstudio .
   docker run -p 3000:3000 --env-file .env.local litreelabstudio
   ```

---

### Option 3: Self-Hosted (Ubuntu/Linux VPS)

1. **SSH into your server**
2. **Install Node.js 24+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and setup**:
   ```bash
   git clone https://github.com/LitLabs420/Labs-Ai.git
   cd Labs-Ai
   npm install
   npm run build
   ```

4. **Create PM2 config** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'litreelabstudio',
       script: 'npm',
       args: 'start',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

5. **Run with PM2**:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Add SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d your-domain.com
   ```

---

## 📝 Project Configuration Files Updated

### Files Changed:
- ✅ `package.json` - Name: `litreelabstudio`, Homepage: `http://localhost:3000`
- ✅ `app.json` - Name: `LitReeLab Studio`
- ✅ `.env.example` - Updated with proper localhost URLs
- ✅ `.env.local` - Added `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL`
- ✅ `Labs-Ai-Complete/package.json` - Synchronized with main package

### Technology Stack:
- **Framework**: Next.js 16.0.8 with Turbopack
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.17
- **Authentication**: Firebase
- **Payments**: Stripe
- **AI**: Google Generative AI
- **Database**: Firestore
- **Monitoring**: Sentry

---

## 🔍 Troubleshooting

### Port 3000 Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Firebase Connection Issues
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project
- Check API key is valid in Firebase Console
- Ensure Firestore is enabled in your Firebase project

### Stripe Webhook Not Working
- Install Stripe CLI: `https://stripe.com/docs/stripe-cli`
- Run: `stripe login`
- Run: `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
- Check webhook secret in Stripe Dashboard matches `.env.local`

### Build Fails
```powershell
# Clear build cache
Remove-Item -Path ".next" -Recurse -Force
npm cache clean --force

# Reinstall and rebuild
npm install
npm run build
```

---

## 📚 Project Structure

```
litreelabstudio/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── [other routes]/
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── dashboard/         # Dashboard components
├── lib/                    # Utility functions
│   ├── config/            # Configuration
│   ├── validators/        # Zod schemas
│   └── middleware/        # Express/Next middleware
├── public/                 # Static assets
├── types/                  # TypeScript types
├── .env.local             # Local environment variables
├── .env.example           # Example environment file
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

---

## ✨ Next Steps

1. **Verify everything works**:
   ```powershell
   npm run dev
   # Visit http://localhost:3000
   ```

2. **Add your API keys** to `.env.local` for Firebase, Stripe, Google AI

3. **Test core features**:
   - Sign up / Login
   - Create content
   - Process payments (if Stripe configured)
   - Upload files

4. **Deploy** using one of the options above (Vercel recommended)

5. **Monitor** with:
   - Sentry (error tracking already configured)
   - Firebase Console (database monitoring)
   - Stripe Dashboard (payments)

---

## 🆘 Need Help?

- **GitHub Issues**: https://github.com/LitLabs420/Labs-Ai
- **Documentation**: See README.md files in project
- **Firebase Support**: https://firebase.google.com/support
- **Stripe Support**: https://support.stripe.com
- **Next.js Docs**: https://nextjs.org/docs

---

## 📞 Support & Resources

- **Local Development**: `npm run dev` → `http://localhost:3000`
- **Production Build**: `npm run build && npm start`
- **Code Quality**: `npm run lint`
- **Type Checking**: `npm run typecheck`

---

**Created**: December 10, 2025
**Workspace**: LitReeLab Studio
**Status**: ✅ Ready for Development
