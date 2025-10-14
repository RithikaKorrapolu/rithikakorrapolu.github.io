-- Create shared_inbox table for Our Mail project
CREATE TABLE IF NOT EXISTS public.shared_inbox (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_name VARCHAR(50) DEFAULT 'Anonymous',
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_starred BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_shared_inbox_created_at ON public.shared_inbox(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.shared_inbox ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read emails
CREATE POLICY "Allow public read access"
    ON public.shared_inbox
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow anyone to insert emails
CREATE POLICY "Allow public insert access"
    ON public.shared_inbox
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policy to allow anyone to update starred/read status
CREATE POLICY "Allow public update access"
    ON public.shared_inbox
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
