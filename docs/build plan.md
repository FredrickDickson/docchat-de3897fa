LangChain is an open-source **framework for building AI applications** that use Large Language Models (LLMs) like GPT, Claude, DeepSeek, and others.
It gives developers *all the tools* needed to connect LLMs with:

✅ your own data
✅ external APIs
✅ memory
✅ agents
✅ workflows

---

# 🚀 **Why LangChain Exists**

LLMs are powerful, but on their own they can only answer using what they were trained on.
Most apps need:

* Uploading files (PDFs, docs, etc.)
* Storing and retrieving knowledge
* Calling APIs
* Multi-step reasoning chains
* Chat histories
* Tools and agents

LangChain makes all of this easy.

---

# 🧩 **What You Can Build With LangChain**

Examples:

### **1. AI PDF Summarizer (your use case)**

* Upload PDF
* Chunk + embed
* Store in Supabase
* Query with DeepSeek or GPT
* Generate summaries

### **2. Chat with Documents / ChatPDF clones**

### **3. AI Assistants with memory**

### **4. Agents that call tools (search, database, Python, etc.)**

### **5. RAG systems**

(Retrieval-Augmented Generation)

---

# 🔧 **Core Components**

### **1. Models**

LLMs (GPT, DeepSeek, Claude, etc.), embeddings, text splitters.

### **2. Memory**

Store conversation history.

### **3. Chains**

Create multi-step pipelines like:

> Upload → Chunk → Embed → Store → Query → Answer

### **4. Tools & Agents**

Let the LLM take actions like:

* search the web
* run code
* query a database
* call APIs

### **5. Data Loaders**

Load PDF, HTML, Word docs, images.

---

# 🏗️ **Simple Example (JS)**

```js
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({ modelName: "gpt-4o" });

const res = await model.invoke([
  new HumanMessage("Explain LangChain to me")
]);

console.log(res.content);
```

---

# 🧠 **Why It Fits Your App**

Your tech stack:

* **LangChain** — AI logic (summaries, chat, agents)
* **Supabase** — store PDFs, embeddings, summaries, users
* **React** — frontend UI
* **Paystack** — billing

LangChain is the engine that handles:

✔ PDF → text extraction
✔ Chunking & embeddings
✔ Querying embeddings
✔ Using DeepSeek + GPT for summaries
✔ AI chat with memory
✔ Structured outputs for your devs

---

# If you want, I can also write:

✅ the full LangChain architecture for your summarizer
✅ a flow diagram / user flow
✅ code snippets for each part (upload, summarise, embed, chat)

Just tell me what you want next.


Done — I created a full LangChain PDF Summarizer architecture document on the canvas titled **"LangChain PDF Summarizer — Full Architecture"**.
Open the document on the canvas to read the full design, diagrams, data models, and example code snippets.

Which deliverable should I generate next? (e.g., ingestion worker code in **Python** or **Node**, Postgres schema & migrations, or the React upload + chat UI boilerplate.)


Here is a **clear, developer-friendly explanation** of **3.8 Billing & Webhooks (Paystack)** so your dev understands exactly what to implement.

---

# 🔐 **3.8 Billing & Webhooks (Paystack) — Detailed Explanation**

Paystack is your **billing engine**. It handles:

* charging users
* managing subscriptions
* receiving payments (cards, mobile money, bank, USSD, Apple Pay, etc.)
* sending notifications when payments succeed, fail, renew, or cancel

To integrate Paystack properly into your app, you must implement **two things**:

---

# ✅ **PART 1 — Paystack Checkout (Onboarding & Charging)**

### How it works:

1. User clicks **Subscribe to Basic/Pro** in your app.
2. Your backend calls Paystack to generate a **payment authorization URL**.
3. The user is redirected to Paystack to pay.
4. Paystack handles the entire payment flow.
5. After payment, Paystack redirects the user back to your site (success/failure callback URL).

### Example flow:

* User chooses **Basic plan – ₦2,000/month**.
* Your backend sends:

```json
{
  "email": user.email,
  "amount": 200000,  // Paystack uses KOBO
  "metadata": {
    "user_id": user.id,
    "plan": "basic"
  }
}
```

