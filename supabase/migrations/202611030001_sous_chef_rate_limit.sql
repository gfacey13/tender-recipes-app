-- Apply before deploying the authenticated Sous Chef endpoint.
create table if not exists public.sous_chef_request_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.sous_chef_request_limits enable row level security;
revoke all on public.sous_chef_request_limits from anon, authenticated;

create or replace function public.consume_sous_chef_request()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_window timestamptz := pg_catalog.date_trunc('minute', pg_catalog.now());
begin
  if caller is null then
    return false;
  end if;

  insert into public.sous_chef_request_limits as limits
    (user_id, window_start, request_count)
  values (caller, current_window, 1)
  on conflict (user_id) do update
  set window_start = excluded.window_start,
      request_count = case when limits.window_start < excluded.window_start
        then 1 else limits.request_count + 1 end
  where limits.window_start < excluded.window_start
     or (limits.window_start = excluded.window_start and limits.request_count < 5);

  return found;
end;
$$;

revoke all on function public.consume_sous_chef_request() from public, anon;
grant execute on function public.consume_sous_chef_request() to authenticated;
