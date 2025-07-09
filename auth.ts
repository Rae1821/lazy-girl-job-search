import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import db from '@/db';

// // Validate required environment variables
// const requiredEnvVars = {
//   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
//   DATABASE_URL: process.env.DATABASE_URL,
// };

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          if (!user.email) {
            console.error('User email is missing');
            return token;
          }

          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            console.log('Creating new user:', user.email);
            const newUser = await db.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image || null,
              },
            });
            token.id = newUser.id;
            token.image = newUser.image || null;
          } else {
            console.log('Found existing user:', existingUser.email);
            token.id = existingUser.id;
            token.image = existingUser.image || null;
          }
        } catch (error) {
          console.error('Error in JWT callback:', error);
          // Return token without user data to prevent complete failure
          return token;
        }
      }
      return token;
    },
    session({ session, token }) {
      try {
        if (token.id) {
          session.user.id = token.id as string;
        }
        console.log('Session created for user:', session.user.email);
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },

    redirect() {
      return '/';
    },
  },
});
