#!/bin/bash
# Stripe Webhook Testing Script
# This script helps you test your Stripe webhook implementation locally

echo "🔧 Stripe Webhook Testing Setup"
echo "================================"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed"
    echo ""
    echo "Install it from: https://stripe.com/docs/stripe-cli"
    echo ""
    echo "macOS:"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "Windows (via Scoop):"
    echo "  scoop install stripe"
    echo ""
    echo "Linux:"
    echo "  curl https://files.stripe.com/stripe-cli/install.sh -o install.sh && sudo bash install.sh"
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Check if user is logged in
if ! stripe status &> /dev/null; then
    echo "📝 You need to login to Stripe"
    echo "Running: stripe login"
    echo ""
    stripe login
fi

echo ""
echo "🚀 Starting webhook listener..."
echo "================================"
echo ""
echo "This will forward Stripe events to localhost:3000/api/webhooks/stripe"
echo ""
echo "In another terminal, trigger test events with:"
echo "  stripe trigger payment_intent.succeeded"
echo "  stripe trigger customer.subscription.created"
echo "  stripe trigger charge.refunded"
echo ""
echo "Press Ctrl+C to stop listening"
echo ""

# Start listening for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
