# DocChat - AI PDF Assistant

DocChat is a powerful AI-powered document assistant that lets you chat with your PDFs and get instant summaries. Built with React, TypeScript, and Supabase, it features a robust subscription system integrated with Paystack.

## 🚀 Features

-   **Chat with PDF**: Interact intelligently with your documents using AI (LangChain + OpenAI/DeepSeek).
-   **PDF Summarization**: Get quick summaries of your documents.
-   **Subscription Plans**:
    -   **Free**: 3 summaries/day.
    -   **Basic**: 50 summaries/day.
    -   **Pro**: Unlimited summaries, Advanced AI.
    -   **Elite**: Unlimited Everything + Priority Support.
-   **Secure Payments**: Integrated with **Paystack** for secure monthly/annual subscriptions.
-   **Authentication**: Secure user authentication via Supabase Auth.
-   **Responsive Design**: Beautiful UI built with TailwindCSS and Shadcn/UI.
-   **Dark Mode**: Native dark mode support.

## 🛠 Tech Stack

-   **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn UI.
-   **Backend**: Supabase (Database, Auth, Storage, Edge Functions).
-   **AI/LLM**: LangChain, OpenAI / DeepSeek.
-   **Payments**: Paystack (via `react-paystack` and Edge Functions).
-   **PDF Processing**: `pdfjs-dist`.

## ⚙️ Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Supabase CLI](https://supabase.com/docs/guides/cli) (for local backend development)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/FredrickDickson/docchat-de3897fa.git
    cd docchat-de3897fa
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `ENV_TEMPLATE.md` content to a new `.env` file and fill in your keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
    VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
    PAYSTACK_SECRET_KEY=your_paystack_secret_key (Server-side only)
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 💳 Paystack Integration Service

The project is configured to use Paystack for subscriptions.

**Plan Configuration:**
Reflected in `src/lib/paystack/paystackConfig.ts`:
-   **Currency**: GHS
-   **Basic**: GHS 105.00/mo 
-   **Pro**: GHS 225.00/mo 
-   **Elite**: GHS 435.00/mo 

**Webhooks**:
Recurring charges are handled via the `paystack-webhook` Edge Function, which correctly identifies users by email for auto-renewals.

## ⚡ Supabase Edge Functions

The backend logic resides in `supabase/functions`:
-   `process-pdf`: Extracts text from uploaded PDFs.
-   `chat`: Handles the RAG (Retrieval Augmented Generation) chat flow.
-   `summarize-pdf`: Generates document summaries.
-   `initialize-paystack-transaction`: Initializes payments with plan codes.
-   `paystack-webhook`: Handles payment success and subscription updates.

## 🚀 Deployment

1.  **Frontend**: Deploy to Vercel, Netlify, or any static site host.
2.  **Backend**: Deploy Edge Functions to Supabase:
    ```bash
    supabase functions deploy
    ```

## 📄 License

This project is licensed under the MIT License.
