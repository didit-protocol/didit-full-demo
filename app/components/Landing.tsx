"use client";

import { AugmentedUser } from "../types";
import useVerificationModal from "../hooks/useVerificationModal";
import { useEffect } from "react";
import { useUserData } from "../contexts/UserContext";

interface HomeProps {
  currentUser: AugmentedUser;
}

const UserInformation = ({ currentUser }: HomeProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mx-4 my-6 border border-gray-200">
      <div className="text-center">
        <img
          src={currentUser.image || "https://via.placeholder.com/150"}
          alt="User"
          className="w-24 h-24 mx-auto rounded-full object-cover"
        />
        <h2 className="text-2xl font-semibold mt-4">
          {currentUser.name} {currentUser.lastName}
        </h2>
        <p className="text-gray-500 mt-2">
          {currentUser.email ?? "No email provided"}
        </p>
        <div className="mt-4 py-2 px-4 bg-blue-100 inline-block rounded-full">
          {currentUser.isVerified ? "Verified" : "Not Verified"}
        </div>
      </div>
    </div>
  );
};

const VerificationSection = ({ currentUser }: HomeProps) => {
  const verificationModal = useVerificationModal();

  return (
    <div className="flex flex-col items-center p-8 bg-blue-600 text-white rounded-2xl shadow-xl mx-4 my-6">
      <h2 className="text-2xl font-semibold mb-4">Identity Verification</h2>
      <p>A secure process to verify your identity.</p>
      <p className="mt-2">
        {currentUser.isVerified
          ? "You are verified 😊"
          : "Please verify your identity to proceed 🚀"}
      </p>

      <button
        onClick={verificationModal.onOpen}
        className="mt-4 bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-4 rounded-full transition duration-200"
      >
        <span>
          {currentUser.isVerified ? "Open Verification" : "Start Verification"}
        </span>
      </button>
    </div>
  );
};

const Landing = ({ currentUser }: HomeProps) => {
  const { userData } = useUserData();

  // if userData.isVerified is true, then update currentUser.isVerified
  useEffect(() => {
    if (userData?.isVerified && !currentUser.isVerified) {
      currentUser.isVerified = true;

      // or redirect to the same page
      window.location.reload();
    }
  }, [userData]);

  return (
    <div className="bg-gray-50 flex flex-col justify-center">
      <div className="max-w-4xl bg-white mx-auto shadow-2xl rounded-3xl overflow-hidden">
        <div className="sm:flex">
          <UserInformation currentUser={currentUser} />
          <VerificationSection currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
