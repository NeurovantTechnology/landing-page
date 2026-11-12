-- Keep the launch waitlist isolated from the NeuroPortal app account tables.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.waitlist_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  referral_code text not null unique check (referral_code ~ '^[a-f0-9]{16}$'),
  referred_by_user_id uuid references public.waitlist_members(user_id) on delete set null,
  verified_at timestamptz not null default now(),
  constraint waitlist_no_self_referral check (referred_by_user_id is null or referred_by_user_id <> user_id)
);
create index waitlist_members_referrer_idx on public.waitlist_members(referred_by_user_id)
  where referred_by_user_id is not null;

alter table public.waitlist_members enable row level security;
revoke all on public.waitlist_members from anon, authenticated;
grant select on public.waitlist_members to authenticated;
create policy waitlist_member_read_self on public.waitlist_members for select to authenticated
  using (user_id = (select auth.uid()));

create function private.provision_verified_waitlist_member() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  display_name_value text;
  referral_code_value text;
  referrer_id uuid;
begin
  if new.email_confirmed_at is null
    or (tg_op = 'UPDATE' and old.email_confirmed_at is not null) then
    return new;
  end if;

  display_name_value := left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40);
  if display_name_value = '' then
    display_name_value := 'Neurovant member';
  end if;

  select m.user_id into referrer_id
  from public.waitlist_members m
  where m.referral_code = lower(coalesce(new.raw_user_meta_data ->> 'referral_code', ''))
    and m.user_id <> new.id;

  referral_code_value := substr(md5(gen_random_uuid()::text), 1, 16);
  insert into public.waitlist_members(user_id, display_name, referral_code, referred_by_user_id, verified_at)
  values (new.id, display_name_value, referral_code_value, referrer_id, new.email_confirmed_at)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
revoke all on function private.provision_verified_waitlist_member() from public, anon, authenticated;
create trigger on_waitlist_email_verified
  after insert or update of email_confirmed_at on auth.users
  for each row execute function private.provision_verified_waitlist_member();

create function public.waitlist_leaderboard()
returns table(rank bigint, display_name text, referral_count bigint)
language sql stable security definer set search_path = '' as $$
  select row_number() over (order by count(invited.user_id) desc, m.verified_at asc) as rank,
    m.display_name, count(invited.user_id) as referral_count
  from public.waitlist_members m
  left join public.waitlist_members invited on invited.referred_by_user_id = m.user_id
  group by m.user_id, m.display_name, m.verified_at
  order by referral_count desc, m.verified_at asc
  limit 50;
$$;
revoke all on function public.waitlist_leaderboard() from public;
grant execute on function public.waitlist_leaderboard() to anon, authenticated;
