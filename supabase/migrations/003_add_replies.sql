-- Add parent_id column to track replies
ALTER TABLE public.shared_inbox
ADD COLUMN parent_id UUID REFERENCES public.shared_inbox(id) ON DELETE CASCADE;

-- Create index on parent_id for faster reply lookups
CREATE INDEX IF NOT EXISTS idx_shared_inbox_parent_id ON public.shared_inbox(parent_id);
