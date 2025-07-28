'use client';

import { useState } from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Job } from '@/app/job-search/columns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ApplyButtonProps {
  job: Job;
  size?: 'sm' | 'default';
  className?: string;
}

const ApplyButton = ({
  job,
  size = 'sm',
  className = '',
}: ApplyButtonProps) => {
  const { markAsApplied, isApplied } = useFavorites();
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const jobApplied = isApplied(job);

  const handleApply = async () => {
    if (job.job_apply_link) {
      window.open(job.job_apply_link, '_blank');

      // Mark as applied after opening the link
      if (!jobApplied) {
        setIsLoading(true);
        try {
          await markAsApplied(job);
          setIsClicked(true);

          // Reset the clicked state after animation
          setTimeout(() => {
            setIsClicked(false);
          }, 2000);
        } catch (error) {
          console.error('Error marking job as applied:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (jobApplied) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={size}
              disabled
              className={`${className} border-teal-500 text-teal-500 bg-green-50 hover:bg-green-50`}
            >
              <Check className="h-3 w-3 mr-1" />
              Applied
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You have already applied to this job</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!job.job_apply_link) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={`${className} text-muted-foreground`}
      >
        N/A
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            onClick={handleApply}
            disabled={isLoading}
            className={`${className} bg-teal-400 transition-all ${
              isClicked ? 'bg-green-50 text-teal-400 border-teal-400' : ''
            }`}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Apply
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open application link and mark as applied</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApplyButton;
