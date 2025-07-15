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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import ResumeUpload from './ResumeUpload';

interface AnalysisResult {
  score: number;
  strengths: { title: string; description?: string }[] | null;
  weaknesses: { title: string; description?: string }[] | null;
  recommendations: { title: string; description?: string }[] | null;
}

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
                {/* <div className="">
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
                </div> */}
                <ResumeUpload />
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
                <Button
                  type="submit"
                  className="cursor-pointer bg-teal-400 text-accent-foreground dark:text-primary-foreground hover:text-primary-foreground"
                >
                  Compare Resume & Job Description
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            {comparisonResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-lg font-semibold">Match Score: </span>
                  <span className="text-3xl font-bold text-teal-400">
                    {comparisonResult.score}%
                  </span>
                </div>

                <Tabs defaultValue="strengths" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="strengths"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </TabsTrigger>
                    <TabsTrigger
                      value="weaknesses"
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </TabsTrigger>
                    <TabsTrigger
                      value="recommendations"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Recommendations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="strengths" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-teal-600 dark:text-teal-400 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          What You're Doing Right
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comparisonResult.strengths &&
                        comparisonResult.strengths.length > 0 ? (
                          <div className="space-y-3">
                            {comparisonResult.strengths.map((item, idx) => (
                              <div
                                key={idx}
                                className="border-l-4 border-teal-500 pl-4 py-2"
                              >
                                <h4 className="font-semibold text-teal-600 dark:text-teal-300">
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No strengths identified.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="weaknesses" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comparisonResult.weaknesses &&
                        comparisonResult.weaknesses.length > 0 ? (
                          <div className="space-y-3">
                            {comparisonResult.weaknesses.map((item, idx) => (
                              <div
                                key={idx}
                                className="border-l-4 border-orange-500 pl-4 py-2"
                              >
                                <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No weaknesses identified.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Actionable Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comparisonResult.recommendations &&
                        comparisonResult.recommendations.length > 0 ? (
                          <div className="space-y-3">
                            {comparisonResult.recommendations.map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-blue-500 pl-4 py-2"
                                >
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No recommendations available.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
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
