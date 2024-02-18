"use client";

import { useState } from "react";

import { useDiditAuth } from "didit-sdk";
import Modal from "./Modal";
import usePaymentModal from "@/app/hooks/usePaymentModal";
import { User } from "@prisma/client";
import LoginButtons from "../auth/LoginButtons";

interface CheckinModalProps {
  currentUser: User | null;
}

const PaymentModal: React.FC<CheckinModalProps> = ({ currentUser }) => {
  const paymentModal = usePaymentModal(); // assume `usePaymentModal` provides `isOpen` and `onClose`

  const [isLoading, setIsLoading] = useState(false);
  const { accessToken } = useDiditAuth();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Specify window features for a smaller, non-full-sized window
      const windowFeatures = "width=400,height=700,left=200,top=200";

      // Open a new window with specified features; this does not guarantee it will be minimized but can be used to simulate a smaller "pop-up" style window
      window.open(
        "https://wallet-demo.staging.didit.me/",
        "_blank",
        windowFeatures
      );
    } catch (error) {
      console.error("Error opening payment page", error);
    } finally {
      // Delay setting isLoading to false
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const bodyContent = (
    <>
      {currentUser ? (
        <>
          <div className="flex flex-col items-center px-6 py-4 space-y-4 text-gray-800">
            <h2 className="text-xl font-semibold">Welcome to Didit Pay</h2>
            <p>
              Didit transforms your identity into a non-custodial wallet
              granting the prowess of an internet bank account, yet more potent.
            </p>
            <p>
              Facilitate direct peer-to-peer transactions, whether individual to
              individual or individual to merchant.
            </p>
            <p className="font-semibold">
              Get ready to unlock a seamless payment experience. Click below to
              access your wallet.
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow space-y-4">
          <p className="text-md text-gray-600">
            To access payments, please log in.
          </p>
          <LoginButtons currentUser={currentUser} />
        </div>
      )}
    </>
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
      disabled={isLoading}
      isOpen={paymentModal.isOpen}
      title="Didit Pay"
      actionLabel={isLoading ? "Loading..." : "Pay online"}
      secondaryActionLabel="Download App"
      secondaryAction={() => {
        // open app store link
        window.open("https://www.apple.com/app-store/", "_blank");
      }}
      onClose={paymentModal.onClose}
      onSubmit={handlePayment}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default PaymentModal;
