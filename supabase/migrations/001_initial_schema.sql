-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 001: Initial Schema
-- Run this in the Supabase Dashboard SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── TAXONOMY TABLES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS governorates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name_ar    text NOT NULL,
  name_en    text NOT NULL,
  lat        numeric(10,6),
  lng        numeric(10,6),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS districts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_id uuid REFERENCES governorates(id) ON DELETE CASCADE,
  name_ar        text NOT NULL,
  name_en        text,
  lat            numeric(10,6),
  lng            numeric(10,6),
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name_ar    text NOT NULL,
  name_en    text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS heritage_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name_ar     text NOT NULL,
  name_en     text NOT NULL,
  desc_ar     text,
  desc_en     text,
  color       text,
  icon        text,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ─── PLACES TABLE (enriched with SerpAPI) ───────────────────────

CREATE TABLE IF NOT EXISTS places (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_id      uuid REFERENCES governorates(id),
  district_id         uuid REFERENCES districts(id),
  name_ar             text NOT NULL,
  name_en             text,
  description_ar      text,
  description_en      text,
  lat                 numeric(10,6),
  lng                 numeric(10,6),
  place_type          text,
  serpapi_place_id    text,
  google_maps_url     text,
  google_rating       numeric(3,2),
  google_photo_url    text,
  serpapi_data        jsonb,
  serpapi_fetched_at  timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_places_governorate ON places(governorate_id);
CREATE INDEX IF NOT EXISTS idx_places_latng ON places(lat, lng);

-- ─── PHOTOS TABLE ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS photos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar            text NOT NULL,
  title_en            text,
  description_ar      text,
  description_en      text,
  photographer        text,
  source              text,
  year                int,
  date_taken          date,
  governorate_id      uuid REFERENCES governorates(id),
  district_id         uuid REFERENCES districts(id),
  place_id            uuid REFERENCES places(id),
  lat                 numeric(10,6),
  lng                 numeric(10,6),
  category_id         uuid REFERENCES heritage_categories(id),
  storage_path        text,
  storage_thumb_path  text,
  file_size_kb        int,
  width_px            int,
  height_px           int,
  aspect              text CHECK (aspect IN ('portrait','landscape','square')),
  status              text DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  featured            boolean DEFAULT false,
  created_by          uuid REFERENCES auth.users(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_category   ON photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_governorate ON photos(governorate_id);
CREATE INDEX IF NOT EXISTS idx_photos_year       ON photos(year);
CREATE INDEX IF NOT EXISTS idx_photos_status     ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_featured   ON photos(featured);

-- Full-text search vector (uses 'simple' config for Arabic+English compat)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title_ar,'') || ' ' ||
      coalesce(title_en,'') || ' ' ||
      coalesce(description_ar,'') || ' ' ||
      coalesce(photographer,'')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_photos_fts ON photos USING GIN(fts);

-- Photo ↔ Tag junction
CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id uuid REFERENCES photos(id) ON DELETE CASCADE,
  tag_id   uuid REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- ─── USER TABLES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text UNIQUE,
  display_name text,
  avatar_url   text,
  bio          text,
  role         text DEFAULT 'user' CHECK (role IN ('user','editor','admin')),
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id   uuid REFERENCES photos(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name text,
  body       text NOT NULL,
  status     text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_photo ON comments(photo_id, status);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id   uuid REFERENCES photos(id)    ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  slug        text UNIQUE,
  title_ar    text,
  title_en    text,
  is_public   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_photos (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  photo_id      uuid REFERENCES photos(id)       ON DELETE CASCADE,
  sort_order    int DEFAULT 0,
  PRIMARY KEY (collection_id, photo_id)
);

-- ─── TIMELINE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timeline_decades (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decade     int NOT NULL,
  label_ar   text NOT NULL,
  label_en   text,
  desc_ar    text,
  desc_en    text,
  sort_order int DEFAULT 0
);
