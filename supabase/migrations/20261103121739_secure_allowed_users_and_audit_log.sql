-- Phase 1: allow-list access and database-generated case history.
-- Existing MIS owners are allow-listed so this migration preserves current access.

begin;

create table if not exists public.allowed_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  added_at timestamptz not null default now()
);

insert into public.allowed_users (user_id, display_name)
select distinct s.owner_id,
       coalesce(
         nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
         nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
         'MIS analyst'
       )
from public.mis_state s
left join auth.users u on u.id = s.owner_id
where s.owner_id is not null
on conflict (user_id) do nothing;

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  owner_id uuid not null,
  case_id bigint not null,
  field text not null,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz not null default now(),
  source text not null default 'ui'
    check (source in ('ui', 'import', 'bulk'))
);

create index if not exists audit_log_owner_case_changed_idx
  on public.audit_log (owner_id, case_id, changed_at desc);

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

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'mis_state'
  loop
    execute format('drop policy %I on public.mis_state', p.policyname);
  end loop;
end
$$;

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

create or replace function public.capture_mis_state_audit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_pair record;
  v_field text;
  v_case_id bigint;
  v_old_value jsonb;
  v_new_value jsonb;
  v_source text := 'ui';
  v_headers jsonb;
  v_old_data jsonb := '{}'::jsonb;
begin
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
    v_source := lower(split_part(coalesce(v_headers ->> 'x-client-info', 'pratham-mis;source=ui'), 'source=', 2));
  exception when others then
    v_source := 'ui';
  end;
  if v_source not in ('ui', 'import', 'bulk') then
    v_source := 'ui';
  end if;

  if tg_op = 'UPDATE' then
    v_old_data := coalesce(old.data, '{}'::jsonb);
  end if;

  for v_pair in
    select coalesce(n.value ->> 'id', o.value ->> 'id') as case_id,
           o.value as old_case,
           n.value as new_case
    from jsonb_array_elements(coalesce(v_old_data -> 'co', '[]'::jsonb)) as o(value)
    full join jsonb_array_elements(coalesce(new.data -> 'co', '[]'::jsonb)) as n(value)
      on o.value ->> 'id' = n.value ->> 'id'
  loop
    begin
      v_case_id := v_pair.case_id::bigint;
    exception when others then
      continue;
    end;

    for v_field in
      select distinct key
      from jsonb_object_keys(
        coalesce(v_pair.old_case, '{}'::jsonb) ||
        coalesce(v_pair.new_case, '{}'::jsonb)
      ) as keys(key)
    loop
      v_old_value := v_pair.old_case -> v_field;
      v_new_value := v_pair.new_case -> v_field;
      if v_old_value is distinct from v_new_value then
        insert into public.audit_log
          (user_id, owner_id, case_id, field, old_value, new_value, source)
        values
          (auth.uid(), new.owner_id, v_case_id, v_field,
           v_old_value, v_new_value, v_source);
      end if;
    end loop;
  end loop;

  return new;
end;
$$;

revoke all on function public.capture_mis_state_audit() from public, anon, authenticated;
drop trigger if exists mis_state_audit_changes on public.mis_state;
create trigger mis_state_audit_changes
  after insert or update of data on public.mis_state
  for each row execute function public.capture_mis_state_audit();

create or replace function public.mis_list_analysts()
returns table(user_id uuid, display_name text)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.allowed_users self where self.user_id = auth.uid()
  ) then
    raise exception 'This account is not enabled for the MIS.';
  end if;

  return query
  select au.user_id,
         coalesce(
           nullif(btrim(au.display_name), ''),
           nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
           nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
           'MIS analyst'
         )
  from public.allowed_users au
  join auth.users u on u.id = au.user_id
  where au.user_id <> auth.uid()
  order by 2;
end;
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
  if v_sender is null or not exists (
    select 1 from public.allowed_users au where au.user_id = v_sender
  ) then
    raise exception 'This account is not enabled for the MIS.';
  end if;
  if p_recipient is null or p_recipient = v_sender or not exists (
    select 1 from public.allowed_users au where au.user_id = p_recipient
  ) then
    raise exception 'Choose another enabled MIS analyst.';
  end if;

  select coalesce(
    nullif(btrim(au.display_name), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    'MIS analyst'
  )
  into v_label
  from public.allowed_users au
  join auth.users u on u.id = au.user_id
  where au.user_id = p_recipient;

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

  select * into v_source from public.mis_state where owner_id = v_sender;
  select * into v_target from public.mis_state where owner_id = p_recipient;

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
    'co', coalesce(v_target.data -> 'co', '[]'::jsonb) || jsonb_build_array(v_case)
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

commit;
