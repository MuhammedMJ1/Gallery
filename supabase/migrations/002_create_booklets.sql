-- Booklets table
create table if not exists public.booklets (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled Booklet',
  pdf_url text not null,
  cover_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.booklets enable row level security;

-- Allow public read access for gallery display
create policy "Allow public read booklets" on public.booklets
  for select using (true);

-- Only service role can insert/update/delete (via admin API)

-- Storage bucket for PDFs
insert into storage.buckets (id, name, public) 
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;

-- Storage policies for the 'pdfs' bucket
create policy "Allow public read pdfs" on storage.objects
  for select using (bucket_id = 'pdfs');

create policy "Allow authenticated uploads pdfs" on storage.objects
  for insert with check (bucket_id = 'pdfs' and auth.role() = 'authenticated');
  
create policy "Allow service role all pdfs" on storage.objects
  for all using (bucket_id = 'pdfs');
