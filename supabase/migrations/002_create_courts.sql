-- Create courts table
create table courts (
  id bigint generated always as identity primary key,
  name varchar(100) not null,
  address varchar(255) not null,
  directions text,
  latitude decimal(10, 7),
  longitude decimal(10, 7),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table courts enable row level security;

create policy "Courts are viewable by everyone"
  on courts for select
  using (true);

create policy "Leader can insert courts"
  on courts for insert
  with check (true);

create policy "Leader can update courts"
  on courts for update
  using (true);
