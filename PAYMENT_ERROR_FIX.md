# Payment Error Fix - Pricing Page

## Issues Fixed

### 1. ✅ Improved Error Messages
- **Problem:** Generic error message "Could not initiate checkout" didn't show the actual issue
- **Fix:** Updated `src/pages/Pricing.tsx` to display actual error messages from the API
- **Result:** Users will now see specific error messages like:
  - "PAYSTACK_SECRET_KEY not configured"
  - "No authorization header - user must be authenticated"
  - "Paystack error: [specific Paystack error]"

### 2. ✅ Enhanced Edge Function Error Handling
- **Problem:** Edge function didn't check for missing environment variables
- **Fix:** Added validation checks in `supabase/functions/paystack-initialize/index.ts`
- **Result:** Function now provides clear error messages for missing configuration

### 3. ✅ Better Paystack API Error Handling
- **Problem:** Paystack API errors weren't properly caught and reported
- **Fix:** Added proper error checking for Paystack API responses
- **Result:** Better error messages when Paystack API calls fail

## Common Error Causes & Solutions

### Error: "PAYSTACK_SECRET_KEY not configured"
**Solution:**
```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxx
# or for production:
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
```

**Or via Dashboard:**
1. Go to Supabase Dashboard → Edge Functions → Settings → Secrets
2. Add secret: `PAYSTACK_SECRET_KEY` = `sk_test_xxx` (or `sk_live_xxx`)

### Error: "SUPABASE_SERVICE_ROLE_KEY not configured"
**Solution:**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Or via Dashboard:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (keep it secret!)
3. Go to Edge Functions → Settings → Secrets
4. Add secret: `SUPABASE_SERVICE_ROLE_KEY` = `[your-service-role-key]`

### Error: "No authorization header - user must be authenticated"
**Solution:**
- Ensure user is logged in before clicking upgrade
- Check browser console for authentication errors
- Verify Supabase client is properly initialized

### Error: "Paystack error: [message]"
**Common Paystack Errors:**
- **"Invalid API Key"** → Check that `PAYSTACK_SECRET_KEY` is correct
- **"Amount must be at least 100"** → Paystack requires minimum amount (in kobo/cents)
- **"Invalid email"** → Ensure user email is valid
- **"Currency not supported"** → Check currency setting (currently USD)

## Testing Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Click "Upgrade" button
   - Look for error messages

2. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Select `paystack-initialize` function
   - Look for error messages

3. **Verify Secrets:**
   ```bash
   # List all secrets (won't show values)
   supabase secrets list
   ```

4. **Test with Diagnostics Page:**
   - Visit `/diagnostics` page
   - Check "Edge Function: paystack-initialize" status
   - Review any error messages

## Required Configuration

### Edge Function Secrets (Must be set):
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `SUPABASE_URL` - Your Supabase project URL (usually auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Frontend Environment Variables:
- `VITE_PAYSTACK_PUBLIC_KEY` - Your Paystack public key (for payment popup)

## Next Steps

1. **Set Missing Secrets:**
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=your-key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
   ```

2. **Test Payment Flow:**
   - Log in to your app
   - Go to `/pricing` page
   - Click "Upgrade" on any plan
   - Check error message (if any)
   - Fix the issue based on error message

3. **Verify Paystack Configuration:**
   - Check Paystack Dashboard → Settings → API Keys
   - Ensure public key matches `.env` file
   - Ensure secret key matches Supabase secrets

## Debugging Tips

- **Check actual error:** The error message will now show the specific issue
- **Check browser console:** Full error details will be logged
- **Check function logs:** Supabase Dashboard → Edge Functions → Logs
- **Test authentication:** Ensure you're logged in before testing
- **Verify amounts:** Paystack requires minimum amounts (usually $0.01 or equivalent)

## Files Modified

- `src/pages/Pricing.tsx` - Improved error handling and messages
- `supabase/functions/paystack-initialize/index.ts` - Added environment variable checks and better error handling

