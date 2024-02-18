"use client";

import { useState, useEffect } from "react";

import useSignInModal from "@/app/hooks/useSignInModal";

import { useDiditAuth } from "didit-sdk";
import Modal from "./Modal";
import LoginButtons from "../auth/LoginButtons";
import { useSession, signIn, signOut } from "next-auth/react";

const RegisterModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  const registerModal = useSignInModal();

  const { isAuthenticated, logout, accessToken } = useDiditAuth();

  useEffect(() => {
    (async () => {
      if (!session && accessToken && !isLoadingSession && !isAuthenticated) {
        const result = await signIn("credentials", {
          token: accessToken,
          redirect: true,
        });

        if (result?.error) {
          console.error("Error signing in with token:", result.error);
        } else {
          console.log("Logged in with session");
        }
      }
    })();
  }, [session, accessToken, isLoadingSession]);

  // New useEffect for handling delayed sign out condition
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if 2 seconds later, the user is still not authenticated but session exists
      if (!isLoadingSession && !isAuthenticated && session) {
        signOut();
      }
    }, 5000); // Set the timeout to 5 seconds

    return () => clearTimeout(timer); // Cleanup timeout on component unmount or re-render
  }, [isLoadingSession, isAuthenticated, session]);

  const handleLogout = async () => {
    await logout();

    // wait 2 seconds to sign out
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await signOut();
  };

  if (isLoadingSession) return <div>Loading...</div>;

  const bodyContent = (
    <div className="flex flex-col gap-4 items-center p-4 bg-white">
      <LoginButtons currentUser={null} />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div className="text-neutral-500 text-center mt-4 font-light">
        <div className="flex flex-row items-center justify-center gap-2">
          {isAuthenticated ? (
            <button
              className="flex text-neutral-500 hover:text-neutral-600"
              onClick={() => {
                handleLogout();
                registerModal.onClose();
              }}
            >
              Sign out
            </button>
          ) : (
            <p className="flex text-neutral-500 hover:text-neutral-600">
              Powered by Didit
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="User"
      actionLabel=""
      onClose={registerModal.onClose}
      onSubmit={() => {}} // This is a dummy function
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
