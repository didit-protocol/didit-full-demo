import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prismaDB from "@/app/libs/prismaDb";
import { introspectToken, getUserInfoBySub } from "@/app/libs/introspect";

import "next-auth";

declare module "next-auth" {
  // This augments the User type provided by NextAuth.js
  interface ExtendedUser {
    /** Add custom properties here */
    id?: string;
  }

  interface Session {
    user: ExtendedUser;
    accessToken: string;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaDB),
  providers: [
    CredentialsProvider({
      name: "token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          throw new Error("Invalid credentials");
        }

        const sub = await introspectToken(credentials.token);

        if (!sub) {
          throw new Error("Invalid token");
        }

        const user = await getUserInfoBySub(sub);

        if (!user) {
          throw new Error("Invalid user");
        }

        // Optionally log the user object returned from getUserInfoByEmail

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  // Enable debug logs in development mode
  debug: process.env.NODE_ENV === "development",

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Keep your existing jwt callback
    jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    // Add or modify session callback to include custom data in the session
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.userId,
      } as any;
      return session;
    },
  },
};

export default NextAuth(authOptions);
