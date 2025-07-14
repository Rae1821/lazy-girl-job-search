import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const Home = async () => {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="bg-muted flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {session.user.name}!
        </h1>
        <Button asChild>
          <Link href="/dashboard" className="bg-teal-400">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-muted flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Welcome to the Lazy Girl Job Tracker
      </h1>

      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>

      <div></div>
    </div>
  );
};

export default Home;
