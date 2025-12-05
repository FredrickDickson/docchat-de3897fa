# Database Schema - Phase 1 Complete

## Overview
Created comprehensive database schema for the AI PDF Summarizer application with proper Row Level Security (RLS) policies and helper functions.

## Tables Created

### 1. users
- Stores user information, subscription plans, and credits
- Fields: id, email, plan, subscription_status, monthly_credits, extra_credits, paystack integration
- RLS: Users can only view/update their own data

### 2. credit_transactions
- Audit log for all credit operations
- Types: purchase, deduction, monthly_reset, refund
- RLS: Users can only view their own transactions

### 3. documents
- Tracks uploaded PDF files
- Fields: filename, file_size, storage_path, status, page_count
- RLS: Users can only access their own documents

### 4. summaries
- Stores AI-generated summaries
- Fields: summary_text, summary_type, credits_used, model_used
- RLS: Users can only access their own summaries

### 5. payment_transactions
- Tracks Paystack payments
- Fields: reference, amount, currency, status, paystack_data
- RLS: Users can only view their own payments

## Helper Functions

### deduct_credits(user_id, cost)
- Deducts credits (monthly first, then extra)
- Returns credit type used ('monthly' or 'extra')
- Raises exception if insufficient credits

### add_extra_credits(user_id, amount, description)
- Adds purchased credits to user account
- Logs transaction in credit_transactions

### reset_monthly_credits()
- Resets monthly credits based on plan
- Updates subscription renewal dates
- Logs reset transactions
- **To be run daily via cron job**

### get_total_credits(user_id)
- Returns total available credits (monthly + extra)

## Next Steps

1. Apply migrations to Supabase database
2. Set up authentication system
3. Configure storage buckets for PDFs
4. Create frontend structure

## Migration Files

- `20251205_create_users_table.sql`
- `20251205_create_credit_transactions_table.sql`
- `20251205_create_documents_table.sql`
- `20251205_create_summaries_table.sql`
- `20251205_create_payment_transactions_table.sql`
- `20251205_create_helper_functions.sql`
