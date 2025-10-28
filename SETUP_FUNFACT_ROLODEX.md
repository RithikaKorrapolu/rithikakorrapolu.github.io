# Fun Fact Rolodex - Supabase Setup Guide

## Quick Setup

You need to create a new table in your existing Supabase project to store the fun facts.

## Step 1: Create the Database Table

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste this SQL code:

```sql
-- Create the fun_facts table
create table fun_facts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  person_name text not null,
  fun_fact text not null,
  submitted_by text default 'Anonymous'
);

-- Enable Row Level Security
alter table fun_facts enable row level security;

-- Create a policy that allows anyone to insert (for submissions)
create policy "Anyone can submit fun facts"
  on fun_facts for insert
  with check (true);

-- Create a policy that allows anyone to read fun facts (public rolodex)
create policy "Anyone can view fun facts"
  on fun_facts for select
  using (true);
```

5. Click **"Run"** (bottom right)
6. You should see "Success. No rows returned"

## Step 2: (Optional) Add Some Sample Data

If you want to pre-populate with some fun facts:

```sql
insert into fun_facts (person_name, fun_fact, submitted_by) values
  ('Sample Person', 'This is a sample fun fact to get you started!', 'Rithika'),
  ('Another Example', 'Add your own fun facts about people you know!', 'Rithika');
```

## That's It!

The rolodex is now ready to use. You can:
- **Shuffle** - Randomly flip to a different fun fact
- **Search** - Find fun facts by person's name
- **Submit** - Add new fun facts to the rolodex

## Database Structure

The `fun_facts` table has these columns:
- `id` - Unique identifier (auto-generated)
- `created_at` - Timestamp when the fact was added
- `person_name` - Name of the person the fun fact is about
- `fun_fact` - The actual fun fact/idiosyncrasy
- `submitted_by` - Name of who submitted it (defaults to "Anonymous")

## Viewing Submissions

1. Go to Supabase → "Table Editor" → "fun_facts"
2. See all submissions in a nice table
3. Search, filter, export to CSV
4. Edit or delete entries if needed
