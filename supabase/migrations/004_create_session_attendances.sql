-- Create session_attendances table
create table session_attendances (
  id bigint generated always as identity primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  member_id bigint not null references members(id),
  is_present boolean not null default true,
  fee_amount integer not null default 0,
  guest_fee integer not null default 0,
  note varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique: one member per session
alter table session_attendances
  add constraint uniq_attendances unique (session_id, member_id);

-- Indexes
create index idx_attendances_session on session_attendances (session_id);
create index idx_attendances_member on session_attendances (member_id);

-- RLS
alter table session_attendances enable row level security;

create policy "Attendances are viewable by everyone"
  on session_attendances for select
  using (true);

create policy "Leader can insert attendances"
  on session_attendances for insert
  with check (true);

create policy "Leader can update attendances"
  on session_attendances for update
  using (true);

create policy "Leader can delete attendances"
  on session_attendances for delete
  using (true);
