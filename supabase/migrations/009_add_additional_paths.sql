ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS additional_paths text[] DEFAULT '{}'::text[];
