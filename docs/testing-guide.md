# Testing Guide - AI PDF Summarizer

## Quick Start Testing

### Prerequisites

1. **Database Migrations Applied:**
```bash
# Check applied migrations
supabase db remote commit list

# Should see:
# - 12_hybrid_credits_system.sql
# - 13_setup_cron_job.sql
# - 14_usage_analytics.sql
```

2. **Edge Functions Deployed:**
```bash
# List deployed functions
supabase functions list

# Should see:
# - paystack-initialize
# - paystack-webhook
# - paystack-verify
# - process-pdf
# - query-document
# - summarize-pdf
# - ocr-image
```

3. **Environment Variables Set:**
- `PAYSTACK_SECRET_KEY`
- `DEEPSEEK_API_KEY`
- `GOOGLE_VISION_API_KEY` (optional)

---

## 1. Payment Flow Testing

### Test Subscription Purchase

**Steps:**
1. Navigate to `/pricing`
2. Click "Get Basic" ($7/month)
3. Complete Paystack payment
4. Verify redirect to success page
5. Check database:

```sql
-- Verify user record updated
SELECT 
  subscription_plan,
  monthly_credits,
  extra_credits,
  subscription_renews_at
FROM users
WHERE id = 'your-user-id';

-- Expected:
-- subscription_plan: 'basic'
-- monthly_credits: 200
-- extra_credits: 0
-- subscription_renews_at: NOW() + 30 days
```

### Test Credit Purchase

**Steps:**
1. Navigate to `/pricing`
2. Switch to "Buy Credits" tab
3. Click "Buy 100 Credits" ($3)
4. Complete payment
5. Check database:

```sql
SELECT extra_credits FROM users WHERE id = 'your-user-id';
-- Should increase by 100
```

---

## 2. Credit System Testing

### Test Credit Deduction Priority

```sql
-- Set up test scenario
UPDATE users 
SET monthly_credits = 5, extra_credits = 10
WHERE id = 'your-user-id';

-- Use 3 credits (chat 3 times)
-- Expected: monthly=2, extra=10

-- Use 5 more credits
-- Expected: monthly=0, extra=8
```

### Test Insufficient Credits

**Steps:**
1. Set credits to 0:
```sql
UPDATE users 
SET monthly_credits = 0, extra_credits = 0
WHERE id = 'your-user-id';
```

2. Try to chat with document
3. **Expected:** Error message "Insufficient credits"
4. **Expected:** 402 status code

### Test Monthly Reset

```sql
-- Manually trigger reset
SELECT reset_monthly_credits();

-- Verify all active subscriptions reset
SELECT 
  email,
  subscription_plan,
  monthly_credits,
  subscription_renews_at
FROM users
WHERE subscription_plan != 'free';

-- Expected: monthly_credits reset to plan amount
```

---

## 3. AI Features Testing

### PDF Summarization

**Test Brief Summary (5 credits):**
1. Upload PDF document
2. Navigate to document detail page
3. Click "Summary" tab
4. Select "Brief Summary"
5. Click "Generate Brief Summary"
6. **Expected:** 2-3 sentence summary
7. **Expected:** 5 credits deducted

**Test Standard Summary (10 credits):**
- Same steps, select "Standard Summary"
- **Expected:** 1-2 paragraph summary
- **Expected:** 10 credits deducted

**Test Detailed Summary (25 credits):**
- Same steps, select "Detailed Summary"
- **Expected:** Multi-paragraph detailed summary
- **Expected:** 25 credits deducted

### AI Chat

**Test Document Q&A:**
1. Open document detail page
2. Click "Chat" tab
3. Ask: "What is the main topic of this document?"
4. **Expected:** Relevant answer within 5 seconds
5. **Expected:** 1 credit deducted
6. **Expected:** Message appears in chat history

**Test Real-time Updates:**
1. Open same document in two browser tabs
2. Send message in tab 1
3. **Expected:** Message appears in tab 2 immediately

### OCR

**Test Image Upload:**
1. Navigate to `/ocr`
2. Upload clear text image (PNG/JPG)
3. Click "Extract Text"
4. **Expected:** Accurate text extraction
5. **Expected:** 2 credits deducted
6. **Expected:** Copy to clipboard works

---

## 4. Analytics Testing

### Test Analytics Dashboard

