import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import AppliedJobsStats from '@/components/AppliedJobsStats';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import data from './data.json';
import JobTable from '../job-search/data-table';
import { auth } from '@/auth';
import db from '@/db';

export default async function Page() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('User not found');
  }

  const userProfileRaw = await db.user.findUnique({
    where: {
      email: session?.user.email ?? undefined,
    },
  });

  if (!userProfileRaw) {
    throw new Error('User not found');
  }

  // Ensure name is always a string
  const userProfile = {
    ...userProfileRaw,
    name: userProfileRaw.name ?? '',
    email: userProfileRaw.email ?? '',
    image: userProfileRaw.image ?? '',
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userProfile={userProfile} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <AppliedJobsStats />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* <DataTable data={data} /> */}
              {/* <JobTable /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
