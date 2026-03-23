-- Create member_monthly_stats table (cache)
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
  updated_at timestamptz not null default now()
);

-- Unique: one stat record per member per month
alter table member_monthly_stats
  add constraint uniq_stats unique (member_id, year_month);

-- RLS
alter table member_monthly_stats enable row level security;

create policy "Stats are viewable by everyone"
  on member_monthly_stats for select
  using (true);

create policy "Leader can insert stats"
  on member_monthly_stats for insert
  with check (true);

create policy "Leader can update stats"
  on member_monthly_stats for update
  using (true);
