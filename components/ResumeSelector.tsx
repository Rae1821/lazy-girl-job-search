'use client';

import React, { useState, useEffect } from 'react';
import { findUniqueResumes } from '@/actions/auth';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Upload, FileText } from 'lucide-react';
import ResumeUpload from './ResumeUpload';

interface Resume {
  id: string;
  resume_url: string | null;
  resume_name: string | null;
}

interface ResumeSelectorProps {
  onResumeSelected: (resumeUrl: string, resumeName?: string) => void;
  onNewResumeUploaded: (resumeUrl: string, resumeName?: string) => void;
}

const ResumeSelector = ({
  onResumeSelected,
  onNewResumeUploaded,
}: ResumeSelectorProps) => {
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('existing');

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const userResumes = await findUniqueResumes();
        const fetchedResumes =
          userResumes?.map((resume: Resume) => ({
            id: resume.id,
            resume_url: resume.resume_url ?? '',
            resume_name: resume.resume_name ?? 'Untitled Resume',
          })) ?? [];
        setSavedResumes(fetchedResumes);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleExistingResumeSelect = () => {
    const selectedResume = savedResumes.find(
      (resume) => resume.id === selectedResumeId
    );
    if (selectedResume && selectedResume.resume_url) {
      onResumeSelected(
        selectedResume.resume_url,
        selectedResume.resume_name || undefined
      );
    }
  };

  const handleNewResumeUpload = (resumeUrl: string, resumeName?: string) => {
    onNewResumeUploaded(resumeUrl, resumeName);
    // Refresh the saved resumes list
    const fetchResumes = async () => {
      try {
        const userResumes = await findUniqueResumes();
        const fetchedResumes =
          userResumes?.map((resume: Resume) => ({
            id: resume.id,
            resume_url: resume.resume_url ?? '',
            resume_name: resume.resume_name ?? 'Untitled Resume',
          })) ?? [];
        setSavedResumes(fetchedResumes);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };
    fetchResumes();
  };

  if (loading) {
    return <div className="text-center py-4">Loading your resumes...</div>;
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Use Saved Resume
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload New Resume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select from Saved Resumes</CardTitle>
              <CardDescription>
                Choose from your previously uploaded resumes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedResumes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved resumes found.</p>
                  <p className="text-sm">Upload a new resume to get started.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resume-select">Choose a resume:</Label>
                    <Select
                      value={selectedResumeId}
                      onValueChange={setSelectedResumeId}
                    >
                      <SelectTrigger id="resume-select">
                        <SelectValue placeholder="Select a resume..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedResumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.resume_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleExistingResumeSelect}
                    disabled={!selectedResumeId}
                    className="w-full"
                  >
                    Use Selected Resume
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Resume</CardTitle>
              <CardDescription>
                Upload a new resume file for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUpload onUploadComplete={handleNewResumeUpload} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeSelector;
