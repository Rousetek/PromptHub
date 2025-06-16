
import { Repository, CreateRepositoryData } from '../types/repository';
import { repositoryService } from '../services/repositoryService';

class RepositoryStore {
  private repositories: Repository[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadRepositories();
  }

  private async loadRepositories() {
    try {
      this.repositories = await repositoryService.loadRepositories();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getRepositories(): Repository[] {
    return [...this.repositories];
  }

  async createRepository(repoData: CreateRepositoryData): Promise<Repository> {
    try {
      const newRepo = await repositoryService.createRepository(repoData);
      this.repositories.unshift(newRepo);
      this.notifyListeners();
      return newRepo;
    } catch (error) {
      console.error('Failed to create repository:', error);
      throw error;
    }
  }

  async starRepository(repositoryId: string): Promise<void> {
    try {
      await repositoryService.starRepository(repositoryId);
      await this.loadRepositories();
    } catch (error) {
      console.error('Failed to star repository:', error);
      throw error;
    }
  }

  async unstarRepository(repositoryId: string): Promise<void> {
    try {
      await repositoryService.unstarRepository(repositoryId);
      await this.loadRepositories();
    } catch (error) {
      console.error('Failed to unstar repository:', error);
      throw error;
    }
  }

  getStats() {
    return {
      totalRepos: this.repositories.length,
      totalPrompts: this.repositories.reduce((sum, repo) => sum + (repo.tags?.length || 0), 0),
      totalContributors: new Set(this.repositories.map(repo => repo.owner_id)).size
    };
  }
}

export const repositoryStore = new RepositoryStore();
