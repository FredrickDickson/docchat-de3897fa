# Database Setup Instructions

This folder contains the SQL scripts required to set up the **Supabase database and storage** for the DocChat / `docchat_flutter` application described in `docs/CONTEXT.md`.

It combines:

- **Core SaaS tables** for the PDF summarizer (users, summaries, subscriptions, etc.).
- **DocChat-specific tables** (`profiles`, `documents`) used by the web app and Flutter client.
- **Storage buckets** for uploaded PDFs, extracted text, public assets, and per-user document files.

---

## Prerequisites

- A Supabase project created.
- Access to the Supabase Dashboard **SQL Editor**.
- You are signed in as a Supabase **owner / admin**.

---

## Files in this folder

1. **`01_users.sql`**
   - Creates the `public.users` table (extends `auth.users` with plan/usage fields).
   - Enables RLS and adds policies so users can **view/update only their own row**.
   - Creates a trigger on `auth.users` so that whenever a new auth user is created, a matching row is inserted into `public.users`.

2. **`02_core_tables.sql`**
   - Creates the **SaaS core tables**:
     - `summaries`, `subscriptions`, `credits`, `files`, `audit_logs`, `admin_metrics`.
   - Adds **RLS policies** so users only see their own data (except `admin_metrics`, which is locked down).
   - Creates the **DocChat tables**:
     - `profiles` – profile data linked to `auth.users`.
     - `documents` – uploaded document metadata (name, size, type, status).
   - Adds RLS policies for `profiles` and `documents` and `updated_at` triggers.

3. **`03_storage.sql`**
   - Creates / ensures the following **Storage buckets** exist:
     - `pdf-uploads` (private – raw PDFs for summarizer).
     - `extracted-text` (private – OCR / parsed text, optional).
     - `public-assets` (public – marketing images, logos, etc.).
     - `documents` (private – DocChat document uploads).
   - Enables RLS on `storage.objects` and defines policies per bucket.

4. **`04_chat.sql`**
   - Creates chat tables for the Phase 4 chat interface:
     - `chat_sessions` – one row per conversation, optionally tied to a `documents` row.
     - `messages` – individual chat messages (user / assistant / system) with token + cost metadata.
   - Adds RLS so users can only access their own chat sessions and messages.
   - Adds a trigger so `chat_sessions.updated_at` is refreshed whenever a new message is inserted.

---

## How to apply the SQL (Supabase Dashboard)

Run the files **in this exact order** from the Supabase SQL Editor:

1. Open Supabase → **SQL** → **+ New query**.
2. Paste the contents of `01_users.sql` → click **Run**.
3. New query → paste `02_core_tables.sql` → **Run**.
4. New query → paste `03_storage.sql` → **Run**.
5. New query → paste `04_chat.sql` → **Run**.

You can also automate this with the Supabase CLI, but the SQL is designed to be copy–pasted into the Dashboard.

---

## Verification Checklist

After running the scripts, verify in the Supabase Dashboard:

1. **Table Editor → public schema**
   - `users`
   - `profiles`
   - `documents`
   - `summaries`
   - `subscriptions`
   - `credits`
   - `files`
   - `audit_logs`
   - `admin_metrics`
   - `chat_sessions`
   - `messages`

2. **Authentication → Users**
   - Create / sign up a test user.
   - Confirm that a matching row appears in `public.users` (and that `profiles` can be created for that user).

3. **Storage → Buckets**
   - Buckets exist:
     - `pdf-uploads`
     - `extracted-text`
     - `public-assets`
     - `documents`

4. **Authentication → Policies / Database → RLS**
   - RLS is **enabled** for all of the tables listed above.
   - Under **Storage → Policies**, RLS is enabled on `storage.objects` and policies for each bucket are visible.

Once this is done, your Supabase backend matches the design in `docs/CONTEXT.md` and is ready for the `docchat_flutter` client.
