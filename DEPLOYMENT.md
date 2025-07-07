# NetCop AI Hub - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- Supabase project with wallet system database
- Stripe account with payment links configured
- N8N instance with AI workflow webhooks
- OpenWeatherMap API key

### Environment Configuration

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Configure required variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `STRIPE_SECRET_KEY` - Stripe secret key (use live key for production)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
   - `NEXT_PUBLIC_OPENWEATHER_API_KEY` - OpenWeatherMap API key
   - `NEXT_PUBLIC_APP_URL` - Your production domain URL

3. **Configure N8N webhook URLs:**
   - Update all `NEXT_PUBLIC_N8N_WEBHOOK_*` variables with your N8N instance URLs

### Database Setup

Run the database schema files in your Supabase project:

```sql
-- 1. Create wallet system tables
\i fresh-wallet-schema.sql

-- 2. Set up RLS policies
\i fix-rls-policies.sql
```

### Build and Deploy

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Manual Build
```bash
# Install dependencies (without dev dependencies)
npm ci --only=production

# Build for production
npm run build:prod

# Start production server
npm start
```

#### Option 3: Docker
```bash
# Build Docker image
docker build -t netcop-ai-hub .

# Run container
docker run -p 3000:3000 netcop-ai-hub
```

### Performance Optimizations

The project includes these production optimizations:
- ✅ **SWC Minification** enabled
- ✅ **Gzip compression** enabled  
- ✅ **Image optimization** with WebP/AVIF formats
- ✅ **Package imports** optimized for React Hot Toast and Zustand
- ✅ **CSS optimization** enabled
- ✅ **Security headers** configured
- ✅ **Unused dependencies** removed (Tailwind, Heroicons, PostCSS)

### Security Configuration

The following security headers are automatically applied:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

### Stripe Webhook Configuration

1. Create webhook endpoint in Stripe Dashboard
2. Point to: `https://your-domain.com/api/wallet/webhook`
3. Enable events: `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Monitoring and Logs

- Check build logs: `npm run build`
- Type checking: `npm run type-check`
- Linting: `npm run lint`

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Stripe webhooks configured
- [ ] N8N workflows tested
- [ ] Domain SSL certificate active
- [ ] Error monitoring setup (optional)
- [ ] Analytics configured (optional)

### Post-Deployment Testing

1. **Wallet System**: Test wallet top-up flow
2. **AI Agents**: Verify all 6 agents work correctly
3. **Authentication**: Test sign up/login flows
4. **Payment Flow**: Complete end-to-end purchase test
5. **Mobile Experience**: Test responsive design

## 📊 Performance Metrics

Target performance benchmarks:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 500KB gzipped

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**: Run `npm run type-check` to identify TypeScript issues
2. **Environment Variables**: Verify all required variables are set
3. **Stripe Webhooks**: Check webhook endpoint is publicly accessible
4. **Database Connection**: Verify Supabase credentials and RLS policies

### Support

For deployment issues, check:
- Vercel deployment logs
- Supabase dashboard logs  
- Stripe webhook delivery logs
- N8N workflow execution logs