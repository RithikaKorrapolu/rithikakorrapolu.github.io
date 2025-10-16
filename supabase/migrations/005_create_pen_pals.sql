-- Create pen_pals table to store e-pen pal sign-ups
CREATE TABLE IF NOT EXISTS public.pen_pals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_pen_pals_created_at ON public.pen_pals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pen_pals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read pen pal profiles
CREATE POLICY "Allow public read access to pen pals"
ON public.pen_pals FOR SELECT
USING (true);

-- Create policy to allow anyone to insert pen pal profiles
CREATE POLICY "Allow public insert access to pen pals"
ON public.pen_pals FOR INSERT
WITH CHECK (true);