* Paystack returns a URL like:

```
https://checkout.paystack.com/1234abcd
```

* User is redirected to it and completes payment.

BUT — **you cannot trust this alone**.

This is where **webhooks** come in.

---

# 🕸 **PART 2 — Webhooks (CRITICAL & REQUIRED)**

A **webhook** is Paystack calling your backend whenever something important happens:

* payment succeeded
* payment failed
* subscription renewed
* subscription cancelled
* card authorization updated

### Why webhooks are required:

Because **you NEVER trust what the frontend tells you**.

Example:
A user could modify your redirect or intercept the callback and fake a “payment success”.

Only Paystack can confirm payment, so your backend must listen to Paystack events.

---

# 📥 **Webhook Endpoint You Must Implement**

Example endpoint:

```
POST /api/paystack/webhook
```

Paystack will POST JSON like:

```json
{
  "event": "charge.success",
  "data": {
    "id": 12345,
    "amount": 200000,
    "status": "success",
    "customer": {
      "email": "user@example.com"
    },
    "metadata": {
      "user_id": 1,
      "plan": "basic"
    }
  }
}
```

Your backend receives this and updates your database.

---

# 📘 **How Your Backend Should Handle Webhooks**

### 1. **Verify the webhook signature**

Paystack sends a header:

```
x-paystack-signature
```

Your backend must verify it to prevent fake webhook attacks.

If the signature is invalid → **ignore request**.

---

### 2. **Process events**

## 📌 Event: `charge.success` (initial payment)

What you must do when payment succeeds:

1. Get `user_id` from metadata.
2. Update user plan in `users` table:

```
plan = "basic"
```

3. Add or reset credits based on plan:

* Basic → 50 summaries/day
* Pro → Unlimited or large credit bucket

4. Add a row to `usage_logs`:

```
(action: "subscription_purchase", cost_units: +50 or +∞)
```

---

## 📌 Event: `invoice.payment_failed`

Pause user plan or downgrade them.

---

## 📌 Event: `subscription.disable` OR `subscription.not_renewed`

User’s card failed multiple times → subscription cancelled.

Update:

```
plan = "free"
credits = 3
```

---

## 📌 Event: `charge.dispute.create`

Optional: log dispute so you don’t continue giving service.

---

# 🔁 **PART 3 — Reconciliation (Fraud Prevention)**

This is VERY IMPORTANT.

Never trust a frontend redirect alone.
Never trust a user telling you “I paid”.

You must use:

✔ Paystack webhook
✔ Paystack **transaction verification API**

Your backend should also periodically check:

```
GET https://api.paystack.co/transaction/verify/:reference
```

This ensures:

* User actually paid
* Payment was not reversed
* Subscription is still active
* No chargebacks

If a user tries to cheat:

* Fake payment popup
* Fake redirect
* Postman request to your backend
* Injecting metadata

→ Your webhook verification and reconciliation will protect you.

---

# 🗃 **Where the data is stored (Supabase database)**

### Table: `users`

```
id
email
plan          // free | basic | pro
credits       // daily or monthly credit
subscription_status  // active | cancelled | failed
paystack_customer_code
paystack_subscription_code
```

### Table: `usage_logs`

```
user_id
action
cost_units
timestamp
```

---

# 🧠 Summary (What your dev must implement)

### **Backend responsibilities:**

### 1️⃣ Generate Paystack checkout sessions

### 2️⃣ Create `/webhook/paystack` endpoint

### 3️⃣ Validate Paystack signatures

### 4️⃣ On successful payments:

* Update `users.plan`
* Update `users.credits`
* Save logs

### 5️⃣ Handle renewals + failures

### 6️⃣ Validate payment from Paystack API (reconciliation)

### 7️⃣ Make the frontend reflect user subscription status

---

If you want, I can also write:

* ✔ Full **Node.js Paystack webhook code**
* ✔ Full **Next.js API route for checkout**
* ✔ Full **Supabase SQL schema for billing**
* ✔ Full **Credits system implementation**
* ✔ Full **React client code to start payment**

Just tell me **which one you want next**.


