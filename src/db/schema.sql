-- KrishiSetu Production-Grade PostgreSQL Database Schema
-- Multi-Tenant Security with Row Level Security (RLS) & E.164 Mobile Phone Identity
-- Supports Supabase Auth + Standalone PostgreSQL with Strict Phone Uniqueness

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. USERS & IDENTITY (Mobile Phone Verified Central Identity)
-- =========================================================================

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  normalized_phone_number text not null,
  phone_verified boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'pending_profile', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

-- Unique index enforcing exactly 1 user account per normalized phone number (+977XXXXXXXXXX)
create unique index if not exists idx_users_normalized_phone
  on public.users (normalized_phone_number);

-- =========================================================================
-- 2. FARMER PROFILES (Personal & Geographical Metadata)
-- =========================================================================

create table if not exists public.farmer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  full_name text not null,
  preferred_language text not null default 'ne'
    check (preferred_language in ('ne', 'en')),
  province text default 'Bagmati',
  district text not null default 'chitwan',
  municipality text,
  ward text,
  locality text,
  profile_completion_pct integer not null default 60
    check (profile_completion_pct >= 0 and profile_completion_pct <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_farmer_profiles_district
  on public.farmer_profiles (district);

-- =========================================================================
-- 3. FARMS & LAND METRICS (Agricultural Units & Canonical Area)
-- =========================================================================

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.users(id) on delete cascade,
  farm_name text not null default 'Main Farm',
  land_size numeric not null default 1.0 check (land_size >= 0),
  land_unit text not null default 'ropani'
    check (land_unit in ('ropani', 'aana', 'paisa', 'daam', 'bigha', 'kattha', 'dhur', 'hectare', 'sqm')),
  land_size_ropani_eqv numeric not null default 1.0 check (land_size_ropani_eqv >= 0),
  soil_type text default 'Alluvial Loam',
  irrigation_type text default 'Irrigated',
  primary_crops text[] not null default array['tomato', 'cauliflower', 'potato'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_farms_farmer_id
  on public.farms (farmer_id);

-- =========================================================================
-- 4. OTP VERIFICATIONS & RATE LIMITING
-- =========================================================================

create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  normalized_phone text not null,
  otp_hash text not null,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  expires_at timestamptz not null,
  cooldown_until timestamptz not null,
  verified_at timestamptz,
  intent text not null default 'login'
    check (intent in ('register', 'login', 'change_phone')),
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_phone
  on public.otp_verifications (normalized_phone);

-- =========================================================================
-- 5. FARM RECORDS & ACCOUNTING LEDGER (Durable Farmer Records)
-- =========================================================================

create table if not exists public.farm_records (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.users(id) on delete cascade,
  crop text not null,
  crop_name text,
  record_type text not null check (record_type in ('expense', 'revenue', 'pooling_savings')),
  amount numeric not null check (amount >= 0),
  source text not null check (source in ('calculator', 'pooling_group', 'ai_assist', 'manual')),
  quantity_kg numeric check (quantity_kg >= 0),
  note text,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_farm_records_farmer
  on public.farm_records (farmer_id, recorded_at desc);

-- =========================================================================
-- 6. LEGACY / COMPATIBILITY FARMERS TABLE (Supabase auth.users Bridge)
-- =========================================================================

create table if not exists public.farmers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text unique,
  district text not null default 'chitwan',
  crops text[] default array['tomato', 'cauliflower', 'potato'],
  land_size numeric check (land_size >= 0),
  land_unit text default 'kattha',
  created_at timestamptz default now()
);

-- =========================================================================
-- 7. MARKET PRICES & MANDI CLOSE RATES
-- =========================================================================

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  price numeric not null check (price >= 0),
  district text not null default 'chitwan',
  recorded_at timestamptz not null default now()
);

-- =========================================================================
-- 8. POOLING GROUPS & MEMBERSHIP
-- =========================================================================

create table if not exists public.pooling_groups (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  harvest_start date not null,
  harvest_end date not null,
  solo_transport_cost_per_kg numeric not null default 8.5,
  pooled_transport_cost_per_kg numeric not null default 3.5,
  district text not null default 'chitwan',
  status text not null default 'filling'
    check (status in ('filling', 'confirmed', 'truck_assigned', 'ready'))
);

create table if not exists public.pooling_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.pooling_groups(id) on delete cascade,
  farmer_id uuid references public.users(id) on delete cascade,
  quantity_kg numeric not null check (quantity_kg > 0),
  joined_at timestamptz default now()
);

-- =========================================================================
-- 9. MARKETPLACE LISTINGS
-- =========================================================================

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.users(id) on delete cascade,
  crop text not null,
  quantity_kg numeric not null check (quantity_kg > 0),
  price numeric not null check (price >= 0),
  photo_url text,
  status text not null default 'active'
    check (status in ('active', 'pending_pickup', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- =========================================================================
-- 10. IN-APP NOTIFICATIONS & DISPATCHES
-- =========================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.users(id) on delete cascade,
  type_key text not null,
  data jsonb not null default '{}'::jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — STRICT ACCESS CONTROL
-- =========================================================================

alter table public.users enable row level security;
alter table public.farmer_profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_records enable row level security;
alter table public.market_prices enable row level security;
alter table public.pooling_groups enable row level security;
alter table public.pooling_group_members enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.notifications enable row level security;

-- Users RLS
create policy "Users can view own account record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own account record"
  on public.users for update
  using (auth.uid() = id);

-- Farmer Profiles RLS
create policy "Public can view basic farmer profiles"
  on public.farmer_profiles for select
  using (true);

create policy "Farmers can update own profile"
  on public.farmer_profiles for update
  using (auth.uid() = user_id);

create policy "Farmers can insert own profile"
  on public.farmer_profiles for insert
  with check (auth.uid() = user_id);

-- Farms RLS
create policy "Farmers can view own farm records"
  on public.farms for select
  using (auth.uid() = farmer_id);

create policy "Farmers can manage own farm records"
  on public.farms for all
  using (auth.uid() = farmer_id);

-- Farm Accounting Ledger RLS
create policy "Farmers can view own accounting records"
  on public.farm_records for select
  using (auth.uid() = farmer_id);

create policy "Farmers can insert own accounting records"
  on public.farm_records for insert
  with check (auth.uid() = farmer_id);

create policy "Farmers can delete own accounting records"
  on public.farm_records for delete
  using (auth.uid() = farmer_id);

-- Market Prices (Public read)
create policy "Public read market prices"
  on public.market_prices for select
  using (true);

-- Pooling Groups
create policy "Public view pooling groups"
  on public.pooling_groups for select
  using (true);

create policy "Farmers can join pool"
  on public.pooling_group_members for insert
  with check (auth.uid() = farmer_id);

-- Marketplace Listings
create policy "Public view listings"
  on public.marketplace_listings for select
  using (true);

create policy "Farmers manage own listings"
  on public.marketplace_listings for all
  using (auth.uid() = farmer_id);
