import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
// import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// import data from "../dashboard/data.json";
// import JobsList from "@/app/job-search/JobsList";
import SearchInput from "@/components/SearchInput";
import JobTable from "./data-table";
import columns from "./columns";

const JobsPage = async (props: {
  searchParams: Promise<{ query: string }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <SearchInput />
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <DataTable data={data} /> */}
              <JobTable columns={columns} query={query} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default JobsPage;
