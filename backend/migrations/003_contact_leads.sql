create table if not exists platform_contact_leads (
  id text primary key,
  name text not null,
  phone text not null,
  origin text not null,
  email text,
  reference text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_contact_leads_created_idx
  on platform_contact_leads (created_at desc);

create index if not exists platform_contact_leads_origin_idx
  on platform_contact_leads (origin, created_at desc);
