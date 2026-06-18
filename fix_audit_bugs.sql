-- ══════════════════════════════════════════════
-- FIX: Deep Audit Fixes (Triggers, Constraints, Missing Songs)
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Add Unique Constraint to reviews table to prevent duplicates
ALTER TABLE reviews ADD UNIQUE (user_id, song_id);

-- 2. Recreate update_song_stats with SECURITY DEFINER and COALESCE logic
CREATE OR REPLACE FUNCTION update_song_stats()
RETURNS TRIGGER
SECURITY DEFINER -- Bypass RLS so it always updates songs
AS $$
DECLARE
  target_song_id UUID;
BEGIN
  target_song_id := COALESCE(NEW.song_id, OLD.song_id);

  UPDATE songs SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(score)::numeric, 2)
      FROM ratings WHERE song_id = target_song_id
    ), 0),
    total_ratings = (
      SELECT COUNT(*) FROM ratings WHERE song_id = target_song_id
    )
  WHERE id = target_song_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate the rating trigger for INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS trigger_update_song_stats ON ratings;
CREATE TRIGGER trigger_update_song_stats
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_song_stats();


-- 4. Recreate update_review_count with SECURITY DEFINER and COALESCE logic
CREATE OR REPLACE FUNCTION update_review_count()
RETURNS TRIGGER
SECURITY DEFINER -- Bypass RLS so it always updates songs
AS $$
DECLARE
  target_song_id UUID;
BEGIN
  target_song_id := COALESCE(NEW.song_id, OLD.song_id);

  UPDATE songs SET
    total_reviews = (
      SELECT COUNT(*) FROM reviews WHERE song_id = target_song_id
    )
  WHERE id = target_song_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Recreate the review trigger for INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS trigger_update_review_count ON reviews;
CREATE TRIGGER trigger_update_review_count
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_review_count();


-- 6. Recalculate ALL existing song stats from actual rating/review data just in case
UPDATE songs SET
  avg_rating = COALESCE((SELECT ROUND(AVG(score)::numeric, 2) FROM ratings WHERE ratings.song_id = songs.id), 0),
  total_ratings = (SELECT COUNT(*) FROM ratings WHERE ratings.song_id = songs.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviews.song_id = songs.id);


-- 7. Auto-Migrate previously "Approved" suggestions that are missing from the songs table
-- We use gen_random_uuid() for the new song ID, and update the suggestion to link to it.
DO $$
DECLARE
  sug RECORD;
  new_song_id UUID;
BEGIN
  FOR sug IN SELECT * FROM song_suggestions WHERE status = 'Approved' AND target_song_id IS NULL LOOP
    new_song_id := gen_random_uuid();
    
    INSERT INTO songs (id, title, year, composer, singer, lyricist, language, film, total_ratings, avg_rating)
    VALUES (new_song_id, sug.song_name, sug.year, sug.director, sug.singer, sug.lyricist, 'Tamil', 'Indie', 0, 0);
    
    UPDATE song_suggestions SET target_song_id = new_song_id WHERE id = sug.id;
  END LOOP;
END;
$$;
