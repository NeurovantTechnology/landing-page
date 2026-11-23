-- Keep the waitlist leaderboard limited to confirmed waitlist signups, and
-- make provisioning idempotent so a later Auth metadata update can repair a
-- previously missed member row.
create or replace function private.provision_verified_waitlist_member() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  display_name_value text;
  referral_code_value text;
  referrer_id uuid;
begin
  if new.email_confirmed_at is null
    or new.raw_user_meta_data ->> 'signup_context' is distinct from 'waitlist' then
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

drop trigger if exists on_waitlist_email_verified on auth.users;
create trigger on_waitlist_email_verified
  after insert or update of email_confirmed_at, raw_user_meta_data on auth.users
  for each row execute function private.provision_verified_waitlist_member();

-- A newly installed verification trigger does not run for users who verified
-- before provisioning was active. Populate those confirmed waitlist signups.
insert into public.waitlist_members(user_id, display_name, referral_code, referred_by_user_id, verified_at)
select u.id,
  coalesce(nullif(left(trim(coalesce(u.raw_user_meta_data ->> 'display_name', '')), 40), ''), 'Neurovant member'),
  substr(md5(gen_random_uuid()::text), 1, 16),
  referrer.user_id,
  u.email_confirmed_at
from auth.users u
left join lateral (
  select m.user_id
  from public.waitlist_members m
  where m.referral_code = lower(coalesce(u.raw_user_meta_data ->> 'referral_code', ''))
    and m.user_id <> u.id
  limit 1
) referrer on true
where u.email_confirmed_at is not null
  and u.raw_user_meta_data ->> 'signup_context' = 'waitlist'
  and not exists (
    select 1
    from public.waitlist_members m
    where m.user_id = u.id
  )
on conflict (user_id) do nothing;
