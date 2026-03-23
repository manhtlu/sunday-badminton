-- Create monthly_extra_fees table
create table monthly_extra_fees (
  id bigint generated always as identity primary key,
  year_month varchar(7) not null,
  member_id bigint references members(id),
  description varchar(255) not null,
  amount integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_extra_fees_month on monthly_extra_fees (year_month);

-- RLS
alter table monthly_extra_fees enable row level security;

create policy "Extra fees are viewable by everyone"
  on monthly_extra_fees for select
  using (true);

create policy "Leader can insert extra fees"
  on monthly_extra_fees for insert
  with check (true);

create policy "Leader can update extra fees"
  on monthly_extra_fees for update
  using (true);

create policy "Leader can delete extra fees"
  on monthly_extra_fees for delete
  using (true);
