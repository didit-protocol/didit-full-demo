"use client";

import { useState } from "react";

import { useDiditAuth } from "didit-sdk";

import Modal from "./Modal";

import useVerificationModal from "@/app/hooks/useVerificationModal";

import { AugmentedUser } from "@/app/types";

import LoginButtons from "../auth/LoginButtons";

import { createSession } from "@/app/services/session";

interface SessionResponse {
  url: string;

  session_token: string;

  // ... any other properties that might be in the response
}

interface CheckinModalProps {
  currentUser: AugmentedUser | null;
}

const CheckinModal: React.FC<CheckinModalProps> = ({ currentUser }) => {
  const verificationModal = useVerificationModal(); // assume `useCheckinModal` provides `isOpen` and `onClose`

  const [isLoading, setIsLoading] = useState(false);

  const { accessToken } = useDiditAuth();

  const [verificationUrl, setVerificationUrl] = useState<string | undefined>();

  const [useIframe, setUseIframe] = useState(true);

  const feature = "OCR + FACE"; // "OCR + FACE" or "OCR + FACE + AML"

  const language = "en"; // "en" or "es"

  const vendor_data = currentUser?.id; // so you can filter by user ID

  const document_types = "P + ID"; // "P + ID" = Passport + ID Card

  const callback = "http://localhost:3000/";

  const handleCreateSession = async () => {
    setIsLoading(true);

    try {
      if (
        !currentUser?.lastVerification?.verificationStatus ||
        currentUser?.lastVerification?.verificationStatus === "Expired" ||
        !currentUser?.lastVerification?.verificationSessionUrl
      ) {
        if (!accessToken) {
          throw new Error("Invalid access token");
        }

        const response = (await createSession(
          feature,

          language,

          callback,

          vendor_data,

          document_types
        )) as unknown as SessionResponse;

        if (response === null) {
          setIsLoading(false);
        } else {
          const { url } = response;

          if (useIframe) {
            setVerificationUrl(url); // Set the URL to be embedded in the iframe
          } else {
            window.location.href = url; // Redirect to the session URL
          }
        }
      } else {
        const url = currentUser.lastVerification?.verificationSessionUrl;

        if (useIframe && url) {
          setVerificationUrl(url);
        } else if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseIframe(e.target.value === "iframe");
  };

  const bodyContent = (
    <div className="flex flex-col items-center px-8 py-2 space-y-2">
      {currentUser ? (
        <>
          {currentUser.isVerified ? (
            <p>
              You are verified 😊. Check the Business Console Verification
              section at https://business.staging.didit.me. Remember you only
              have 10 free verification for staging
            </p>
          ) : (
            <>
              {!verificationUrl && (
                <>
                  <p>
                    Verify your identity through a quick and secure process to
                    access our services.
                  </p>

                  <p>
                    Upon clicking Start Verification, an identity verification
                    session will be generated. You can either be directed to a
                    specific page or continue the process within an embedded
                    iframe.
                  </p>

                  <p>
                    Once completed, you will be redirected back to a
                    predetermined callback URL. Webhooks will notify us of every
                    state change during the verification process.
                  </p>

                  <div className="flex flex-row gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="redirect"
                        checked={!useIframe}
                        onChange={handleOptionChange}
                      />
                      Redirect
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="iframe"
                        checked={useIframe}
                        onChange={handleOptionChange}
                      />
                      Iframe
                    </label>
                  </div>
                </>
              )}

              {verificationUrl && useIframe && (
                <iframe src={verificationUrl} className="w-full h-[900px]" />
              )}
            </>
          )}
        </>
      ) : (
        <LoginButtons currentUser={currentUser} />
      )}
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />

      <div className="text-neutral-500 text-center mt-4 font-light">
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="flex text-neutral-500 hover:text-neutral-600">
            Powered by Didit
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={currentUser?.isVerified || isLoading}
      isOpen={verificationModal.isOpen}
      title="Identity Verification"
      actionLabel={
        currentUser?.isVerified
          ? "You're verified"
          : isLoading
          ? "Loading..."
          : verificationUrl
          ? ""
          : "Start Verification"
      }
      onClose={verificationModal.onClose}
      onSubmit={handleCreateSession}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default CheckinModal;
