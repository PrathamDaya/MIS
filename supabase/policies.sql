-- RLS policy reference for the public tables used by the MIS.
-- Run the timestamped migration first; it creates allowed_users and audit_log.

alter table public.allowed_users enable row level security;
alter table public.audit_log enable row level security;
alter table public.mis_state enable row level security;

revoke all on public.allowed_users from public, anon, authenticated;
grant select on public.allowed_users to authenticated;
revoke all on public.audit_log from public, anon, authenticated;
grant select on public.audit_log to authenticated;
revoke all on public.mis_state from public, anon, authenticated;
grant select, insert, update on public.mis_state to authenticated;

drop policy if exists allowed_users_select_self on public.allowed_users;
create policy allowed_users_select_self
  on public.allowed_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists audit_log_select_owner on public.audit_log;
create policy audit_log_select_owner
  on public.audit_log for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.allowed_users au
      where au.user_id = (select auth.uid())
    )
  );

drop policy if exists mis_state_select_allowed_owner on public.mis_state;
drop policy if exists mis_state_insert_allowed_owner on public.mis_state;
drop policy if exists mis_state_update_allowed_owner on public.mis_state;
create policy mis_state_select_allowed_owner
  on public.mis_state for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.allowed_users au
      where au.user_id = (select auth.uid())
    )
  );
create policy mis_state_insert_allowed_owner
  on public.mis_state for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.allowed_users au
      where au.user_id = (select auth.uid())
    )
  );
create policy mis_state_update_allowed_owner
  on public.mis_state for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.allowed_users au
      where au.user_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.allowed_users au
      where au.user_id = (select auth.uid())
    )
  );
