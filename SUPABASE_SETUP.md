# Supabase Setup Instructions

To use Supabase with CaliberDesk, you need to create a `users` table in your Supabase project.

## 1. Create Users Table
Run the following SQL in the Supabase SQL Editor:

```sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text,
  name text,
  "firstName" text,
  "middleName" text,
  "lastName" text,
  "phoneNumbers" text[],
  "isEmployer" boolean default false,
  "isVerified" boolean default false,
  "joinedDate" timestamp with time zone default now(),
  "companyName" text,
  "isSuperUser" boolean default false,
  "idNumber" text unique,
  role text,
  city text,
  country text,
  skills text[],
  "digitalSkills" text[],
  certifications text[],
  hobbies text[],
  projects jsonb,
  "experienceSummary" text,
  "profileCompleted" boolean default false,
  "linkedInConnected" boolean default false,
  "isSubscribed" boolean default false,
  "subscriptionTier" text default 'free',
  "purchaseHistory" jsonb default '[]',
  "adOptIn" boolean default true,
  alerts jsonb default '[]',
  "savedJobIds" text[] default '{}',
  "autoApplyEnabled" boolean default false,
  "profileImages" text[] default '{}',
  "workHistory" jsonb default '[]',
  education jsonb default '[]',
  "stealthMode" boolean default false,
  notifications jsonb default '[]',
  "subUsers" jsonb default '[]',
  "isAdmin" boolean default false,
  "opRole" text,
  "isDeactivated" boolean default false,
  "deactivationDate" timestamp with time zone,
  "verificationEmail" text,
  "verificationMethod" text,
  "verificationDocuments" text[]
);

-- Enable RLS
alter table users enable row level security;

-- Create policies (for now, allow all for the anon key if you haven't set up specific RLS)
-- In production, you should restrict this!
create policy "Allow all for anon" on users for all using (true) with check (true);
```

## 2. Environment Variables
Ensure your `.env` file has the following (already added to `.env.example`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
