ALTER TABLE public.photos
ADD COLUMN IF NOT EXISTS additional_details_ar text,
ADD COLUMN IF NOT EXISTS additional_details_en text;
