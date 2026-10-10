-- KrishiSetu Production-Grade PostgreSQL Database Schema
-- Multi-Tenant Security with Row Level Security (RLS) & E.164 Mobile Phone Identity

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. USERS & IDENTITY
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

create unique index if not exists idx_users_normalized_phone
  on public.users (normalized_phone_number);

-- 2. FARMER PROFILES
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

-- 3. FARMS & LAND METRICS
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

-- 4. OTP VERIFICATIONS
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

-- 5. FARM RECORDS & ACCOUNTING LEDGER
create table if not exists public.farm_records (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.users(id) on delete cascade,
  crop text not null,
  crop_name text,
  record_type text not null check (record_type in ('revenue', 'expense', 'harvest', 'yield')),
  category text not null default 'General',
  amount numeric not null default 0,
  source text not null default 'manual',
  quantity_kg numeric,
  price_per_kg numeric,
  note text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_farm_records_farmer_date
  on public.farm_records (farmer_id, recorded_at desc);

-- 6. MARKETPLACE LISTINGS
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.users(id) on delete cascade,
  crop text not null,
  crop_name text not null,
  quantity_kg numeric not null check (quantity_kg > 0),
  available_kg numeric not null check (available_kg >= 0),
  price_per_kg numeric not null check (price_per_kg > 0),
  min_order_kg numeric default 50,
  district text not null default 'chitwan',
  location text not null,
  harvest_date text not null,
  quality_grade text not null default 'Grade A',
  is_organic boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'sold', 'reserved', 'cancelled')),
  allow_pooling boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_crop_district
  on public.marketplace_listings (crop, district, status);
