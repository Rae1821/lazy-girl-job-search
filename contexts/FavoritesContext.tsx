'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Job } from '@/app/job-search/columns';
import {
  addToFavorites as addToFavoritesAction,
  removeFromFavorites as removeFromFavoritesAction,
  getFavorites,
  clearFavorites as clearFavoritesAction,
  markAsApplied as markAsAppliedAction,
  removeFromApplied as removeFromAppliedAction,
  getAppliedJobs,
  clearApplied as clearAppliedAction,
} from '@/actions/auth';

interface FavoritesContextType {
  favorites: Job[];
  appliedJobs: Job[];
  addToFavorites: (job: Job) => Promise<void>;
  removeFromFavorites: (jobId: string) => Promise<void>;
  isFavorite: (job: Job | string) => boolean;
  clearFavorites: () => Promise<void>;
  markAsApplied: (job: Job) => Promise<void>;
  removeFromApplied: (jobId: string) => Promise<void>;
  isApplied: (job: Job | string) => boolean;
  clearApplied: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshApplied: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);

  // Generate a unique ID for each job based on its properties
  const generateJobId = (job: Job): string => {
    return `${job.employer_name}-${job.job_title}-${job.job_location}`
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  const findJobByJobId = (jobId: string, jobs: Job[]): Job | undefined => {
    return jobs.find((job) => generateJobId(job) === jobId);
  };

  const refreshFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    }
  };

  const refreshApplied = async () => {
    try {
      const applied = await getAppliedJobs();
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error refreshing applied jobs:', error);
    }
  };

  // Load favorites and applied jobs from database on mount
  useEffect(() => {
    refreshFavorites();
    refreshApplied();
  }, []);

  const addToFavorites = async (job: Job) => {
    try {
      await addToFavoritesAction(job);
      await refreshFavorites();
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (jobId: string) => {
    try {
      const job = findJobByJobId(jobId, favorites);
      if (job) {
        await removeFromFavoritesAction(job);
        await refreshFavorites();
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (jobId: string) => {
    return favorites.some((job) => generateJobId(job) === jobId);
  };

  const clearFavorites = async () => {
    try {
      await clearFavoritesAction();
      await refreshFavorites();
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  const markAsApplied = async (job: Job) => {
    try {
      await markAsAppliedAction(job);
      await refreshApplied();
    } catch (error) {
      console.error('Error marking as applied:', error);
    }
  };

  const removeFromApplied = async (jobId: string) => {
    try {
      const job = findJobByJobId(jobId, appliedJobs);
      if (job) {
        await removeFromAppliedAction(job);
        await refreshApplied();
      }
    } catch (error) {
      console.error('Error removing from applied:', error);
    }
  };

  const isApplied = (jobId: string) => {
    return appliedJobs.some((job) => generateJobId(job) === jobId);
  };

  const clearApplied = async () => {
    try {
      await clearAppliedAction();
      await refreshApplied();
    } catch (error) {
      console.error('Error clearing applied jobs:', error);
    }
  };

  const isJobFavorite = (job: Job | string): boolean => {
    const jobId = typeof job === 'string' ? job : generateJobId(job);
    return isFavorite(jobId);
  };

  const isJobApplied = (job: Job | string): boolean => {
    const jobId = typeof job === 'string' ? job : generateJobId(job);
    return isApplied(jobId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        appliedJobs,
        addToFavorites,
        removeFromFavorites,
        isFavorite: isJobFavorite,
        clearFavorites,
        markAsApplied,
        removeFromApplied,
        isApplied: isJobApplied,
        clearApplied,
        refreshFavorites,
        refreshApplied,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
