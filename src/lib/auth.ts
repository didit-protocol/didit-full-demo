import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials are provided
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter both email and password");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error("Please enter a valid email address");
        }

        // Try to fetch user from the database
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (dbError) {
          console.error("Database connection error during login:", dbError);
          throw new Error(
            "Unable to connect to database. Please try again later.",
          );
        }

        // Check if user exists
        if (!user) {
          throw new Error(
            "No account found with this email. Please register first.",
          );
        }

        // Check if user has a password (might be OAuth user)
        if (!user.password) {
          throw new Error(
            "This account was created with a different sign-in method.",
          );
        }

        // Compare hashed passwords
        let isValidPassword;
        try {
          isValidPassword = await compare(credentials.password, user.password);
        } catch (compareError) {
          console.error("Password comparison error:", compareError);
          throw new Error("Authentication failed. Please try again.");
        }

        if (!isValidPassword) {
          throw new Error("Incorrect password. Please try again.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        try {
          // Fetch the latest user data from the database
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true,
            },
          });

          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              name: user.name,
              email: user.email,
              isVerified: user.isVerified,
            };
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
          // Return session without updated user data rather than failing
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
