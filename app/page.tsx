import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const Home = async () => {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>Welcome back, {session.user.name}!</h1>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Welcome to the Lazy Girl Job Tracker</h1>

      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>

      <div></div>
    </div>
  );
};

export default Home;
