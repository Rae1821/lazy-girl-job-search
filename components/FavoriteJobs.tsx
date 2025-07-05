"use client";

import { useFavorites } from "@/contexts/FavoritesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, MapPin, Building, Trash2 } from "lucide-react";
import { Job } from "@/app/job-search/columns";

const FavoriteJobs = () => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();

  const generateJobId = (job: Job): string => {
    return `${job.employer_name}-${job.job_title}-${job.job_location}`
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const handleRemoveFavorite = (job: Job) => {
    const jobId = generateJobId(job);
    removeFromFavorites(jobId);
  };

  const handleApplyToJob = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="text-sm">No favorite jobs yet</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Click the heart icon on any job to add it to your favorites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          <span className="text-sm font-medium">Favorite Jobs</span>
          <Badge variant="secondary" className="text-xs">
            {favorites.length}
          </Badge>
        </div>
        {favorites.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFavorites}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {favorites.map((job) => (
          <Card key={generateJobId(job)} className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {job.job_title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Building className="h-3 w-3 shrink-0" />
                    <span className="truncate">{job.employer_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{job.job_location}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFavorite(job)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {job.job_is_remote && (
                  <Badge variant="outline" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleApplyToJob(job.job_apply_link)}
                className="w-full h-7 text-xs"
                disabled={!job.job_apply_link}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Apply Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoriteJobs;
