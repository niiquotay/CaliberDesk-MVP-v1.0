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
  "verificationDocuments" text[],
  "pendingAssessmentReminders" jsonb default '[]',
  "employmentVerificationStatus" text default 'none',
  "verificationCertificateUrl" text
);

-- Enable RLS
alter table users enable row level security;

-- Create policies (for now, allow all for the anon key if you haven't set up specific RLS)
-- In production, you should restrict this!
create policy "Allow all for anon" on users for all using (true) with check (true);
```

## 2. Create Jobs, Blog, and Applications Tables
Run the following SQL to set up the rest of the database:

```sql
-- Jobs Table
create table jobs (
  id uuid default uuid_generate_v4() primary key,
  "idNumber" text unique,
  title text not null,
  company text not null,
  city text,
  country text,
  location text, -- Hybrid, Remote, Onsite
  category text,
  "allowedCountries" text[],
  salary text,
  description text,
  responsibilities text,
  requirements text,
  tags text[],
  benefits text[],
  "postedAt" timestamp with time zone default now(),
  "expiryDate" timestamp with time zone,
  "isPremium" boolean default false,
  "isQuickHire" boolean default false,
  status text default 'active',
  "applicationType" text default 'in-app',
  industry text,
  "postedBy" uuid references users(id),
  "aptitudeTestId" text
);

-- Blog Posts Table
create table blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  author text not null,
  "authorRole" text,
  "publishedAt" timestamp with time zone default now(),
  "imageUrl" text,
  "videoUrl" text,
  tags text[],
  "readTime" text,
  "isDraft" boolean default false
);

-- Applications Table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  "jobId" uuid references jobs(id),
  "userId" uuid references users(id),
  status text default 'applied',
  "appliedDate" timestamp with time zone default now(),
  "matchScore" integer,
  "matchReason" text,
  "isAutoApplied" boolean default false,
  "statusHistory" jsonb default '[]',
  "reminderSent7d" boolean default false
);

-- Aptitude Tests Table
create table aptitude_tests (
  id uuid default uuid_generate_v4() primary key,
  "jobId" uuid references jobs(id),
  title text not null,
  questions jsonb not null, -- Array of questions
  "timeLimit" integer,
  "createdAt" timestamp with time zone default now(),
  difficulty text
);

-- Enable RLS for new tables
alter table jobs enable row level security;
alter table blog_posts enable row level security;
alter table applications enable row level security;
alter table aptitude_tests enable row level security;

-- Simple policies for MVP (Allow all for anon)
create policy "Allow all for anon" on jobs for all using (true) with check (true);
create policy "Allow all for anon" on blog_posts for all using (true) with check (true);
create policy "Allow all for anon" on applications for all using (true) with check (true);
create policy "Allow all for anon" on aptitude_tests for all using (true) with check (true);
```

## 3. Environment Variables
Ensure your `.env` file has the following (already added to `.env.example`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
