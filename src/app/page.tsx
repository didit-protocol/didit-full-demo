"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ExternalLink,
  RefreshCw,
  LogOut,
  Copy,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WebhookLogs from "@/components/webhook-logs";

export default function Home() {
  const { data: session, update } = useSession();
  const [verificationUrl, setVerificationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  const createVerificationSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isIframe }),
      });
      const data = await response.json();
      setVerificationUrl(data.url);
    } catch (error) {
      console.error("Error creating verification session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetVerification = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/reset-verification", {
        method: "POST",
      });
      if (response.ok) {
        setVerificationUrl("");
        await update(); // Refresh session
      }
    } catch (error) {
      console.error("Error resetting verification:", error);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      update();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [update]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">
                Welcome, {session?.user?.name || session?.user?.email}!
              </CardTitle>
              {session?.user?.isVerified !== undefined && (
                <Badge
                  variant={session.user.isVerified ? "default" : "outline"}
                  className="text-sm py-1 px-3"
                >
                  {session.user.isVerified ? "Verified" : "Not Verified"}
                </Badge>
              )}
            </div>
            <CardDescription>
              Manage your verification status and session here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show verified success message with reset option */}
            {session?.user?.isVerified && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">
                  Verification Complete!
                </AlertTitle>
                <AlertDescription className="text-green-600">
                  Your identity has been verified. To test webhooks again, reset
                  your verification status below.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Alert>
                <AlertTitle>Integration Options</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Choose the integration method that works best for your app:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Iframe:</strong> Keeps the user on your page. The
                      callback URL will be loaded within the iframe.
                    </li>
                    <li>
                      <strong>New Tab:</strong> Opens a new tab for
                      verification. The callback URL will redirect the user back
                      to your app in the new tab.
                    </li>
                  </ul>
                  <p className="mt-2">
                    Ensure your callback URL is set up to handle the
                    verification result and update the user&apos;s status
                    accordingly.
                  </p>
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="iframeToggle"
                  checked={isIframe}
                  onChange={(e) => setIsIframe(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-primary"
                />
                <label htmlFor="iframeToggle" className="text-sm">
                  Use iframe method
                </label>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                  {verificationUrl && (
                    <div className="w-full sm:w-2/3">
                      <Label
                        htmlFor="verification-url"
                        className="text-sm mb-1 block"
                      >
                        Verification URL:
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="verification-url"
                          value={verificationUrl}
                          readOnly
                          className="text-sm py-1"
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={copyToClipboard}
                                aria-label="Copy verification URL"
                              >
                                {copied ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copied ? "Copied!" : "Copy URL"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  window.open(verificationUrl, "_blank")
                                }
                                aria-label="Open verification URL in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open in new tab</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={createVerificationSession}
                    disabled={isLoading}
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {isLoading && (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {verificationUrl
                      ? "Create New Verification"
                      : "Create Verification Session"}
                  </Button>
                </div>
                {verificationUrl && (
                  <div className="space-y-4">
                    {isIframe ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full py-2 text-sm">
                            Open Verification Iframe
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh]">
                          <iframe
                            src={verificationUrl}
                            className="w-full h-full min-h-[600px]"
                            title="Verification Session"
                            allow="fullscreen; camera; microphone; autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        asChild
                        className="w-full py-2 text-sm"
                        variant="default"
                      >
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Verification in New Tab
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reset and Sign Out buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {session?.user?.isVerified && (
                <Button
                  onClick={resetVerification}
                  disabled={isResetting}
                  variant="outline"
                  className="w-full sm:w-auto py-2 text-sm"
                >
                  {isResetting ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Reset Verification (Test Again)
                </Button>
              )}
              <Button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                variant="secondary"
                className="w-full sm:flex-1 py-2 text-sm"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Logs Section */}
        <WebhookLogs />
      </div>
    </div>
  );
}
