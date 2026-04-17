-- Sunday Badminton — schema for Neon (PostgreSQL)
-- Run this in Neon SQL Editor after creating a project, or: psql $DATABASE_URL -f database/neon-schema.sql
-- Migrated from supabase/migrations (tables + triggers; RLS omitted — access via Nuxt server API only)

create table members (
  id bigint generated always as identity primary key,
  name varchar(100) not null,
  avatar_url text,
  gender varchar(10) not null check (gender in ('male', 'female')),
  role varchar(10) not null default 'member' check (role in ('leader', 'member')),
  access_code varchar(50),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courts (
  id bigint generated always as identity primary key,
  name varchar(100) not null,
  address varchar(255) not null,
  directions text,
  latitude decimal(10, 7),
  longitude decimal(10, 7),
  is_active boolean not null default true,
  court_fee integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  id bigint generated always as identity primary key,
  court_id bigint not null references courts(id),
  session_date date not null,
  status varchar(10) not null default 'planned' check (status in ('planned', 'completed')),
  shuttlecock_quantity integer not null default 0,
  shuttlecock_price_per_unit integer not null default 0,
  court_fee integer not null default 0,
  misc_fee integer not null default 0,
  misc_fee_note varchar(255),
  male_split_fee integer not null default 0,
  female_split_fee integer not null default 0,
  total_fee integer not null default 0,
  attendee_count integer not null default 0,
  guest_note text,
  note text,
  name varchar(255) default 'Sinh hoạt nội bộ',
  start_time time default '19:30',
  end_time time default '21:30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_date on sessions (session_date);
create index idx_sessions_court on sessions (court_id);

create table session_attendances (
  id bigint generated always as identity primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  member_id bigint not null references members(id),
  is_present boolean not null default true,
  fee_amount integer not null default 0,
  guest_fee integer not null default 0,
  note varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_attendances unique (session_id, member_id)
);

create index idx_attendances_session on session_attendances (session_id);
create index idx_attendances_member on session_attendances (member_id);

create table session_guests (
  id bigint generated always as identity primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  member_id bigint references members(id),
  guest_name varchar(100) not null,
  fee_amount integer not null default 0,
  note varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_guests_session on session_guests (session_id);
create index idx_guests_member on session_guests (member_id);

create table monthly_extra_fees (
  id bigint generated always as identity primary key,
  year_month varchar(7) not null,
  member_id bigint references members(id),
  description varchar(255) not null,
  amount integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_extra_fees_month on monthly_extra_fees (year_month);

create table member_monthly_stats (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id),
  year_month varchar(7) not null,
  total_fee integer not null default 0,
  extra_fee integer not null default 0,
  grand_total integer not null default 0,
  sessions_attended integer not null default 0,
  cumulative_total integer not null default 0,
  is_paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_stats unique (member_id, year_month)
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_members_updated_at
  before update on members
  for each row execute function update_updated_at();

create trigger trg_courts_updated_at
  before update on courts
  for each row execute function update_updated_at();

create trigger trg_sessions_updated_at
  before update on sessions
  for each row execute function update_updated_at();

create trigger trg_session_attendances_updated_at
  before update on session_attendances
  for each row execute function update_updated_at();

create trigger trg_session_guests_updated_at
  before update on session_guests
  for each row execute function update_updated_at();

create trigger trg_monthly_extra_fees_updated_at
  before update on monthly_extra_fees
  for each row execute function update_updated_at();

create trigger trg_member_monthly_stats_updated_at
  before update on member_monthly_stats
  for each row execute function update_updated_at();