**Steps:**
1. Perform various actions:
   - 5 chat messages
   - 2 summaries
   - 1 OCR
2. Navigate to `/analytics`
3. **Verify:**
   - Total credits used = correct sum
   - Activity breakdown shows all event types
   - Daily usage chart displays data
   - Top documents list appears

**SQL Verification:**
```sql
-- Check analytics data
SELECT 
  event_type,
  COUNT(*) as total_events,
  SUM(credits_used) as total_credits
FROM user_analytics
WHERE user_id = 'your-user-id'
GROUP BY event_type;
```

---

## 5. Error Handling Testing

### Test Network Errors

**Steps:**
1. Disconnect internet
2. Try to chat with document
3. **Expected:** User-friendly error message
4. **Expected:** Retry option available

### Test Invalid Inputs

**PDF Upload:**
- Upload non-PDF file
- **Expected:** Error message "Invalid file type"

**Image Upload (OCR):**
- Upload >10MB image
- **Expected:** Error message "File too large"

**Payment:**
- Use invalid card
- **Expected:** Paystack error message displayed

---

## 6. Performance Testing

### Measure Response Times

**Chat Response:**
```javascript
console.time('chat');
// Send chat message
console.timeEnd('chat');
// Expected: <5 seconds
```

**Summary Generation:**
```javascript
console.time('summary');
// Generate summary
console.timeEnd('summary');
// Expected: <10 seconds
```

**OCR Processing:**
```javascript
console.time('ocr');
// Process image
console.timeEnd('ocr');
// Expected: <8 seconds
```

### Check Database Performance

```sql
-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 7. Security Testing

### Test RLS Policies

**Attempt Unauthorized Access:**
```sql
-- Try to view another user's data
SELECT * FROM documents WHERE user_id != auth.uid();
-- Expected: No results (RLS blocks)

SELECT * FROM user_analytics WHERE user_id != auth.uid();
-- Expected: No results (RLS blocks)
```

### Test API Security

**Attempt Direct Edge Function Call:**
```bash
# Without authentication
curl https://ptvfsnkcousrzsyldlpv.supabase.co/functions/v1/query-document \
  -d '{"documentId":"test","question":"test","userId":"test"}'

# Expected: 401 Unauthorized
```

---

## 8. Mobile Testing

### Test Responsive Design

**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Pages to Test:**
- Home page
- Pricing page
- Dashboard
- Document detail
- Analytics
- OCR

**Check:**
- [ ] Layout responsive
- [ ] Buttons clickable
- [ ] Forms usable
- [ ] Images load
- [ ] Navigation works

---

## 9. Browser Compatibility

### Test Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Features to Test

- [ ] File upload
- [ ] Payment flow
- [ ] Real-time updates
- [ ] Charts rendering
- [ ] Copy to clipboard

---

## 10. Load Testing

### Concurrent Users Test

```bash
# Using Artillery
artillery quick --count 10 --num 50 https://your-app-url.com
```

**Monitor:**
- Response times
- Error rates
- Database connections
- Memory usage

---

## Test Results Template

```markdown
## Test Session: [Date]

### Payment Flows
- [ ] Basic subscription: PASS/FAIL
- [ ] Pro subscription: PASS/FAIL
- [ ] Elite subscription: PASS/FAIL
- [ ] Credit purchase: PASS/FAIL

### Credit System
- [ ] Deduction priority: PASS/FAIL
- [ ] Insufficient credits: PASS/FAIL
- [ ] Monthly reset: PASS/FAIL

### AI Features
- [ ] Chat accuracy: PASS/FAIL
- [ ] Summary quality: PASS/FAIL
- [ ] OCR accuracy: PASS/FAIL

### Performance
- [ ] Response times: PASS/FAIL
- [ ] Page load: PASS/FAIL
- [ ] Database queries: PASS/FAIL

### Security
- [ ] RLS policies: PASS/FAIL
- [ ] API security: PASS/FAIL
- [ ] Data protection: PASS/FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```

---

## Quick Smoke Test

**5-Minute Verification:**

1. ✅ Sign up new user
2. ✅ Purchase Basic plan
3. ✅ Upload PDF
4. ✅ Chat with document
5. ✅ Generate summary
6. ✅ Check analytics
7. ✅ Verify credits deducted

**All pass? Ready for production!** 🚀
