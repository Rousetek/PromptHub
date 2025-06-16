import { supabase } from '../integrations/supabase/client';

async function updateProfiles() {
  try {
    // Update profiles table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.profiles 
        ALTER COLUMN username SET NOT NULL,
        ADD CONSTRAINT profiles_username_key UNIQUE (username);
      `
    });

    if (alterError) {
      console.error('Error updating profiles table:', alterError);
      return;
    }

    // Update handle_new_user function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (functionError) {
      console.error('Error updating handle_new_user function:', functionError);
      return;
    }

    // Clean up NULL usernames
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.profiles 
        SET username = SPLIT_PART(email, '@', 1)
        WHERE username IS NULL;
      `
    });

    if (updateError) {
      console.error('Error cleaning up NULL usernames:', updateError);
      return;
    }

    console.log('Successfully updated profiles table and handle_new_user function');
  } catch (error) {
    console.error('Error running updates:', error);
  }
}

updateProfiles(); 