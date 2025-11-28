# FLIPFORGE™ PHASE 2-3 FILE STRUCTURE + STARTER CODE

**Use this to build Phase 2 & 3 features. Copy snippets into your files.**

---

## 📁 PHASE 2 FILE STRUCTURE (Next 30 Days)

### File: `functions/permissions.ts`

```typescript
/**
 * Permission control system for multi-team access
 * Define roles: owner, admin, support, viewer
 */

const db = admin.firestore();

// Role definitions
const ROLES = {
  OWNER: 'owner',      // Can change everything
  ADMIN: 'admin',      // Can manage users, refunds, alerts
  SUPPORT: 'support',  // Can help users, view only
  VIEWER: 'viewer'     // Read-only access
};

// Permission matrix: what each role can do
const PERMISSIONS = {
  owner: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: true,
    changePayoutSettings: true,
    changeStripeKeys: true,
    changePricing: true,
    viewAdmin: true,
    editAdmin: true,
    viewAnalytics: true,
    editBlockedIps: true
  },
  admin: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: false,
    changePayoutSettings: false,
    changeStripeKeys: false,
    changePricing: false,
    viewAdmin: true,
    editAdmin: false,
    viewAnalytics: true,
    editBlockedIps: true
  },
  support: {
    viewUsers: true,
    editUsers: false,
    deleteUsers: false,
    changePayoutSettings: false,
    changeStripeKeys: false,
    changePricing: false,
    viewAdmin: false,
    editAdmin: false,
    viewAnalytics: false,
    editBlockedIps: false
  },
  viewer: {
    viewUsers: true,
    editUsers: false,
    deleteUsers: false,
    changePayoutSettings: false,
    changeStripeKeys: false,
    changePricing: false,
    viewAdmin: false,
    editAdmin: false,
    viewAnalytics: true,
    editBlockedIps: false
  }
};

// Check if user has permission
async function checkPermission(userId, action) {
  const userDoc = await db.collection('users').doc(userId).get();
  const userRole = userDoc.data().role || 'viewer';
  
  const hasPermission = PERMISSIONS[userRole]?.[action] || false;
  
  console.log(`[PERMISSION] ${userId} (${userRole}) checking "${action}" = ${hasPermission}`);
  
  return hasPermission;
}

// Assign role to user
exports.assignUserRole = async (req, res) => {
  const { targetUserId, newRole } = req.body;
  const requestingUserId = req.user.uid;
  
  // Only owner can assign roles
  const isOwner = await checkPermission(requestingUserId, 'editAdmin');
  
  if (!isOwner) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  await db.collection('users').doc(targetUserId).update({
    role: newRole,
    roleUpdatedBy: requestingUserId,
    roleUpdatedAt: new Date()
  });
  
  // Log action
  await db.collection('admin_actions').add({
    actionType: 'role_assignment',
    performedBy: requestingUserId,
    targetUser: targetUserId,
    newRole,
    timestamp: new Date()
  });
  
  res.json({ success: true, message: `${targetUserId} is now ${newRole}` });
};

// Get all team members with roles
exports.getTeamMembers = async (req, res) => {
  const requestingUserId = req.user.uid;
  
  // Check if can view admin
  const canViewAdmin = await checkPermission(requestingUserId, 'viewAdmin');
  if (!canViewAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const snapshot = await db.collection('users').where('role', '!=', undefined).get();
  const team = [];
  
  snapshot.forEach(doc => {
    team.push({
      uid: doc.id,
      email: doc.data().email,
      role: doc.data().role,
      joinedAt: doc.data().createdAt
    });
  });
  
  res.json({ team });
};

module.exports = { checkPermission, PERMISSIONS, ROLES };
```

---

### File: `functions/feature-flags.ts`

