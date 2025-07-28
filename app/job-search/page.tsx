import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import SearchInput from '@/components/SearchInput';
import JobTable from './data-table';
import columns from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { auth } from '@/auth';

const JobsPage = async (props: {
  searchParams: Promise<{ query: string }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query;

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
          <div className="@container/main flex flex-1 flex-col gap-2 px-4">
            <SearchInput />

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              {/* <DataTable data={data} /> */}
              <Suspense
                key={query}
                fallback={<Skeleton className="h-96 w-full" />}
              >
                <JobTable columns={columns} query={query} />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default JobsPage;
