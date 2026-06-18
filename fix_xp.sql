-- ══════════════════════════════════════════════
-- FIX: Create missing increment_xp function
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_xp(amount INT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users 
  SET xp = COALESCE(xp, 0) + amount 
  WHERE id = auth.uid();
$$;