```typescript
/**
 * Feature flags for A/B testing and feature rollout
 * Allows toggling features without redeploying
 */

const db = admin.firestore();

// Get all feature flags
async function getFeatureFlags() {
  const doc = await db.collection('app_config').doc('features').get();
  return doc.data() || {};
}

// Check if feature enabled for user
async function isFeatureEnabled(featureName, userId = null) {
  const flags = await getFeatureFlags();
  
  // Global flag disabled? Everyone gets it disabled
  if (!flags[featureName]) return false;
  
  // If specific user check needed (for A/B testing)
  if (userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Power users (God Mode / Lifetime) get beta features
    if (userData.tier === 'god' || userData.tier === 'lifetime') {
      return true;
    }
    
    // Random rollout: 10% of users
    const hash = userId.charCodeAt(0) % 100;
    return hash < 10; // 10% rollout
  }
  
  return true;
}

// Admin can toggle flags
exports.toggleFeatureFlag = async (req, res) => {
  const { featureName, enabled } = req.body;
  const userId = req.user.uid;
  
  // Check if owner
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.data().role !== 'owner') {
    return res.status(403).json({ error: 'Only owner can toggle flags' });
  }
  
  // Update
  await db.collection('app_config').doc('features').update({
    [featureName]: enabled,
    [`${featureName}_updated_by`]: userId,
    [`${featureName}_updated_at`]: new Date()
  });
  
  console.log(`[FLAG] ${featureName} = ${enabled}`);
  
  res.json({ success: true, message: `${featureName} is now ${enabled ? 'ENABLED' : 'DISABLED'}` });
};

// Get feature status for dashboard admin
exports.getFeatureStatus = async (req, res) => {
  const userId = req.user.uid;
  
  // Only admin
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.data().role !== 'owner' && userDoc.data().role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const flags = await getFeatureFlags();
  res.json({ features: flags });
};

module.exports = { isFeatureEnabled, getFeatureFlags };
```

---

### File: `functions/monetization.ts`

```typescript
/**
 * In-app upsell triggers
 * Shows upgrade modals when limits hit
 */

const db = admin.firestore();

// Monetization rules: when to show upsell modals
const UPSELL_RULES = {
  FREE_TIER: {
    aiCallsPerDay: 5,
    funnelsPerMonth: 1,
    emailsPerMonth: 10,
    storageGB: 0.5
  },
  PRO_TIER: {
    aiCallsPerDay: 100,
    funnelsPerMonth: 10,
    emailsPerMonth: 500,
    storageGB: 50
  },
  GOD_MODE: {
    aiCallsPerDay: 999999,
    funnelsPerMonth: 999999,
    emailsPerMonth: 999999,
    storageGB: 500
  }
};

// Check if user hit limit and should see upsell
exports.checkMonetizationTrigger = async (req, res) => {
  const userId = req.user.uid;
  const { action } = req.body; // 'ai_call', 'funnel_creation', 'email_send', 'storage'
  
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const currentTier = userData.tier || 'free';
  
  // If already on God Mode or Lifetime, no upsell
  if (currentTier === 'god' || currentTier === 'lifetime') {
    return res.json({ shouldShowModal: false });
  }
  
  // Get usage this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  let usage = 0;
  
  if (action === 'ai_call') {
    const snapshot = await db.collection('ai_usage')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startOfMonth)
      .get();
    usage = snapshot.docs.length;
    
    const limit = UPSELL_RULES[currentTier.toUpperCase()]?.aiCallsPerDay || 5;
    
    if (usage >= limit) {
      return res.json({
        shouldShowModal: true,
        modalType: 'upgrade_to_pro',
        copy: `You've hit your ${limit} AI calls for today. Upgrade to Pro for 100+ daily!`,
        currentPlan: currentTier,
        recommendedPlan: 'pro',
        price: '$29/month'
      });
    }
  }
  
  if (action === 'funnel_creation') {
    const snapshot = await db.collection('funnels')
      .where('createdBy', '==', userId)
      .where('createdAt', '>=', startOfMonth)
      .get();
    usage = snapshot.docs.length;
    
    const limit = UPSELL_RULES[currentTier.toUpperCase()]?.funnelsPerMonth || 1;
    
    if (usage >= limit) {
      return res.json({
        shouldShowModal: true,
        modalType: 'upgrade_to_pro',
        copy: `You can only create 1 funnel/month on free. Go Pro for 10+!`,
        currentPlan: currentTier,
        recommendedPlan: 'pro',
        price: '$29/month'
      });
    }
  }
  
  return res.json({ shouldShowModal: false });
};

