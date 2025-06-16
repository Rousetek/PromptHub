import { supabase } from '../integrations/supabase/client';
import { Prompt, CreatePromptData } from '../types/prompt';

export class PromptService {
  async createPrompt(repositoryId: string, promptData: CreatePromptData): Promise<Prompt> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw new Error('Failed to get user information');
      }
      
      if (!user) {
        throw new Error('User must be authenticated to create prompts');
      }

      // Check if user owns the repository
      const { data: repoData, error: repoError } = await supabase
        .from('repositories')
        .select('owner_id')
        .eq('id', repositoryId)
        .single();

      if (repoError) {
        console.error('Error checking repository ownership:', repoError);
        throw new Error('Failed to verify repository ownership');
      }

      if (!repoData || repoData.owner_id !== user.id) {
        throw new Error('You do not have permission to create prompts in this repository');
      }

      console.log('Creating prompt with data:', {
        repository_id: repositoryId,
        name: promptData.name,
        content: promptData.content,
        description: promptData.description || '',
        file_path: promptData.file_path,
        size: new Blob([promptData.content]).size
      });

      const { data, error } = await supabase
        .from('prompts')
        .insert([{
          repository_id: repositoryId,
          name: promptData.name,
          content: promptData.content,
          description: promptData.description || '',
          file_path: promptData.file_path,
          size: new Blob([promptData.content]).size
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating prompt:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create prompt: ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
      }

      return data as Prompt;
    } catch (error) {
      console.error('Unexpected error in createPrompt:', error);
      throw error;
    }
  }

  async getRepositoryPrompts(repositoryId: string): Promise<Prompt[]> {
    const { data, error } = await (supabase as any)
      .from('prompts')
      .select('*')
      .eq('repository_id', repositoryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading prompts:', error);
      return [];
    }

    return (data as Prompt[]) || [];
  }

  async getPrompt(promptId: string): Promise<Prompt | null> {
    const { data, error } = await (supabase as any)
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Error loading prompt:', error);
      return null;
    }

    return data as Prompt | null;
  }

  async updatePrompt(promptId: string, updates: Partial<CreatePromptData>): Promise<Prompt> {
    const updateData: any = { ...updates };
    if (updates.content) {
      updateData.size = new Blob([updates.content]).size;
    }

    const { data, error } = await (supabase as any)
      .from('prompts')
      .update(updateData)
      .eq('id', promptId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }

    return data as Prompt;
  }

  async deletePrompt(promptId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('prompts')
      .delete()
      .eq('id', promptId);

    if (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }
}

export const promptService = new PromptService();