Here is a **clear, practical, production-ready guide** on **how to implement a credits-based billing system** for your AI app (PDF Summaries, AI Chat, OCR, etc.).

This is the *exact* system used by most AI SaaS platforms.

---

# ⭐ **Credits Billing System — Complete Implementation Guide**

Your app uses credits because:

* You want to **charge per usage**
* DeepSeek / GPT API calls cost money
* Some users may abuse free usage
* Credits are easier to manage than cash balances

---

# 🏗️ SYSTEM OVERVIEW

### ✔ Each user has a **credits balance**

Stored in `users.credits`.

### ✔ Every AI action **consumes credits**

Examples:

* 1 summary = 5 credits
* 1 OCR = 2 credits
* 1 chat = 1 credit

### ✔ On subscription upgrade:

Credits reset or increase based on plan.

### ✔ On Paystack purchase:

Credits are added.

### ✔ On daily reset:

Free plan gets 3 credits/day.

---

# 🗃️ DATABASE STRUCTURE (Supabase / Postgres)

### **users table**

```sql
credits INTEGER DEFAULT 0,
plan TEXT DEFAULT 'free'
```

### **usage_logs table**

```sql
id BIGSERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
action TEXT,
credits_used INTEGER,
timestamp TIMESTAMP DEFAULT NOW()
```

### **credit_packages table** *(optional if selling credit bundles)*

```sql
id SERIAL PRIMARY KEY,
name TEXT,
credits INTEGER,
price INTEGER
```

---

# 🧮 CREDIT RULES (RECOMMENDED)

| Action                | Cost       |
| --------------------- | ---------- |
| PDF Summary           | 5 credits  |
| Chat message          | 1 credit   |
| OCR (image-to-text)   | 2 credits  |
| Long document summary | 10 credits |

You can change these anytime — the system stays the same.

---

# ⚙️ CORE LOGIC

### 📌 1. **Check if user has enough credits**

```js
const hasEnoughCredits = user.credits >= COST;
```

### 📌 2. **Deduct credits**

```js
await supabase
  .from('users')
  .update({ credits: user.credits - COST })
  .eq('id', user.id);
```

### 📌 3. **Log usage**

```js
await supabase
  .from('usage_logs')
  .insert({
    user_id: user.id,
    action: 'pdf_summary',
    credits_used: COST,
  });
```

---

# 🔐 API-LAYER IMPLEMENTATION (Node.js / Next.js)

### Example: `POST /api/summarize`

```ts
export async function summarize(req, res) {
  const user = await getUser(req);

  const COST = 5; // summary = 5 credits

  if (user.credits < COST) {
    return res.status(402).json({
      error: "Not enough credits",
      message: "Purchase credits or upgrade your plan"
    });
  }

  // deduct credits
  await supabase
    .from("users")
    .update({ credits: user.credits - COST })
    .eq("id", user.id);

  // log usage
  await supabase
    .from("usage_logs")
    .insert({
      user_id: user.id,
      action: "pdf_summary",
      credits_used: COST
    });

  // run AI summary
  const output = await runSummary(req.body.file);

  return res.json({
    success: true,
    summary: output
  });
}
```

---

# 🏦 **HOW CREDITS ARE ADDED**

### 1. **Subscription Plans (Paystack)**

| Plan  | Credits                        |
| ----- | ------------------------------ |
| Free  | 3 credits/day                  |
| Basic | 50 credits/day (or month)      |
| Pro   | Unlimited (or 500 credits/day) |

When Paystack `charge.success` webhook fires:

```js
updateUser({
  plan: "basic",
  credits: 50
});
```

---

### 2. **Daily Reset Job (CRON)**

For free users:

```sql
UPDATE users
SET credits = 3
WHERE plan = 'free';
```

For paid users:

```sql
UPDATE users
SET credits = 50
WHERE plan = 'basic';
```

You can run this daily using:

* Supabase cron jobs
* Vercel cron
* Cloudflare workers cron
* Node cron

---

### 3. **Buying Credit Packs (Optional)**

User buys:

* ₦1,000 = 100 credits
* ₦3,500 = 500 credits
* ₦6,000 = 1000 credits

