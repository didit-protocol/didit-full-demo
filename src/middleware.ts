// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

// Exclude API routes, auth pages, and Next.js special routes from middleware
export const config = {
  matcher: [
    // Only protect these specific routes that need authentication
    // Everything else is public
    "/((?!api/|_next/|static/|.*\\..*|favicon.ico|signin|register|callback).*)",
  ],
};
