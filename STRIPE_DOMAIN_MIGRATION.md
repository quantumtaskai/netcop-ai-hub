# Stripe Domain Migration Guide

## Overview
This document outlines the complete process for migrating Stripe payment integration from localhost (development) to production domain. This guide was created during the migration from `localhost:3000` to `https://netcop.netlify.app`.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Update Stripe Webhook Configuration](#step-1-update-stripe-webhook-configuration)
- [Step 2: Update Payment Links Redirect URLs](#step-2-update-payment-links-redirect-urls)
- [Step 3: Update Environment Variables](#step-3-update-environment-variables)
- [Step 4: Testing and Verification](#step-4-testing-and-verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedure](#rollback-procedure)

## Prerequisites

### Required Tools
- Stripe CLI installed and authenticated
- Access to Stripe Dashboard
- Git access to your repository
- Production environment access (Netlify, Vercel, etc.)

### Required Information
- **Current domain**: `localhost:3000` (or your development domain)
- **New production domain**: `https://netcop.netlify.app` (replace with your domain)
- **Webhook endpoint path**: `/api/stripe/webhook`
- **Payment success redirect path**: `/?payment=success`

### Existing Payment Links (Example from our setup)
```bash
10 credits:  plink_1Rf43nE7rYAIcmqEUf3QVzIM
50 credits:  plink_1Rf45bE7rYAIcmqEJup5AdIy
100 credits: plink_1Rf45qE7rYAIcmqErAymOGQz
500 credits: plink_1Rf45uE7rYAIcmqEOmlW7x0i
```

## Step 1: Update Stripe Webhook Configuration

### 1.1 Create New Webhook Endpoint in Stripe Dashboard

1. **Navigate to Stripe Dashboard**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to **Developers** → **Webhooks**

2. **Add New Endpoint**
   - Click **"Add endpoint"**
   - **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - **Events to send**: Select `checkout.session.completed`
   - **Description**: "Production webhook for credit purchases"

3. **Configure Webhook**
   - Click **"Add endpoint"**
   - Copy the **Webhook signing secret** (starts with `whsec_`)
   - Save this secret for environment variable updates

### 1.2 Verify Webhook Implementation

Ensure your webhook endpoint handles the following:
```typescript
// Example webhook handler structure
export async function POST(request: Request) {
  // 1. Verify webhook signature
  // 2. Handle checkout.session.completed event
  // 3. Extract user ID from client_reference_id
  // 4. Calculate credits from payment amount
  // 5. Update user credits in database
  // 6. Return success response
}
```

## Step 2: Update Payment Links Redirect URLs

### 2.1 Using Stripe CLI (Recommended)

**Login to Stripe CLI:**
```bash
stripe login
```

**Update each payment link:**
```bash
# Update 10 credits payment link
stripe payment_links update plink_1Rf43nE7rYAIcmqEUf3QVzIM \
  --after-completion.type redirect \
  --after-completion.redirect.url https://netcop.netlify.app/?payment=success

# Update 50 credits payment link
stripe payment_links update plink_1Rf45bE7rYAIcmqEJup5AdIy \
  --after-completion.type redirect \
  --after-completion.redirect.url https://netcop.netlify.app/?payment=success

# Update 100 credits payment link
stripe payment_links update plink_1Rf45qE7rYAIcmqErAymOGQz \
  --after-completion.type redirect \
  --after-completion.redirect.url https://netcop.netlify.app/?payment=success

# Update 500 credits payment link
stripe payment_links update plink_1Rf45uE7rYAIcmqEOmlW7x0i \
  --after-completion.type redirect \
  --after-completion.redirect.url https://netcop.netlify.app/?payment=success
```

### 2.2 Alternative: Using Stripe Dashboard

1. **Navigate to Payment Links**
   - Go to **Products** → **Payment links**
   - Click on each payment link to edit

2. **Update After Payment Settings**
   - Scroll to **"After payment"** section
   - Select **"Redirect to URL"**
   - Enter: `https://your-domain.com/?payment=success`
   - Save changes

3. **Repeat for All Payment Links**
   - Update all credit packages (10, 50, 100, 500 credits)

## Step 3: Update Environment Variables

### 3.1 Update Development Environment (.env.local)

**Note**: `.env.local` should not be committed to git

```bash
# Update application URL
NEXT_PUBLIC_APP_URL=https://netcop.netlify.app

# Update webhook secret (from Step 1.1)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_NEW_WEBHOOK_SECRET
```

### 3.2 Update Environment Example (.env.example)

```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://netcop.netlify.app
```

### 3.3 Update Production Environment

**For Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Update or add:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_NEW_WEBHOOK_SECRET
   NEXT_PUBLIC_APP_URL=https://netcop.netlify.app
   ```

**For Vercel:**
1. Go to **Project Settings** → **Environment Variables**
2. Update the same variables

## Step 4: Testing and Verification

### 4.1 Test Payment Links

1. **Test Each Payment Link**
   ```bash
   # Test accessibility
   curl -I "https://buy.stripe.com/test_28EbJ16AA7ly3ic7vh2VG0a"
   ```

2. **Complete Test Purchase**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify redirect to your domain
   - Check webhook receives event
   - Confirm credits are added to user account

### 4.2 Verify Webhook Functionality

1. **Check Webhook Logs**
   - Monitor your application logs during test purchases
   - Verify webhook signature validation passes
   - Confirm credit calculations are correct

2. **Test User Flow**
   - User clicks "Buy Credits"
   - Completes payment on Stripe
   - Redirects back to your site with success message
   - Credits appear in user account

### 4.3 Monitor Production

1. **Set up Monitoring**
   - Monitor webhook endpoint for errors
   - Track payment completion rates
   - Watch for failed credit updates

## Troubleshooting

### Common Issues and Solutions

#### 1. Webhook Signature Verification Fails
```bash
# Error: Invalid signature
# Solution: Verify webhook secret is correct
echo $STRIPE_WEBHOOK_SECRET
```

#### 2. Payment Links Don't Redirect
```bash
# Verify payment link configuration
stripe payment_links retrieve plink_1Rf43nE7rYAIcmqEUf3QVzIM
```

#### 3. Credits Not Added After Payment
- Check webhook endpoint is receiving events
- Verify user lookup logic (client_reference_id or email)
- Check database connection and permissions

#### 4. CORS Issues
```typescript
// Ensure webhook endpoint allows POST requests
export async function GET(request: Request) {
  return NextResponse.json({ status: 'Webhook endpoint ready' })
}
```

### Debug Commands

```bash
# Test webhook endpoint
curl -X POST https://netcop.netlify.app/api/stripe/webhook

# Check payment link details
stripe payment_links retrieve plink_YOUR_PAYMENT_LINK_ID

# List recent webhook events
stripe events list --limit 10

# Test webhook with sample event
stripe trigger checkout.session.completed
```

## Rollback Procedure

### If Issues Occur in Production

1. **Revert Payment Links**
   ```bash
   # Revert to localhost for testing
   stripe payment_links update plink_1Rf43nE7rYAIcmqEUf3QVzIM \
     --after-completion.redirect.url http://localhost:3000/?payment=success
   ```

2. **Revert Environment Variables**
   ```bash
   # Update production environment back to previous values
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Monitor and Fix**
   - Check logs for specific errors
   - Test each component individually
   - Re-run migration steps after fixes

## Best Practices

### 1. Testing Strategy
- Always test on staging environment first
- Use Stripe test mode until production ready
- Test all payment amounts and user scenarios

### 2. Security Considerations
- Never commit webhook secrets to git
- Use environment variables for all sensitive data
- Verify webhook signatures always

### 3. Monitoring
- Set up alerts for webhook failures
- Monitor payment completion rates
- Track credit update success rates

### 4. Documentation
- Keep payment link IDs documented
- Document all environment variables
- Maintain rollback procedures

## Migration Checklist

- [ ] Create new webhook endpoint in Stripe Dashboard
- [ ] Copy webhook signing secret
- [ ] Update all payment links redirect URLs via Stripe CLI
- [ ] Update development environment variables
- [ ] Update production environment variables
- [ ] Update .env.example file
- [ ] Test each payment link
- [ ] Verify webhook receives events
- [ ] Test complete user purchase flow
- [ ] Monitor production for 24 hours
- [ ] Document any issues encountered

## Support and Resources

- **Stripe CLI Documentation**: https://stripe.com/docs/stripe-cli
- **Webhook Documentation**: https://stripe.com/docs/webhooks
- **Payment Links API**: https://stripe.com/docs/api/payment_links
- **Testing Guide**: https://stripe.com/docs/testing

---

## Migration Example Summary

**Our Migration:**
- **From**: `localhost:3000`
- **To**: `https://netcop.netlify.app`
- **Completion Time**: ~30 minutes
- **Payment Links Updated**: 4 (10, 50, 100, 500 credits)
- **Zero Downtime**: Yes
- **Issues Encountered**: None

This migration was completed successfully with no impact to users and full functionality restored immediately.