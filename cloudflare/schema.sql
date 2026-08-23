-- CanPay Insights on D1. Mirrors the Supabase schema column-for-column so the
-- analysis layer (lib/d1/*) and the archive format stay unchanged.
-- Apply:  wrangler d1 execute canpay --remote --file=cloudflare/schema.sql

create table if not exists events (
  id integer primary key,                -- keeps Supabase ids on migration
  created_at text not null,              -- ISO 8601 UTC
  mode text not null, province text not null, income_bracket text not null,
  lang text not null, source text not null default 'web', embed_host text,
  country text, region text, city text, lat real, lon real,
  device text, browser text,
  shift_start_hour integer, shift_end_hour integer, unpaid_break_min integer,
  days_per_week integer, works_weekend integer, avg_daily_hours real,
  has_rrsp integer, rrsp_pct_bucket text, employer_match integer,
  shift_premium integer, premium_rate_bucket text, ot_hours_bucket text,
  tips_pct_bucket text, pay_frequency text,
  viewed_report integer default 0, entry_path text, referrer_path text,
  local_hour integer, local_dow integer, session_id text, seq integer,
  industry text, industry_rank integer, industry_returning integer,
  intent text, expectation text, work_arrangement text, age_band text,
  employment_shape text, product_interest text,
  is_registered integer, from_history integer, change_direction text,
  change_pct_bucket text, days_since_saved_bucket text, province_changed integer,
  median_ratio_bucket text, median_wage_ref integer,
  schema_version integer not null default 1,
  excluded integer
);
create index if not exists idx_events_created on events(created_at);
create index if not exists idx_events_session on events(session_id);

create table if not exists gsc_daily (
  date text primary key, clicks integer, impressions integer, ctr real, position real, fetched_at text
);
create table if not exists gsc_queries (
  date text not null, query text not null, clicks integer, impressions integer, ctr real, position real,
  primary key (date, query)
);
create table if not exists gsc_pages (
  date text not null, page text not null, clicks integer, impressions integer, ctr real, position real,
  primary key (date, page)
);
create index if not exists idx_gsc_pages_page on gsc_pages(page);

create table if not exists purchases (
  id integer primary key autoincrement,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  stripe_session_id text unique not null, stripe_payment_intent text,
  product text not null, amount_cents integer not null, currency text not null,
  email text, lang text, from_province text, to_province text, income_bracket text,
  refunded integer not null default 0, user_id text
);

create table if not exists product_waitlist (
  id integer primary key autoincrement,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  product text not null, email text not null, lang text
);

create table if not exists monthly_snapshots (
  month text primary key, payload text not null, taken_at text not null
);

-- Accounts that are not real users (owner, App Review, friends). Kept by id
-- so the rule survives the auth migration.
create table if not exists excluded_users (
  user_id text primary key, reason text, added_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
