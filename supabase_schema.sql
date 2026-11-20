-- ==========================================================
-- Urban Standz Legal Case Tracker - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (100% Free Cloud Database)
-- ==========================================================

-- 1. Create Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
  id TEXT PRIMARY KEY,
  serial_number INTEGER NOT NULL,
  court TEXT NOT NULL,
  cch TEXT,
  judge TEXT,
  cnr TEXT,
  registration_number TEXT NOT NULL,
  plaintiff_1 TEXT NOT NULL,
  plaintiff_2 TEXT,
  plaintiff_3 TEXT,
  defendant_1 TEXT NOT NULL,
  defendant_2 TEXT,
  defendant_3 TEXT,
  defendant_4 TEXT,
  advocate TEXT,
  status TEXT DEFAULT 'Pending',
  stage TEXT,
  filing_date DATE,
  next_hearing DATE,
  last_business TEXT,
  linked_case TEXT,
  category TEXT DEFAULT 'Tenant vs Landlord & Urban Standz',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create index for fast searching and sorting
CREATE INDEX IF NOT EXISTS idx_cases_next_hearing ON public.cases(next_hearing);
CREATE INDEX IF NOT EXISTS idx_cases_court ON public.cases(court);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_reg_no ON public.cases(registration_number);
CREATE INDEX IF NOT EXISTS idx_cases_cnr ON public.cases(cnr);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Anyone in public can read cases without login
CREATE POLICY "Public users can view cases" 
ON public.cases 
FOR SELECT 
USING (true);

-- 5. Policy: Allow insert/update/delete for authenticated users or public if configured
CREATE POLICY "Public with anon key can write" 
ON public.cases 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- If you want strictly authenticated users only to write, you can replace policy 5 with:
-- CREATE POLICY "Admins can update cases" 
-- ON public.cases 
-- FOR ALL 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);

-- ==========================================================
-- 6. Create Resources Table for News and External Media Links
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT DEFAULT 'News',
  category TEXT DEFAULT 'Media Report',
  description TEXT,
  published_date DATE,
  author_or_source TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index on created_at
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policies for Resources
CREATE POLICY "Public users can view resources" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Public with anon key can write resources" 
ON public.resources 
FOR ALL 
USING (true) 
WITH CHECK (true);

