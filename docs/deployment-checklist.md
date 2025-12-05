# Production Deployment Checklist

## Pre-Deployment

### Database

- [ ] **Apply all migrations**
  ```bash
  supabase db push --project-ref ptvfsnkcousrzsyldlpv
  ```

- [ ] **Verify migrations applied**
  ```sql
  SELECT * FROM supabase_migrations.schema_migrations
  ORDER BY version DESC LIMIT 5;
  ```

- [ ] **Enable pg_cron extension**
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  ```

- [ ] **Verify cron job scheduled**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'reset_monthly_credits';
  ```

- [ ] **Set up automated backups**
  - Supabase Dashboard → Database → Backups
  - Enable daily backups
  - Retention: 7 days minimum

---

### Edge Functions

- [ ] **Deploy all functions**
  ```bash
  supabase functions deploy paystack-initialize
  supabase functions deploy paystack-webhook
  supabase functions deploy paystack-verify
  supabase functions deploy process-pdf
  supabase functions deploy query-document
  supabase functions deploy summarize-pdf
  supabase functions deploy ocr-image
  ```

- [ ] **Set environment secrets**
  ```bash
  supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
  supabase secrets set DEEPSEEK_API_KEY=sk-xxx
  supabase secrets set GOOGLE_VISION_API_KEY=xxx  # Optional
  ```

- [ ] **Verify functions deployed**
  ```bash
  supabase functions list
  ```

---

### Paystack Configuration

- [ ] **Configure webhook URL**
  - URL: `https://ptvfsnkcousrzsyldlpv.supabase.co/functions/v1/paystack-webhook`
  - Events: `charge.success`, `subscription.disable`

- [ ] **Switch to live keys**
  - Update `PAYSTACK_SECRET_KEY` to live key
  - Update frontend with live public key

- [ ] **Test webhook**
  - Make test payment
  - Verify webhook received
  - Check database updated

---

### Frontend

- [ ] **Update environment variables**
  ```env
  VITE_SUPABASE_URL=https://ptvfsnkcousrzsyldlpv.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key
  VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
  ```

- [ ] **Build production bundle**
  ```bash
  npm run build
  ```

- [ ] **Test build locally**
  ```bash
  npm run preview
  ```

- [ ] **Deploy to hosting**
  - Vercel / Netlify / Custom server
  - Configure custom domain (optional)
  - Enable HTTPS

---

## Security Checklist

- [ ] **Verify RLS enabled on all tables**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = false;
  -- Should return no results
  ```

- [ ] **Check no secrets in code**
  ```bash
  git grep -i "sk_live"
  git grep -i "secret"
  # Should return no matches in src/
  ```

- [ ] **Verify CORS configuration**
  - Supabase Dashboard → API Settings
  - Add production domain to allowed origins

- [ ] **Enable rate limiting**
  - Supabase Dashboard → API Settings
  - Set appropriate limits

- [ ] **Review authentication settings**
  - Email confirmation required
  - Password requirements
  - Session timeout

---

## Performance Checklist

- [ ] **Add database indexes**
  ```sql
  -- Verify critical indexes exist
  SELECT * FROM pg_indexes 
  WHERE schemaname = 'public'
  AND tablename IN ('user_analytics', 'pdf_chunks', 'chat_messages');
  ```

- [ ] **Optimize images**
  - Convert to WebP
  - Compress assets
  - Use CDN (optional)

- [ ] **Enable caching**
  - Service worker
  - Browser caching headers
  - CDN caching

- [ ] **Code splitting**
  - Lazy load routes
  - Dynamic imports
  - Bundle analysis

---

## Monitoring Setup

- [ ] **Enable Supabase monitoring**
  - Dashboard → Logs
  - Set up alerts for errors

- [ ] **Add error tracking**
  - Sentry (optional)
  - Log critical errors

- [ ] **Set up analytics**
  - Google Analytics (optional)
  - Track key metrics

- [ ] **Monitor costs**
  - Supabase usage
  - API costs (DeepSeek, Google Vision)
  - Paystack fees

---

## Testing Checklist

- [ ] **Smoke test all features**
  - Sign up
  - Purchase subscription
  - Upload PDF
  - Chat with document
  - Generate summary
  - Use OCR
  - Check analytics

- [ ] **Test payment flows**
  - Basic plan purchase
  - Pro plan purchase
  - Elite plan purchase
  - Credit pack purchase
  - Subscription cancellation

- [ ] **Test error scenarios**
  - Insufficient credits
  - Payment failure
  - Invalid file upload
  - Network errors

- [ ] **Test on multiple devices**
  - Desktop (Chrome, Firefox, Safari)
  - Mobile (iOS, Android)
  - Tablet

---

## Documentation

- [ ] **User documentation**
  - Getting started guide
  - Feature tutorials
  - FAQ

- [ ] **Admin documentation**
  - Deployment guide
  - Troubleshooting
  - Database schema

- [ ] **API documentation**
  - Edge Function endpoints
  - Request/response formats
  - Error codes

---

## Post-Deployment

### Day 1

- [ ] Monitor error logs
- [ ] Check payment success rate
- [ ] Verify cron job runs
- [ ] Test all critical flows
- [ ] Monitor performance metrics

### Week 1

- [ ] Analyze user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Review cost metrics

### Month 1

- [ ] Security audit
- [ ] Performance review
- [ ] Feature usage analysis
- [ ] Cost optimization

---

## Rollback Plan

### If Critical Issues Found

1. **Revert Edge Functions**
   ```bash
   # Deploy previous version
   git checkout previous-commit
   supabase functions deploy
   ```

2. **Revert Database**
   ```sql
   -- Restore from backup
   -- Supabase Dashboard → Database → Backups → Restore
   ```

3. **Revert Frontend**
   ```bash
   # Redeploy previous version
   vercel rollback
   ```

---

## Launch Announcement

- [ ] **Prepare announcement**
  - Blog post
  - Social media
  - Email to beta users

- [ ] **Support ready**
  - Support email set up
  - FAQ updated
  - Response templates ready

- [ ] **Monitoring active**
  - Error alerts configured
  - Performance monitoring
  - Cost alerts set

---

## Success Criteria

### Functionality ✅
- All payment flows work
- Credit system accurate
- AI features functional
- No critical bugs

### Performance ✅
- API response <2 seconds
- Page load <3 seconds
- Error rate <1%
- Uptime >99%

### Security ✅
- All RLS policies active
- No secrets exposed
- HTTPS enforced
- Input validation working

---

## Final Sign-Off

**Deployment Date:** ___________

**Deployed By:** ___________

**Verified By:** ___________

**Status:** ⬜ Ready for Production

---

## Emergency Contacts

- **Database Issues:** Supabase Support
- **Payment Issues:** Paystack Support
- **Hosting Issues:** Vercel/Netlify Support
- **Technical Lead:** [Your contact]

---

**🚀 Ready to launch when all checkboxes are complete!**
