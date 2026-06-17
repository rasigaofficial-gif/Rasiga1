-- ══════════════════════════════════════════════
-- MIGRATION: RLS Policies for Users Table
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. Allow anyone to read all user profiles (needed for Community Pulse and Profile views)
CREATE POLICY "Anyone can read user profiles" ON users FOR SELECT 
  USING (true);

-- 2. Allow authenticated users to create their own profile (Onboarding)
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to update their own profile (Editing profile)
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE 
  USING (auth.uid() = id);
