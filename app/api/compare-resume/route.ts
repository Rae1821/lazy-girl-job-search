import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Modality,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface UserInput {
  resume: string;
  jobDescription: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: UserInput = await request.json();
    const { resume, jobDescription } = body;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `You are an application tracking system (ATS) that evaluates resumes against job descriptions.
    You will receive a resume and a job description. Your task is to analyze the resume and
    provide a detailed comparison, highlighting the strengths and weaknesses of the resume
    in relation to the job description. Focus on key skills, qualifications, and experiences that match
    the requirements of the job. Provide a score from 0 to 100, where 0 means no match and 100 means a perfect match.
    
    Resume: ${resume}
    
    Job Description: ${jobDescription}
    
    Please provide your analysis in the following format:
    - Score: [0-100]
    - Strengths: [List of matching qualifications and skills]
    - Weaknesses: [List of missing qualifications and skills]
    - Recommendations: [Suggestions for improvement]`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const analysisText = response.text;
    console.log(analysisText);
    return NextResponse.json({
      success: true,
      analysis: analysisText,
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
