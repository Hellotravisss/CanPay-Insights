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
  excluded integer,
  -- 2026-09-15: neighbourhood. `fsa` is the first three characters of a
  -- Canadian postal code (typed, or the nearest FSA centroid to a device
  -- location the visitor chose to share); `lat2`/`lon2` are that device
  -- location rounded to two decimals ON THE DEVICE (~1 km) before it is sent;
  -- `tz` is the browser's IANA zone; `is_returning` is a same-device counter
  -- flag, never an identifier.
  -- Added in production by ALTER during 2026-08/09 and mirrored here on 2026-09-15.
  tenure_band text, union_member text, employer_size text, vacation_band text, os_family text, device_brand text,
  fsa text, fsa_source text, lat2 real, lon2 real, tz text, is_returning integer,
  -- Net → gross calculator: the monthly take-home asked for, as a range label only.
  -- Added in production by ALTER on 2026-09-26.
  reverse_target_bucket text,
  -- 1 when the visitor ticked "I support a spouse or common-law partner" (TD1 spouse
  -- amount), 0 when not. Never the spouse's income. Added in production by ALTER on 2026-09-26.
  spouse_claim integer
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

-- The public research note's own record of what it said, one row a day,
-- written the first time the page renders each day and never updated after.
-- It is what makes a live page citable: the figure a journalist quoted on a
-- given day stays on the page for ever, even as the headline moves.
create table if not exists research_daily (
  day        text primary key,   -- Vancouver date, YYYY-MM-DD
  n          integer not null,   -- calculations behind that day's figures
  raise_up   integer not null,   -- % of visits that ended on a higher income
  before7    integer not null,   -- % of edited shifts starting before 7am
  move_share integer not null    -- % of visits pricing two or more provinces
);
