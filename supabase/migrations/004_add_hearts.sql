-- Add hearts_count column to track reactions
ALTER TABLE public.shared_inbox
ADD COLUMN hearts_count INTEGER DEFAULT 0;

-- Create index on hearts_count for faster sorting
CREATE INDEX IF NOT EXISTS idx_shared_inbox_hearts_count ON public.shared_inbox(hearts_count DESC);
