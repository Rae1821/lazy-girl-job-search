"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Job } from "@/app/job-search/columns";

interface FavoritesContextType {
  favorites: Job[];
  addToFavorites: (job: Job) => void;
  removeFromFavorites: (jobId: string) => void;
  isFavorite: (job: Job | string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<Job[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("jobFavorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("jobFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (job: Job) => {
    const jobId = generateJobId(job);
    setFavorites((prev) => {
      // Check if job is already in favorites
      if (prev.some((fav) => generateJobId(fav) === jobId)) {
        return prev;
      }
      return [...prev, job];
    });
  };

  const removeFromFavorites = (jobId: string) => {
    setFavorites((prev) => prev.filter((job) => generateJobId(job) !== jobId));
  };

  const isFavorite = (jobId: string) => {
    return favorites.some((job) => generateJobId(job) === jobId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  // Generate a unique ID for each job based on its properties
  const generateJobId = (job: Job): string => {
    return `${job.employer_name}-${job.job_title}-${job.job_location}`
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const isJobFavorite = (job: Job | string): boolean => {
    const jobId = typeof job === "string" ? job : generateJobId(job);
    return isFavorite(jobId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite: isJobFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
