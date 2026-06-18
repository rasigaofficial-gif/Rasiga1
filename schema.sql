-- Enable the uuid extension if not already enabled (though Supabase uses gen_random_uuid() natively now)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: songs
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_native TEXT,
    film TEXT,
    language TEXT NOT NULL,
    industry TEXT,
    year INTEGER,
    composer TEXT,
    singer TEXT,
    lyricist TEXT,
    raga TEXT,
    taal TEXT,
    genre TEXT[],
    mood TEXT[],
    is_film_song BOOLEAN DEFAULT true,
    spotify_id TEXT UNIQUE,
    artwork_url TEXT,
    avg_rating NUMERIC(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 2: users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    lang_prefs TEXT[],
    is_pro BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 3: ratings
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    score NUMERIC(2,1) CHECK (score >= 0.5 AND score <= 5.0),
    comp_score NUMERIC(2,1),
    vocal_score NUMERIC(2,1),
    lyric_score NUMERIC(2,1),
    arr_score NUMERIC(2,1),
    rated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, song_id)
);

-- TABLE 4: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    rating_id UUID REFERENCES ratings(id),
    body TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 5: diary_entries
CREATE TABLE diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    listened_on DATE NOT NULL,
    is_relisten BOOLEAN DEFAULT false,
    mood_context TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 6: lists
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 7: list_songs (junction table)
CREATE TABLE list_songs (
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER,
    added_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (list_id, song_id)
);

-- TABLE 8: review_likes
CREATE TABLE review_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like',
    PRIMARY KEY (user_id, review_id)
);

-- INDEXES
CREATE INDEX idx_songs_language ON songs(language);
CREATE INDEX idx_songs_year ON songs(year DESC);
CREATE INDEX idx_songs_avg_rating ON songs(avg_rating DESC);
CREATE INDEX idx_ratings_song ON ratings(song_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_reviews_song ON reviews(song_id);
CREATE INDEX idx_diary_user ON diary_entries(user_id, listened_on DESC);

-- FUNCTIONS AND TRIGGERS

-- Update song stats function and trigger
CREATE OR REPLACE FUNCTION update_song_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE songs SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(score)::numeric, 2)
      FROM ratings WHERE song_id = NEW.song_id
    ), 0),
    total_ratings = (
      SELECT COUNT(*) FROM ratings WHERE song_id = NEW.song_id
    )
  WHERE id = NEW.song_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_song_stats
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_song_stats();

-- Update review count function and trigger
CREATE OR REPLACE FUNCTION update_review_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE songs SET
    total_reviews = (
      SELECT COUNT(*) FROM reviews WHERE song_id = NEW.song_id
    )
  WHERE id = NEW.song_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_count
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_review_count();
