-- SQL schema for CSGIRLIES companion profiles
-- Run this in your Supabase SQL Editor to create the necessary table

-- Create companion_profiles table
CREATE TABLE IF NOT EXISTS companion_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  animal_name TEXT NOT NULL,
  animal_color TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'baby',
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  parent_email TEXT,
  study_goal_minutes INTEGER DEFAULT 0,
  total_study_time INTEGER NOT NULL DEFAULT 0,
  completed_learning_cycles INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE companion_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON companion_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON companion_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON companion_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS companion_profiles_user_id_idx ON companion_profiles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_companion_profiles_updated_at
  BEFORE UPDATE ON companion_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MOCK DATA FOR TESTING
-- ============================================
-- IMPORTANT: First create a test user in Supabase Auth with these credentials:
-- Email: demo@csgirlies.com
-- Password: DemoPass123!
-- 
-- Then get the user_id from Supabase Auth dashboard and replace 'YOUR-USER-ID-HERE' below
-- with the actual UUID.
--
-- To insert mock data, uncomment and run the following INSERT statement:

/*
INSERT INTO companion_profiles (
  user_id,
  name,
  animal_type,
  animal_name,
  animal_color,
  xp,
  level,
  current_streak,
  max_streak,
  last_study_date,
  study_goal_minutes,
  total_study_time,
  completed_learning_cycles
) VALUES (
  'YOUR-USER-ID-HERE'::uuid,  -- Replace with actual user_id from Supabase Auth
  'Demo Student',
  'af',  -- Fox
  'Nova',
  '#a855ff',  -- Purple
  150,  -- 150 XP (enough to show progress)
  'adolescent',  -- Evolved to adolescent level
  5,  -- 5 day current streak
  7,  -- Max streak was 7 days
  CURRENT_DATE,  -- Last studied today
  30,  -- 30 minutes daily goal
  125,  -- 125 minutes total study time (5 sessions of 25 min)
  12  -- 12 completed Pomodoro cycles
);
*/

-- Example queries to verify the mock data:
-- SELECT * FROM companion_profiles WHERE name = 'Demo Student';
-- SELECT user_id, name, xp, level, completed_learning_cycles FROM companion_profiles;
