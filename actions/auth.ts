'use server';

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Modality,
} from '@google/genai';
import { auth, signOut } from '@/auth';
import db from '@/db';
import { Job } from '@/app/job-search/columns';
import { redirect } from 'next/dist/server/api-utils';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs';
import os from 'os';

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

// Client-side function to call the resume comparison API
interface UserInput {
  resume: string;
  jobDescription: string;
  isStructuredData?: boolean;
}

// Signout
export const logOut = async () => {
  try {
    const signout = await signOut();
    console.log(signout);
    revalidatePath('/login'); // Redirect to login page after sign out
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: 'Failed to sign out' };
  }
};

// Update User
interface AddUploadedResumeInput {
  id?: string;
  email?: string;
  resume_url?: string;
  resume_name?: string;
}

// export const updateUser = async (input: AddUploadedResumeInput) => {
//   try {
//     if (!input.resume_url) {
//       throw new Error('File URL is required');
//     }

//     const session = await auth();
//     if (!session?.user?.id) {
//       throw new Error('User not authenticated');
//     }

//     const updatedUser = await db.user.update({
//       where: { id: session.user.id },
//       data: {
//         user: { connect: { email: session.user.email } },
//         resume_url: input.resume_url,
//         resume_name: input.resume_name,
//       },
//     });
//     return updatedUser;
//   } catch (error) {
//     console.error('Error updating user:', error);
//     return { success: false, error: 'Failed to update user' };
//   }
// };

// Upload Thing - upload resume

export const addUploadedResume = async (input: AddUploadedResumeInput) => {
  try {
    const addResume = await db.resume.create({
      data: {
        user: { connect: { id: input.id } },
        resume_url: input.resume_url ?? '',
        resume_name: input.resume_name ?? '',
      },
    });
    return addResume;
  } catch (error) {
    console.error('Error adding uploaded resume:', error);
    return { success: false, error: 'Failed to add uploaded resume' };
  }
};

interface UploadedFile {
  uri?: string;
  mimeType: string;
}

const downloadFile = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempFilePath = path.join(os.tmpdir(), path.basename(url));
  await fs.promises.writeFile(tempFilePath, buffer);
  return tempFilePath;
};

export const geminiResumeUpload = async (fileId: string) => {
  // grab the resume url from the db
  // sent the url to the gemini api to parse through document vision
  // decide how to handle the response
  console.log('geminiResumeUpload called with fileId:', fileId);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    console.log('User authenticated:', session.user.id);

    const userResume = await findUniqueResumes();
    console.log('Found resumes:', userResume?.length || 0);

    if (!userResume || userResume.length === 0) {
      throw new Error('No resumes found for the user');
    }
    const resume = userResume.find((res) => res.id === fileId);
    console.log('Selected resume:', resume);

    if (!resume) {
      throw new Error('Resume not found');
    }
    if (!resume.resume_url) {
      throw new Error('Resume URL is empty');
    }
    console.log('Downloading file from URL:', resume.resume_url);

    const filePath = await downloadFile(resume.resume_url);
    console.log('File downloaded to:', filePath);

    // Read the file content
    const fileBuffer = await fs.promises.readFile(filePath);
    console.log('File read, buffer size:', fileBuffer.length);

    const contents = [
      {
        text: `Analyze this resume provide all of the information in a JSON format following this schema:
        
        

        resumePdf = {
          'languages and technologies': [list of languages and technologies],
          'projects': [list of projects with descriptions],
          'skills': [list of skills],
          'qualifications': [list of qualifications],
          'experience': [List of experiences with job title, company name, and description],
          'education': [list of education with degree, institution, and year],
          'certifications': [list of certifications with name and issuing organization],
          'awards': [list of awards with name and year],
          'volunteer experience': [list of volunteer experiences with organization name, role, and description],
          'publications': [list of publications with title, publication name, and year],
          'summary': [brief summary of the resume],
        }


      Example of expected JSON output: 

      { 
        "languages and technologies": ["JavaScript", "React", "Node.js"],
        "projects": [
          {
            "title": "Portfolio Website",
            "description": "A personal portfolio website built with React and Tailwind CSS."
          }
        ],
        "skills": ["JavaScript", "React", "Node.js", "Tailwind CSS"],
        "qualifications": ["Bachelor's in Computer Science", "Certified JavaScript Developer"],
        "experience": [
          {
            "job_title": "Frontend Developer",
            "company_name": "Tech Company",
            "description": "Developed user interfaces using React and Redux."
          }
        ],
        "education": [
          {
            "degree": "Bachelor's in Computer Science",
            "institution": "University of Technology",
            "year": 2020
          }
        ],
        "certifications": [
          {
            "name": "Certified JavaScript Developer",
            "issuing_organization": "JavaScript Institute"
          }
        ],
        "awards": [
          {
            "name": "Best Developer Award",
            "year": 2021
          }
        ],
        "volunteer experience": [
          {
            "organization_name": "Local Non-Profit",
            "role": "Web Developer",
            "description": "Developed a website for the non-profit organization."
          }
        ],
        "publications": [
          {
            "title": "Understanding React",
            "publication_name": "Tech Journal",
            "year": 2022
          }
        ],
        "summary": "A passionate frontend developer with experience in building user-friendly web applications."
      }`,
      },

      {
        inlineData: {
          mimeType: 'application/pdf',
          data: fileBuffer.toString('base64'),
        },
      },
    ];

    console.log('Calling Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
    });

    console.log('Gemini response received:', response.text);
    return response.text;
  } catch (error) {
    console.error('Error uploading resume to Gemini:', error);
    return {
      error: 'Failed to upload resume to Gemini: ' + (error as Error).message,
    };
  }
};

