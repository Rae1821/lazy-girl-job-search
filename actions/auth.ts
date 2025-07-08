'use server';

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Modality,
} from '@google/genai';
import { auth } from '@/auth';
import db from '@/db';
import { Job } from '@/app/job-search/columns';

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
}

// export async function compareResume(userInput: UserInput) {
//   try {
//     const response = await fetch('/api/compare-resume', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(userInput),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to analyze resume');
//     }

//     const result = await response.json();
//     console.log(result);
//     return result;
//   } catch (error) {
//     console.error('Error comparing resume:', error);
//     throw error;
//   }
// }

export const generateComparison = async (userInput: UserInput) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `You are an application tracking system (ATS) that evaluates resumes against job descriptions.
      You will receive a resume and a job description. Your task is to analyze the resume and
      provide a detailed comparison, highlighting the strengths and weaknesses of the resume
      in relation to the job description. Focus on key skills, qualifications, and experiences that match
      the requirements of the job. Provide a score from 0 to 100, where 0 means no match and 100 means a perfect match.
      
      Resume: ${userInput.resume}
      
      Job Description: ${userInput.jobDescription}
      
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
  return {
    success: true,
    analysis: analysisText,
  };
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
