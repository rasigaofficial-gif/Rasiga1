-- ══════════════════════════════════════════════
-- MIGRATION: Add missing tables and columns
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- TABLE: follows
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Add missing columns to song_suggestions table if it already exists
ALTER TABLE IF EXISTS song_suggestions ADD COLUMN IF NOT EXISTS target_song_id UUID REFERENCES songs(id) ON DELETE CASCADE;

-- TABLE: song_suggestions
CREATE TABLE IF NOT EXISTS song_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    song_name TEXT NOT NULL,
    year INTEGER,
    director TEXT,
    singer TEXT,
    lyricist TEXT,
    status TEXT DEFAULT 'Pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE song_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own suggestions" ON song_suggestions FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can insert suggestions" ON song_suggestions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pending suggestions" ON song_suggestions FOR DELETE 
  USING (auth.uid() = user_id AND status = 'Pending');
CREATE POLICY "Admins can update suggestions" ON song_suggestions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- TABLE: user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System can insert badges" ON user_badges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add poop support to review_likes
ALTER TABLE review_likes ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like';

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_user ON song_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON song_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
