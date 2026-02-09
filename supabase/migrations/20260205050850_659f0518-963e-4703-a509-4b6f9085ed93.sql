-- Add note fields to shops table for multilingual shop announcements
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS note_en TEXT,
ADD COLUMN IF NOT EXISTS note_ar TEXT,
ADD COLUMN IF NOT EXISTS note_ku TEXT;