"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Job } from "@/app/job-search/columns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteButtonProps {
  job: Job;
}

const FavoriteButton = ({ job }: FavoriteButtonProps) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);

  const generateJobId = (job: Job): string => {
    return `${job.employer_name}-${job.job_title}-${job.job_location}`
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const jobId = generateJobId(job);
  const isJobFavorite = isFavorite(job);

  const handleToggleFavorite = () => {
    if (isJobFavorite) {
      removeFromFavorites(jobId);
    } else {
      addToFavorites(job);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isJobFavorite
                  ? "fill-red-500 text-red-500"
                  : isHovered
                    ? "fill-red-200 text-red-500"
                    : "text-gray-400"
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isJobFavorite ? "Remove from favorites" : "Add to favorites"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteButton;