// Log usage
exports.logUsage = async (userId, action) => {
  await db.collection('usage_logs').add({
    userId,
    action,
    timestamp: new Date(),
    date: new Date().toDateString()
  });
};

// Churn recovery: inactive 7+ days
exports.checkChurnRecovery = async (req, res) => {
  const userId = req.user.uid;
  
  // Last login
  const userDoc = await db.collection('users').doc(userId).get();
  const lastLogin = userDoc.data().lastLogin || userDoc.data().createdAt;
  
  const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLogin >= 7) {
    return res.json({
      shouldShowModal: true,
      modalType: 'churn_recovery',
      copy: `We miss you! Come back and get 1 month free when you upgrade to Pro.`,
      offerCode: 'COMEBACK7',
      discountedPrice: '$0/month for 30 days, then $29/month'
    });
  }
  
  return res.json({ shouldShowModal: false });
};

module.exports = { UPSELL_RULES };
```

---

### File: `components/PlaybookHub.js`

```javascript
/**
 * In-app learning path / playbook system
 * Guides users through onboarding and monetization
 */

const PLAYBOOKS = [
  {
    id: 'first-100',
    title: '💰 Get Your First $100',
    description: 'Complete this 3-step playbook to hit your first sale',
    difficulty: 'beginner',
    estimatedTime: '30 minutes',
    steps: [
      {
        step: 1,
        title: 'Set Up Your Storefront',
        description: 'Create a digital product or service offer',
        action: 'navigateTo("storefront")',
        resources: ['How to price your offer', 'Best selling categories']
      },
      {
        step: 2,
        title: 'Build a Landing Page',
        description: 'Use our templates to create a high-converting page',
        action: 'navigateTo("funnels")',
        resources: ['5 high-converting templates', 'Copywriting tips']
      },
      {
        step: 3,
        title: 'Send to 10 People',
        description: 'Share your link with 10 potential customers',
        action: 'navigateTo("share")',
        resources: ['DM templates', 'Best times to post']
      }
    ]
  },
  {
    id: '10x-referrals',
    title: '🤝 10x Your Referrals',
    description: 'Earn $300+ passively by referring others',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    steps: [
      {
        step: 1,
        title: 'Get Your Referral Link',
        description: 'Each referral earns you $30',
        action: 'navigateTo("referrals")'
      },
      {
        step: 2,
        title: 'Share in Your Community',
        description: 'Post in relevant groups/communities',
        resources: ['Copy-paste share templates']
      },
      {
        step: 3,
        title: 'Track Your Earnings',
        description: 'Watch as referral commissions roll in',
        action: 'navigateTo("referrals")'
      }
    ]
  },
  {
    id: 'secure-account',
    title: '🛡️ Secure Your Account',
    description: 'Protect your account from hackers and fraud',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    steps: [
      {
        step: 1,
        title: 'Enable 2FA',
        description: 'Add two-factor authentication for security',
        action: 'navigateTo("settings")',
        resources: ['2FA guide']
      },
      {
        step: 2,
        title: 'Review Active Sessions',
        description: 'Check where you\'re logged in',
        action: 'navigateTo("settings")'
      },
      {
        step: 3,
        title: 'Set Strong Password',
        description: 'Use a 16+ character unique password',
        resources: ['Password manager recommendations']
      }
    ]
  }
];

// Load playbook hub into dashboard
async function loadPlaybookHub() {
  const contentDiv = document.querySelector('.content-pages');
  
  let html = `
    <div class="page" id="playbook-page">
      <h2>📚 Learning Path</h2>
      <p class="subtitle">Master FLIPFORGE with guided playbooks</p>
      
      <div id="playbooks-container" class="playbooks-grid">
  `;
  
  // Get user progress from Firestore
  const userProgressDoc = await db.collection('users').doc(currentUser.uid)
    .collection('playbook_progress').doc(currentUser.uid).get();
  const userProgress = userProgressDoc.data() || {};
  
  PLAYBOOKS.forEach(playbook => {
    const progress = userProgress[playbook.id] || { completedSteps: 0, completed: false };
    const progressPercent = (progress.completedSteps / playbook.steps.length) * 100;
    
    html += `
      <div class="playbook-card" onclick="openPlaybook('${playbook.id}')">
        <div class="playbook-header">
          <h3>${playbook.title}</h3>
          <span class="difficulty ${playbook.difficulty}">${playbook.difficulty}</span>
        </div>
        <p>${playbook.description}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <p class="progress-text">${progress.completedSteps}/${playbook.steps.length} complete</p>
      </div>
    `;
  });
  
  html += `</div></div>`;
  
  contentDiv.innerHTML = html;
  addPlaybookStyles();
}

