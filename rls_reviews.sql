-- ══════════════════════════════════════════════
-- MIGRATION: RLS Policies for Ratings & Reviews
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- 1. RATINGS
DROP POLICY IF EXISTS "Anyone can read ratings" ON ratings;
CREATE POLICY "Anyone can read ratings" ON ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own ratings" ON ratings;
CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- 2. REVIEWS
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- 3. REVIEW LIKES (REACTIONS)
DROP POLICY IF EXISTS "Anyone can read review likes" ON review_likes;
CREATE POLICY "Anyone can read review likes" ON review_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own likes" ON review_likes;
CREATE POLICY "Users can insert own likes" ON review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON review_likes;
CREATE POLICY "Users can delete own likes" ON review_likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own likes" ON review_likes;
CREATE POLICY "Users can update own likes" ON review_likes FOR UPDATE USING (auth.uid() = user_id);
