-- ══════════════════════════════════════════════
-- FIX: Update songs RLS policies to use is_admin from users table
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Drop old policies that use JWT role claim (which doesn't exist)
DROP POLICY IF EXISTS "Admins can insert songs" ON songs;
DROP POLICY IF EXISTS "Admins can update songs" ON songs;
DROP POLICY IF EXISTS "Admins can delete songs" ON songs;

-- Recreate with proper is_admin check from users table
CREATE POLICY "Admins can insert songs"
  ON songs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update songs"
  ON songs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete songs"
  ON songs FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
