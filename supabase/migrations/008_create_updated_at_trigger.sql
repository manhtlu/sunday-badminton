-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables
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
