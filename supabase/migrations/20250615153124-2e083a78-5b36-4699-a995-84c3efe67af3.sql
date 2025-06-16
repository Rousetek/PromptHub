
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create repositories table
CREATE TABLE public.repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  license TEXT NOT NULL DEFAULT 'MIT License',
  category TEXT NOT NULL DEFAULT 'general',
  stars_count INTEGER NOT NULL DEFAULT 0,
  forks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stars table for tracking repository stars
CREATE TABLE public.stars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  repository_id UUID NOT NULL REFERENCES public.repositories ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, repository_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for repositories
CREATE POLICY "Anyone can view public repositories" ON public.repositories FOR SELECT USING (NOT is_private);
CREATE POLICY "Users can view own repositories" ON public.repositories FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create repositories" ON public.repositories FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own repositories" ON public.repositories FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own repositories" ON public.repositories FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for stars
CREATE POLICY "Users can view all stars" ON public.stars FOR SELECT USING (true);
CREATE POLICY "Users can star repositories" ON public.stars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unstar repositories" ON public.stars FOR DELETE USING (auth.uid() = user_id);

-- Create functions for incrementing/decrementing stars
CREATE OR REPLACE FUNCTION public.increment_stars_count(repository_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.repositories 
  SET stars_count = stars_count + 1 
  WHERE id = repository_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_stars_count(repository_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.repositories 
  SET stars_count = GREATEST(stars_count - 1, 0)
  WHERE id = repository_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
