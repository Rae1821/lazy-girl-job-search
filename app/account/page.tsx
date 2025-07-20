import { auth } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import MyAccount from '@/components/MyAccount';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const AccountPage = async () => {
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
            <MyAccount user={user} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AccountPage;
