# Payment Links Feature

## Overview
Payment Links allow users to create shareable checkout pages without any coding. Users can create one-time purchases, recurring subscriptions, or donation links and share them via URL, email, or QR code.

## Features

### Types of Payment Links
1. **One-Time Purchase**: Single transaction for a product or service
2. **Recurring Subscription**: Monthly or yearly recurring charges
3. **Donation**: Variable-amount donations

### Functionality
- **Create Links**: Simple form-based interface to create payment links in seconds
- **Share Links**: Copy link to clipboard or open in new tab
- **Analytics**: Track views and conversions for each link
- **Status Control**: Activate/deactivate links without deleting
- **Custom Domains**: Use custom domain for payment page (requires $10/month domain setup)
- **Success/Cancel URLs**: Redirect customers after payment

### UI Components
- **PaymentLinksManager** (`components/billing/PaymentLinksManager.tsx`): Full CRUD interface
  - Create form with validation
  - List view with statistics
  - Copy, view, toggle, and delete actions
  - Responsive design with Tailwind CSS

## API Endpoints

### GET `/api/payment-links`
Fetch all active payment links for the authenticated user.

**Response:**
```json
{
  "links": [
    {
      "id": "link_123",
      "title": "Premium Template Pack",
      "type": "product",
      "amount": 2999,
      "currency": "usd",
      "url": "https://buy.stripe.com/...",
      "active": true,
      "viewCount": 45,
      "conversionCount": 12,
      "createdAt": "2025-12-08T00:00:00Z"
    }
  ]
}
```

### POST `/api/payment-links`
Create a new payment link.

**Request Body:**
```json
{
  "title": "Premium Template Pack",
  "description": "Get access to 50+ proven templates",
  "type": "product",
  "amount": 2999,
  "currency": "usd",
  "productName": "Template Pack",
  "quantity": 1,
  "billingInterval": "month",
  "customDomain": "payments.yourdomain.com",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

### GET `/api/payment-links/[linkId]`
Fetch details and statistics for a specific payment link.

**Response:**
```json
{
  "link": { /* PaymentLink object */ },
  "stats": {
    "views": 45,
    "conversions": 12,
    "revenue": 299.88,
    "conversionRate": 26.67
  }
}
```

### PUT `/api/payment-links/[linkId]`
Update a payment link (activate/deactivate).

**Request Body:**
```json
{
  "active": false,
  "title": "Updated Title"
}
```

### DELETE `/api/payment-links/[linkId]`
Delete a payment link (deactivates in Stripe and removes from Firestore).

## Database Schema

### Firestore Collection
Location: `users/{userId}/paymentLinks/{linkId}`

```typescript
interface PaymentLink {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'product' | 'subscription' | 'donation';
  amount: number; // in cents
  currency: string;
  stripePaymentLinkId: string;
  url: string;
  customDomain?: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  conversionCount: number;
}
```

## Usage Examples

### Creating a Product Link
```typescript
const response = await fetch('/api/payment-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Digital Course',
    description: 'Learn AI content creation',
    type: 'product',
    amount: 4999, // $49.99
    currency: 'usd',
    productName: 'AI Content Course',
  }),
});

const link = await response.json();
console.log(`Share this link: ${link.url}`);
```

### Creating a Subscription Link
```typescript
const response = await fetch('/api/payment-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Pro Membership',
    type: 'subscription',
    amount: 9999, // $99.99
    currency: 'usd',
    billingInterval: 'month',
  }),
});
```

### Creating a Donation Link
```typescript
const response = await fetch('/api/payment-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Support Our Mission',
    type: 'donation',
    amount: 1000, // $10 default
    currency: 'usd',
  }),
});
```

## Validation Rules

- **Title**: Required, 1-100 characters
- **Type**: Must be 'product', 'subscription', or 'donation'
- **Amount**: Positive number, minimum $0.50, maximum $999,999.99
- **Currency**: Valid 3-letter currency code (usd, eur, gbp, cad, etc.)
- **Billing Interval**: Required for subscriptions, must be 'month' or 'year'
- **URLs**: Must be valid HTTP/HTTPS URLs

## Security Features

- Authentication required on all endpoints (via `getUserFromRequest`)
- User isolation: Users can only access their own payment links
- Firestore security rules prevent unauthorized access
- Input validation with Zod schemas
- Stripe API integration ensures PCI compliance

## Analytics & Tracking

Payment links track:
- **View Count**: Number of times the link was accessed
- **Conversion Count**: Number of completed purchases
- **Revenue**: Total revenue generated (calculated from Stripe sessions)
- **Conversion Rate**: Percentage of viewers who completed purchase

Data is pulled from Stripe checkout sessions and cached locally.

## Custom Domain Setup

To use custom domains with payment links:
1. Set up a custom domain via the Domains tab ($10/month)
2. Verify DNS records
3. Specify `customDomain` parameter when creating payment link
4. Payment page will be served on your custom domain

Example:
```
Standard Stripe URL: https://buy.stripe.com/test_1234567890
Custom domain URL: https://payments.yourdomain.com/...
```

## Best Practices

1. **Clear Titles**: Use descriptive titles so customers know what they're buying
2. **Add Descriptions**: Help customers understand the value
3. **Use Custom Domains**: Increases trust and brand consistency
4. **Set Success URLs**: Redirect to thank you page or deliver digital product
5. **Track Analytics**: Monitor conversion rates to optimize
6. **Test First**: Use test mode links before promoting

## Limitations

- Stripe API rate limits apply
- Payment links are one-time creations (can't be edited after creation, must delete and recreate)
- Stripe doesn't track individual link views (tracked via custom implementation)
- Maximum 100 active payment links per user (can be increased)

## Future Enhancements

- [ ] Bulk download of links (CSV/Excel)
- [ ] Custom link slugs instead of auto-generated
- [ ] Built-in QR code generation and display
- [ ] Email campaign integration
- [ ] A/B testing for different link descriptions
- [ ] Scheduled link activation/deactivation
- [ ] Webhook notifications for conversions
- [ ] Revenue forecasting based on conversion rates
