#!/bin/bash
# GLAMFLOW AI - Automated Daily Tasks

echo "🚀 GLAMFLOW AI - Daily Automation Script"
echo "========================================"

# Task 1: Check payment status
echo "📊 Checking payment status..."
curl -s https://dashboard.stripe.com/payments > /dev/null && echo "✅ Stripe: Online" || echo "❌ Stripe: Offline"

# Task 2: Monitor Firebase health
echo "🔥 Checking Firebase..."
curl -s https://firebase.google.com > /dev/null && echo "✅ Firebase: Online" || echo "❌ Firebase: Offline"

# Task 3: Deploy latest changes
echo "🚀 Deploying latest changes..."
cd /Users/dying/public
firebase deploy --only hosting --force

# Task 4: Check error logs
echo "📋 Checking error logs..."
firebase functions:log | tail -20

echo ""
echo "✅ Daily automation complete!"
echo "📊 Revenue Monitor: https://studio-4627045237-a2fe9.web.app/revenue-monitor.html"
echo "💳 Stripe Dashboard: https://dashboard.stripe.com/payments"
