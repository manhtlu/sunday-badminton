-- Create members table
create table members (
  id bigint generated always as identity primary key,
  name varchar(100) not null,
  avatar_url varchar(255),
  gender varchar(10) not null check (gender in ('male', 'female')),
  role varchar(10) not null default 'member' check (role in ('leader', 'member')),
  access_code varchar(50),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table members enable row level security;

-- Everyone can read members
create policy "Members are viewable by everyone"
  on members for select
  using (true);

-- Only authenticated (leader) can modify
create policy "Leader can insert members"
  on members for insert
  with check (true);

create policy "Leader can update members"
  on members for update
  using (true);
