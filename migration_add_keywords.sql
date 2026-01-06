-- Migration: Add keyword columns to companies table

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS keyword1 TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS keyword2 TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS keyword3 TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS keyword4 TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS keyword5 TEXT;

-- Update dummy data with some keywords for testing
UPDATE public.companies 
SET 
  keyword1 = 'KeywordA',
  keyword2 = 'KeywordB' 
WHERE (random() * 10)::int % 2 = 0;

-- Create index for faster search if needed (optional for small data)
-- CREATE INDEX idx_companies_keyword1 ON public.companies(keyword1);