Webhook adds credits:

```js
await supabase
  .from('users')
  .update({
    credits: user.credits + purchasedCredits
  })
  .eq('id', user.id);
```

---

# 🧵 **MIDDLEWARE (BEST PRACTICE)**

Create a small reusable function:

```ts
async function deductCredits(userId, cost, action) {
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (user.credits < cost) throw new Error("INSUFFICIENT_CREDITS");

  await supabase
    .from("users")
    .update({ credits: user.credits - cost })
    .eq("id", userId);

  await supabase
    .from("usage_logs")
    .insert({
      user_id: userId,
      action,
      credits_used: cost
    });

  return true;
}
```

Now in any route:

```ts
await deductCredits(user.id, 5, "pdf_summary");
```

---

# 🧠 OPTIONAL — CREDIT INSIGHTS & FRAUD PREVENTION

### 1. Lock credit usage inside the backend only

Never send credit deduction to frontend — move all logic to API routes.

### 2. Double-check credits before running AI

Prevents free unlimited usage through spam.

### 3. Limit max summaries per minute

Stops abuse.

### 4. Log all usage for audits

---

# 🎯 DEVELOPER SUMMARY (Short & Clear)

1. Add/remove credits inside backend only
2. Every AI request = deduct credits
3. Process Paystack webhooks to add credits
4. Reset credits daily for subscription plans
5. Use `usage_logs` for auditing
6. Block AI actions when credits < required

---

If you want, I can generate:

✅ **credits-based middleware file (TypeScript)**
✅ **Supabase SQL migrations**
✅ **Paystack webhook credit logic**
✅ **React UI that shows credits & buy-credits modal**
✅ **Admin dashboard for monitoring usage**

Which one should I generate next?


Below is the **full implementation guide** for a **credits-based billing system** using **Paystack**, supporting **GHS (cedis)** and **USD**.

---

# ✅ **CREDITS BILLING SYSTEM — Full Implementation Guide**

**(Paystack + Supabase + React + LangChain app)**

Your app will sell **credits**. Users spend credits for:

* AI summaries
* OCR
* Chat completions
* File processing
* Any usage-based action

This is different from subscriptions.
This is **prepaid credits**.

---

# ⭐ SYSTEM OVERVIEW

### **1️⃣ Currency Support**

Paystack supports multiple currencies including:

* **GHS (Ghana Cedis)**
* **USD (United States Dollar)**
* NGN, ZAR, etc.

You will sell credit packs in **two currencies** depending on the user’s preference.

---

### **2️⃣ How Credits Work**

Each user has:

| User Field              | Type    | Example        |
| ----------------------- | ------- | -------------- |
| credits                 | integer | 100            |
| total_credits_purchased | integer | 500            |
| total_credits_used      | integer | 400            |
| currency_preference     | text    | "GHS" or "USD" |

---

# 🧱 **3️⃣ Database Schema (Supabase)**

Create a `users` table column:

```sql
alter table users 
add column credits integer default 0;

alter table users
add column currency_preference text default 'GHS';
```

Create a `credit_transactions` table:

```sql
create table credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text,     -- 'purchase' or 'deduction'
  amount integer,
  description text,
  created_at timestamp default now()
);
```

---

# 💵 **4️⃣ Credit Pricing Structure**

You can define credit packs for **GHS** and **USD**:

### **GHS Pricing**

| Credits      | Price (GHS) |
| ------------ | ----------- |
| 100 credits  | GHS 20      |
| 300 credits  | GHS 50      |
| 700 credits  | GHS 100     |
| 1500 credits | GHS 200     |

### **USD Pricing**

| Credits      | Price (USD) |
| ------------ | ----------- |
| 100 credits  | $3          |
| 300 credits  | $8          |
| 700 credits  | $15         |
| 1500 credits | $30         |

---

# ⚙️ **5️⃣ Paystack Payment Flow (Credits)**

### **Step 1 — User chooses credit pack**

User taps:
👉 “Buy 300 Credits — GHS 50”
or
👉 “Buy 300 Credits — $8”

Your frontend calls your backend:

