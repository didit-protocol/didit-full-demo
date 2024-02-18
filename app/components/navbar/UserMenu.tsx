"use client";

import { useCallback, useState } from "react";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";
import useSignInModal from "@/app/hooks/useSignInModal";
import { User } from "@prisma/client";
import { useDiditAuth } from "didit-sdk";
import { signOut } from "next-auth/react";
import usePaymentModal from "@/app/hooks/usePaymentModal";

interface UserMenuProps {
  currentUser: User | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useDiditAuth();

  const registerModal = useSignInModal();
  const paymentModal = usePaymentModal();

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    await logout();

    // wait 2 seconds to sign out
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await signOut();
  }, [logout]);

  return (
    <div className="relative text-right">
      {currentUser ? (
        <>
          <button
            onClick={toggleOpen}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out"
          >
            <Avatar src={currentUser?.image} />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200">
              <MenuItem
                onClick={() =>
                  window.open("https://profile.staging.didit.me/", "_blank")
                }
                label="Profile"
              />
              <MenuItem onClick={() => paymentModal.onOpen()} label="Wallet" />
              <hr className="my-1" />
              <MenuItem onClick={handleLogout} label="Logout" />
            </div>
          )}
        </>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={registerModal.onOpen}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition-colors duration-200 ease-in-out"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
