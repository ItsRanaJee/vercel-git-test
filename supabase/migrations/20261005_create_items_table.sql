create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "Allow public access"
on public.items
for all
using (true)
with check (true);
