# Hybrid Credits System - Implementation Guide

## Overview

This migration adds a **hybrid billing model** that combines:
- **Monthly subscription credits** (reset every 30 days)
- **Pay-as-you-go credits** (purchased separately, never expire)

## What Was Added

### Database Fields

**users table:**
- `monthly_credits` - Credits that reset monthly based on plan
- `extra_credits` - Purchased credits that never expire  
- `subscription_renews_at` - When to reset monthly credits

**payment_transactions table:**
- `credits` - Number of credits purchased in transaction

### Helper Functions

#### 1. `deduct_credits(user_id, cost)`
Deducts credits from user account.

**Logic:**
1. Try to use `monthly_credits` first
2. If insufficient, use `extra_credits`
3. If still insufficient, raise error
4. Log transaction in `credits` table

**Returns:** `'monthly'` or `'extra'` (which type was used)

**Usage:**
```sql
SELECT deduct_credits('user-uuid', 5); -- Deduct 5 credits
```

#### 2. `add_extra_credits(user_id, amount, description)`
Adds purchased credits to user account.

**Usage:**
```sql
SELECT add_extra_credits('user-uuid', 100, 'Purchased 100 credits');
```

#### 3. `reset_monthly_credits()`
Resets monthly credits for all active subscriptions.

**Should be run daily via cron job.**

**Logic:**
1. Find users with active subscriptions
2. Reset `monthly_credits` based on plan:
   - free → 3
   - basic → 200
   - pro → 600
   - elite → 1500
3. Update `subscription_renews_at` (+30 days)
4. Log reset in `credits` table

**Usage:**
```sql
SELECT reset_monthly_credits();
```

#### 4. `get_total_credits(user_id)`
Returns total available credits.

**Usage:**
```sql
SELECT get_total_credits('user-uuid'); -- Returns: 605 (e.g., 600 monthly + 5 extra)
```

## Credit Flow Examples

### Example 1: New Free User
```
User signs up
├─ monthly_credits: 3
├─ extra_credits: 0
└─ Total: 3 credits
```

### Example 2: Pro Subscription User
```
User subscribes to Pro ($15/month)
├─ monthly_credits: 600
├─ extra_credits: 0
└─ Total: 600 credits

After using 600 credits:
├─ monthly_credits: 0
├─ extra_credits: 0
└─ Total: 0 credits (blocked until renewal or purchase)

User buys $8 credit pack (300 credits):
├─ monthly_credits: 0
├─ extra_credits: 300
└─ Total: 300 credits (can continue using)

After 30 days (renewal):
├─ monthly_credits: 600 (reset)
├─ extra_credits: 250 (remaining from purchase)
└─ Total: 850 credits
```

### Example 3: Credit Deduction Priority
```
User has:
├─ monthly_credits: 50
└─ extra_credits: 100

User creates summary (costs 5 credits):
├─ Deducts from monthly_credits first
├─ monthly_credits: 45
└─ extra_credits: 100 (unchanged)

User uses all monthly credits:
├─ monthly_credits: 0
└─ extra_credits: 100

Next summary (costs 5 credits):
├─ Deducts from extra_credits
├─ monthly_credits: 0
└─ extra_credits: 95
```

## Integration with Paystack

### Subscription Payment
When Paystack webhook receives `charge.success` for subscription:

```typescript
// Set plan and renewal date
await supabase.rpc('execute_sql', {
  sql: `
    UPDATE users 
    SET 
      plan = $1,
      monthly_credits = CASE $1
        WHEN 'basic' THEN 200
        WHEN 'pro' THEN 600
        WHEN 'elite' THEN 1500
      END,
      subscription_renews_at = NOW() + INTERVAL '30 days'
    WHERE id = $2
  `,
  params: [plan, userId]
});
```

### Credit Purchase
When Paystack webhook receives `charge.success` for credits:

```typescript
await supabase.rpc('add_extra_credits', {
  p_user_id: userId,
  p_amount: credits,
  p_description: 'Credits purchase via Paystack'
});
```

## Cron Job Setup

Set up daily cron to reset monthly credits:

**Supabase Dashboard:**
1. Go to Database → Cron Jobs
2. Create new job:
   - Name: `reset_monthly_credits`
   - Schedule: `0 0 * * *` (daily at midnight)
   - SQL: `SELECT reset_monthly_credits();`

**Or via SQL:**
```sql
SELECT cron.schedule(
  'reset-monthly-credits',
  '0 0 * * *',
  $$SELECT reset_monthly_credits()$$
);
```

## Testing

### Test Credit Deduction
```sql
-- Setup test user
INSERT INTO users (id, plan, monthly_credits, extra_credits)
VALUES ('test-uuid', 'pro', 600, 100);

-- Test deduction
SELECT deduct_credits('test-uuid', 5);
-- Should return 'monthly'

-- Check result
SELECT monthly_credits, extra_credits FROM users WHERE id = 'test-uuid';
-- Should show: 595, 100
```

### Test Credit Purchase
```sql
SELECT add_extra_credits('test-uuid', 300, 'Test purchase');

SELECT extra_credits FROM users WHERE id = 'test-uuid';
-- Should show: 400
```

### Test Monthly Reset
```sql
-- Set renewal date to past
UPDATE users 
SET subscription_renews_at = NOW() - INTERVAL '1 day'
WHERE id = 'test-uuid';

-- Run reset
SELECT reset_monthly_credits();

-- Check result
SELECT monthly_credits, subscription_renews_at FROM users WHERE id = 'test-uuid';
-- monthly_credits should be 600, renews_at should be ~30 days from now
```

## Next Steps

1. Apply this migration to Supabase
2. Update Paystack webhook handlers to use new functions
3. Set up daily cron job for `reset_monthly_credits()`
4. Update frontend to show monthly vs extra credits
5. Test complete payment flow
