import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SiteHeader } from '@/components/site-header';
import AppliedJobsStats from '@/components/AppliedJobsStats';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('User not found');
  }

  const user = {
    email: session.user.email,
    name: session.user.name || '',
    image: session.user.image || '',
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
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
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
