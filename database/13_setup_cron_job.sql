-- Daily Cron Job for Resetting Monthly Credits
-- This should be run once to set up the automated daily reset

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job to reset monthly credits daily at midnight UTC
SELECT cron.schedule(
  'reset-monthly-credits-daily',
  '0 0 * * *', -- Every day at midnight UTC
  $$SELECT public.reset_monthly_credits()$$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'reset-monthly-credits-daily';

-- To manually run the reset (for testing):
-- SELECT public.reset_monthly_credits();

-- To unschedule the job (if needed):
-- SELECT cron.unschedule('reset-monthly-credits-daily');

-- To view all cron jobs:
-- SELECT * FROM cron.job;

-- To view cron job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
