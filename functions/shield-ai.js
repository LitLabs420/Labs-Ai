// SHIELD AI - Security & Fraud Detection System
// Firebase Cloud Functions + Firestore Backend

// ===== FIRESTORE COLLECTIONS SCHEMA =====

/*
Collection: security_logins
{
  userId: string,
  timestamp: Date,
  ip: string,
  country: string,
  deviceId: string (hash of userAgent + fingerprint),
  success: boolean,
  source: 'web' | 'mobile' | 'admin',
  userAgent: string,
  latitude?: number,
  longitude?: number
}

Collection: security_sessions
{
  userId: string,
  sessionId: string (unique per session),
  createdAt: Date,
  lastSeenAt: Date,
  deviceId: string,
  ip: string,
  country: string,
  isActive: boolean,
  deviceName?: string (e.g., "Chrome on Windows")
}

Collection: security_alerts
{
  userId: string (nullable for system-level alerts),
  severity: 'low' | 'medium' | 'high' | 'critical',
  type: 'new_device' | 'impossible_travel' | 'card_fraud' | 'referral_abuse' | 'brute_force' | 'admin_snoop' | 'account_sharing',
  message: string,
  meta: {
    previousCountry?: string,
    newCountry?: string,
    timeDifference?: number,
    cardFingerprint?: string,
    fraudScore?: number,
    ip?: string,
    deviceIds?: string[]
  },
  status: 'open' | 'investigating' | 'resolved' | 'false_alarm',
  createdAt: Date,
  resolvedBy?: string,
  resolvedAt?: Date,
  actionsTaken?: string[]
}

Collection: payments_events
{
  userId: string,
  stripeCustomerId: string,
  type: 'payment_succeeded' | 'charge_refunded' | 'dispute_created' | 'charge_declined',
  amount: number,
  currency: string,
  ip: string,
  country: string,
  cardFingerprint: string (last 4 digits + hash),
  timestamp: Date,
  metadata: {
    chargeId: string,
    invoiceId?: string,
    disputeId?: string,
    description: string
  }
}

Collection: referral_events
{
  referrerUserId: string,
  refereeUserId: string,
  ip: string,
  deviceId: string,
  timestamp: Date,
  source: 'link' | 'code' | 'email',
  referralCode: string,
  success: boolean
}

Collection: blocked_ips
{
  ip: string,
  reason: string,
  blockedAt: Date,
  blockedBy: string (admin email),
  expiresAt?: Date,
  permanent: boolean
}

Collection: admin_actions
{
  adminUserId: string,
  action: 'force_logout' | 'block_ip' | 'require_mfa' | 'ban_user' | 'mark_safe' | 'refund_charge',
  targetUserId?: string,
  targetIp?: string,
  reason: string,
  timestamp: Date,
  metadata: any
}
*/

// ===== CLOUD FUNCTIONS =====

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geoip = require('geoip-lite');

admin.initializeApp();
const db = admin.firestore();

// ===== 1. Log Login Events =====
exports.logSecurityLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error('Must be authenticated');

  const { ip, deviceId, userAgent, source } = data;
  const userId = context.auth.uid;

  try {
    // Get geolocation from IP
    const geo = geoip.lookup(ip) || {};
    
    // Check for bruteforce (5+ failed attempts in 5 min)
    const recentFailed = await db.collection('security_logins')
      .where('userId', '==', userId)
      .where('success', '==', false)
      .where('ip', '==', ip)
      .where('timestamp', '>', new Date(Date.now() - 5 * 60 * 1000))
      .get();

    if (recentFailed.size >= 5) {
      // Block this IP temporarily
      await blockIpTemporarily(ip, 'Brute force detected', 15);
      
      // Create alert
      await createAlert({
        userId,
        severity: 'high',
        type: 'brute_force',
        message: `${recentFailed.size} failed login attempts from ${ip} (${geo.country})`,
        meta: { ip, country: geo.country, attempts: recentFailed.size }
      });
    }

    // Log the login
    await db.collection('security_logins').add({
      userId,
      timestamp: new Date(),
      ip,
      country: geo.country || 'UNKNOWN',
      deviceId,
      success: true,
      source,
      userAgent,
      latitude: geo.ll ? geo.ll[0] : null,
      longitude: geo.ll ? geo.ll[1] : null
    });

    // Update or create session
    const sessionId = `${userId}_${deviceId}`;
    await db.collection('security_sessions').doc(sessionId).set({
      userId,
      sessionId,
      createdAt: new Date(),
      lastSeenAt: new Date(),
      deviceId,
      ip,
      country: geo.country || 'UNKNOWN',
      isActive: true,
      deviceName: parseDeviceName(userAgent)
    }, { merge: true });

    // Check for impossible travel
    await detectImpossibleTravel(userId, geo.country, ip);

    // Check for account sharing (too many devices)
    await detectAccountSharing(userId);

    return { success: true, sessionId };
  } catch (error) {
    console.error('Login logging error:', error);
    throw error;
  }
});

