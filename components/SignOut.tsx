'use server';

import { signOut } from '@/auth';
import React from 'react';
import { Button } from './ui/button';

const SignOut = () => {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <Button type="submit" className="w-full">
        Logout
      </Button>
    </form>
  );
};

export default SignOut;
