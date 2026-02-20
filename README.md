# Gallery Website

A professional gallery website with a private admin dashboard. Built with Next.js, Tailwind CSS, ImageKit, Supabase, and Framer Motion.

## Features

- **Public Gallery** – Displays projects with grid, masonry, or carousel layouts
- **Framer Motion Animations** – Fade, slide, scale, or none per project
- **Admin Dashboard** – Add, edit, delete projects (password protected)
- **Image Upload** – Images stored on ImageKit.io
- **Supabase** – Project data (title, layout, animation, images)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin operations) |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint (e.g. `https://ik.imagekit.io/xxx`) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `ADMIN_PASSWORD` | Password for admin login |

### 3. Supabase database

Run the migration in Supabase SQL Editor:

```sql
-- From supabase/migrations/001_create_projects.sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  layout text not null default 'grid' check (layout in ('grid', 'masonry', 'carousel')),
  animation text not null default 'fade' check (animation in ('fade', 'slide', 'scale', 'none')),
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Allow public read" on public.projects
  for select using (true);
```

### 4. Run the app

```bash
npm run dev
```

- **Gallery:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

## Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS, Framer Motion
- **Storage:** ImageKit.io
- **Database:** Supabase
- **Auth:** Simple session-based admin password
