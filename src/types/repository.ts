
export interface Repository {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  owner_username: string;
  owner_email: string;
  is_private: boolean;
  tags: string[];
  license: string;
  category: string;
  stars_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  is_starred?: boolean;
}

export interface CreateRepositoryData {
  name: string;
  description: string;
  is_private?: boolean;
  tags?: string[];
  license: string;
  category: string;
}
