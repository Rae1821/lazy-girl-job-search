'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import TruncatedText from '@/components/TruncatedText';
import FavoriteButton from '@/components/FavoriteButton';
import ApplyButton from '@/components/ApplyButton';
import { Button } from '@/components/ui/button';

export type Job = {
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
};

const columns: ColumnDef<Job>[] = [
  {
    id: 'favorite',
    header: '',
    size: 50,
    cell: ({ row }) => {
      return <FavoriteButton job={row.original} />;
    },
  },
  {
    accessorKey: 'job_title',
    header: 'Job Title',
    size: 200,
  },
  {
    accessorKey: 'employer_name',
    header: 'Company',
    size: 150,
  },
  {
    accessorKey: 'employer_website',
    header: 'Company Website',
    size: 150,
  },
  {
    accessorKey: 'job_location',
    header: 'Location',
    size: 120,
  },
  {
    accessorKey: 'job_posted_at_datetime_utc',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date Posted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 100,
    cell: ({ row }) => {
      const datePosted = row.getValue('job_posted_at_datetime_utc') as string;
      return new Date(datePosted).toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
    },
  },
  {
    accessorKey: 'job_is_remote',
    header: 'Remote',
    size: 80,
    cell: ({ row }) => {
      const isRemote =
        row.getValue('job_is_remote') === true ||
        row.getValue('job_is_remote') === false;
      return isRemote ? 'Yes' : 'No';
    },
  },
  {
    accessorKey: 'job_apply_link',
    header: 'Job Link',
    size: 100,
    cell: ({ row }) => {
      return <ApplyButton job={row.original} className="h-7 px-2 text-xs" />;
    },
  },
  {
    accessorKey: 'job_description',
    header: 'Description',
    size: 300,
    cell: ({ row }) => {
      const description = row.getValue('job_description') as string;
      return <TruncatedText text={description} maxWords={20} maxLines={3} />;
    },
  },
  {
    id: 'qualifications',
    header: 'Qualifications',
    size: 250,
    accessorFn: (row) => row.job_highlights?.Qualifications,
    cell: ({ row }) => {
      const qualifications = row.original.job_highlights?.Qualifications;
      const text =
        Array.isArray(qualifications) && qualifications.length > 0
          ? qualifications.join(', ')
          : 'N/A';
      return <TruncatedText text={text} maxWords={15} maxLines={2} />;
    },
  },
  {
    id: 'benefits',
    header: 'Benefits',
    size: 250,
    accessorFn: (row) => row.job_highlights?.Benefits,
    cell: ({ row }) => {
      const benefits = row.original.job_highlights?.Benefits;
      const text =
        Array.isArray(benefits) && benefits.length > 0
          ? benefits.join(', ')
          : 'N/A';
      return <TruncatedText text={text} maxWords={15} maxLines={2} />;
    },
  },
  {
    id: 'responsibilities',
    header: 'Responsibilities',
    size: 250,
    accessorFn: (row) => row.job_highlights?.Responsibilities,
    cell: ({ row }) => {
      const responsibilities = row.original.job_highlights?.Responsibilities;
      const text =
        Array.isArray(responsibilities) && responsibilities.length > 0
          ? responsibilities.join(', ')
          : 'N/A';
      return <TruncatedText text={text} maxWords={15} maxLines={2} />;
    },
  },
];

export default columns;
