'use client';

import { findUniqueResumes, updateResumeName } from '@/actions/auth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TbFileDescription } from 'react-icons/tb';
import { TbEdit } from 'react-icons/tb';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from './ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface Resume {
  id: string;
  resume_url: string | null;
  resume_name: string | null;
}

const MyAccount = ({
  user,
}: {
  user: { name: string; email: string; image?: string };
}) => {
  const [resume, setResume] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResumes = await findUniqueResumes();

        const fetchedResumes =
          userResumes?.map((resume: Resume) => ({
            id: resume.id,
            resume_url: resume.resume_url ?? '',
            resume_name: resume.resume_name ?? '',
          })) ?? [];

        setResume(fetchedResumes);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!resume || resume.length === 0) {
    return <div>No resumes found.</div>;
  }

  const handleNameUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
    resumeId: string
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resumeName = formData.get('resume-name') as string;

    if (!resumeName.trim()) {
      console.error('Resume name is required');
      return;
    }

    try {
      const newName = await updateResumeName({
        resume_id: resumeId,
        resume_name: resumeName,
      });
      if (newName) {
        setResume((prev) =>
          prev.map((res) =>
            res.id === newName.id
              ? { ...res, resume_name: newName.resume_name }
              : res
          )
        );
      }
      return newName;
    } catch (error) {
      console.error('Error updating resume name:', error);
    }
  };

  return (
    <div className="px-4 lg:px-6 container mx-auto py-12">
      <div>
        <h1 className="text-4xl font-bold">Saved Resumes</h1>
        <p className="text-muted-foreground mt-2">
          View all of your uploaded resumes here.
        </p>
      </div>
      <div className="flex flex-col gap-4 mt-12">
        {resume.map((res) => (
          <Card key={res.id} className="w-1/2 relative">
            <CardHeader>
              <CardDescription>Resume Name</CardDescription>
              <CardTitle>{res.resume_name}</CardTitle>
            </CardHeader>
            <Dialog key={res.id}>
              <DialogTrigger asChild>
                <TbEdit className="absolute top-5 right-5 ml-2 text-unicorn w-5 h-5" />
              </DialogTrigger>

              <DialogContent className="">
                <DialogTitle className="">Edit Resume</DialogTitle>
                <DialogDescription>
                  {' '}
                  Give your resume a name to easily identify it later.
                </DialogDescription>
                <form onSubmit={(event) => handleNameUpdate(event, res.id)}>
                  <div className="grid gap-3">
                    <Label htmlFor="resume-name">Resume Name</Label>
                    <Input
                      id="resume-name"
                      name="resume-name"
                      placeholder="Google software engineer"
                      className="mb-4"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <DialogClose asChild>
                      <Button variant="outline" data-dialog-close>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </div>
                </form>
              </DialogContent>
              <DialogFooter></DialogFooter>
            </Dialog>

            <CardContent className="flex items-center">
              <Button
                asChild
                className="bg-unicorn hover:text-primary-foreground text-primary dark:text-primary-foreground"
              >
                <Link href={res.resume_url ?? '#'} target="_blank">
                  <TbFileDescription />
                  View Resume
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyAccount;
