# Supabase Setup Guide

## Step 1 — Create Supabase Project
1. Go to supabase.com → New project
2. Name it `career-craft`
3. Set a strong database password
4. Choose region closest to you
5. Click "Create new project"

## Step 2 — Run this SQL in Supabase SQL Editor

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  created_at timestamp with time zone default now()
);

-- Applications table
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text not null,
  role text not null,
  status text default 'Applied',
  resume_latex text,
  jd_text text,
  notes text,
  interview_date date,
  applied_at timestamp with time zone default now()
);

-- Resume library table
create table resume_library (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  original_text text,
  latex_template text,
  created_at timestamp with time zone default now()
);

-- Community posts table
create table community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  author_name text,
  content text not null,
  category text default 'tip',
  likes integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table applications enable row level security;
alter table resume_library enable row level security;
alter table community_posts enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Applications policies
create policy "Users can view own applications" on applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications for update using (auth.uid() = user_id);
create policy "Users can delete own applications" on applications for delete using (auth.uid() = user_id);

-- Resume library policies
create policy "Users can manage own resumes" on resume_library for all using (auth.uid() = user_id);

-- Community posts policies (everyone can read, own user can write/delete)
create policy "Anyone can read posts" on community_posts for select using (true);
create policy "Users can insert posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on community_posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on community_posts for delete using (auth.uid() = user_id);

-- Admin can see everything (for your email)
create policy "Admin can view all applications" on applications for select using (
  auth.jwt() ->> 'email' = 'sgovindaraj3@wisc.edu'
);
create policy "Admin can view all profiles" on profiles for select using (
  auth.jwt() ->> 'email' = 'sgovindaraj3@wisc.edu'
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 3 — Get your Supabase credentials
1. Go to Settings → API
2. Copy "Project URL" → this is your VITE_SUPABASE_URL
3. Copy "anon public" key → this is your VITE_SUPABASE_ANON_KEY

## Step 4 — Add to Netlify Environment Variables
ANTHROPIC_API_KEY = your-anthropic-key
VITE_SUPABASE_URL = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
