'use client';

import { useFavorites } from '@/contexts/FavoritesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Briefcase, TrendingUp } from 'lucide-react';

const AppliedJobsStats = () => {
  const { appliedJobs } = useFavorites();

  // Calculate some basic stats
  const totalApplied = appliedJobs.length;
  const recentApplied = appliedJobs.filter((job) => {
    // Jobs applied within last 7 days (simple approximation)
    return true; // For now, we'll show all as recent since we don't track application dates
  }).length;

  const uniqueCompanies = new Set(appliedJobs.map((job) => job.employer_name))
    .size;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalApplied}</div>
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
          <div className="text-2xl font-bold text-green-600">
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
          <div className="text-2xl font-bold text-purple-600">
            {recentApplied}
          </div>
          <p className="text-xs text-muted-foreground">Recent applications</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliedJobsStats;