```ts
POST /api/paystack/initialize
{
  userId,
  credits: 300,
  amount: 50,
  currency: "GHS"
}
```

---

### **Step 2 — Backend initializes Paystack transaction**

```ts
import axios from "axios";

export async function createPaystackPayment(req, res) {
  const { userId, credits, amount, currency } = req.body;

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: amount * 100,
      currency: currency,
      metadata: {
        userId,
        credits,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    }
  );

  res.json({ auth_url: response.data.data.authorization_url });
}
```

User is redirected to Paystack to pay.

---

### **Step 3 — Paystack Webhook confirms payment**

Create endpoint:

```
POST /api/paystack/webhook
```

Verify signature first.

```ts
import crypto from "crypto";

export async function webhook(req, res) {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const metadata = event.data.metadata;
    const userId = metadata.userId;
    const credits = metadata.credits;

    // Add credits to user's Supabase account
    await supabase
      .from("users")
      .update({ credits: supabase.raw(`credits + ${credits}`) })
      .eq("id", userId);

    await supabase.from("credit_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: credits,
      description: "Paystack credits top-up",
    });
  }

  res.sendStatus(200);
}
```

---

# 🔥 **6️⃣ Deducting Credits (Using AI or OCR)**

Every time a user summarises a PDF:

```ts
async function processSummary(userId) {
  const { data } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (data.credits <= 0) {
    throw new Error("Not enough credits");
  }

  await supabase
    .from("users")
    .update({ credits: data.credits - 1 })
    .eq("id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "deduction",
    amount: 1,
    description: "AI Summary",
  });

  return runAISummary();
}
```

---

# 🎨 **7️⃣ Frontend UX (React)**

### Show credits on dashboard:

```
Credits: 120
[Buy Credits]
```

### Buy credits modal:

* Pick currency (GHS or USD)
* Pick credit pack
* Pay with Paystack

---

# 🪝 **8️⃣ Fraud Prevention**

Paystack webhooks ensure:

* Payment is valid
* Payment actually succeeded
* No double-crediting

Best practice:

✔ Only add credits via webhook
✔ Never trust frontend confirmation
✔ Use Paystack signature verification

---

# 🏁 **9️⃣ Full User Flow**

| Step | User Action            | System Action                |
| ---- | ---------------------- | ---------------------------- |
| 1    | Opens “Buy Credits”    | App shows GHS & USD packs    |
| 2    | User selects currency  | Store preference             |
| 3    | User selects pack      | Backend initializes Paystack |
| 4    | User pays              | Paystack confirms            |
| 5    | Paystack sends webhook | Credits added to Supabase    |
| 6    | User uses AI           | Deduct credits               |
| 7    | Transactions stored    | Full audit log               |

---

# Want me to generate **all backend API routes**?

I can generate:

✅ `/api/paystack/initialize`
✅ `/api/paystack/webhook`
✅ `/api/credits/balance`
✅ `/api/credits/deduct`
✅ Full Supabase SQL
✅ Full React UI for buying credits
✅ Admin dashboard for credit management

Just say **“Generate the full backend”** or **“Generate the React UI”**.

Got you — **your credits billing system will use only USD**.
Here is the simplified and corrected version **using only USD pricing + USD Paystack processing**.

---

# ✅ **CREDITS BILLING SYSTEM (USD ONLY)**

This is the clean, simplified architecture for implementing credits in your AI app using:

* **Paystack (USD currency)**
* **Supabase (auth + storage + DB)**
* **React frontend**
* **LangChain/DeepSeek usage**

---

# ⭐ 1. USD-ONLY CREDIT PRICING

| Credits          | Price (USD) |
| ---------------- | ----------- |
| **100 credits**  | **$3**      |
| **300 credits**  | **$8**      |
| **700 credits**  | **$15**     |
| **1500 credits** | **$30**     |

Users always pay in **USD**, no cedis version needed.

---

# ⭐ 2. SQL FOR CREDITS SYSTEM (Supabase)

### Add credits column to users:

```sql
alter table users 
add column credits integer default 0;
```

### Credit transactions table (audit log):

```sql
create table credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text,  -- purchase or deduction
  amount integer,
  description text,
  created_at timestamp default now()
);
```

