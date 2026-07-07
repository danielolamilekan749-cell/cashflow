# CashFlow AI

**CashFlow AI** is an AI-powered business intelligence and financial management platform built specifically for Nigerian merchants on the Nomba payment infrastructure.

---

## What It Does

Most small business owners — market traders, provision stores, retail shops — have no real visibility into how their business is performing. They don't know which products are selling, which customers are loyal, who owes them money, or whether their revenue is growing or declining. CashFlow AI solves that.

The platform connects directly to a merchant's Nomba account and turns raw transaction data into clear, actionable intelligence — all in one dashboard that works on both desktop and mobile.

---

## Core Features

### 📊 Live Business Dashboard
Real-time KPI cards showing today's revenue, weekly and monthly performance, total transactions, average order value, and account balance — all pulled directly from the merchant's Nomba account via the Nomba API.

### 🤖 AI Business Assistant
A conversational AI powered by **Groq (LLaMA 3.3 70B)** that has full access to the merchant's business data. The merchant can ask natural language questions like *"Why are my sales down?"*, *"Who are my top customers?"*, or *"What should I restock?"* and get specific, data-driven answers.

### 💳 Debt Tracker
Merchants can record customers who owe them money, set due dates, track payment progress, and take action with one tap — call the customer directly, send a WhatsApp payment reminder, or mark the debt as paid. All debt records are saved to a Supabase database and persist across sessions. An AI reminder automatically analyses overdue debts on page load and tells the merchant who to follow up with first.

### 👥 Customer Intelligence
Customers are ranked by total transaction spend from live Nomba data — not manually entered. The platform segments them into Gold, Silver, and Bronze tiers based on their actual purchasing behaviour. An AI insight summarises the customer base and highlights retention opportunities.

### 📈 Revenue Analytics
Interactive charts showing revenue, sales volume, and transaction trends across 7-day, 30-day, 90-day, and 12-month periods. All data is live from Nomba transactions when connected.

### 📱 WhatsApp Notifications
Merchants can connect their WhatsApp number directly in the sidebar. Once connected, they receive automated business alerts — payment received, debt overdue, low inventory — on their phone even when they are not on the dashboard.

### 🔔 Notification Centre
An in-app feed of business events, categorised by payment, customer activity, inventory, AI discovery, and growth milestones.

### 📋 Reports
Exportable CSV reports for revenue and transactions, with a live data table showing the full transaction history from Nomba.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| AI | Groq API (LLaMA 3.3 70B) |
| Payments / Data | Nomba API (Sandbox + Production) |
| Database | Supabase (PostgreSQL) |
| Routing | React Router v7 |

---

## How the Nomba Integration Works

The app connects to the **Nomba sandbox automatically on first load** — no credentials required. Using the sandbox's unauthenticated endpoints, it creates a virtual account, fetches transactions, account balance, and merchant profile details.

When the merchant is ready to connect their real Nomba account (production), they click Connect, enter their Account ID, Client ID, and Client Secret from the Nomba Developer Dashboard, and the platform switches to live data instantly.

The three auth endpoints used are:
- `POST /v1/auth/token/issue` — authenticate with credentials
- `POST /v1/auth/token/refresh` — silently refresh expiring tokens
- `POST /v1/auth/token/revoke` — cleanly disconnect

---

## Database Schema

Six tables in Supabase:
- `nomba_sessions` — stores connection metadata per merchant
- `merchant_profiles` — caches account name, email, phone from Nomba
- `debts` — full debt records with payment progress (persists across reloads)
- `whatsapp_config` — WhatsApp number and per-type alert preferences
- `notification_log` — history of in-app and WhatsApp alerts sent
- `transaction_cache` — local cache of Nomba transaction data

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (required for Nomba sandbox proxy)
npm run dev
```

The Vite dev server proxies `/api/nomba-sandbox` to `https://sandbox.nomba.com` to avoid CORS. The app works without any `.env` configuration — sandbox connection is automatic.

To use real Nomba credentials or Groq AI, copy `.env.example` to `.env` and fill in your keys.

---

## Environment Variables

```env
# Nomba (optional — sandbox works without these)
VITE_NOMBA_ENV=sandbox
VITE_NOMBA_CLIENT_ID=your_client_id
VITE_NOMBA_CLIENT_SECRET=your_client_secret
VITE_NOMBA_ACCOUNT_ID=your_account_id

# Groq AI
VITE_GROQ_API_KEY=your_groq_api_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Built For

Nomba × DevCareer Hackathon — July 2026

The project demonstrates how the Nomba API can power a full business intelligence platform for the everyday Nigerian merchant, combining real-time financial data, AI analysis, and multi-channel notifications in a single seamless product.
