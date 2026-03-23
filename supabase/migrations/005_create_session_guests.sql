-- Create session_guests table
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

-- Indexes
create index idx_guests_session on session_guests (session_id);
create index idx_guests_member on session_guests (member_id);

-- RLS
alter table session_guests enable row level security;

create policy "Guests are viewable by everyone"
  on session_guests for select
  using (true);

create policy "Leader can insert guests"
  on session_guests for insert
  with check (true);

create policy "Leader can update guests"
  on session_guests for update
  using (true);

create policy "Leader can delete guests"
  on session_guests for delete
  using (true);
