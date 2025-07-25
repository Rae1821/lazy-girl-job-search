import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import { signIn } from '@/auth';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start"></div>
            <h1 className="text-2xl font-bold">Lazy Girl Job Tracker</h1>
          </div>
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input type="email" placeholder="Email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Input type="password" placeholder="Password" required />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full">
                  Login
                </Button>
                {/* <SignIn /> */}
                <form
                  action={async () => {
                    'use server';
                    await signIn('google');
                  }}
                >
                  <Button type="submit" className="w-full">
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Signin with Google
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>Don't have an account?</p>
            <a href="#" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