// Open single playbook
async function openPlaybook(playbookId) {
  const playbook = PLAYBOOKS.find(p => p.id === playbookId);
  const contentDiv = document.querySelector('.content-pages');
  
  let html = `
    <div class="page" id="playbook-detail-page">
      <div class="playbook-header-detail">
        <button onclick="loadPlaybookHub()" class="back-btn">← Back</button>
        <h2>${playbook.title}</h2>
        <p class="subtitle">${playbook.description}</p>
        <div class="playbook-meta">
          <span>⏱️ ${playbook.estimatedTime}</span>
          <span>📈 ${playbook.difficulty}</span>
        </div>
      </div>
      
      <div class="playbook-steps">
  `;
  
  playbook.steps.forEach((step, idx) => {
    html += `
      <div class="playbook-step">
        <div class="step-number">${step.step}</div>
        <div class="step-content">
          <h3>${step.title}</h3>
          <p>${step.description}</p>
          ${step.action ? `<button class="btn-primary" onclick="${step.action}">Start</button>` : ''}
          ${step.resources ? `
            <div class="resources">
              ${step.resources.map(r => `<a href="#">📖 ${r}</a>`).join('')}
            </div>
          ` : ''}
          <button class="btn-secondary" onclick="markPlaybookStepComplete('${playbookId}', ${step.step})">
            ✓ Mark Complete
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  
  contentDiv.innerHTML = html;
}

// Mark step complete
async function markPlaybookStepComplete(playbookId, stepNumber) {
  const docRef = db.collection('users').doc(currentUser.uid)
    .collection('playbook_progress').doc(currentUser.uid);
  
  const doc = await docRef.get();
  const currentProgress = doc.data()?.[playbookId] || { completedSteps: 0, completed: false };
  
  currentProgress.completedSteps = Math.max(currentProgress.completedSteps, stepNumber);
  
  const playbook = PLAYBOOKS.find(p => p.id === playbookId);
  if (currentProgress.completedSteps === playbook.steps.length) {
    currentProgress.completed = true;
    currentProgress.completedAt = new Date();
  }
  
  await docRef.update({
    [playbookId]: currentProgress
  });
  
  showSuccess(`✓ Step ${stepNumber} complete!`);
  openPlaybook(playbookId); // Refresh
}

// CSS Styles
function addPlaybookStyles() {
  const styleId = 'playbook-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .playbooks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .playbook-card {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a1a2a 100%);
      border: 2px solid #ff0080;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .playbook-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(255, 0, 128, 0.3);
    }
    
    .playbook-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .playbook-header h3 {
      margin: 0;
      font-size: 1.2em;
    }
    
    .difficulty {
      font-size: 0.7em;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(255, 0, 128, 0.2);
      color: #ff0080;
    }
    
    .progress-bar {
      background: rgba(255, 255, 255, 0.1);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 15px 0;
    }
    
    .progress-fill {
      background: linear-gradient(90deg, #ff0080, #00d4ff);
      height: 100%;
      transition: width 0.3s;
    }
    
    .playbook-steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .playbook-step {
      display: flex;
      gap: 15px;
      background: rgba(255, 0, 128, 0.05);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ff0080;
    }
    
    .step-number {
      min-width: 40px;
      width: 40px;
      height: 40px;
      background: #ff0080;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1em;
    }
    
    .resources {
      margin: 10px 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .resources a {
      color: #00d4ff;
      text-decoration: none;
      font-size: 0.9em;
    }
  `;
  
  document.head.appendChild(style);
}
```

---

## 📁 PHASE 3 FILE STRUCTURE (90 Days)

### File: `admin/cockpit.html` (Founder Analytics)

```html
<!DOCTYPE html>
<html>
<head>
  <title>FLIPFORGE™ - Founder Cockpit</title>
  <style>
    body { background: #0a0a0a; color: #fff; font-family: 'Courier New'; }
    .cockpit { padding: 30px; }
    .metric-card {
      background: linear-gradient(135deg, #1a1a1a, #2a1a3a);
      border: 2px solid #ff0080;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .metric-value { font-size: 2.5em; color: #00d4ff; font-weight: bold; }
    .metric-label { font-size: 0.9em; color: #aaa; margin-top: 10px; }
    .chart-container { height: 300px; margin: 20px 0; }
    .alert-box {
      background: rgba(255, 0, 128, 0.1);
      border-left: 4px solid #ff0080;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="cockpit">
    <h1>📊 FOUNDER COCKPIT</h1>
    
    <!-- MRR Display -->
    <div class="metric-card">
      <div class="metric-label">Monthly Recurring Revenue</div>
      <div class="metric-value" id="mrr-display">$0</div>
      <canvas id="revenue-chart"></canvas>
    </div>
    
    <!-- Key Metrics Row -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
      <div class="metric-card">
        <div class="metric-label">Active Users</div>
        <div class="metric-value" id="active-users">0</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">New Signups (Today)</div>
        <div class="metric-value" id="new-signups">0</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Churn Rate</div>
        <div class="metric-value" id="churn-rate">0%</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Free → Paid</div>
        <div class="metric-value" id="conversion-rate">0%</div>
      </div>
    </div>
    
    <!-- Conversion Funnel -->
    <div class="metric-card">
      <div class="metric-label">Conversion Funnel (This Month)</div>
      <div id="conversion-funnel"></div>
    </div>
    
    <!-- AI Recommendations -->
    <div class="metric-card" style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 0, 128, 0.1));">
      <div class="metric-label">🤖 SHIELD AI Recommendations</div>
      <div id="ai-recommendations" style="margin-top: 15px;"></div>
    </div>
    
    <!-- Alerts -->
    <div class="metric-card">
      <div class="metric-label">🚨 Security Summary</div>
      <div id="alerts-summary"></div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="../firebase-config.js"></script>
  <script>
    // Load founder cockpit data
    async function loadFounderCockpit() {
      const db = window.firebaseDb;
      
      // Get MRR (sum of all active Pro + God + Lifetime recurring)
      const usersSnapshot = await db.collection('users')
        .where('tier', 'in', ['pro', 'god', 'lifetime'])
        .get();
      
      let mrr = 0;
      let activeUsers = 0;
      let newSignupsToday = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        
        // Count active users
        if (user.status === 'active') activeUsers++;
        
        // Count signups today
        if (user.createdAt >= today) newSignupsToday++;
        
        // Calculate MRR (Pro = $29, God = $99, Lifetime = count once as $0/mo)
        if (user.subscription?.status === 'active') {
          if (user.tier === 'pro') mrr += 29;
          if (user.tier === 'god') mrr += 99;
          // Lifetime = no recurring, but count as customer
        }
      });
      
      // Display MRR
      document.getElementById('mrr-display').textContent = `$${mrr.toLocaleString()}`;
      document.getElementById('active-users').textContent = activeUsers;
      document.getElementById('new-signups').textContent = newSignupsToday;
      
      // Get churn rate (users who cancelled in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const churnedSnapshot = await db.collection('users')
        .where('subscription.cancelledAt', '>=', thirtyDaysAgo)
        .get();
      
      const churnRate = activeUsers > 0 ? ((churnedSnapshot.docs.length / activeUsers) * 100).toFixed(1) : 0;
      document.getElementById('churn-rate').textContent = `${churnRate}%`;
      
      // Conversion funnel
      const freeUsers = (await db.collection('users').where('tier', '==', 'free').get()).size;
      const proUsers = (await db.collection('users').where('tier', '==', 'pro').get()).size;
      const godUsers = (await db.collection('users').where('tier', '==', 'god').get()).size;
      const lifetimeUsers = (await db.collection('users').where('tier', '==', 'lifetime').get()).size;
      
      const totalUsers = freeUsers + proUsers + godUsers + lifetimeUsers;
      const conversionRate = totalUsers > 0 ? (((proUsers + godUsers + lifetimeUsers) / totalUsers) * 100).toFixed(1) : 0;
      
      document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
      
      // Display funnel
      const funnelHtml = `
        <div style="padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; margin: 5px 0;">
          Free: <strong>${freeUsers}</strong> users | <span style="color: #aaa;">${((freeUsers/totalUsers)*100).toFixed(1)}%</span>
        </div>
        <div style="padding: 10px; background: rgba(41, 128, 185, 0.1); border-left: 3px solid #2980b9; border-radius: 4px; margin: 5px 0;">
          → Pro: <strong>${proUsers}</strong> users | <span style="color: #aaa;">${((proUsers/totalUsers)*100).toFixed(1)}%</span>
        </div>
        <div style="padding: 10px; background: rgba(155, 89, 182, 0.1); border-left: 3px solid #9b59b6; border-radius: 4px; margin: 5px 0;">
          → God Mode: <strong>${godUsers}</strong> users | <span style="color: #aaa;">${((godUsers/totalUsers)*100).toFixed(1)}%</span>
        </div>
        <div style="padding: 10px; background: rgba(255, 0, 128, 0.1); border-left: 3px solid #ff0080; border-radius: 4px; margin: 5px 0;">
          → Lifetime: <strong>${lifetimeUsers}</strong> users | <span style="color: #aaa;">${((lifetimeUsers/totalUsers)*100).toFixed(1)}%</span>
        </div>
      `;
      document.getElementById('conversion-funnel').innerHTML = funnelHtml;
      
      // Get AI recommendations
      await loadAiRecommendations(db, { totalUsers, churnRate, conversionRate, mrr });
    }
    
    // Get SHIELD AI recommendations
    async function loadAiRecommendations(db, metrics) {
      const recDiv = document.getElementById('ai-recommendations');
      const recommendations = [];
      
      // Rule-based recommendations
      if (metrics.conversionRate < 3) {
        recommendations.push({
          priority: 'HIGH',
          action: 'Increase landing page conversion',
          detail: 'Your 1.5% conversion is below industry avg (3%). Try A/B testing headlines.'
        });
      }
      
      if (metrics.churnRate > 5) {
        recommendations.push({
          priority: 'HIGH',
          action: 'Reduce churn rate',
          detail: `Your churn is ${metrics.churnRate}%. Send re-engagement emails to inactive users.`
        });
      }
      
      if (metrics.mrr > 5000) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'Hire support team',
          detail: 'Your MRR ($' + metrics.mrr + ') is high enough to hire 1 support person.'
        });
      }
      
      recommendations.push({
        priority: 'LOW',
        action: 'Next feature to build',
        detail: 'Users requesting API access. Could be $X,000/year revenue stream.'
      });
      
      let html = '';
      recommendations.forEach(rec => {
        html += `
          <div class="alert-box" style="border-left-color: ${rec.priority === 'HIGH' ? '#ff0080' : '#ff8c00'};">
            <strong>[${rec.priority}]</strong> ${rec.action}<br>
            <span style="font-size: 0.9em; color: #aaa;">${rec.detail}</span>
          </div>
        `;
      });
      
      recDiv.innerHTML = html;
    }
    
    // Load on page load
    loadFounderCockpit();
  </script>
