-- Enable RLS on all tables
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SONGS
-- ==========================================
CREATE POLICY "Anyone can read songs" 
  ON songs FOR SELECT 
  USING (true);

-- Note: The admin check here uses a JWT claim 'role' = 'admin'. 
-- You might need to adjust this depending on how you implement admin roles in Supabase.
CREATE POLICY "Admins can insert songs" 
  ON songs FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update songs" 
  ON songs FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete songs" 
  ON songs FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- ==========================================
-- USERS
-- ==========================================
CREATE POLICY "Anyone can read public user profiles" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- ==========================================
-- RATINGS
-- ==========================================
CREATE POLICY "Anyone can read ratings" 
  ON ratings FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own rating" 
  ON ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating" 
  ON ratings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating" 
  ON ratings FOR DELETE 
  USING (auth.uid() = user_id);

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE POLICY "Anyone can read reviews" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
  ON reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
  ON reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- ==========================================
-- DIARY_ENTRIES
-- ==========================================
CREATE POLICY "Users can read own diary entries" 
  ON diary_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" 
  ON diary_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" 
  ON diary_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- ==========================================
-- LISTS
-- ==========================================
CREATE POLICY "Anyone can read public lists and own private lists" 
  ON lists FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" 
  ON lists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" 
  ON lists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" 
  ON lists FOR DELETE 
  USING (auth.uid() = user_id);

-- ==========================================
-- LIST_SONGS (junction table)
-- ==========================================
-- Visibility derived from lists
CREATE POLICY "Anyone can read songs in public/own lists" 
  ON list_songs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE id = list_songs.list_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert songs to own lists" 
  ON list_songs FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM lists WHERE id = list_songs.list_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update songs in own lists" 
  ON list_songs FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM lists WHERE id = list_songs.list_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete songs from own lists" 
  ON list_songs FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM lists WHERE id = list_songs.list_id AND user_id = auth.uid())
  );

-- ==========================================
-- REVIEW_LIKES
-- ==========================================
CREATE POLICY "Anyone can read review likes" 
  ON review_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own review likes" 
  ON review_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own review likes" 
  ON review_likes FOR DELETE 
  USING (auth.uid() = user_id);