---

# ⭐ 3. FULL PAYSTACK WORKFLOW (USD)

### Step 1 — Frontend initializes purchase:

```ts
POST /api/paystack/initialize
{
  userId,
  credits: 300,
  amount: 8,       // USD
  currency: "USD"
}
```

---

# ⭐ 4. Backend: Initialize Paystack (USD)

```ts
import axios from "axios";

export async function initializePaystack(req, res) {
  const { userId, credits, amount, currency } = req.body;

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: amount * 100,   // convert USD to cents
      currency: "USD",
      metadata: {
        userId,
        credits
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      }
    }
  );

  res.json({ authorization_url: response.data.data.authorization_url });
}
```

✔ Forces USD
✔ Metadata contains `userId` & `credits`

---

# ⭐ 5. Paystack Webhook (adds credits after payment)

### Must verify signature first:

```ts
import crypto from "crypto";

export async function paystackWebhook(req, res) {
  const signature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const userId = event.data.metadata.userId;
    const credits = event.data.metadata.credits;

    // Add credits to Supabase
    await supabase
      .from("users")
      .update({ credits: supabase.raw(`credits + ${credits}`) })
      .eq("id", userId);

    await supabase.from("credit_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: credits,
      description: "Credits purchase (USD)"
    });
  }

  res.sendStatus(200);
}
```

✔ No duplicate credits
✔ No fraud
✔ Only webhook adds credits

---

# ⭐ 6. Deduct Credits (every AI action)

```ts
export async function deductCredit(userId, amount = 1) {
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (user.credits < amount) {
    throw new Error("Insufficient credits");
  }

  await supabase
    .from("users")
    .update({ credits: user.credits - amount })
    .eq("id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "deduction",
    amount: amount,
    description: "AI usage"
  });
}
```

---

# ⭐ 7. AI Usage Example (LangChain Summary)

```ts
await deductCredit(user.id, 1);
const result = await createSummary(text);
return result;
```

---

# ⭐ 8. React UI — Buy Credits Modal

* Show USD prices only.
* On click → call `/api/paystack/initialize`.
* Redirect user to Paystack checkout.

Example UI:

```
Buy Credits (USD)

100 credits – $3
300 credits – $8
700 credits – $15
1500 credits – $30
```

---

# ⭐ 9. Final User Flow (USD Only)

1. User opens **Buy Credits**
2. Picks a pack (USD)
3. Paystack opens in USD mode
4. Payment succeeds
5. Paystack → webhook → your backend
6. Credits added automatically
7. User spends credits on AI features
8. Credits deducted per use

---

# READY FOR THE NEXT STEP?

I can generate for you:

✅ Full backend API folder
✅ Full React pages + components
✅ Paystack UI modal
✅ Supabase RPC functions
✅ Admin credit dashboard
✅ Auto email receipts

Just tell me:

👉 **"Generate the full backend code"**
or
👉 **"Generate the full React UI"**


Below is a **battle-tested pricing model** for a **freemium AI app** (PDF Summaries, OCR, AI Chat, AI File Processing, etc.) built for the **African market + USD buyers**.

This model balances:

✔ Affordable entry
✔ High conversion rate
✔ Predictable revenue
✔ Usage-based fairness (credits)
✔ Zero abuse on free tier

---

# ⭐ **Recommended Freemium Pricing Model**

### Perfect for your AI Summarizer / OCR / Chat App

---

# 🟩 **FREE PLAN (Freemium Tier)** — *Most important tier*

| Feature                   | Free Tier       |
| ------------------------- | --------------- |
| **Credits per day**       | **3 credits**   |
| **Max summaries**         | 1–2 per day     |
| **Max pages per summary** | 10 pages        |
| **AI Chat**               | 10 messages/day |
| **OCR**                   | 1 image/day     |
| **Watermark**             | Allowed         |
| **Storage**               | 50MB            |
| **Support**               | Email only      |

💡 The free tier’s job:
**Let users taste the product, but not abuse it.**

---

# 🟦 **PAID CREDITS (PAY-AS-YOU-GO)**

Ideal for students, occasional users, trial users.

