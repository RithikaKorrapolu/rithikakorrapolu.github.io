# Quick Start: Supabase Setup

## What You Need to Do

### 1. Create Supabase Account & Project (5 minutes)
- Go to https://supabase.com
- Sign up / Log in
- Create new project: `job-applications`
- Wait for it to finish setting up (~2 minutes)

### 2. Create Database Table (2 minutes)
- Go to **SQL Editor** in left sidebar
- Click **New Query**
- Copy and paste the SQL from `SETUP_SUPABASE_JOB_FORM.md` (Step 2)
- Click **Run**

### 3. Get Your Credentials (1 minute)
- Go to **Settings** → **API**
- Copy two values:
  1. **Project URL** (example: `https://abcdefg.supabase.co`)
  2. **anon public** key (long string)

### 4. Update fakejob.html
Give me these two values and I'll update the code for you!

Or update yourself:
- Line 734: Replace `YOUR_SUPABASE_PROJECT_URL` with your Project URL
- Line 735: Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

### 5. Test It!
- Push to GitHub
- Submit a test application
- Check Supabase → Table Editor → job_applications
- You should see your submission!

## How to View Submissions

1. Go to your Supabase project
2. Click **Table Editor** in left sidebar
3. Click **job_applications** table
4. See all submissions!

You can:
- Search
- Filter
- Export to CSV
- Delete entries
- View individual responses

## Set Up Email Notifications (Optional)

### Option 1: Simple - Use Supabase Dashboard
1. Go to **Database** → **Webhooks**
2. Create webhook for `job_applications` table on INSERT
3. Point to your EmailJS endpoint (I can help set this up)

### Option 2: Advanced - Database Triggers
Create a PostgreSQL trigger that emails you on new submissions.

## EmailJS Still Works!
Applicants will still receive the auto-response email through EmailJS - that part stays the same!

## What's Better Than Formspree?
✅ Can add file uploads later with Supabase Storage
✅ All data in one place (your dashboard)
✅ Query and analyze submissions
✅ Export to CSV anytime
✅ No monthly limits on submissions
✅ More control over your data
