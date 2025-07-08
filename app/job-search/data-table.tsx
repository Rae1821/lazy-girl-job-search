'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { fetchJobs } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Job } from './columns';

interface JobTableProps<TValue> {
  columns: ColumnDef<Job, TValue>[];
  query: string; // Add query as a required prop
}

interface JobsListProps {
  employer_name: string;
  employer_website: string;
  job_publisher: string;
  job_employment_type: string;
  job_title: string;
  job_apply_link: string;
  job_description: string;
  job_is_remote: string;
  job_posted_human_readable: string;
  job_posted_at_datetime_utc: string;
  job_location: string;
  job_state: string;
  job_highlights: {
    Qualifications: string[];
    Benefits: string[];
    Responsibilities: string[];
  };
}
const JobTable = <TValue,>({ columns, query }: JobTableProps<TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]); // State to manage sorting
  const [jobs, setJobs] = useState<Job[]>([]); // Initialize state for jobs
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading status

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting, // Update sorting state when sorting changes
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting, // Pass the sorting state to the table
    },
    debugTable: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return; // Skip if query is empty
      setLoading(true); // Set loading to true before fetching
      try {
        const fetchedJobs = await fetchJobs({ searchItem: query });
        setJobs(fetchedJobs || []); // Set jobs state with fetched data
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchData();
  }, [query]); // Re-fetch when query changes

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default JobTable;
