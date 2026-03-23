-- Create sessions table
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_sessions_date on sessions (session_date);
create index idx_sessions_court on sessions (court_id);

-- RLS
alter table sessions enable row level security;

create policy "Sessions are viewable by everyone"
  on sessions for select
  using (true);

create policy "Leader can insert sessions"
  on sessions for insert
  with check (true);

create policy "Leader can update sessions"
  on sessions for update
  using (true);

create policy "Leader can delete sessions"
  on sessions for delete
  using (true);
