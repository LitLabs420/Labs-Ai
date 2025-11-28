// FLIPFORGE™ FIRESTORE DATABASE SCHEMA
// Copy this structure to Firebase Console or deploy via Cloud Functions

// ============================================================================
// COLLECTIONS OVERVIEW
// ============================================================================
/*
FLIPFORGE uses these Firestore collections:

1. users/              → User accounts, subscriptions, profiles
2. funnels/            → Sales funnels created by users
3. products/           → Digital products for sale (storefront)
4. email_sequences/    → Pre-written email automation sequences
5. transactions/       → Payment history, upgrades, refunds
6. referrals/          → Referral link tracking, earnings
7. challenges/         → Weekly income challenges
8. analytics/          → User activity tracking
9. ai_generated/       → Cache of AI-generated content
10. admin_settings/    → Platform configuration
*/

// ============================================================================
// 1. USERS COLLECTION
// ============================================================================
{
  uid: "user123",
  email: "creator@example.com",
  displayName: "Creator Name",
  photoURL: "https://...",
  tier: "free" | "pro" | "godmode",
  status: "active" | "suspended" | "cancelled",
  
  // Subscription info
  subscription: {
    plan: "pro" | "godmode",
    status: "active" | "cancelled" | "past_due",
    customerId: "cus_stripe123",
    subscriptionId: "sub_stripe123",
    createdAt: Timestamp,
    endsAt: Timestamp | null,
    currentPeriodStart: Timestamp,
    currentPeriodEnd: Timestamp,
  },

  // Profile
  skills: ["copywriting", "design", "social media"],
  incomeGoal: 1000 | 5000 | 10000,
  hasAudience: false | true,
  audienceSize: 0 | 1000 | 10000,
  bio: "I help entrepreneurs...",

  // Money Map (AI-generated)
  moneyMap: {
    primaryPath: "service_selling",
    estimatedMonthly: 5000,
    recommendations: ["Email marketing", "Content creation", "Funnel building"],
    generatedAt: Timestamp,
  },

  // Stats
  totalRevenue: 5000,
  totalCustomers: 12,
  averageOrderValue: 416.67,
  monthlyRecurring: 1740,
  
  // Reputation
  xpScore: 2500,
  level: 5,
  badges: ["first_offer", "100_revenue", "10_customers"],
  
  // Settings
  emailNotifications: true,
  marketingEmails: true,
  
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  updatedAt: Timestamp,
}

// ============================================================================
// 2. FUNNELS COLLECTION
// ============================================================================
{
  funnelId: "funnel_123",
  userId: "user123",
  name: "Email Course Funnel",
  type: "webinar" | "product_launch" | "service_sales" | "lead_generation",
  
  // Core funnel data
  product: {
    name: "Social Media Mastery Course",
    description: "Learn to grow 10K followers in 30 days",
    price: 97,
    currency: "USD",
    image: "https://...",
  },

  // Pages
  pages: [
    {
      pageId: "landing_page",
      type: "landing",
      headline: "Make $10K/Month on Social Media",
      subheadline: "The Step-by-Step Framework Used by 1000+ Creators",
      copyAiGenerated: true,
      conversionRate: 0.08,
    },
    {
      pageId: "checkout_page",
      type: "checkout",
      buttonText: "Unlock Now (Limited Spots)",
      copyAiGenerated: true,
    },
    {
      pageId: "thank_you_page",
      type: "thank_you",
      message: "Welcome! Check your email for immediate access.",
    },
  ],

  // Email automation
  emailSequence: {
    enabled: true,
    emails: [
      {
        dayDelay: 0,
        subject: "Welcome to [Product]",
        template: "welcome_template",
        openRate: 0.45,
        clickRate: 0.12,
      },
      {
        dayDelay: 3,
        subject: "Here's What You're Missing...",
        template: "value_email",
        openRate: 0.42,
      },
      {
        dayDelay: 7,
        subject: "Last Chance - Limited Spots Left",
        template: "urgency_email",
        openRate: 0.38,
      },
    ],
  },

  // Performance
  stats: {
    visitors: 1250,
    subscribers: 180,
    customers: 24,
    revenue: 2328,
    conversionRate: 0.018,
    averageOrderValue: 97,
  },

  // Settings
  isPublished: true,
  customUrl: "flipforge.io/social-mastery",
  trackingId: "gtag_123",
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
}

