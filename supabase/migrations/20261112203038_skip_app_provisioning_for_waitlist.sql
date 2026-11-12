-- Waitlist-only Auth users share the project but must not get an app workspace.
create or replace function private.provision_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare new_workspace_id uuid;
begin
  if new.raw_user_meta_data ->> 'signup_context' = 'waitlist' then
    return new;
  end if;

  insert into public.profiles(user_id) values (new.id);
  insert into public.user_settings(user_id) values (new.id);
  insert into public.workspaces(owner_user_id, name, kind)
    values (new.id, 'My workspace', 'personal') returning id into new_workspace_id;
  insert into public.workspace_members(workspace_id, user_id, role)
    values (new_workspace_id, new.id, 'owner');
  return new;
end;
$$;
