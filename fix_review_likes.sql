-- ══════════════════════════════════════════════
-- FIX: Add reaction_type to review_likes table
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Add the reaction_type column if it doesn't exist
ALTER TABLE review_likes ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like';

-- Drop the old unique constraint if it exists (assuming it was just the primary key)
-- The primary key is already (user_id, review_id), so we don't strictly need to do anything else,
-- but the upsert uses { onConflict: 'user_id, review_id' } which works because of the primary key.
