import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/db';

// GET - Fetch user's favorite jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const favoriteJobs = await db.job.findMany({
      where: {
        userId: user.id,
        isFavorite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ favorites: favoriteJobs });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a job to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobData = await request.json();

    // Check if job already exists
    const existingJob = await db.job.findFirst({
      where: {
        userId: user.id,
        job_title: jobData.job_title,
        employer_name: jobData.employer_name,
        job_location: jobData.job_location,
      },
    });

    let job;
    if (existingJob) {
      // Update existing job to be favorited
      job = await db.job.update({
        where: { id: existingJob.id },
        data: { isFavorite: true },
      });
    } else {
      // Create new job entry
      job = await db.job.create({
        data: {
          userId: user.id,
          employer_name: jobData.employer_name,
          employer_website: jobData.employer_website,
          job_publisher: jobData.job_publisher,
          job_employment_type: jobData.job_employment_type,
          job_title: jobData.job_title,
          job_apply_link: jobData.job_apply_link,
          job_description: jobData.job_description,
          job_is_remote: jobData.job_is_remote || false,
          job_posted_at_datetime_utc: jobData.job_posted_at_datetime_utc,
          job_location: jobData.job_location,
          job_highlights_qualifications: Array.isArray(
            jobData.job_highlights?.Qualifications
          )
            ? jobData.job_highlights.Qualifications.join(', ')
            : jobData.job_highlights?.Qualifications || '',
          job_highlights_responsibilities: Array.isArray(
            jobData.job_highlights?.Responsibilities
          )
            ? jobData.job_highlights.Responsibilities.join(', ')
            : jobData.job_highlights?.Responsibilities || '',
          job_highlights_benefits: Array.isArray(
            jobData.job_highlights?.Benefits
          )
            ? jobData.job_highlights.Benefits.join(', ')
            : jobData.job_highlights?.Benefits || '',
          isFavorite: true,
          status: 'saved',
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a job from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Find the job by the unique identifier (title + employer + location)
    const [employer_name, job_title, job_location] = jobId
      .split('-')
      .map((part) => part.replace(/-/g, ' '));

    const job = await db.job.findFirst({
      where: {
        userId: user.id,
        job_title: { contains: job_title, mode: 'insensitive' },
        employer_name: { contains: employer_name, mode: 'insensitive' },
        job_location: { contains: job_location, mode: 'insensitive' },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If job is also applied, just remove favorite flag
    if (job.isApplied) {
      await db.job.update({
        where: { id: job.id },
        data: { isFavorite: false },
      });
    } else {
      // If job is only favorited, delete the entire record
      await db.job.delete({
        where: { id: job.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
