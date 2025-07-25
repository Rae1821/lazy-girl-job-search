'use client';

import * as React from 'react';
import {
  IconCamera,
  IconChartBar,
  IconCircleCheck,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconHeart,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import FavoriteJobs from '@/components/FavoriteJobs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

const data = {
  // user: {
  //   name: 'shadcn',
  //   email: 'm@example.com',
  //   avatar: '/avatars/shadcn.jpg',
  // },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Favorites',
      url: '/favorites',
      icon: IconHeart,
    },
    {
      title: 'Applied',
      url: '/applied',
      icon: IconCircleCheck,
    },
    {
      title: 'Resume Analysis',
      url: '/resume-analysis',
      icon: IconFileWord,
    },
  ],
  // teamNavigation: [
  //   {
  //     title: 'Library',
  //     url: '#',
  //     icon: IconListDetails,
  //   },
  //   {
  //     title: 'Reports',
  //     url: '#',
  //     icon: IconChartBar,
  //   },
  //   {
  //     title: 'Applied',
  //     url: '#',
  //     icon: IconFolder,
  //   },
  //   {
  //     title: 'Team',
  //     url: '#',
  //     icon: IconUsers,
  //   },
  // ],
  // navClouds: [
  //   {
  //     title: 'Capture',
  //     icon: IconCamera,
  //     isActive: true,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  //   {
  //     title: 'Proposal',
  //     icon: IconFileDescription,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  //   {
  //     title: 'Prompts',
  //     icon: IconFileAi,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: 'Settings',
  //     url: '#',
  //     icon: IconSettings,
  //   },
  //   {
  //     title: 'Get Help',
  //     url: '#',
  //     icon: IconHelp,
  //   },
  //   {
  //     title: 'Search',
  //     url: '#',
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: 'Data Library',
  //     url: '#',
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: 'Reports',
  //     url: '#',
  //     icon: IconReport,
  //   },
  //   {
  //     name: 'Word Assistant',
  //     url: '#',
  //     icon: IconFileWord,
  //   },
  // ],
};

interface UserProfile {
  name: string;
  email: string;
  image?: string;
}

export function AppSidebar({
  user,
  ...props
}: { user: UserProfile } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 "
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Lazy Girl Job Search
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarGroup>
          <SidebarGroupContent>
            <FavoriteJobs />
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
