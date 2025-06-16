
import { useState, useEffect } from 'react';
import { repositoryStore } from '../stores/repositoryStore';
import { Repository, CreateRepositoryData } from '../types/repository';

export const useRepositories = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState({ totalRepos: 0, totalPrompts: 0, totalContributors: 0 });

  useEffect(() => {
    const updateData = () => {
      setRepositories(repositoryStore.getRepositories());
      setStats(repositoryStore.getStats());
    };

    updateData();
    const unsubscribe = repositoryStore.subscribe(updateData);

    return () => {
      unsubscribe();
    };
  }, []);

  const createRepository = async (repoData: CreateRepositoryData) => {
    return repositoryStore.createRepository(repoData);
  };

  return {
    repositories,
    stats,
    createRepository
  };
};