// ============================================================================
// 3. EMAIL_SEQUENCES COLLECTION (Pre-written templates)
// ============================================================================
{
  sequenceId: "welcome_sequence_v1",
  userId: "user123",
  templateId: "welcome_5email",
  name: "Welcome Sequence (5 Emails)",
  description: "Pre-written welcome emails for new subscribers",
  
  emails: [
    {
      emailNumber: 1,
      dayDelay: 0,
      subject: "[First Name], Welcome to {{PRODUCT_NAME}}!",
      preheader: "Here's your immediate action plan...",
      body: `
        Hi [First Name],

        Welcome to {{PRODUCT_NAME}}!

        I created this for people like you who want to {{OUTCOME}}.

        Here's what makes this special:
        • {{BENEFIT_1}}
        • {{BENEFIT_2}}
        • {{BENEFIT_3}}

        Tomorrow I'm sending you Step 1.

        Talk soon,
        [Your Name]
      `,
      cta: {
        text: "Get Started",
        url: "https://{{DOMAIN}}/start",
      },
      openRateAvg: 0.45,
      clickRateAvg: 0.12,
    },
    {
      emailNumber: 2,
      dayDelay: 1,
      subject: "{{FIRST_NAME}}, The First Step Most People Miss",
      preheader: "This is critical if you want {{OUTCOME}}",
      body: `
        Hey {{FIRST_NAME}},

        Most people jump straight to the advanced tactics.

        Big mistake.

        The first step is {{STEP_1}}.

        Why? Because {{REASON}}.

        Try this today and reply with your results.

        [Your Name]
      `,
      cta: {
        text: "Show Me Step 1",
        url: "https://{{DOMAIN}}/step-1",
      },
      openRateAvg: 0.42,
      clickRateAvg: 0.10,
    },
    {
      emailNumber: 3,
      dayDelay: 3,
      subject: "Here's What {{FIRST_NAME}} Did Wrong",
      preheader: "And how to avoid the same mistake...",
      body: `
        {{FIRST_NAME}},

        I got an email from someone asking: "Why isn't my {{PRODUCT}} selling?"

        After asking a few questions, I found the problem: {{MISTAKE}}.

        This is the #1 reason people fail at {{GOAL}}.

        The fix? {{SOLUTION}}.

        Try this and let me know.

        [Your Name]
      `,
      cta: {
        text: "Fix My {{PRODUCT}}",
        url: "https://{{DOMAIN}}/fix",
      },
      openRateAvg: 0.38,
      clickRateAvg: 0.09,
    },
    {
      emailNumber: 4,
      dayDelay: 5,
      subject: "{{FIRST_NAME}}, You're Doing It Wrong (Social Proof Inside)",
      preheader: "Proof that this works...",
      body: `
        {{FIRST_NAME}},

        One of my students implemented {{SOLUTION}} and made ${{AMOUNT}} in {{TIMEFRAME}}.

        Here's exactly what they did:

        Step 1: {{STEP_1}}
        Step 2: {{STEP_2}}
        Step 3: {{STEP_3}}

        Ready to copy their success?

        [Your Name]
      `,
      cta: {
        text: "Copy This System",
        url: "https://{{DOMAIN}}/system",
      },
      openRateAvg: 0.52,
      clickRateAvg: 0.15,
    },
    {
      emailNumber: 5,
      dayDelay: 7,
      subject: "Last Email: The {{OUTCOME}} Blueprint {{FIRST_NAME}}",
      preheader: "Your action plan is inside...",
      body: `
        {{FIRST_NAME}},

        This is my final email in this sequence.

        If you want {{OUTCOME}}, here's your blueprint:

        {{BLUEPRINT}}

        Now it's time to act.

        Either you'll {{RESULT_IF_YES}} or you'll {{RESULT_IF_NO}}.

        The choice is yours.

        [Your Name]

        P.S. If you have questions, reply to this email.
      `,
      cta: {
        text: "Get The Blueprint",
        url: "https://{{DOMAIN}}/blueprint",
      },
      openRateAvg: 0.41,
      clickRateAvg: 0.11,
    },
  ],

  avgOpenRate: 0.42,
  avgClickRate: 0.11,
  deployments: 15,
  totalEmailed: 3240,
  totalRevenue: 45600,
  
  createdAt: Timestamp,
}