// export const updateUser = async (input: AddUploadedResumeInput) => {
//   try {
//     if (!input.resume_url) {
//       throw new Error('Resume URL is required');
//     }

//     const session = await auth();
//     // const email = session?.user?.email;
//     if (!session?.user?.id) {
//       throw new Error('User not authenticated');
//     }

//     const updateUser = await db.user.update({
//       where: { id: session.user.id },
//       data: {
//         resume_url: input.resume_url,
//       },
//     });
//     return updateUser;
//   } catch (error) {
//     console.error('Error updating user:', error);
//     return { success: false, error: 'Failed to update user' };
//   }
// };

export const generateComparison = async (userInput: UserInput) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const basePrompt = `You are an application tracking system (ATS) that evaluates resumes against job descriptions.
      You will receive a resume and a job description. Your task is to analyze the resume and
      provide a detailed comparison, highlighting the strengths and weaknesses of the resume
      in relation to the job description. Focus on key skills, qualifications, and experiences that match
      the requirements of the job. Provide a score from 0 to 100, where 0 means no match and 100 means a perfect match.`;

  const structuredDataNote = userInput.isStructuredData
    ? `\n\nNOTE: The resume data provided below is in structured JSON format, pre-processed by AI for enhanced analysis. Use this structured data to provide more precise matching against the job requirements.`
    : '';

  const prompt = `${basePrompt}${structuredDataNote}
      
      Resume: ${userInput.resume}
      
      Job Description: ${userInput.jobDescription}

      Please return an analysis object following this schema:

      Analysis = {'score': [0-100], 'strengths': [list of matching qualifications and skills], 'weaknesses': [list of missing qualifications and skills], 'recommendations': [suggestions for improvement]}

      Example of expected JSON output: 

      {
        "score": 85,
        "strengths": [
          {
            "title": "React Experience",
            "description": "The resume highlights significant experience with React.js and Next.js, which are closely related to the required React 18+.  While the specific version isn't stated, the experience level suggests proficiency."
          },
          {
            "title": "UI Framework Experience",
            "description": "The candidate demonstrates experience with TailwindCSS, a required skill."
          },
          {
            "title": "API Integration",
            "description": "The resume shows experience integrating RESTful APIs, though the specific tools (Axios or Fetch) aren't explicitly mentioned."
          },
          {
            "title": "TypeScript Familiarity",
            "description": "Although not explicitly stated as a core skill, use of TypeScript in several projects suggests some familiarity, aligning with the job description's preference."
          },
          {
            "title": "Responsive UI Development",
            "description": "Multiple projects showcase building responsive websites, a key requirement of the job."
          },
          {
            "title": "Version Control",
            "description": "Consistent use of Git and GitHub demonstrates proficiency in version control."
          },
          {
            "title": "Collaboration",
            "description": "The resume emphasizes collaboration skills, a crucial aspect of the role."
          }
        ],
        "weaknesses": [
          {
            "title": "React 18+ and Specific Version",
            "description": "The resume doesn't specify experience with React 18+, only general React experience. The job description emphasizes 3+ years specifically with React 18+ and its features (hooks, context, performance optimization). This needs clarification."
          },
          {
            "title": "OAuth (Auth0) Experience",
            "description": "The resume lacks explicit mention of experience with OAuth or Auth0, a critical requirement."
          },
          {
            "title": "Azure Static Web Apps (or similar)",
            "description": "No experience with Azure Static Web Apps or comparable deployment platforms is mentioned."
          }
        ],

        "recommendations": [
          {
            "title": "Quantify React 18+ Experience",
            "description": "Clearly state the extent of experience with React 18+, including specific examples of using hooks, context, and performance optimization techniques."
          },
          {
            "title": "Highlight OAuth/Auth0 Skills (if any)",
            "description": "If Rachel has any experience with OAuth or Auth0, even in personal projects, this should be prominently featured. If not, consider acquiring this skill."
          },
          {
            "title": "Mention Deployment Platforms",
            "description": "Update the resume to include experience with deployment platforms similar to Azure Static Web Apps, if available."
          }
        ]
      }`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });

  const analysisText = response.text;
  const analysisResult = parseGeminiResponse(analysisText);
  return {
    success: true,
    analysis: analysisResult,
  };
};

