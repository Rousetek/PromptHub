import { supabase } from '../integrations/supabase/client';
import { Repository, CreateRepositoryData } from '../types/repository';

export class RepositoryService {
  async loadRepositories(): Promise<Repository[]> {
    try {
      // First get repositories
      const { data: repositories, error: repoError } = await supabase
        .from('repositories')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (repoError) {
        console.error('Error loading repositories:', repoError);
        return [];
      }

      if (!repositories || repositories.length === 0) {
        return [];
      }

      // Get unique owner IDs
      const ownerIds = [...new Set(repositories.map(repo => repo.owner_id))];

      // Get profiles for these owners
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', ownerIds);

      if (profileError) {
        console.error('Error loading profiles:', profileError);
        return [];
      }

      // Map repositories with profile data, filtering out those without profiles
      return repositories
        .map(repo => {
          const profile = profiles?.find(p => p.id === repo.owner_id);
          if (!profile?.username) return null;
          return {
            ...repo,
            owner_username: profile.username,
            owner_email: profile.email || ''
          };
        })
        .filter((repo): repo is Repository => repo !== null);
    } catch (error) {
      console.error('Error connecting to database:', error);
      return [];
    }
  }

  async createRepository(repoData: CreateRepositoryData): Promise<Repository> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw new Error(`Failed to get user information: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User must be authenticated to create repositories');
      }

      // Defensive check: ensure profile exists for the user
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking user profile:', profileError);
        throw new Error(`Failed to verify user profile: ${profileError.message}`);
      }

      if (!profile?.username) {
        console.log(`Profile exists but missing username for user ${user.id}, updating it.`);
        const username = user.user_metadata?.username || user.email?.split('@')[0];
        if (!username) {
          throw new Error('Could not determine username for profile');
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            email: user.email!,
            username: username
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          throw new Error(`Failed to update user profile: ${updateError.message}`);
        }

        profile = { username, email: user.email! };
      }

      console.log('Creating repository with data:', {
        name: repoData.name,
        description: repoData.description,
        owner_id: user.id,
        is_private: repoData.is_private || false,
        tags: repoData.tags || [],
        license: repoData.license,
        category: repoData.category
      });

      const { data, error } = await supabase
        .from('repositories')
        .insert([{
          name: repoData.name,
          description: repoData.description,
          owner_id: user.id,
          is_private: repoData.is_private || false,
          tags: repoData.tags || [],
          license: repoData.license,
          category: repoData.category,
          stars_count: 0,
          forks_count: 0
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating repository:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create repository: ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
      }

      return {
        ...data,
        owner_username: profile.username,
        owner_email: profile.email || ''
      };
    } catch (error) {
      console.error('Error in createRepository:', error);
      throw error;
    }
  }

  async starRepository(repositoryId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to star repositories');
    }

    const { error } = await supabase
      .from('stars')
      .insert([{
        user_id: user.id,
        repository_id: repositoryId
      }]);

    if (error) {
      console.error('Error starring repository:', error);
      throw error;
    }

    // Manually increment stars count
    const { error: updateError } = await supabase
      .rpc('increment_stars_count', { repository_id: repositoryId });

    if (updateError) {
      console.error('Error updating stars count:', updateError);
    }
  }

  async unstarRepository(repositoryId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to unstar repositories');
    }

    const { error } = await supabase
      .from('stars')
      .delete()
      .eq('user_id', user.id)
      .eq('repository_id', repositoryId);

    if (error) {
      console.error('Error unstarring repository:', error);
      throw error;
    }

    // Manually decrement stars count
    const { error: updateError } = await supabase
      .rpc('decrement_stars_count', { repository_id: repositoryId });

    if (updateError) {
      console.error('Error updating stars count:', updateError);
    }
  }
}

export const repositoryService = new RepositoryService();