// ============================================================================
// 4. TRANSACTIONS COLLECTION
// ============================================================================
{
  transactionId: "txn_123",
  userId: "user123",
  type: "upgrade" | "purchase" | "referral_payout" | "affiliate_commission" | "refund",
  
  // Transaction details
  amount: 2900, // in cents ($29.00)
  currency: "USD",
  status: "completed" | "failed" | "pending" | "refunded",
  
  // What was purchased
  itemType: "subscription" | "product" | "course",
  itemId: "plan_pro",
  plan: "pro",
  description: "FLIPFORGE Pro Monthly Subscription",
  
  // Payment method
  paymentMethod: {
    type: "card",
    brand: "visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2025,
  },

  // Stripe reference
  stripeTransactionId: "pi_123456789",
  stripeInvoiceId: "in_123456789",
  
  // Referral info (if applicable)
  referrerId: "user456",
  referrerEarnings: 500, // in cents
  
  metadata: {
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0...",
    source: "upgrade_modal",
  },

  createdAt: Timestamp,
  completedAt: Timestamp,
}

// ============================================================================
// 5. REFERRALS COLLECTION
// ============================================================================
{
  referralId: "ref_123",
  referrerId: "user123",
  referralCode: "YOU123456",
  referralLink: "https://flipforge.io?ref=YOU123456",
  
  // Tracking
  totalClicks: 450,
  totalSignups: 23,
  totalConversions: 6, // People who upgraded to paid
  
  // Earnings
  totalEarnings: 18000, // in cents ($180)
  pendingEarnings: 3000,
  paidOutEarnings: 15000,
  
  // Detailed referrals
  referrals: [
    {
      referralId: "refer_456",
      email: "newuser@example.com",
      signupDate: Timestamp,
      status: "converted", // free | trial | converted | churned
      conversionDate: Timestamp,
      plan: "pro",
      earnings: 3000, // referrer gets $30 per conversion
    },
  ],

  // Settings
  customLink: "flipforge.io/build-with-you",
  tierLevel: "gold", // bronze (0-10), silver (11-50), gold (50+)
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
}

// ============================================================================
// 6. PRODUCTS COLLECTION (Creator Storefront)
// ============================================================================
{
  productId: "prod_123",
  userId: "user123",
  name: "Social Media Mastery Template Pack",
  description: "Copy-paste templates for Twitter, Instagram, LinkedIn",
  category: "template" | "ebook" | "course" | "service",
  price: 47,
  currency: "USD",
  
  // Content
  content: {
    fileUrl: "https://storage.googleapis.com/...",
    fileType: "pdf" | "zip" | "video" | "course",
    fileSize: 15000000, // bytes
  },

  // Marketing
  image: "https://...",
  tags: ["social media", "content", "marketing"],
  description: "5 complete templates...",
  sampleContent: "Here's what's inside...",

  // Sales data
  totalSales: 142,
  totalRevenue: 6674,
  averageRating: 4.8,
  totalReviews: 31,

  // Visibility
  isPublished: true,
  featured: false,
  featuredRank: null,

  createdAt: Timestamp,
  updatedAt: Timestamp,
}

// ============================================================================
// 7. ANALYTICS COLLECTION
// ============================================================================
{
  analyticsId: "analytics_user123_nov2025",
  userId: "user123",
  date: "2025-11-28",
  
  // Daily metrics
  dailyRevenue: 145,
  dailyCustomers: 2,
  dailyVisitors: 120,
  dailySignups: 8,
  
  // Cumulatives
  monthlyRevenue: 4850,
  monthlyCustomers: 42,
  monthlyVisitors: 3200,
  monthlySignups: 185,

  // Engagement
  emailsSent: 450,
  emailsOpened: 189,
  emailsClicked: 42,
  emailsConverted: 8,

  // Funnels
  topFunnel: "social_mastery",
  topFunnelRevenue: 1240,

  // Traffic sources
  trafficSources: {
    organic: 0.35,
    paid: 0.20,
    referral: 0.25,
    direct: 0.20,
  },

  createdAt: Timestamp,
}

// ============================================================================
// 8. CHALLENGES COLLECTION (Gamification)
// ============================================================================
{
  challengeId: "challenge_nov_week1",
  title: "Make Your First $100",
  description: "Get 2 customers to spend $50+ each",
  reward: {
    xp: 1000,
    badge: "first_hundred",
    featured: true,
  },
  
  // Leaderboard
  participants: [
    {
      userId: "user123",
      username: "Creator Name",
      progress: 100,
      completed: true,
      completedDate: Timestamp,
      rank: 1,
    },
  ],

  startDate: Timestamp,
  endDate: Timestamp,
}

// ============================================================================
// SECURITY RULES (Copy to Firebase Console → Firestore Rules)
// ============================================================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data only
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Funnels - users can access their own
    match /funnels/{funnelId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Transactions - read own only
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.userId;
    }
    
    // Products in storefront - anyone can read, users can write their own
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Referrals - read/write own
    match /referrals/{referralId} {
      allow read, write: if request.auth.uid == resource.data.referrerId;
    }
  }
}
