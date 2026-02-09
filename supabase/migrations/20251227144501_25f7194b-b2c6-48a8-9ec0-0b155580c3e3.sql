-- Add note columns for each language to external_link_categories
ALTER TABLE public.external_link_categories
ADD COLUMN note_en TEXT,
ADD COLUMN note_ar TEXT,
ADD COLUMN note_ku TEXT;