
-- Create the prompts table
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Prompts are viewable if repository is accessible" ON public.prompts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.repositories
    WHERE repositories.id = prompts.repository_id
    AND (NOT repositories.is_private OR repositories.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can insert prompts in their repositories" ON public.prompts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.repositories
    WHERE repositories.id = prompts.repository_id
    AND repositories.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update prompts in their repositories" ON public.prompts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.repositories
    WHERE repositories.id = prompts.repository_id
    AND repositories.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete prompts in their repositories" ON public.prompts
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.repositories
    WHERE repositories.id = prompts.repository_id
    AND repositories.owner_id = auth.uid()
  )
);
