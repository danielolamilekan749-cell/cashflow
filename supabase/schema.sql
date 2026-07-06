-- ============================================================
-- CashFlow AI — Full Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── 1. Nomba Sessions ───────────────────────────────────────
-- Stores each merchant's Nomba connection
create table if not exists nomba_sessions (
  account_id   text primary key,
  client_id    text,
  connected_at timestamptz default now(),
  expires_at   timestamptz,
  environment  text default 'sandbox',
  created_at   timestamptz default now()
);

-- ─── 2. Merchant Profiles ────────────────────────────────────
-- Auto-populated from Nomba's /v1/accounts/parent after connect
create table if not exists merchant_profiles (
  account_id   text primary key,
  account_name text,
  email        text,
  phone_number text,
  status       text,
  currency     text default 'NGN',
  updated_at   timestamptz default now(),
  created_at   timestamptz default now()
);

-- ─── 3. Debt Tracker ─────────────────────────────────────────
-- Persists debts across sessions (survives page reload/clear)
create table if not exists debts (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text references merchant_profiles(account_id) on delete cascade,
  customer_name        text not null,
  phone                text,
  amount               numeric(12, 2) not null,
  collected_date       date not null,
  due_date             date not null,
  installment_progress integer default 0 check (installment_progress between 0 and 100),
  reminder_status      text default 'pending' check (reminder_status in ('pending','sent','overdue')),
  category             text default 'due-soon' check (category in ('overdue','due-soon','paid')),
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists debts_merchant_idx on debts(merchant_account_id);
create index if not exists debts_category_idx on debts(category);

-- Auto-update updated_at on any row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger debts_updated_at
  before update on debts
  for each row execute function update_updated_at();

-- ─── 4. WhatsApp Notifications Config ───────────────────────
-- Stores the merchant's WhatsApp number and alert preferences
create table if not exists whatsapp_config (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text references merchant_profiles(account_id) on delete cascade,
  phone_number         text not null,
  verified             boolean default false,
  connected_at         timestamptz default now(),
  -- Alert toggles
  alert_payments       boolean default true,
  alert_inventory      boolean default true,
  alert_insights       boolean default true,
  alert_customers      boolean default false,
  alert_debts          boolean default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  unique(merchant_account_id)
);

create trigger whatsapp_updated_at
  before update on whatsapp_config
  for each row execute function update_updated_at();

-- ─── 5. Notification Log ────────────────────────────────────
-- Tracks every notification sent (in-app + WhatsApp)
create table if not exists notification_log (
  id                   uuid primary key default uuid_generate_v4(),
  merchant_account_id  text,
  title                text not null,
  message              text not null,
  type                 text check (type in ('payment','growth','inventory','ai','customer','debt')),
  channel              text default 'in_app' check (channel in ('in_app','whatsapp','both')),
  read                 boolean default false,
  sent_at              timestamptz default now()
);

create index if not exists notif_merchant_idx on notification_log(merchant_account_id);
create index if not exists notif_read_idx on notification_log(read);

-- ─── 6. Transaction Cache ────────────────────────────────────
-- Caches Nomba transactions locally so dashboard loads fast
create table if not exists transaction_cache (
  id                   text primary key,  -- Nomba transaction ID
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

create index if not exists txn_merchant_idx on transaction_cache(merchant_account_id);
create index if not exists txn_time_idx on transaction_cache(time_created desc);

-- ─── 7. Row Level Security (RLS) ────────────────────────────
-- Lock each table so only authenticated users see their own data
-- (Enable RLS per table — uses anon key for now, upgrade with auth later)

alter table nomba_sessions      enable row level security;
alter table merchant_profiles   enable row level security;
alter table debts                enable row level security;
alter table whatsapp_config      enable row level security;
alter table notification_log     enable row level security;
alter table transaction_cache    enable row level security;

-- Permissive policy for anon key (hackathon mode — tighten with Supabase Auth later)
create policy "anon_all_nomba_sessions"    on nomba_sessions    for all using (true) with check (true);
create policy "anon_all_merchant_profiles" on merchant_profiles  for all using (true) with check (true);
create policy "anon_all_debts"             on debts              for all using (true) with check (true);
create policy "anon_all_whatsapp"          on whatsapp_config    for all using (true) with check (true);
create policy "anon_all_notif_log"         on notification_log   for all using (true) with check (true);
create policy "anon_all_txn_cache"         on transaction_cache  for all using (true) with check (true);
