-- ══════════════════════════════════════════════
-- MIGRATION: Reset Dummy Ratings
-- Run this in Supabase SQL Editor if you want to start fresh!
-- ══════════════════════════════════════════════

-- Reset all song ratings to 0 (No ratings yet)
UPDATE songs SET avg_rating = 0, total_ratings = 0, total_reviews = 0;

-- Optionally, you can also delete all dummy reviews and ratings if there are any
-- DELETE FROM reviews;
-- DELETE FROM ratings;
