-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  license TEXT NOT NULL,
  category TEXT NOT NULL,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, name)
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stars table
CREATE TABLE IF NOT EXISTS stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, repository_id)
);

-- Create forks table
CREATE TABLE IF NOT EXISTS forks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  forked_repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_repository_id, forked_repository_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE forks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Repositories policies
CREATE POLICY "Public repositories are viewable by everyone" ON repositories 
  FOR SELECT USING (NOT is_private OR owner_id = auth.uid());
CREATE POLICY "Users can insert their own repositories" ON repositories 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own repositories" ON repositories 
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own repositories" ON repositories 
  FOR DELETE USING (auth.uid() = owner_id);

-- Prompts policies
CREATE POLICY "Prompts are viewable if repository is accessible" ON prompts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = prompts.repository_id 
      AND (NOT repositories.is_private OR repositories.owner_id = auth.uid())
    )
  );
CREATE POLICY "Users can insert prompts in their repositories" ON prompts 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = prompts.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update prompts in their repositories" ON prompts 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = prompts.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete prompts in their repositories" ON prompts 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = prompts.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );

-- Stars policies
CREATE POLICY "Anyone can view stars" ON stars FOR SELECT USING (true);
CREATE POLICY "Users can star repositories" ON stars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unstar repositories" ON stars FOR DELETE USING (auth.uid() = user_id);

-- Forks policies
CREATE POLICY "Anyone can view forks" ON forks FOR SELECT USING (true);
CREATE POLICY "Users can fork repositories" ON forks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update stars count
CREATE OR REPLACE FUNCTION update_repository_stars_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE repositories 
    SET stars_count = stars_count + 1 
    WHERE id = NEW.repository_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE repositories 
    SET stars_count = GREATEST(stars_count - 1, 0) 
    WHERE id = OLD.repository_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stars count
DROP TRIGGER IF EXISTS trigger_update_stars_count ON stars;
CREATE TRIGGER trigger_update_stars_count
  AFTER INSERT OR DELETE ON stars
  FOR EACH ROW EXECUTE FUNCTION update_repository_stars_count();

-- Create RPC functions for manual star count updates
CREATE OR REPLACE FUNCTION increment_stars_count(repository_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE repositories 
  SET stars_count = stars_count + 1 
  WHERE id = repository_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_stars_count(repository_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE repositories 
  SET stars_count = GREATEST(stars_count - 1, 0) 
  WHERE id = repository_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
