import { signIn } from '@/auth';
import { Button } from './ui/button';
import { FcGoogle } from 'react-icons/fc';

const SignIn = () => {
  return (
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
  );
};

export default SignIn;
