-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 011: Improve Search Ranking
-- ═══════════════════════════════════════════════════════════════

-- 1. Recreate FTS column using the 'arabic' text search configuration
-- We use setweight to prioritize Title (A), Location (B), Description (C), and other fields (D).
ALTER TABLE public.photos DROP COLUMN IF EXISTS fts;

ALTER TABLE public.photos ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title_ar,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title_en,'')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(district_name,'') || ' ' || coalesce(neighborhood_name,'')), 'B') ||
    setweight(to_tsvector('arabic', coalesce(description_ar,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description_en,'')), 'C') ||
    setweight(to_tsvector('arabic', coalesce(photographer,'') || ' ' || coalesce(source,'') || ' ' || coalesce(additional_details_ar,'')), 'D') ||
    setweight(to_tsvector('simple', coalesce(year::text,'')), 'D')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_photos_fts ON public.photos USING GIN(fts);

-- 2. Update search RPC to order by relevance rank
DROP FUNCTION IF EXISTS search_photos_with_tags(text);

CREATE OR REPLACE FUNCTION search_photos_with_tags(search_term text)
RETURNS SETOF public.photos AS $$
BEGIN
  RETURN QUERY
  SELECT p.* 
  FROM public.photos p
  WHERE (
    -- FTS matching using both arabic and simple configs
    p.fts @@ websearch_to_tsquery('arabic', search_term)
    OR p.fts @@ websearch_to_tsquery('simple', search_term)
    -- Fallback to partial text matching for important fields
    OR p.title_ar ILIKE '%' || search_term || '%'
    OR p.district_name ILIKE '%' || search_term || '%'
    OR p.neighborhood_name ILIKE '%' || search_term || '%'
    OR p.photographer ILIKE '%' || search_term || '%'
    OR p.source ILIKE '%' || search_term || '%'
    -- Search in tags using EXISTS to avoid duplicate rows
    OR EXISTS (
      SELECT 1 FROM public.photo_tags pt
      JOIN public.tags t ON t.id = pt.tag_id
      WHERE pt.photo_id = p.id
      AND (t.name_ar ILIKE '%' || search_term || '%' OR t.name_en ILIKE '%' || search_term || '%')
    )
  )
  ORDER BY 
    -- Calculate relevance score based on weights
    ts_rank(p.fts, websearch_to_tsquery('arabic', search_term)) + 
    ts_rank(p.fts, websearch_to_tsquery('simple', search_term)) +
    -- Add arbitrary score boosts for partial matches on critical fields
    (CASE WHEN p.title_ar ILIKE '%' || search_term || '%' THEN 1.0 ELSE 0.0 END) +
    (CASE WHEN EXISTS (
      SELECT 1 FROM public.photo_tags pt
      JOIN public.tags t ON t.id = pt.tag_id
      WHERE pt.photo_id = p.id AND t.name_ar ILIKE '%' || search_term || '%'
    ) THEN 0.8 ELSE 0.0 END) +
    (CASE WHEN p.district_name ILIKE '%' || search_term || '%' OR p.neighborhood_name ILIKE '%' || search_term || '%' THEN 0.5 ELSE 0.0 END) DESC,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
