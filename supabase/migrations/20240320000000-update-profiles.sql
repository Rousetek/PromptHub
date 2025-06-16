-- Update profiles table to make username required and unique
ALTER TABLE public.profiles 
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Update handle_new_user function to ensure username is always set
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

-- Clean up any existing profiles with NULL usernames
UPDATE public.profiles 
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL; 