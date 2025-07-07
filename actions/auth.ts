import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Modality,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fetch jobs from JSearch API
export async function fetchJobs({ searchItem }: { searchItem: string }) {
  const headers = {
    'x-rapidapi-key': 'e8e61d9638mshf2c592bf697514fp18b971jsn02e0d86ad08e',
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
  };

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${searchItem}&page=1&num_pages=5&country=us&date_posted=today`,
      {
        headers,
      }
    );

    const result = await response.json();
    console.log(result?.data);
    return result?.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
}

// Gemini AI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface UserInput {
  resume: string;
  jobDescription: string;
}

export const compareResume = async (userInput: UserInput) => {
  const prompt = `You are an application tracking system (ATS) that evaluates resumes against job descriptions.
  You will receive a resume ${userInput.resume} and a job description ${userInput.jobDescription}. Your task is to analyze the resume and
  provide a detailed comparison, highlighting the strengths and weaknesses of the resume
  in relation to the job description. Focus on key skills, qualifications, and experiences that match
  the requirements of the job. Provide a score from 0 to 100, where 0 means no match and 100 means a perfect match.`;
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });
  console.log(response.text);
};
