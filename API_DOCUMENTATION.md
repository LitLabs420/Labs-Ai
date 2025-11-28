# 🔌 GLAMFLOW AI - REST API Documentation

**For developers building integrations with GLAMFLOW AI**

---

## Base URL

```
https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net
```

---

## Authentication

All requests require Firebase ID token in header:

```
Authorization: Bearer {idToken}
```

Get token:
```javascript
const idToken = await firebase.auth().currentUser.getIdToken();
```

---

## Endpoints

### 1. Create Checkout Session

**POST** `/createCheckoutSession`

Create a Stripe checkout session for payment.

**Request:**
```json
{
  "priceId": "price_1SYMhF440X4TKc4a2MfVCkFt",
  "userId": "user123",
  "plan": "pro"
}
```

**Response:**
```json
{
  "sessionId": "cs_live_abc123...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

**Example:**
```javascript
const response = await fetch('https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/createCheckoutSession', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    priceId: 'price_1SYMhF440X4TKc4a2MfVCkFt',
    userId: currentUser.uid,
    plan: 'pro'
  })
});

const data = await response.json();
window.location.href = data.url; // Redirect to checkout
```

---

### 2. Verify Payment

**POST** `/verifyPayment`

Verify a payment was successful.

**Request:**
```json
{
  "sessionId": "cs_live_abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "plan": "pro",
  "status": "completed"
}
```

---

### 3. Get Payment Status

**GET** `/getPaymentStatus?userId={userId}`

Get user's subscription status.

**Response:**
```json
{
  "tier": "pro",
  "status": "active",
  "expiresAt": "2025-12-28",
  "stripeCustomerId": "cus_abc123..."
}
```

---

### 4. Create Portal Session

**POST** `/createPortalSession`

Open Stripe customer portal for billing management.

**Request:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/abc123..."
}
```

---

## Webhook Events

Your system receives these events from Stripe:

### Event: `checkout.session.completed`
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_abc123",
      "customer_email": "user@example.com",
      "amount_total": 2900,
      "metadata": {
        "plan": "pro"
      }
    }
  }
}
```

### Event: `invoice.payment_failed`
```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "customer_email": "user@example.com",
      "amount_due": 2900
    }
  }
}
```

---

## Firestore Collections

### Users
```
/users/{uid}
├── email: string
├── displayName: string
├── tier: 'free' | 'pro' | 'enterprise'
├── subscription: {
│   ├── plan: string
│   ├── status: 'active' | 'inactive' | 'canceled'
│   ├── createdAt: timestamp
│   └── endsAt: timestamp
└── stripeCustomerId: string
```

### Transactions
```
/transactions/{id}
├── userId: string
├── userEmail: string
├── amount: number
├── status: 'completed' | 'failed' | 'pending'
├── type: 'payment' | 'refund' | 'adjustment'
├── sessionId: string
├── timestamp: timestamp
└── metadata: object
```

---

## Error Codes

```
400 Bad Request - Missing or invalid parameters
401 Unauthorized - Invalid or missing auth token
402 Payment Required - Payment failed
404 Not Found - Resource not found
500 Internal Error - Server error
```

---

## Rate Limiting

- 100 requests per minute per user
- 1,000 requests per hour per IP

---

## Examples

### Example 1: Process Payment
```javascript
async function upgradeUser() {
  const user = firebase.auth().currentUser;
  const idToken = await user.getIdToken();
  
  const response = await fetch(
    'https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/createCheckoutSession',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        priceId: 'price_1SYMhF440X4TKc4a2MfVCkFt',
        userId: user.uid,
        plan: 'pro'
      })
    }
  );
  
  const { url } = await response.json();
  window.location.href = url;
}
```

### Example 2: Check User Subscription
```javascript
async function checkSubscription() {
  const user = firebase.auth().currentUser;
  
  const userDoc = await firebase.firestore()
    .collection('users')
    .doc(user.uid)
    .get();
  
  const userData = userDoc.data();
  console.log('Current plan:', userData.tier);
  console.log('Status:', userData.subscription.status);
}
```

### Example 3: Listen for Transactions
```javascript
firebase.firestore()
  .collection('transactions')
  .where('userEmail', '==', 'user@example.com')
  .onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const transaction = doc.data();
      console.log('Amount:', transaction.amount);
      console.log('Status:', transaction.status);
    });
  });
```

---

## Support

- Docs: See SYSTEM_HEALTH_CHECK.md
- Issues: Check Firebase logs with `firebase functions:log`
- Email: dyingbreed243@gmail.com

---

## Version

**API v1.0** - November 28, 2025
