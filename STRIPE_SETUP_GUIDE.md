# Stripe Configuration Guide for Netlify

## Environment Variables to Configure

Add these environment variables in your Netlify dashboard:

### 1. Stripe Keys (Test Environment)
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 2. Stripe Webhook Configuration
```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Steps to Configure in Netlify

### Step 1: Add Environment Variables
1. Go to your Netlify dashboard
2. Navigate to your site: `netcop.netlify.app`
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Your Stripe test secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your Stripe test publishable key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Generated after creating webhook |

### Step 2: Create Stripe Webhook Endpoint
1. Go to your Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://netcop.netlify.app/api/wallet/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to Netlify as `STRIPE_WEBHOOK_SECRET`

### Step 3: Test the Configuration
After adding the environment variables:
1. Deploy your site (or trigger a new deploy)
2. Test the checkout creation: `https://netcop.netlify.app/api/wallet/create-checkout`
3. Test the payment verification: `https://netcop.netlify.app/api/wallet/verify-payment`

## Wallet Top-Up Packages

Your current wallet packages are:
- **10 AED** → 10 AED (Basic)
- **25 AED** → 27 AED (Popular, +2 AED bonus)
- **50 AED** → 55 AED (+5 AED bonus)
- **100 AED** → 115 AED (+15 AED bonus)

## Agent Pricing Structure

Your agents use direct AED pricing:
- Weather Reporter: 2.00 AED
- Data Analyzer: 8.00 AED
- Content Writer: 6.00 AED
- Customer Support: 4.00 AED
- Email Automation: 5.00 AED
- Sales Assistant: 7.00 AED
- Task Automation: 3.00 AED
- 5 Whys Analysis: 4.00 AED

## Testing Instructions

1. **Test Checkout Creation:**
   ```bash
   curl -X POST https://netcop.netlify.app/api/wallet/create-checkout \
     -H "Content-Type: application/json" \
     -d '{"packageId": "wallet_25", "userId": "test-user-id"}'
   ```

2. **Test Payment Verification:**
   ```bash
   curl -X POST https://netcop.netlify.app/api/wallet/verify-payment \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "cs_test_session_id", "packageId": "wallet_25"}'
   ```

## Important Notes

- Use **test keys** for now (they start with `sk_test_` and `pk_test_`)
- The webhook URL must be publicly accessible: `https://netcop.netlify.app/api/wallet/webhook`
- After adding environment variables, you may need to trigger a new deploy
- Test with small amounts first (10 AED package)
- Monitor the Netlify function logs for debugging

## Current Status

✅ **Completed:**
- Wallet system implementation
- API endpoints created
- Database schema updated
- UI components updated
- Stripe integration code ready

⚠️ **Pending:**
- Stripe environment variables in Netlify
- Webhook endpoint configuration
- End-to-end testing

## Next Steps

1. Add the environment variables to Netlify
2. Create the webhook endpoint in Stripe
3. Test the complete payment flow
4. Monitor webhook events in Stripe dashboard