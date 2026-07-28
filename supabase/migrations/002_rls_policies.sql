-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 002: Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════

-- ─── HELPER: is_admin() function ────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_editor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','editor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── TAXONOMY (read-only for public) ────────────────────────────
ALTER TABLE governorates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE heritage_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places            ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_decades  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read governorates"       ON governorates FOR SELECT USING (true);
CREATE POLICY "Admins manage governorates"     ON governorates FOR ALL   USING (is_admin());

CREATE POLICY "Public read districts"          ON districts FOR SELECT USING (true);
CREATE POLICY "Admins manage districts"        ON districts FOR ALL   USING (is_admin());

CREATE POLICY "Public read tags"               ON tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags"             ON tags FOR ALL   USING (is_admin());

CREATE POLICY "Public read heritage_categories" ON heritage_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage heritage_categories" ON heritage_categories FOR ALL USING (is_admin());

CREATE POLICY "Public read places"             ON places FOR SELECT USING (true);
CREATE POLICY "Editors manage places"          ON places FOR ALL   USING (is_editor());

CREATE POLICY "Public read timeline_decades"   ON timeline_decades FOR SELECT USING (true);
CREATE POLICY "Admins manage timeline_decades" ON timeline_decades FOR ALL   USING (is_admin());

-- ─── PHOTOS ─────────────────────────────────────────────────────
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published photos"
  ON photos FOR SELECT USING (status = 'published');

CREATE POLICY "Editors manage all photos"
  ON photos FOR ALL USING (is_editor());

-- ─── PHOTO TAGS ─────────────────────────────────────────────────
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads photo_tags"
  ON photo_tags FOR SELECT USING (true);

CREATE POLICY "Editors manage photo_tags"
  ON photo_tags FOR ALL USING (is_editor());

-- ─── PROFILES ───────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins manage profiles"
  ON profiles FOR ALL USING (is_admin());

-- ─── COMMENTS ───────────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads approved comments"
  ON comments FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users insert comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users update own pending comments"
  ON comments FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Editors manage all comments"
  ON comments FOR ALL USING (is_editor());

-- ─── FAVORITES ──────────────────────────────────────────────────
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own favorites"
  ON favorites FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users manage own favorites"
  ON favorites FOR ALL USING (user_id = auth.uid());

-- ─── COLLECTIONS ────────────────────────────────────────────────
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads public collections"
  ON collections FOR SELECT USING (is_public = true);

CREATE POLICY "Owners read own collections"
  ON collections FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners manage own collections"
  ON collections FOR ALL USING (user_id = auth.uid());

ALTER TABLE collection_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read collection_photos if collection visible"
  ON collection_photos FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND (c.is_public = true OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Owners manage collection_photos"
  ON collection_photos FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
