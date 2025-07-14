'use client';

import React, { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { generateComparison } from '@/actions/auth';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from './ui/badge';

interface AnalysisResult {
  score: number;
  strengths: { title: string; description?: string }[] | null;
  weaknesses: { title: string; description?: string }[] | null;
  recommendations: { title: string; description?: string }[] | null;
}

// If you want to display more details (like a title, description, etc.) for each strength, weakness, or recommendation,
// you should change the types from string[] to an array of objects, e.g.,
// strengths: { title: string; description?: string }[] | null;
// Then update the rendering code accordingly.
// Otherwise, if you only need plain strings, string[] is sufficient.

const ResumeAnalysis = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [comparisonResult, setComparisonResult] =
    useState<AnalysisResult | null>(null);

  const handleCompare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resume || !jobDescription) {
      alert('Please fill in both fields.');
      return;
    }
    const userInput = { resume, jobDescription };

    try {
      const result = await generateComparison(userInput);
      console.log(result);

      // Transform result to AnalysisResult if successful
      if (result.success && result.analysis) {
        // Assuming result.analysis is a JSON string or object matching AnalysisResult
        let analysisObj: AnalysisResult;
        if (typeof result.analysis === 'string') {
          analysisObj = JSON.parse(result.analysis);
        } else {
          analysisObj = result.analysis;
        }
        setComparisonResult(analysisObj);
        alert('Comparison completed successfully!');
      } else {
        setComparisonResult(null);
        alert('Comparison failed or returned no analysis.');
      }
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
        <h1 className="text-4xl font-bold mb-4 text-[#fafafa]">
          Resume Analysis
        </h1>
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
                <Button type="submit" className="cursor-pointer">
                  Compare Resume & Job Description
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-12">
          <div>
            <h2 className="text-2xl font-bold">Comparison Result</h2>
            {comparisonResult ? (
              <div className="space-y-4 mt-4">
                <div>
                  <span className="font-semibold">Score:</span>{' '}
                  {comparisonResult.score}
                </div>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>
                      Things you are doing right
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <ul className="leading-loose">
                      {comparisonResult.strengths &&
                      comparisonResult.strengths.length > 0 ? (
                        comparisonResult.strengths.map((item, idx) => (
                          <li key={idx}>
                            <Badge variant="outline" className="text-teal-400">
                              {item.title}
                            </Badge>
                            <span className="text-sm ml-2 mb-2">
                              {item.description}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </CardFooter>
                </Card>
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Areas for improvement</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <ul className="leading-loose">
                      {comparisonResult.weaknesses &&
                      comparisonResult.weaknesses.length > 0 ? (
                        comparisonResult.weaknesses.map((item, idx) => (
                          <li key={idx}>
                            <Badge variant="outline" className="text-red-400">
                              {item.title}
                            </Badge>
                            <span className="text-sm ml-2 mb-2">
                              {item.description}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </CardFooter>
                </Card>
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>
                      What you can do to improve
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <ul className="leading-loose">
                      {comparisonResult.recommendations &&
                      comparisonResult.recommendations.length > 0 ? (
                        comparisonResult.recommendations.map((item, idx) => (
                          <li key={idx}>
                            <Badge className="bg-teal-400 dark:text-primary-foreground">
                              {item.title}
                            </Badge>
                            <span className="text-sm ml-2 mb-2">
                              {item.description}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <p>No comparison result yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