interface AnalysisResult {
  score: number;
  strengths: { title: string; description: string }[] | null;
  weaknesses: { title: string; description: string }[] | null;
  recommendations: { title: string; description: string }[] | null;
}

function parseGeminiResponse(
  responseText: string | undefined
): AnalysisResult | null {
  if (!responseText) return null;

  try {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }
  return null;
}

// Find User
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Favorites Server Actions
export async function addToFavorites(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Create a unique identifier for the job
    const jobId =
      `${jobData.employer_name}-${jobData.job_title}-${jobData.job_location}`
        .replace(/\s+/g, '-')
        .toLowerCase();

    // Check if job already exists
    const existingJob = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
      },
    });

    if (existingJob) {
      // Update existing job to be favorite
      await db.job.update({
        where: { id: existingJob.id },
        data: { isFavorite: true },
      });
    } else {
      // Create new job as favorite
      await db.job.create({
        data: {
          userId: session.user.id,
          employer_name: jobData.employer_name,
          employer_website: jobData.employer_website || null,
          job_publisher: jobData.job_publisher || null,
          job_employment_type: jobData.job_employment_type || null,
          job_title: jobData.job_title,
          job_apply_link: jobData.job_apply_link || null,
          job_description: jobData.job_description || null,
          job_is_remote: jobData.job_is_remote === 'true',
          job_posted_at_datetime_utc:
            jobData.job_posted_at_datetime_utc || null,
          job_location: jobData.job_location || null,
          job_highlights_qualifications:
            jobData.job_highlights?.Qualifications?.join(', ') || null,
          job_highlights_responsibilities:
            jobData.job_highlights?.Responsibilities?.join(', ') || null,
          job_highlights_benefits:
            jobData.job_highlights?.Benefits?.join(', ') || null,
          status: 'favorited',
          isFavorite: true,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

export async function removeFromFavorites(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const job = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
      },
    });

    if (job) {
      if (job.isApplied) {
        // If job is also applied, just remove favorite status
        await db.job.update({
          where: { id: job.id },
          data: {
            isFavorite: false,
            status: 'applied',
          },
        });
      } else {
        // If job is only favorited, delete it
        await db.job.delete({
          where: { id: job.id },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

export async function getFavorites() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const favorites = await db.job.findMany({
      where: {
        userId: session.user.id,
        isFavorite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform database job to match Job interface
    return favorites.map((job) => ({
      employer_name: job.employer_name,
      employer_website: job.employer_website || '',
      job_publisher: job.job_publisher || '',
      job_employment_type: job.job_employment_type || '',
      job_title: job.job_title,
      job_apply_link: job.job_apply_link || '',
      job_description: job.job_description || '',
      job_is_remote: job.job_is_remote ? 'true' : 'false',
      job_posted_human_readable: job.job_posted_at_datetime_utc || '',
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc || '',
      job_location: job.job_location || '',
      job_state: '',
      job_highlights: {
        Qualifications: job.job_highlights_qualifications?.split(', ') || [],
        Benefits: job.job_highlights_benefits?.split(', ') || [],
        Responsibilities:
          job.job_highlights_responsibilities?.split(', ') || [],
      },
    }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function checkIsFavorite(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const job = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
        isFavorite: true,
      },
    });

    return !!job;
  } catch (error) {
    console.error('Error checking if favorite:', error);
    return false;
  }
}

export async function clearFavorites() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    await db.job.updateMany({
      where: {
        userId: session.user.id,
        isFavorite: true,
      },
      data: {
        isFavorite: false,
        status: 'saved',
      },
    });

    // Delete jobs that are only favorited (not applied)
    await db.job.deleteMany({
      where: {
        userId: session.user.id,
        isFavorite: false,
        isApplied: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing favorites:', error);
    throw error;
  }
}

// Applied Jobs Server Actions
export async function markAsApplied(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const existingJob = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
      },
    });

    if (existingJob) {
      await db.job.update({
        where: { id: existingJob.id },
        data: {
          isApplied: true,
          status: 'applied',
        },
      });
    } else {
      await db.job.create({
        data: {
          userId: session.user.id,
          employer_name: jobData.employer_name,
          employer_website: jobData.employer_website || null,
          job_publisher: jobData.job_publisher || null,
          job_employment_type: jobData.job_employment_type || null,
          job_title: jobData.job_title,
          job_apply_link: jobData.job_apply_link || null,
          job_description: jobData.job_description || null,
          job_is_remote: jobData.job_is_remote === 'true',
          job_posted_at_datetime_utc:
            jobData.job_posted_at_datetime_utc || null,
          job_location: jobData.job_location || null,
          job_highlights_qualifications:
            jobData.job_highlights?.Qualifications?.join(', ') || null,
          job_highlights_responsibilities:
            jobData.job_highlights?.Responsibilities?.join(', ') || null,
          job_highlights_benefits:
            jobData.job_highlights?.Benefits?.join(', ') || null,
          status: 'applied',
          isApplied: true,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking as applied:', error);
    throw error;
  }
}

export async function getAppliedJobs() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const appliedJobs = await db.job.findMany({
      where: {
        userId: session.user.id,
        isApplied: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return appliedJobs.map((job) => ({
      employer_name: job.employer_name,
      employer_website: job.employer_website || '',
      job_publisher: job.job_publisher || '',
      job_employment_type: job.job_employment_type || '',
      job_title: job.job_title,
      job_apply_link: job.job_apply_link || '',
      job_description: job.job_description || '',
      job_is_remote: job.job_is_remote ? 'true' : 'false',
      job_posted_human_readable: job.job_posted_at_datetime_utc || '',
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc || '',
      job_location: job.job_location || '',
      job_state: '',
      job_highlights: {
        Qualifications: job.job_highlights_qualifications?.split(', ') || [],
        Benefits: job.job_highlights_benefits?.split(', ') || [],
        Responsibilities:
          job.job_highlights_responsibilities?.split(', ') || [],
      },
    }));
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return [];
  }
}

export async function checkIsApplied(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const job = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
        isApplied: true,
      },
    });

    return !!job;
  } catch (error) {
    console.error('Error checking if applied:', error);
    return false;
  }
}

export async function removeFromApplied(jobData: Job) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const job = await db.job.findFirst({
      where: {
        userId: session.user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
      },
    });

    if (job) {
      if (job.isFavorite) {
        // If job is also favorited, just remove applied status
        await db.job.update({
          where: { id: job.id },
          data: {
            isApplied: false,
            status: 'favorited',
          },
        });
      } else {
        // If job is only applied, delete it
        await db.job.delete({
          where: { id: job.id },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from applied:', error);
    throw error;
  }
}

export async function clearApplied() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    await db.job.updateMany({
      where: {
        userId: session.user.id,
        isApplied: true,
      },
      data: {
        isApplied: false,
        status: 'saved',
      },
    });

    // Delete jobs that are only applied (not favorited)
    await db.job.deleteMany({
      where: {
        userId: session.user.id,
        isFavorite: false,
        isApplied: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing applied jobs:', error);
    throw error;
  }
}

export const findUniqueResumes = async () => {
  try {
    const session = await auth();
    const email = session?.user?.email ?? '';

    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const currentUser = await db.user.findUnique({
      where: { email },
      include: { resumes: true },
    });

    return currentUser?.resumes;
  } catch (error) {
    console.error('Error finding resume by ID:', error);
    throw error;
  }
};

interface UpdateResumeNameInput {
  resume_id: string;
  resume_name: string;
}

export const updateResumeName = async (input: UpdateResumeNameInput) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    if (!input.resume_name) {
      throw new Error('Resume name is required');
    }
    if (!input.resume_id) {
      throw new Error('Resume ID is required');
    }

    // First verify that the resume belongs to the authenticated user
    const resume = await db.resume.findUnique({
      where: { id: input.resume_id },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    if (resume.userId !== session.user.id) {
      throw new Error('You do not have permission to update this resume');
    }

    const updatedResumeName = await db.resume.update({
      where: { id: input.resume_id },
      data: {
        resume_name: input.resume_name,
      },
    });

    return updatedResumeName;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
