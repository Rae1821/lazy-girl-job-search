'use client';

import { useFavorites } from '@/contexts/FavoritesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ExternalLink,
  MapPin,
  Building,
  Trash2,
  Clock,
} from 'lucide-react';
import { Job } from '@/app/job-search/columns';

const AppliedJobsList = () => {
  const { appliedJobs, removeFromApplied, clearApplied } = useFavorites();

  const generateJobId = (job: Job): string => {
    return `${job.employer_name}-${job.job_title}-${job.job_location}`
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  const handleRemoveApplied = (job: Job) => {
    const jobId = generateJobId(job);
    removeFromApplied(jobId);
  };

  const handleViewJob = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (appliedJobs.length === 0) {
    return (
      <div className="space-y-4 px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">No applied jobs yet</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Apply to jobs from the job search page and they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Applied Jobs</span>
          <Badge variant="secondary" className="text-xs">
            {appliedJobs.length}
          </Badge>
        </div>
        {appliedJobs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearApplied}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appliedJobs.map((job) => (
          <Card key={generateJobId(job)} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
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
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveApplied(job)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {job.job_is_remote && (
                  <Badge variant="outline" className="text-xs">
                    Remote
                  </Badge>
                )}

                <Badge
                  variant="secondary"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  Applied
                </Badge>
              </div>

              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewJob(job.job_apply_link)}
                  className="w-full h-7 text-xs"
                  disabled={!job.job_apply_link}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Job Posting
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Applied recently</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppliedJobsList;
