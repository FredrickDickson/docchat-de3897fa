# Troubleshooting Guide

## Quick Diagnostics

Visit `/diagnostics` page in your app to run automated diagnostics and identify configuration issues.

## Common Issues and Solutions

### 1. App Does Not Display

**Symptoms:**
- Blank white screen
- Console errors about missing environment variables
- "Missing VITE_SUPABASE_URL" error

**Solutions:**

1. **Create `.env` file** in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx (or pk_live_xxx)
```

2. **Verify Supabase Configuration:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the Project URL and anon/public key
   - Ensure they match your `.env` file

3. **Restart Development Server:**
```bash
npm run dev
```

### 2. PDF AI Features Not Working

**Symptoms:**
- Chat messages fail to send
- Summary generation fails
- "Function not found" errors

**Solutions:**

1. **Check Edge Functions Deployment:**
```bash
# List deployed functions
supabase functions list

# Should see:
# - query-document
# - summarize-pdf
# - process-pdf
# - paystack-initialize
# - paystack-webhook
# - paystack-verify
# - ocr-image
```

2. **Deploy Missing Functions:**
```bash
# Deploy each function
supabase functions deploy query-document
supabase functions deploy summarize-pdf
supabase functions deploy process-pdf
```

3. **Set Environment Secrets in Supabase:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Add secrets:
     - `DEEPSEEK_API_KEY` - Your DeepSeek API key
     - `PAYSTACK_SECRET_KEY` - Your Paystack secret key
     - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

4. **Verify Database Tables Exist:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'documents', 'pdf_chunks', 'chat_messages', 'summaries');
```

5. **Check Storage Buckets:**
   - Go to Supabase Dashboard → Storage
   - Ensure `documents` bucket exists
   - Set bucket to public or configure RLS policies

### 3. Payment Gateway Not Working

**Symptoms:**
- Payment button does nothing
- "PaystackPop is not defined" error
- Payment popup doesn't open

**Solutions:**

1. **Check Paystack Script Loading:**
   - Verify `index.html` includes:
   ```html
   <script src="https://js.paystack.co/v1/inline.js"></script>
   ```

2. **Set Paystack Keys:**
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx  # For testing
   # or
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx  # For production
   ```

3. **Set Paystack Secret in Edge Functions:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Add secret: `PAYSTACK_SECRET_KEY=sk_test_xxx` (or `sk_live_xxx`)

4. **Verify Paystack Configuration:**
   - Check Paystack Dashboard → Settings → API Keys
   - Ensure public key matches `.env` file
   - Ensure secret key matches Supabase secrets

5. **Test Payment Flow:**
   - Use Paystack test cards: `4084084084084081`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - PIN: Any 4 digits

### 4. Database Connection Issues

**Symptoms:**
- "Connection failed" errors
- Cannot fetch documents
- Authentication fails

**Solutions:**

1. **Verify Supabase URL and Key:**
   ```bash
   # Check .env file
   cat .env | grep SUPABASE
   ```

2. **Test Connection:**
   - Visit `/diagnostics` page
   - Check "Supabase Connection" status

3. **Check Network:**
   - Ensure no firewall blocking Supabase
   - Check browser console for CORS errors

### 5. Edge Function Errors

**Symptoms:**
- "Function not found" errors
- 404 errors when calling functions
- "DEEPSEEK_API_KEY not configured" errors

**Solutions:**

1. **Check Function Deployment:**
```bash
supabase functions list
```

2. **Redeploy Functions:**
```bash
supabase functions deploy query-document
supabase functions deploy summarize-pdf
supabase functions deploy process-pdf
supabase functions deploy paystack-initialize
supabase functions deploy paystack-webhook
supabase functions deploy paystack-verify
```

3. **Set Function Secrets:**
```bash
# Set secrets for each function
supabase secrets set DEEPSEEK_API_KEY=your-key
supabase secrets set PAYSTACK_SECRET_KEY=your-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

4. **Check Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for error messages

### 6. Credit System Issues

**Symptoms:**
- Credits not deducting
- "Insufficient credits" when credits exist
- Credits not resetting monthly

**Solutions:**

1. **Check Database Functions:**
```sql
-- Verify functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('deduct_credits', 'add_extra_credits', 'reset_monthly_credits');
```

2. **Check Cron Job:**
```sql
-- Verify cron job exists
SELECT * FROM cron.job WHERE jobname = 'reset_monthly_credits';
```

3. **Manually Test Credit Deduction:**
```sql
-- Test credit deduction
SELECT deduct_credits('user-id', 1);
```

## Testing Checklist

Follow the testing guide in `docs/testing-guide.md`:

1. ✅ **Environment Variables Set**
   - Supabase URL and Key
   - Paystack Public Key
   - DeepSeek API Key (in Supabase secrets)

2. ✅ **Database Migrations Applied**
   - All tables created
   - RLS policies enabled
   - Functions created

3. ✅ **Edge Functions Deployed**
   - All 7 functions deployed
   - Secrets configured
   - Functions accessible

4. ✅ **Storage Configured**
   - `documents` bucket created
   - RLS policies set

5. ✅ **Payment Gateway**
   - Paystack script loaded
   - Keys configured
   - Test payment works

## Getting Help

1. **Run Diagnostics:**
   - Visit `/diagnostics` page
   - Review all test results
   - Fix any failures

2. **Check Logs:**
   - Browser console (F12)
   - Supabase Edge Function logs
   - Network tab for API calls

3. **Verify Configuration:**
   - Compare `.env` with `ENV_TEMPLATE.md`
   - Check Supabase dashboard settings
   - Verify Paystack dashboard settings

## Quick Fixes

### Reset Everything
```bash
# Stop dev server
# Delete .env file
# Recreate .env from ENV_TEMPLATE.md
# Restart dev server
npm run dev
```

### Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear localStorage: DevTools → Application → Local Storage → Clear

### Redeploy Functions
```bash
# Deploy all functions
supabase functions deploy query-document
supabase functions deploy summarize-pdf
supabase functions deploy process-pdf
supabase functions deploy paystack-initialize
supabase functions deploy paystack-webhook
supabase functions deploy paystack-verify
supabase functions deploy ocr-image
```

