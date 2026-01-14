"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Map NextAuth error codes to user-friendly messages
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    Configuration:
      "Server configuration error. Please check that NEXTAUTH_SECRET is set in your .env file.",
    AccessDenied: "Access denied. You don't have permission to sign in.",
    Verification: "The verification link has expired or has already been used.",
    OAuthSignin: "Error starting the sign in process.",
    OAuthCallback: "Error during the OAuth callback.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "Error during the callback.",
    OAuthAccountNotLinked:
      "This email is already associated with another account.",
    EmailSignin: "Error sending the email.",
    CredentialsSignin: "Invalid email or password. Please try again.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An error occurred during sign in.",
  };

  return errorMessages[error] || error || errorMessages.Default;
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL error parameter from NextAuth
  useEffect(() => {
    if (urlError) {
      setError(getErrorMessage(urlError));
    }
    if (registered === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [urlError, registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Client-side validation
    if (!userInfo.email.trim()) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!userInfo.password) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email: userInfo.email.trim().toLowerCase(),
        password: userInfo.password,
        redirect: false,
      });

      console.log("SignIn result:", res);

      if (res?.error) {
        // The error from NextAuth authorize function
        setError(getErrorMessage(res.error));
        setIsLoading(false);
      } else if (res?.ok) {
        // Login successful - redirect to home page
        // Use replace to avoid back button issues
        window.location.replace("/");
      } else {
        setError("Sign in failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        "Unable to connect to the server. Please check your internet connection and try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={userInfo.password}
              onChange={(e) =>
                setUserInfo({ ...userInfo, password: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
