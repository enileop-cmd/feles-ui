-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 003: Custom RPC Functions
-- ═══════════════════════════════════════════════════════════════

-- ─── get_photo_detail ───────────────────────────────────────────
-- Returns a single photo with all joined metadata in one round-trip
CREATE OR REPLACE FUNCTION get_photo_detail(p_id uuid)
RETURNS json AS $$
  SELECT json_build_object(
    'photo',          p,
    'governorate',    g,
    'district',       d,
    'category',       hc,
    'place',          pl,
    'tags',           (
      SELECT json_agg(json_build_object('id', t.id, 'slug', t.slug, 'name_ar', t.name_ar, 'name_en', t.name_en))
      FROM photo_tags pt
      JOIN tags t ON t.id = pt.tag_id
      WHERE pt.photo_id = p.id
    ),
    'comments',       (
      SELECT json_agg(
        json_build_object(
          'id', c.id, 'body', c.body, 'created_at', c.created_at,
          'user_id', c.user_id, 'guest_name', c.guest_name,
          'profile', (SELECT json_build_object('display_name', pr.display_name, 'avatar_url', pr.avatar_url)
                      FROM profiles pr WHERE pr.id = c.user_id)
        ) ORDER BY c.created_at DESC
      )
      FROM comments c
      WHERE c.photo_id = p.id AND c.status = 'approved'
    ),
    'comment_count',  (SELECT count(*) FROM comments WHERE photo_id = p.id AND status = 'approved'),
    'favorite_count', (SELECT count(*) FROM favorites WHERE photo_id = p.id)
  )
  FROM photos p
  LEFT JOIN governorates       g  ON g.id  = p.governorate_id
  LEFT JOIN districts          d  ON d.id  = p.district_id
  LEFT JOIN heritage_categories hc ON hc.id = p.category_id
  LEFT JOIN places             pl ON pl.id = p.place_id
  WHERE p.id = p_id AND p.status = 'published';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── get_map_markers ────────────────────────────────────────────
-- Returns all governorates with photo counts (for map markers)
CREATE OR REPLACE FUNCTION get_map_markers()
RETURNS TABLE(
  id           uuid,
  slug         text,
  name_ar      text,
  name_en      text,
  lat          numeric,
  lng          numeric,
  photo_count  bigint
) AS $$
  SELECT
    g.id, g.slug, g.name_ar, g.name_en, g.lat, g.lng,
    COUNT(p.id) AS photo_count
  FROM governorates g
  LEFT JOIN photos p ON p.governorate_id = g.id AND p.status = 'published'
  GROUP BY g.id
  ORDER BY g.name_ar;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── get_timeline_data ──────────────────────────────────────────
-- Returns all decades with their photos grouped (max 8 per decade)
CREATE OR REPLACE FUNCTION get_timeline_data()
RETURNS json AS $$
  SELECT json_agg(
    json_build_object(
      'decade',       td.decade,
      'label_ar',     td.label_ar,
      'label_en',     td.label_en,
      'desc_ar',      td.desc_ar,
      'desc_en',      td.desc_en,
      'photos',       (
        SELECT json_agg(
          json_build_object(
            'id',            p.id,
            'title_ar',      p.title_ar,
            'title_en',      p.title_en,
            'year',          p.year,
            'storage_path',  p.storage_path,
            'storage_thumb_path', p.storage_thumb_path,
            'aspect',        p.aspect,
            'governorate',   (SELECT row_to_json(g) FROM governorates g WHERE g.id = p.governorate_id)
          ) ORDER BY p.year
        )
        FROM (
          SELECT * FROM photos
          WHERE year >= td.decade AND year < td.decade + 10 AND status = 'published'
          ORDER BY year
          LIMIT 8
        ) p
      ),
      'photo_count',  (
        SELECT COUNT(*) FROM photos
        WHERE year >= td.decade AND year < td.decade + 10 AND status = 'published'
      )
    )
    ORDER BY td.decade
  )
  FROM timeline_decades td;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── get_archive_stats ──────────────────────────────────────────
-- Dashboard KPIs
CREATE OR REPLACE FUNCTION get_archive_stats()
RETURNS json AS $$
  SELECT json_build_object(
    'total_photos',      (SELECT count(*) FROM photos WHERE status = 'published'),
    'total_governorates',(SELECT count(DISTINCT governorate_id) FROM photos WHERE status = 'published'),
    'total_categories',  (SELECT count(*) FROM heritage_categories),
    'total_comments',    (SELECT count(*) FROM comments WHERE status = 'approved'),
    'pending_comments',  (SELECT count(*) FROM comments WHERE status = 'pending'),
    'featured_count',    (SELECT count(*) FROM photos WHERE featured = true AND status = 'published')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── toggle_favorite ────────────────────────────────────────────
-- Atomically toggle a favorite, returns new state
CREATE OR REPLACE FUNCTION toggle_favorite(p_photo_id uuid)
RETURNS json AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_exists  boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM favorites WHERE user_id = v_user_id AND photo_id = p_photo_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM favorites WHERE user_id = v_user_id AND photo_id = p_photo_id;
    RETURN json_build_object('favorited', false);
  ELSE
    INSERT INTO favorites (user_id, photo_id) VALUES (v_user_id, p_photo_id);
    RETURN json_build_object('favorited', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
