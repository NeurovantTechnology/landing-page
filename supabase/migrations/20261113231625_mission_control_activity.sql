create table public.mission_control_activity (
  workflow_key text primary key check (workflow_key in ('marketing', 'leads', 'meetings', 'support', 'projects', 'research', 'administration', 'website')),
  workflow_label text not null check (workflow_label in ('Marketing pipeline', 'Lead follow-up', 'Meeting follow-through', 'Customer support', 'Project operations', 'Research briefing', 'Administration review', 'Website upkeep')),
  status text not null default 'idle' check (status in ('idle', 'working', 'failed')),
  station text not null default 'Office Floor' check (station in ('Office Floor', 'Research Desk', 'Script Studio', 'Review Queue', 'Lead Desk', 'Meeting Room', 'Support Desk', 'Project Ops', 'Administration', 'Website Desk')),
  activity text not null default 'Waiting for work' check (activity in ('Waiting for work', 'Reviewing the content queue', 'Preparing channel drafts', 'Checking new inquiries', 'Preparing meeting follow-through', 'Sorting support requests', 'Reviewing project tasks', 'Preparing a source-backed briefing', 'Reviewing invoices and receipts', 'Checking pages and forms')),
  started_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.mission_control_activity enable row level security;

revoke all on table public.mission_control_activity from anon, authenticated;
grant select on table public.mission_control_activity to anon, authenticated;

create policy "Public can read generic Mission Control status"
  on public.mission_control_activity
  for select
  to anon, authenticated
  using (true);

insert into public.mission_control_activity (workflow_key, workflow_label)
values
  ('marketing', 'Marketing pipeline'),
  ('leads', 'Lead follow-up'),
  ('meetings', 'Meeting follow-through'),
  ('support', 'Customer support'),
  ('projects', 'Project operations'),
  ('research', 'Research briefing'),
  ('administration', 'Administration review'),
  ('website', 'Website upkeep');

alter publication supabase_realtime add table public.mission_control_activity;
