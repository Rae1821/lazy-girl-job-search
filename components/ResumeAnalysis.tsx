'use client';

import React, { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { set } from 'zod';
import { compareResume } from '@/actions/auth';

const ResumeAnalysis = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleCompare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resume || !jobDescription) {
      alert('Please fill in both fields.');
      return;
    }
    const userInput = { resume, jobDescription };

    try {
      await compareResume(userInput);
    } catch (error) {
      console.error('Error comparing resume:', error);
      alert(
        'An error occurred while processing your request. Please try again.'
      );
    }
  };

  return (
    <div className="px-4 lg:px-6 container mx-auto py-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Resume Analysis</h1>
        <p className="text-lg">
          Upload your resume for analysis and get insights on how to improve it.
        </p>
        <div className="flex flex-row items-center">
          <div className="mt-12 w-full">
            <form onSubmit={handleCompare}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="">
                  <Label
                    htmlFor="resume-upload"
                    className="block mb-2 font-semibold"
                  >
                    Paste Resume
                  </Label>
                  <Textarea
                    placeholder="Paste your resume here..."
                    id="resume"
                    className="h-96 w-md"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="job-description"
                    className="block mb-2 font-semibold"
                  >
                    Paste Job Description
                  </Label>
                  <Textarea
                    placeholder="Paste a job description here..."
                    id="job-description"
                    className="h-96 w-md"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button type="submit">Compare Resume & Job Description</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
