'use client';

import { useFavorites } from '@/contexts/FavoritesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Briefcase, TrendingUp } from 'lucide-react';

const AppliedJobsStats = () => {
  const { appliedJobs, favorites } = useFavorites();

  // Calculate some basic stats
  const totalSaved = favorites.length;
  const totalApplied = appliedJobs.length;
  const recentApplied = appliedJobs.filter((job) => {
    // Jobs applied within last 7 days (simple approximation)
    return true; // For now, we'll show all as recent since we don't track application dates
  }).length;

  const uniqueCompanies = new Set(appliedJobs.map((job) => job.employer_name))
    .size;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jobs Saved</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-400">{totalSaved}</div>
          <p className="text-xs text-muted-foreground">
            Job applications saved
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-400">{totalApplied}</div>
          <p className="text-xs text-muted-foreground">
            Job applications submitted
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-400">
            {uniqueCompanies}
          </div>
          <p className="text-xs text-muted-foreground">
            Unique companies applied to
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Period</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-400">
            {recentApplied}
          </div>
          <p className="text-xs text-muted-foreground">Recent applications</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliedJobsStats;
