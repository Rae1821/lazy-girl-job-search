'use client';

import React, { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { geminiResumeUpload, generateComparison } from '@/actions/auth';
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
import { CheckCircle, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import ResumeSelector from './ResumeSelector';
import { extractTextFromPDF, createResumeTextPrompt } from '@/lib/pdfUtils';

interface AnalysisResult {
  score: number;
  strengths: { title: string; description?: string }[] | null;
  weaknesses: { title: string; description?: string }[] | null;
  recommendations: { title: string; description?: string }[] | null;
}

interface ParsedResume {
  'languages and technologies': string[];
  projects: { title: string; description: string }[];
  skills: string[];
  qualifications: string[];
  experience: {
    job_title: string;
    company_name: string;
    description: string;
  }[];
  education: { degree: string; institution: string; year: number }[];
  certifications: { name: string; issuing_organization: string }[];
  awards: { name: string; year: number }[];
  'volunteer experience': {
    organization_name: string;
    role: string;
    description: string;
  }[];
  publications: { title: string; publication_name: string; year: number }[];
  summary: string;
}

const ResumeAnalysis = () => {
  const [resume, setResume] = useState<string>('');
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [comparisonResult, setComparisonResult] =
    useState<AnalysisResult | null>(null);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>('');
  const [selectedResumeName, setSelectedResumeName] = useState<string>('');
  const [resumeTextExtracted, setResumeTextExtracted] =
    useState<boolean>(false);
  const [isProcessingResume, setIsProcessingResume] = useState<boolean>(false);

  const handleResumeSelected = async (
    resumeId: string,
    resumeUrl: string,
    resumeName?: string
  ) => {
    console.log('Resume selected:', { resumeId, resumeUrl, resumeName });
    setSelectedResumeUrl(resumeUrl);
    setSelectedResumeName(resumeName || 'Selected Resume');
    setIsProcessingResume(true);

    try {
      console.log('Processing resume with Gemini using ID:', resumeId);
      const resumeInfo = await geminiResumeUpload(resumeId);
      console.log('Gemini response:', resumeInfo);

      if (typeof resumeInfo === 'string') {
        try {
          // Try to parse the JSON response from Gemini
          const cleanedJson = resumeInfo
            .replace(/```json\n?|\n?```/g, '')
            .trim();
          console.log('Cleaned JSON:', cleanedJson);
          const parsedResumeData = JSON.parse(cleanedJson) as ParsedResume;
          setParsedResume(parsedResumeData);
          setResume(cleanedJson); // Keep the raw JSON as backup
          setResumeTextExtracted(true);
          console.log('Successfully parsed resume data:', parsedResumeData);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          console.log('Raw response that failed to parse:', resumeInfo);
          setResume(resumeInfo);
          setParsedResume(null);
          setResumeTextExtracted(false);
        }
      } else if (resumeInfo && 'error' in resumeInfo) {
        console.error('Gemini returned error:', resumeInfo.error);
        setResume(resumeInfo.error);
        setParsedResume(null);
        setResumeTextExtracted(false);
      } else {
        console.error('Unexpected response format from Gemini:', resumeInfo);
        setResume('Unexpected response format');
        setParsedResume(null);
        setResumeTextExtracted(false);
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      setResume('Error processing resume: ' + (error as Error).message);
      setParsedResume(null);
      setResumeTextExtracted(false);
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleNewResumeUpload = async (
    resumeUrl: string,
    resumeName?: string
  ) => {
    setSelectedResumeUrl(resumeUrl);
    setSelectedResumeName(resumeName || 'Uploaded Resume');

    try {
      // Attempt to extract text from PDF
      const extractedText = await extractTextFromPDF(resumeUrl);
      setResume(extractedText);
      setResumeTextExtracted(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      // If extraction fails, show a prompt for manual input
      setResume('');
      setResumeTextExtracted(false);
    }
  };

  const handleCompare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedResumeUrl) {
      alert('Please select or upload a resume first.');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please provide a job description.');
      return;
    }

    // Use parsed resume data if available, otherwise fall back to raw text
    let resumeData: string;
    if (parsedResume) {
      // Convert parsed resume back to a structured string for the API
      resumeData = JSON.stringify(parsedResume, null, 2);
      console.log('Using parsed resume data for comparison:', parsedResume);
    } else {
      // Fallback to raw resume text
      resumeData = typeof resume === 'string' ? resume : '';
      if (!resumeData.trim()) {
        alert(
          'Resume data is not available. Please select a resume and wait for it to be processed.'
        );
        return;
      }
    }

    const userInput = {
      resume: resumeData,
      jobDescription,
      isStructuredData: !!parsedResume, // Flag to indicate if resume is structured JSON
    };

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
                <div className="flex-1">
                  <p className="text-sm font-semibold pb-4">
                    Choose Your Resume
                  </p>
                  <ResumeSelector
                    onResumeSelected={handleResumeSelected}
                    onNewResumeUploaded={handleNewResumeUpload}
                  />

                  {selectedResumeUrl && (
                    <div className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Resume Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isProcessingResume ? (
                            <div className="flex items-center gap-2 text-blue-500">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              Processing resume with AI...
                            </div>
                          ) : parsedResume ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-teal-400">
                                <CheckCircle className="w-4 h-4" />
                                Resume successfully processed by AI
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {selectedResumeName}
                              </div>
                              <details className="text-sm">
                                <summary className="cursor-pointer  hover:text-teal-400">
                                  View parsed resume data
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs max-h-32 overflow-y-auto">
                                  <strong>Skills:</strong>{' '}
                                  {parsedResume.skills?.join(', ') ||
                                    'None listed'}
                                  <br />
                                  <strong>Experience:</strong>{' '}
                                  {parsedResume.experience?.length || 0}{' '}
                                  positions
                                  <br />
                                  <strong>Education:</strong>{' '}
                                  {parsedResume.education?.length || 0} entries
                                  <br />
                                  <strong>Projects:</strong>{' '}
                                  {parsedResume.projects?.length || 0} projects
                                </div>
                              </details>
                            </div>
                          ) : resumeTextExtracted ? (
                            <div className="flex items-center gap-2 text-yellow-500">
                              <AlertCircle className="w-4 h-4" />
                              Resume processed but needs manual review
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <AlertCircle className="w-4 h-4" />
                              Resume selected: {selectedResumeName}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Label
                    htmlFor="job-description"
                    className="block mb-2 font-semibold"
                  >
                    Paste Job Description
                  </Label>
                  <Textarea
                    placeholder="Paste a job description here..."
                    id="job-description"
                    className="h-96 w-full"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={
                    isProcessingResume ||
                    !selectedResumeUrl ||
                    !jobDescription.trim()
                  }
                  className="cursor-pointer bg-teal-400 text-accent-foreground dark:text-primary-foreground hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingResume
                    ? 'Processing Resume...'
                    : !selectedResumeUrl
                      ? 'Select a Resume First'
                      : !jobDescription.trim()
                        ? 'Add Job Description'
                        : parsedResume
                          ? 'Compare AI-Parsed Resume & Job Description'
                          : 'Compare Resume & Job Description'}
                </Button>
                {parsedResume && (
                  <p className="text-sm mt-2">
                    ✓ Using AI-processed resume data for enhanced analysis
                  </p>
                )}
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
                        <CardTitle className="text-xl text-rose-400 dark:text-blue-400 flex items-center gap-2">
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
