import { auth } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import AppliedJobsList from '@/components/AppliedJobsList';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const AppliedPage = async () => {
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
      <AppSidebar user={user} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="space-y-4 px-4">
                <h1 className="text-2xl font-bold">Applied Jobs</h1>
                <p className="text-muted-foreground">
                  Track the jobs you've applied to and manage your applications.
                </p>
              </div>
              <div className="max-w-4xl">
                <AppliedJobsList />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppliedPage;
