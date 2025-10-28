# Supabase Setup Guide for Fake Job Application

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: `job-applications` (or whatever you want)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes ~2 minutes to set up)

## Step 2: Create Database Table

1. Once your project is ready, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste this SQL code:

```sql
-- Create the job applications table
create table job_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  resume_link text,
  website text,
  ever_get_scared text not null,
  what_scares_you text,
  how_know_love text not null,
  someone_you_love text not null,
  forgiving_person text not null,
  is_god_real text not null,
  how_do_you_know text,
  laugh_easily text not null,
  feel_better text not null,
  interesting_people text not null,
  dream_size text not null,
  describe_dream text,
  dont_understand text not null,
  do_understand text not null,
  anything_else text
);

-- Enable Row Level Security
alter table job_applications enable row level security;

-- Create a policy that allows anyone to insert (for form submissions)
create policy "Anyone can submit applications"
  on job_applications for insert
  with check (true);

-- Create a policy that only allows authenticated users to read (for you)
create policy "Only authenticated users can view applications"
  on job_applications for select
  using (auth.role() = 'authenticated');
```

4. Click **"Run"** (bottom right)
5. You should see "Success. No rows returned"

## Step 3: Get Your Supabase Credentials

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"**
3. You'll see two important values:

   **Copy these and save them:**
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string - this is safe to use in your website)

## Step 4: Set Up Email Notifications (Optional but Recommended)

### Option A: Supabase Database Webhooks (Easiest)

1. In Supabase, go to **"Database"** → **"Webhooks"**
2. Click **"Create a new hook"**
3. Configure:
   - **Name**: `new-job-application`
   - **Table**: `job_applications`
   - **Events**: Check `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: We'll use EmailJS webhook URL (I'll provide this)

### Option B: Use Supabase Edge Functions (More advanced)

You can create a function that sends you an email whenever someone applies.

## Step 5: Update Your Website Code

I'll update `fakejob.html` to use these credentials. Just provide me with:
- Your **Project URL**
- Your **anon public key**

## What You'll Be Able To Do

1. **View all applications** in Supabase dashboard:
   - Go to Supabase → "Table Editor" → "job_applications"
   - See all submissions in a nice table
   - Search, filter, export to CSV

2. **Get email notifications** when someone applies

3. **Query your data** however you want with SQL

4. **Keep EmailJS** for sending auto-responses to applicants

## Free Tier Limits

- 50,000 database rows (plenty for job applications!)
- 1 GB database space
- 2 GB bandwidth
- Unlimited API requests

You'll never hit these limits with a job application form!
