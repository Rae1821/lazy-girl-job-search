import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import db from '@/db';

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
        if (!user.email) return token;
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await db.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image || null, // Ensure image is optional
            },
          });
          token.id = newUser.id;
          token.image = newUser.image || null; // Ensure image is set
        } else {
          token.id = existingUser.id;
          token.image = existingUser.image || null; // Ensure image is set
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },

    redirect() {
      return '/';
    },
  },
});