// ===== 2. Detect Impossible Travel =====
async function detectImpossibleTravel(userId, newCountry, newIp) {
  try {
    const lastLogin = await db.collection('security_logins')
      .where('userId', '==', userId)
      .where('success', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(2)
      .get();

    if (lastLogin.size < 2) return; // Need at least 2 logins

    const previous = lastLogin.docs[1].data();
    const current = lastLogin.docs[0].data();

    const timeDiff = (new Date() - previous.timestamp) / 1000 / 60; // minutes
    const isSameCountry = previous.country === newCountry;

    // If different country in < 2 hours, flag it
    if (!isSameCountry && timeDiff < 120) {
      await createAlert({
        userId,
        severity: 'high',
        type: 'impossible_travel',
        message: `Login from ${newCountry} (${newIp}) ${timeDiff} minutes after ${previous.country}. Physically impossible.`,
        meta: {
          previousCountry: previous.country,
          newCountry,
          timeDifference: timeDiff,
          previousIp: previous.ip,
          newIp
        }
      });
    }
  } catch (error) {
    console.error('Impossible travel detection error:', error);
  }
}

// ===== 3. Detect Account Sharing =====
async function detectAccountSharing(userId) {
  try {
    const sessions = await db.collection('security_sessions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    // If 10+ devices or 3+ countries in 24h, flag it
    const uniqueCountries = new Set(sessions.docs.map(doc => doc.data().country));
    const uniqueIps = new Set(sessions.docs.map(doc => doc.data().ip));

    if (sessions.size >= 10 || uniqueCountries.size >= 3) {
      await createAlert({
        userId,
        severity: 'medium',
        type: 'account_sharing',
        message: `Unusual activity: ${sessions.size} active sessions across ${uniqueCountries.size} countries and ${uniqueIps.size} IPs.`,
        meta: {
          sessionCount: sessions.size,
          countryCount: uniqueCountries.size,
          ipCount: uniqueIps.size
        }
      });
    }
  } catch (error) {
    console.error('Account sharing detection error:', error);
  }
}

// ===== 4. Process Stripe Payment Events =====
exports.handleStripePaymentEvent = functions.https.onRequest(async (req, res) => {
  try {
    const event = req.body;
    const { type, data } = event;

    if (type === 'charge.succeeded') {
      const charge = data.object;
      
      // Log payment event
      await db.collection('payments_events').add({
        userId: charge.metadata?.userId,
        stripeCustomerId: charge.customer,
        type: 'payment_succeeded',
        amount: charge.amount / 100,
        currency: charge.currency,
        ip: charge.client_ip || 'UNKNOWN',
        country: charge.client_ip ? geoip.lookup(charge.client_ip)?.country : 'UNKNOWN',
        cardFingerprint: charge.payment_method_details?.card?.fingerprint || '',
        timestamp: new Date(charge.created * 1000),
        metadata: {
          chargeId: charge.id,
          description: charge.description
        }
      });

      // Check for payment fraud patterns
      await detectPaymentFraud(charge);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Payment event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== 5. Detect Payment Fraud =====
async function detectPaymentFraud(charge) {
  try {
    const cardFingerprint = charge.payment_method_details?.card?.fingerprint;
    
    if (!cardFingerprint) return;

    // Check if same card used on multiple accounts
    const otherAccounts = await db.collection('payments_events')
      .where('cardFingerprint', '==', cardFingerprint)
      .where('timestamp', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 days
      .get();

    const uniqueUsers = new Set(otherAccounts.docs.map(doc => doc.data().userId));

    if (uniqueUsers.size > 2) {
      await createAlert({
        severity: 'critical',
        type: 'card_fraud',
        message: `Same card used on ${uniqueUsers.size} different accounts in 30 days. Potential fraud ring.`,
        meta: {
          cardFingerprint,
          accountCount: uniqueUsers.size,
          users: Array.from(uniqueUsers)
        }
      });
    }
  } catch (error) {
    console.error('Payment fraud detection error:', error);
  }
}

// ===== 6. Detect Referral Abuse =====
exports.detectReferralAbuse = functions.firestore
  .document('referral_events/{docId}')
  .onCreate(async (snap) => {
    try {
      const event = snap.data();
      const { deviceId, referrerUserId, timestamp } = event;

      // Check if same device created 20+ referrals in 24h
      const recent = await db.collection('referral_events')
        .where('deviceId', '==', deviceId)
        .where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
        .get();

      if (recent.size >= 20) {
        await createAlert({
          userId: referrerUserId,
          severity: 'high',
          type: 'referral_abuse',
          message: `${recent.size} referrals from same device in 24h. Possible referral farming.`,
          meta: { deviceId, referralCount: recent.size }
        });
      }
    } catch (error) {
      console.error('Referral abuse detection error:', error);
    }
  });

// ===== 7. Create Security Alert =====
async function createAlert(alertData) {
  try {
    await db.collection('security_alerts').add({
      ...alertData,
      status: 'open',
      createdAt: new Date()
    });
    
    console.log(`🚨 SECURITY ALERT: ${alertData.type} - ${alertData.message}`);
  } catch (error) {
    console.error('Alert creation error:', error);
  }
}

// ===== 8. Block IP Temporarily =====
async function blockIpTemporarily(ip, reason, minutes) {
  try {
    await db.collection('blocked_ips').doc(ip).set({
      ip,
      reason,
      blockedAt: new Date(),
      blockedBy: 'system',
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
      permanent: false
    });
  } catch (error) {
    console.error('IP blocking error:', error);
  }
}

// ===== 9. Admin Action: Force Logout =====
exports.forceLogoutUser = functions.https.onCall(async (data, context) => {
  // Only admins can call this
  const adminEmail = context.auth.token.email;
  if (adminEmail !== 'dyingbreed243@gmail.com') {
    throw new Error('Admin only');
  }

  const { userId } = data;

  try {
    // Invalidate all sessions
    const sessions = await db.collection('security_sessions')
      .where('userId', '==', userId)
      .get();

    for (const doc of sessions.docs) {
      await doc.ref.update({ isActive: false });
    }

    // Log admin action
    await db.collection('admin_actions').add({
      adminUserId: context.auth.uid,
      action: 'force_logout',
      targetUserId: userId,
      reason: data.reason || 'Manual admin action',
      timestamp: new Date()
    });

    return { success: true, sessionsInvalidated: sessions.size };
  } catch (error) {
    throw new Error('Failed to force logout: ' + error.message);
  }
});

// ===== 10. Admin Action: Block IP =====
exports.blockIpPermanent = functions.https.onCall(async (data, context) => {
  const adminEmail = context.auth.token.email;
  if (adminEmail !== 'dyingbreed243@gmail.com') {
    throw new Error('Admin only');
  }

  const { ip, reason } = data;

  try {
    await db.collection('blocked_ips').doc(ip).set({
      ip,
      reason,
      blockedAt: new Date(),
      blockedBy: context.auth.uid,
      permanent: true
    });

    return { success: true, ip, blocked: true };
  } catch (error) {
    throw new Error('Failed to block IP: ' + error.message);
  }
});

// ===== 11. Get Security Alerts (Admin) =====
exports.getSecurityAlerts = functions.https.onCall(async (data, context) => {
  const adminEmail = context.auth.token.email;
  if (adminEmail !== 'dyingbreed243@gmail.com') {
    throw new Error('Admin only');
  }

  const { limit = 50, status = 'open' } = data;

  try {
    const alerts = await db.collection('security_alerts')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return alerts.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Failed to fetch alerts: ' + error.message);
  }
});

// ===== HELPER: Parse Device Name =====
function parseDeviceName(userAgent) {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Mobile')) return 'Mobile';
  
  return 'Unknown Device';
}

module.exports = {
  logSecurityLogin: exports.logSecurityLogin,
  handleStripePaymentEvent: exports.handleStripePaymentEvent,
  detectReferralAbuse: exports.detectReferralAbuse,
  forceLogoutUser: exports.forceLogoutUser,
  blockIpPermanent: exports.blockIpPermanent,
  getSecurityAlerts: exports.getSecurityAlerts
};
