-- Gallery projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  layout text not null default 'grid' check (layout in ('grid', 'masonry', 'carousel')),
  animation text not null default 'fade' check (animation in ('fade', 'slide', 'scale', 'none')),
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS (we use service role for admin, anon can read)
alter table public.projects enable row level security;

-- Allow public read access for gallery display
create policy "Allow public read" on public.projects
  for select using (true);

-- Only service role can insert/update/delete (via admin API)
