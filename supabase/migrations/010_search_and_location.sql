-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 010: Search and Location
-- ═══════════════════════════════════════════════════════════════

-- 1. Add District and Neighborhood text columns
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS district_name text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS neighborhood_name text;

-- 2. Update Full-Text Search (fts)
-- We drop the existing column to recreate it with the new fields
ALTER TABLE public.photos DROP COLUMN IF EXISTS fts;

ALTER TABLE public.photos ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title_ar,'') || ' ' ||
      coalesce(title_en,'') || ' ' ||
      coalesce(description_ar,'') || ' ' ||
      coalesce(description_en,'') || ' ' ||
      coalesce(photographer,'') || ' ' ||
      coalesce(source,'') || ' ' ||
      coalesce(year::text,'') || ' ' ||
      coalesce(district_name,'') || ' ' ||
      coalesce(neighborhood_name,'') || ' ' ||
      coalesce(additional_details_ar,'') || ' ' ||
      coalesce(additional_details_en,'')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_photos_fts ON public.photos USING GIN(fts);

-- 3. Create a Custom Search RPC for Tags and Text
-- This function allows searching both by the full-text search vector and by any associated tag names.
CREATE OR REPLACE FUNCTION search_photos_with_tags(search_term text)
RETURNS SETOF public.photos AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.* 
  FROM public.photos p
  LEFT JOIN public.photo_tags pt ON pt.photo_id = p.id
  LEFT JOIN public.tags t ON t.id = pt.tag_id
  WHERE (
    p.fts @@ websearch_to_tsquery('simple', search_term)
    OR t.name_ar ILIKE '%' || search_term || '%'
    OR t.name_en ILIKE '%' || search_term || '%'
  );
END;
$$ LANGUAGE plpgsql STABLE;