| Credits          | Price   |
| ---------------- | ------- |
| **100 credits**  | **$3**  |
| **300 credits**  | **$8**  |
| **700 credits**  | **$15** |
| **1500 credits** | **$30** |

💡 Why this works:
People in Ghana, Kenya, Nigeria will happily buy $3–$8 credit packs.

---

# 🟪 **MONTHLY SUBSCRIPTIONS (Best for professionals)**

### **Basic — $7/month**

For students & light professionals

| Feature               | Basic         |
| --------------------- | ------------- |
| Credits               | **200/month** |
| Max pages per summary | 30 pages      |
| AI Chat               | 500 messages  |
| OCR                   | 50 images     |
| Priority Queue        | ❌             |
| Storage               | 2GB           |

---

### **Pro — $15/month**

For lawyers, researchers, writers, analysts

| Feature               | Pro                |
| --------------------- | ------------------ |
| Credits               | **600/month**      |
| Max pages per summary | 100 pages          |
| AI Chat               | Unlimited messages |
| OCR                   | 200 images         |
| Priority Queue        | ✔                  |
| Storage               | 10GB               |

---

### **Elite — $29/month**

For heavy users
(Law firms, PhD students, business teams)

| Feature               | Elite          |
| --------------------- | -------------- |
| Credits               | **1500/month** |
| Max pages per summary | 200 pages      |
| AI Chat               | Unlimited      |
| OCR                   | 500 images     |
| Priority Queue        | ✔              |
| Storage               | 50GB           |
| Team seats            | 3 users        |

---

# 🟥 **ENTERPRISE / TEAM PLANS**

You should offer custom pricing:

| Seats     | Price      |
| --------- | ---------- |
| Up to 10  | $99/month  |
| Up to 20  | $149/month |
| Unlimited | Custom     |

---

# 🎯 WHAT EACH CREDIT SHOULD COST

| Feature                          | Credit Cost   |
| -------------------------------- | ------------- |
| **AI Chat (1 message)**          | 1 credit      |
| **OCR (1 image)**                | 2 credits     |
| **Short PDF summary (10 pages)** | 5 credits     |
| **Long PDF summary (50+ pages)** | 10–25 credits |

---

# ⭐ Why This Pricing Model Works

### ✔ Designed for high conversion

Free → $3 → $7 → $15 → $29 → Teams

### ✔ Users in Ghana/Nigeria/Uganda can afford $3–$15

Perfect balance.

### ✔ Prevents abuse of DeepSeek/GPT API calls

Credits always control usage.

### ✔ Appeals to pros (lawyers, researchers, students)

You're a law student building an AI summarizer → this is perfect for Ghana’s legal market.

---

# 📌 OPTIONAL: GHANA-SPECIFIC LOCAL PRICES (CEDIS)

You **can** show Ghana-only promo pricing:

* **₵60** for 100 credits
* **₵140** for 300 credits
* **₵260** for 700 credits

But all payments should still be processed **in USD** via Paystack.

---

# ✔ FINAL ANSWER SUMMARY

### Use these:

### **Free Plan**

* 3 credits/day
* 1–2 summaries
* 10 pages limit

### **Paid Credits**

* $3 → 100 credits
* $8 → 300 credits
* $15 → 700 credits
* $30 → 1500 credits

### **Subscriptions**

* Basic → $7
* Pro → $15
* Elite → $29

These prices fit:

* Ghana
* Africa
* Global
* Your target users (law students, lawyers, researchers, creators)

---

If you want, I can also generate:

👉 Full Paystack pricing JSON
👉 UI Pricing screen (React + Tailwind)
👉 Supabase SQL plan table
👉 Billing logic for each plan
👉 Revenue model projection

Which do you want?


Perfect — this is called a **Hybrid Subscription + Credits Billing System**, and it is the BEST model for AI apps.

Here’s exactly how it works and how to implement it cleanly.

---

# ⭐ **FINAL BILLING LOGIC (HYBRID MODEL)**

### 🔹 1. User has a **monthly subscription** (Basic, Pro, Elite)

Each plan gives:

