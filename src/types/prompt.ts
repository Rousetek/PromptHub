export interface Prompt {
  id: string;
  repository_id: string;
  name: string;
  content: string;
  description?: string;
  file_path: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptData {
  name: string;
  content: string;
  description?: string;
  file_path: string;
}
