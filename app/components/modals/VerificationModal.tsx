"use client";

import { useState, useCallback } from "react";

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
          const { url, session_token } = response;

          // Redirect to the session URL
          window.location.href = url;
        }
      } else {
        // open the verificationSessionUrl in the same tab
        window.location.href =
          currentUser.lastVerification?.verificationSessionUrl;
      }
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      // Delay setting isLoading to false by 1 second
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
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
              <p>
                Verify your identity through a quick and secure process to
                access our services.
              </p>
              <p>
                Upon clicking Start Verification, an identity verification
                session will be generated. You can either be directed to a
                specific page or continue the process within an embedded iframe.
              </p>
              <p>
                Once completed, you will be redirected back to a predetermined
                callback URL. Webhooks will notify us of every state change
                during the verification process.
              </p>
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
