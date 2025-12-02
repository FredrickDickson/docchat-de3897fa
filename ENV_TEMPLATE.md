# Environment Variables Template

Copy this to `.env` and fill in your values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# AI API Keys (use one or more)
# DeepSeek (Recommended - cheapest, ~$0.14 per 1M tokens)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenAI API (alternative)
VITE_OPENAI_API_KEY=your_openai_api_key

# Claude API (alternative)
VITE_CLAUDE_API_KEY=your_claude_api_key

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Paystack Configuration (alternative payment provider)
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_google_analytics_id

# Optional: Sentry (error tracking)
VITE_SENTRY_DSN=your_sentry_dsn
```