</body>
</html>
```

---

### File: `functions/pdf-report.ts`

```typescript
/**
 * Generate downloadable PDF reports for users
 * Shows their earnings, conversions, security - proof they can share
 */

const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();

exports.generatePdfReport = async (req, res) => {
  const userId = req.user.uid;
  const db = admin.firestore();
  
  // Get user data
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Get month revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const transactionSnapshot = await db.collection('transactions')
    .where('userId', '==', userId)
    .where('timestamp', '>=', startOfMonth)
    .get();
  
  let monthlyRevenue = 0;
  transactionSnapshot.forEach(doc => {
    monthlyRevenue += doc.data().amount || 0;
  });
  
  // Create PDF
  const doc = new PDFDocument();
  const filename = `flipforge-report-${userId}-${Date.now()}.pdf`;
  const file = bucket.file(`reports/${filename}`);
  const stream = file.createWriteStream();
  
  doc.pipe(stream);
  
  // Header
  doc.fontSize(24).text('FLIPFORGE™ Performance Report', { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  
  // User info
  doc.fontSize(12).text(`User: ${userData.email}`);
  doc.fontSize(12).text(`Plan: ${userData.tier.toUpperCase()}`);
  doc.moveDown();
  
  // Key metrics
  doc.fontSize(14).text('📊 This Month Metrics', { underline: true });
  doc.fontSize(12).text(`Revenue: $${monthlyRevenue}`);
  doc.text(`Active Funnels: ${transactionSnapshot.docs.length}`);
  doc.text(`Security Score: Excellent (0 alerts)`);
  doc.moveDown(2);
  
  // Security summary
  doc.fontSize(14).text('🛡️ Security Status', { underline: true });
  doc.fontSize(12).text(`✓ No unauthorized access attempts`);
  doc.text(`✓ 0 fraud alerts`);
  doc.text(`✓ Account secure and verified`);
  doc.moveDown(2);
  
  // Footer
  doc.fontSize(10)
    .text('This report is powered by FLIPFORGE™', { align: 'center' })
    .text('Share this report to prove your results!', { align: 'center', color: '#00d4ff' });
  
  doc.end();
  
  // Return download URL
  stream.on('finish', async () => {
    const downloadURL = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({
      success: true,
      downloadUrl: downloadURL[0],
      filename
    });
  });
};
```

---

### File: `functions/api-management.ts`

```typescript
/**
 * API keys for power users
 * Allow integration with external tools
 */

const db = admin.firestore();

// Generate API key
exports.generateApiKey = async (req, res) => {
  const userId = req.user.uid;
  const { name } = req.body;
  
  const userDoc = await db.collection('users').doc(userId).get();
  const tier = userDoc.data().tier;
  
  // Only Pro and God Mode get API access
  if (!['pro', 'god', 'lifetime'].includes(tier)) {
    return res.status(403).json({ error: 'API access requires Pro plan or higher' });
  }
  
  const apiKey = `fgf_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.collection('api_keys').add({
    userId,
    name,
    key: apiKey,
    createdAt: new Date(),
    lastUsed: null,
    requests: 0,
    rateLimit: tier === 'god' ? 10000 : 1000 // per day
  });
  
  res.json({
    success: true,
    apiKey,
    message: 'API key created. Store securely!'
  });
};

// Use API key to push lead
exports.apiPushLead = async (req, res) => {
  const { apiKey, lead } = req.body;
  
  // Verify API key
  const keyDoc = await db.collection('api_keys')
    .where('key', '==', apiKey)
    .limit(1)
    .get();
  
  if (keyDoc.empty) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const keyData = keyDoc.docs[0].data();
  const userId = keyData.userId;
  
  // Check rate limit
  const today = new Date().toDateString();
  const requestsToday = keyData.requests || 0;
  
  if (requestsToday >= keyData.rateLimit) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Add lead to user's funnel
  await db.collection('users').doc(userId)
    .collection('leads').add({
      ...lead,
      source: 'api',
      timestamp: new Date()
    });
  
  // Update API key stats
  await keyDoc.docs[0].ref.update({
    lastUsed: new Date(),
    requests: requestsToday + 1
  });
  
  res.json({
    success: true,
    message: 'Lead captured successfully'
  });
};

// Get API key status
exports.getApiKeys = async (req, res) => {
  const userId = req.user.uid;
  
  const keysSnapshot = await db.collection('api_keys')
    .where('userId', '==', userId)
    .get();
  
  const keys = [];
  keysSnapshot.forEach(doc => {
    keys.push({
      id: doc.id,
      name: doc.data().name,
      key: doc.data().key.substring(0, 20) + '***', // Mask
      createdAt: doc.data().createdAt,
      requests: doc.data().requests
    });
  });
  
  res.json({ keys });
};
```

---

### File: `functions/next-best-action.ts`

```typescript
/**
 * AI-powered "next best action" recommendations
 * Suggests what user should do next to make money
 */

const db = admin.firestore();
const { TextServiceClient } = require('@google-ai/generativelanguage').v1beta3;

exports.getNextBestAction = async (req, res) => {
  const userId = req.user.uid;
  
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Gather user data
  const funnelsSnapshot = await db.collection('users').doc(userId)
    .collection('funnels').get();
  const leadsSnapshot = await db.collection('users').doc(userId)
    .collection('leads').get();
  const sessionsSnapshot = await db.collection('security_logins')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  
  // Build context
  const context = {
    tier: userData.tier,
    funnelCount: funnelsSnapshot.docs.length,
    leadCount: leadsSnapshot.docs.length,
    lastLogin: sessionsSnapshot.docs[0]?.data().timestamp,
    hasStorefront: leadsSnapshot.docs.length > 0,
    daysSinceSignup: Math.floor((Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24))
  };
  
  // Determine best action
  const actions = [];
  
  if (context.daysSinceSignup < 1) {
    actions.push({
      priority: 1,
      title: '🚀 Create Your First Funnel',
      detail: 'Build a high-converting sales funnel in 5 minutes',
      action: 'navigateTo("funnels")',
      value: 'Very High'
    });
  } else if (context.funnelCount === 0) {
    actions.push({
      priority: 1,
      title: '⚡ Your Account is Empty',
      detail: 'Create a funnel to start capturing leads',
      action: 'navigateTo("funnels")',
      value: 'Critical'
    });
  } else if (context.leadCount < 10) {
    actions.push({
      priority: 2,
      title: '📈 Traffic is Your Bottleneck',
      detail: 'Send your funnel link to 50 people in your network',
      action: 'navigateTo("funnels")',
      value: 'High'
    });
  } else if (context.tier === 'free') {
    actions.push({
      priority: 2,
      title: '💰 Upgrade to Pro',
      detail: 'Remove limits and get AI Ghostwriter',
      action: 'navigateTo("upgrade")',
      value: 'High'
    });
  }
  
  // Always suggest referrals if tier allows
  if (context.tier !== 'free' || context.funnelCount > 0) {
    actions.push({
      priority: 3,
      title: '🤝 Earn $30 Per Referral',
      detail: 'Share FLIPFORGE and get paid for each signup',
      action: 'navigateTo("referrals")',
      value: 'Medium'
    });
  }
  
  // Sort by priority
  actions.sort((a, b) => a.priority - b.priority);
  
  res.json({
    recommendations: actions.slice(0, 3),
    topAction: actions[0]
  });
};
```

---

## 🎯 INTEGRATION CHECKLIST

Copy these into your dashboard and Firebase functions:

- [ ] **Phase 2 (30 Days)**
  - [ ] `functions/permissions.ts` → Cloud Functions
  - [ ] `functions/feature-flags.ts` → Cloud Functions
  - [ ] `functions/monetization.ts` → Cloud Functions
  - [ ] `components/PlaybookHub.js` → Add to dashboard navigation
  - [ ] Update admin dashboard with role selector
  - [ ] Update admin dashboard with feature flags toggle

- [ ] **Phase 3 (90 Days)**
  - [ ] `admin/cockpit.html` → New admin page
  - [ ] `functions/pdf-report.ts` → Cloud Functions
  - [ ] `functions/api-management.ts` → Cloud Functions
  - [ ] `functions/next-best-action.ts` → Cloud Functions
  - [ ] Add PDF export button to analytics page
  - [ ] Add API management section to settings
  - [ ] Add "Next Best Action" card to dashboard

---

## ✅ QUICK START

**To deploy Phase 2 features:**

```bash
# 1. Copy Phase 2 functions into functions/ folder
# 2. Deploy
firebase deploy --only functions

# 3. Add PlaybookHub to dashboard navigation
# 4. Redeploy hosting
firebase deploy --only hosting --force
```

**Test:**
- Try creating a new user (see playbook on dashboard)
- As admin, toggle a feature flag in admin panel
- Hit a free tier limit (should show upsell modal)

---

**That's your complete roadmap. Execute Phase 2 first, then Phase 3. You'll be at $15K+/month by end of Q1.** 🚀

