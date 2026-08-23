-- Accounts and per-user data on D1 (phase B of the Supabase move).
-- User ids are kept from Supabase so purchases.user_id and excluded_users
-- keep meaning. Sessions are stateless JWTs; session_version lets a user
-- (or us) invalidate every issued token at once.

create table if not exists users (
  id text primary key,
  email text not null unique,
  name text, avatar_url text,
  provider text,                       -- first provider seen: email | google | apple
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login text,
  session_version integer not null default 1
);

-- One-time magic-link tokens. Only the SHA-256 of the token is stored.
create table if not exists auth_tokens (
  token_hash text primary key,
  email text not null,
  redirect text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at text not null,
  used_at text
);

create table if not exists calculation_history (
  id text primary key, user_id text not null, mode text, name text, province text,
  inputs text, results text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists idx_history_user on calculation_history(user_id, created_at);

create table if not exists user_settings (
  user_id text primary key,
  simple_inputs text, annual_inputs text, timesheet_inputs text, last_mode text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists timesheet_entries (
  id text primary key, user_id text not null, date text not null,
  check_in text, check_out text, unpaid_break_minutes integer, notes text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists idx_timesheet_user on timesheet_entries(user_id, date);
