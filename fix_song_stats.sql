-- ══════════════════════════════════════════════
-- FIX: Ensure song stats triggers exist and recalculate
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Step 1: Recreate the update_song_stats function
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

-- Step 2: Recreate the trigger (drop first to avoid "already exists" error)
DROP TRIGGER IF EXISTS trigger_update_song_stats ON ratings;
CREATE TRIGGER trigger_update_song_stats
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_song_stats();

-- Step 3: Recreate review count function
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

DROP TRIGGER IF EXISTS trigger_update_review_count ON reviews;
CREATE TRIGGER trigger_update_review_count
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_review_count();

-- Step 4: Recalculate ALL existing song stats from actual rating/review data
UPDATE songs SET
  avg_rating = COALESCE((SELECT ROUND(AVG(score)::numeric, 2) FROM ratings WHERE ratings.song_id = songs.id), 0),
  total_ratings = (SELECT COUNT(*) FROM ratings WHERE ratings.song_id = songs.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviews.song_id = songs.id);
