-- MIS analyst ownership, case transfer, and account-deletion guard
-- Before running: replace the single placeholder below with the email used by
-- the owner of the existing shared MIS portfolio. Do not put this file or any
-- case data, passwords, or secret/service_role keys in GitHub.

alter table public.mis_state
  add column if not exists owner_id uuid;

do $$
declare
  v_owner_email text := 'REPLACE_WITH_YOUR_SUPABASE_LOGIN_EMAIL';
  v_owner_id uuid;
begin
  select u.id into v_owner_id
  from auth.users u
  where lower(u.email) = lower(v_owner_email)
  limit 1;

  if v_owner_id is null then
    raise exception 'No Supabase Auth user found for the owner email. Replace the SQL placeholder with the correct login email and run again.';
  end if;

  update public.mis_state
  set owner_id = v_owner_id
  where id = 'main' and owner_id is null;

  if exists (
    select 1 from public.mis_state where owner_id is null
  ) then
    raise exception 'MIS contains an unassigned state row. Stop and review the table before continuing.';
  end if;
end $$;

create unique index if not exists mis_state_owner_id_uidx
  on public.mis_state(owner_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mis_state_owner_id_fkey'
      and conrelid = 'public.mis_state'::regclass
  ) then
    alter table public.mis_state
      add constraint mis_state_owner_id_fkey
      foreign key (owner_id) references auth.users(id) on delete cascade;
  end if;
end $$;

alter table public.mis_state
  alter column owner_id set not null,
  enable row level security;

-- Remove earlier broad authenticated policies before enabling per-login access.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'mis_state'
  loop
    execute format('drop policy %I on public.mis_state', p.policyname);
  end loop;
end $$;

create policy mis_state_select_own
  on public.mis_state for select to authenticated
  using (owner_id = auth.uid());

create policy mis_state_insert_own
  on public.mis_state for insert to authenticated
  with check (owner_id = auth.uid());

create policy mis_state_update_own
  on public.mis_state for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

grant select, insert, update on public.mis_state to authenticated;

create or replace function public.mis_list_analysts()
returns table(user_id uuid, display_name text)
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select
    u.id,
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
      u.email,
      'MIS analyst'
    )
  from auth.users u
  where u.id <> auth.uid()
  order by 2;
$$;

revoke all on function public.mis_list_analysts() from public, anon;
grant execute on function public.mis_list_analysts() to authenticated;

create or replace function public.mis_transfer_case(
  p_case_id bigint,
  p_recipient uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_sender uuid := auth.uid();
  v_label text;
  v_source public.mis_state%rowtype;
  v_target public.mis_state%rowtype;
  v_case jsonb;
  v_source_cases jsonb;
  v_source_basket jsonb;
  v_target_data jsonb;
begin
  if v_sender is null then
    raise exception 'Sign in before transferring a case.';
  end if;
  if p_recipient is null or p_recipient = v_sender then
    raise exception 'Choose another MIS analyst.';
  end if;

  select coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    u.email,
    'MIS analyst'
  )
  into v_label
  from auth.users u
  where u.id = p_recipient;

  if v_label is null then
    raise exception 'The selected Supabase analyst account was not found.';
  end if;

  -- Ensure the destination state exists, then lock both owners in UUID order.
  insert into public.mis_state(id, owner_id, data, version)
  values (
    p_recipient::text,
    p_recipient,
    jsonb_build_object('co', '[]'::jsonb, 'bk', '[]'::jsonb),
    1
  )
  on conflict (owner_id) do nothing;

  perform s.owner_id
  from public.mis_state s
  where s.owner_id in (v_sender, p_recipient)
  order by s.owner_id
  for update;

  select * into v_source
  from public.mis_state
  where owner_id = v_sender;

  select * into v_target
  from public.mis_state
  where owner_id = p_recipient;

  if v_source.owner_id is null then
    raise exception 'Your MIS account has no saved cases.';
  end if;

  select e.value into v_case
  from jsonb_array_elements(coalesce(v_source.data -> 'co', '[]'::jsonb)) as e(value)
  where e.value ->> 'id' = p_case_id::text
  limit 1;

  if v_case is null then
    raise exception 'This case is no longer in your MIS. Refresh and try again.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(v_target.data -> 'co', '[]'::jsonb)) as e(value)
    where e.value ->> 'id' = p_case_id::text
  ) then
    raise exception 'The selected analyst already has a case with this ID. Contact MIS support before retrying.';
  end if;

  v_case := jsonb_set(v_case, '{an}', to_jsonb(v_label), true);
  v_case := jsonb_set(v_case, '{tr}', 'false'::jsonb, true);

  select coalesce(jsonb_agg(e.value order by e.ordinality), '[]'::jsonb)
  into v_source_cases
  from jsonb_array_elements(coalesce(v_source.data -> 'co', '[]'::jsonb))
       with ordinality as e(value, ordinality)
  where e.value ->> 'id' <> p_case_id::text;

  select coalesce(jsonb_agg(e.value order by e.ordinality), '[]'::jsonb)
  into v_source_basket
  from jsonb_array_elements(coalesce(v_source.data -> 'bk', '[]'::jsonb))
       with ordinality as e(value, ordinality)
  where coalesce(e.value ->> 'id', '') <> p_case_id::text;

  v_target_data := v_target.data || jsonb_build_object(
    'co',
    coalesce(v_target.data -> 'co', '[]'::jsonb) || jsonb_build_array(v_case)
  );

  update public.mis_state
  set data = v_source.data || jsonb_build_object('co', v_source_cases, 'bk', v_source_basket),
      version = v_source.version + 1,
      updated_at = now()
  where owner_id = v_sender;

  update public.mis_state
  set data = v_target_data,
      version = v_target.version + 1,
      updated_at = now()
  where owner_id = p_recipient;

  return jsonb_build_object('analyst', v_label);
end;
$$;

revoke all on function public.mis_transfer_case(bigint, uuid) from public, anon;
grant execute on function public.mis_transfer_case(bigint, uuid) to authenticated;

-- Keep Auth users linked to MIS rows with no cases deletable, but block deletion
-- while even one case remains. The FK then removes the empty MIS state row.
create or replace function public.mis_guard_user_delete()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if exists (
    select 1
    from public.mis_state s
    where s.owner_id = old.id
      and case
        when jsonb_typeof(s.data -> 'co') = 'array'
          then jsonb_array_length(s.data -> 'co') > 0
        else false
      end
  ) then
    raise exception using
      errcode = '23503',
      message = 'Transfer all MIS cases owned by this account before deleting the Supabase user.';
  end if;

  return old;
end;
$$;

revoke all on function public.mis_guard_user_delete() from public, anon, authenticated;

drop trigger if exists mis_guard_user_delete on auth.users;
create trigger mis_guard_user_delete
before delete on auth.users
for each row execute function public.mis_guard_user_delete();

notify pgrst, 'reload schema';
