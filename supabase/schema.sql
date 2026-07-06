-- ============================================================
-- CashFlow AI — Supabase Schema
-- Run this FULL script in:
--   Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Drop existing tables (clean slate) ──────────────────────
drop table if exists debts cascade;
drop table if exists whatsapp_config cascade;
drop table if exists nomba_sessions cascade;
drop table if exists merchant_profiles cascade;
drop table if exists notification_log cascade;
drop table if exists transaction_cache cascade;

-- ─── 1. Nomba Sessions ───────────────────────────────────────
create table nomba_sessions (
  account_id   text primary key,
  client_id    text,
  connected_at timestamptz default now(),
  expires_at   timestamptz,
  environment  text default 'sandbox',
  created_at   timestamptz default now()
);

-- ─── 2. Merchant Profiles ────────────────────────────────────
create table merchant_profiles (
  account_id   text primary key,
  account_name text,
  email        text,
  phone_number text,
  status       text,
  currency     text default 'NGN',
  updated_at   timestamptz default now(),
  created_at   timestamptz default now()
);

-- ─── 3. Debts ────────────────────────────────────────────────
-- NO foreign key — works for demo mode, sandbox, and real accounts
create table debts (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text not null,
  customer_name        text not null,
  phone                text,
  amount               numeric(12, 2) not null,
  collected_date       date not null,
  due_date             date not null,
  installment_progress integer default 0,
  reminder_status      text default 'pending',
  category             text default 'due-soon',
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index debts_merchant_idx on debts(merchant_account_id);
create index debts_category_idx on debts(category);
create index debts_created_idx  on debts(created_at desc);

-- ─── 4. WhatsApp Config ──────────────────────────────────────
create table whatsapp_config (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text not null unique,
  phone_number         text not null,
  verified             boolean default false,
  connected_at         timestamptz default now(),
  alert_payments       boolean default true,
  alert_inventory      boolean default true,
  alert_insights       boolean default true,
  alert_customers      boolean default false,
  alert_debts          boolean default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── 5. Notification Log ─────────────────────────────────────
create table notification_log (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text,
  title                text not null,
  message              text not null,
  type                 text,
  channel              text default 'in_app',
  read                 boolean default false,
  sent_at              timestamptz default now()
);

create index notif_merchant_idx on notification_log(merchant_account_id);

-- ─── 6. Transaction Cache ────────────────────────────────────
create table transaction_cache (
  id                   text primary key,
  merchant_account_id  text,
  status               text,
  amount               numeric(12, 2),
  type                 text,
  source               text,
  rrn                  text,
  terminal_id          text,
  merchant_tx_ref      text,
  time_created         timestamptz,
  synced_at            timestamptz default now()
);

create index txn_merchant_idx on transaction_cache(merchant_account_id);
create index txn_time_idx     on transaction_cache(time_created desc);

-- ─── 7. Row Level Security ───────────────────────────────────
alter table nomba_sessions    enable row level security;
alter table merchant_profiles enable row level security;
alter table debts              enable row level security;
alter table whatsapp_config    enable row level security;
alter table notification_log   enable row level security;
alter table transaction_cache  enable row level security;

-- Allow ALL operations with the anon key (for hackathon/demo)
-- Tighten these with Supabase Auth later in production

create policy "allow_all_nomba_sessions"    on nomba_sessions    for all to anon using (true) with check (true);
create policy "allow_all_merchant_profiles" on merchant_profiles  for all to anon using (true) with check (true);
create policy "allow_all_debts"             on debts              for all to anon using (true) with check (true);
create policy "allow_all_whatsapp_config"   on whatsapp_config    for all to anon using (true) with check (true);
create policy "allow_all_notification_log"  on notification_log   for all to anon using (true) with check (true);
create policy "allow_all_transaction_cache" on transaction_cache  for all to anon using (true) with check (true);

-- ─── Done ────────────────────────────────────────────────────
-- Tables created: nomba_sessions, merchant_profiles, debts,
--                 whatsapp_config, notification_log, transaction_cache