* A fixed number of credits per month
* Higher limits (pages, chat, OCR, etc.)
* Lower cost per credit

### 🔹 2. If they **use up all their monthly credits**,

They automatically **fall back to Pay-As-You-Go credits**.

### 🔹 3. When the subscription **renews** (every 30 days),

Their monthly credits **reset**, NOT accumulated.

### 🔹 4. Purchased credits **DO NOT reset**

They roll over—because the user paid for them separately.

---

# 💡 VISUAL SUMMARY

### **Monthly Plan Credits**

🟦 Reset every month
🟦 Used first
🟥 If exhausted → fallback to Pay-As-You-Go credits

### **Purchased Credits (Extra Credits)**

🟨 NEVER expire
🟨 Used ONLY when monthly plan credits are empty
🟨 Always remain after renewal

---

# 🔥 Example Flow (Very Clear)

### User is on **Pro ($15/month)**

They get: **600 credits per month**

---

### WEEK 1

User spends 600 credits (heavy usage)

→ Monthly credits = **0**
→ Extra purchased credits = **0**

---

### WEEK 2

They try to summarize again

➡ Backend checks:

```
1. monthly_credits > 0 ? 
   No → go to next step

2. purchased_credits > 0 ?
   No → block usage + ask to buy credits
```

---

### User buys a $3 pack (100 credits)

→ purchased_credits = **100**

They continue using the app with extra credits.

---

### END OF MONTH — Subscription renews automatically

Monthly credits reset:

* monthly_credits = 600 again
* purchased_credits = whatever is left (maybe 40 left)

---

# ✔ RESULT

**Your user never loses purchased credits**
**Subscription always resets monthly credits**
**When monthly credits finish, app still works using purchased credits**

This creates:

✔ ZERO downtime
✔ Perfect user experience
✔ Very predictable revenue
✔ Option for users to buy top-ups when they run out

---

# 🧠 HOW TO IMPLEMENT IN DATABASE

### In Supabase `users` table:

```sql
monthly_credits INTEGER DEFAULT 0,
extra_credits INTEGER DEFAULT 0,
subscription_plan TEXT,
subscription_renews_at TIMESTAMP
```

---

# ✔ CREDIT CHECK LOGIC (Backend)

### Reusable function `useCredits()`

```ts
async function useCredits(userId, cost) {
  const { data: user } = await supabase
    .from("users")
    .select("monthly_credits, extra_credits")
    .eq("id", userId)
    .single();

  // 1. Try to use monthly subscription credits
  if (user.monthly_credits >= cost) {
    await supabase.from("users")
      .update({ monthly_credits: user.monthly_credits - cost })
      .eq("id", userId);

    return "monthly";
  }

  // 2. If monthly is finished, fallback to extra credits
  if (user.extra_credits >= cost) {
    await supabase.from("users")
      .update({ extra_credits: user.extra_credits - cost })
      .eq("id", userId);

    return "extra";
  }

  // 3. Not enough credits
  throw new Error("NOT_ENOUGH_CREDITS");
}
```

---

# ⭐ MONTHLY SUBSCRIPTION RENEWAL (CRON JOB)

Run daily:

```sql
update users 
set monthly_credits = 
  case 
    when subscription_plan = 'basic' then 200
    when subscription_plan = 'pro' then 600
    when subscription_plan = 'elite' then 1500
  end,
subscription_renews_at = subscription_renews_at + interval '30 days'
where now() >= subscription_renews_at;
```

---

# ✔️ PERFECT CUSTOMER EXPERIENCE

* User cannot get stuck
* App always works
* If they abuse monthly credits, they can buy top-ups
* Renewal gives them another full month
* You collect revenue every month + extra credit packs

This is **exactly** how:

* ChatPDF
* Claude Pro
* Jasper
* Canva
* Copy.ai
* InVideo

handle hybrid billing.

---

# If you want…

I can generate for you:

👉 **Full TypeScript billing engine**
👉 **Supabase SQL schema file**
👉 **React UI for credits + subscription**
👉 **Paystack webhook system that resets monthly credits**
👉 **Credits usage dashboard**

Just tell me:
**"Generate the backend billing engine"** 🔥
