"use client";

import { DiditAuthMethod, DiditLoginButton } from "didit-sdk";
import IconApple from "@/app/components/icons/IconApple";
import IconGoogle from "@/app/components/icons/IconGoogle";
import IconMetamask from "@/app/components/icons/IconMetamask";
import { User } from "@prisma/client";
import { useDiditAuth } from "didit-sdk";

const socialLoginOptions = [
  {
    name: "Google",
    Icon: IconGoogle,
    width: 6,
    authMethod: DiditAuthMethod.GOOGLE,
  },
  {
    name: "Apple",
    Icon: IconApple,
    width: 6,
    authMethod: DiditAuthMethod.APPLE,
  },
];

const walletLoginOptions = [
  {
    name: "Wallet",
    Icon: IconMetamask,
    width: 6,
    authMethod: DiditAuthMethod.WALLET,
  },
];

interface LoginButtonsProps {
  currentUser: User | null;
}

const LoginButtons = ({ currentUser }: LoginButtonsProps) => {
  const { isAuthenticated, logout } = useDiditAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full md:w-2/3 px-4 md:px-0">
      <div className="text-center w-full">
        <h1 className="font-bold text-xl md:text-2xl text-neutral-800 mt-4 mb-2">
          Welcome back to Didit
        </h1>
        <p className="font-medium text-md md:text-md text-neutral-600 mb-4">
          Your trusted decentralized identity
        </p>
      </div>
      {!isAuthenticated ? (
        <>
          {socialLoginOptions.map((option) => (
            <div
              className="relative flex justify-center items-center w-full"
              key={option.name}
              style={{ height: "2.5rem" }} // Ensure parent div has a defined height if the button's height is dynamic
            >
              <DiditLoginButton
                label=""
                authMethod={option.authMethod}
                className="h-12 lg:h-16 w-full z-10 relative hover:bg-transparent hover:border-blue-500"
              />
              {/* Position the icon absolutely within the button */}
              <div
                className="absolute flex items-center justify-center"
                style={{ zIndex: 0 }}
              >
                <p className="text-neutral-600 text-sm md:text-md font-semibold">
                  {option.name}
                </p>
                <option.Icon className="h-6 w-6 ml-2" />
              </div>
              {/* Optionally, place label text for additional clarity */}
            </div>
          ))}

          {walletLoginOptions.map((option) => (
            <div
              className="relative flex justify-center items-center w-full"
              key={option.name}
              style={{ height: "2.5rem" }} // Ensure parent div has a defined height if the button's height is dynamic
            >
              <DiditLoginButton
                label=""
                authMethod={option.authMethod}
                className="h-12 lg:h-16 w-full z-10 relative hover:bg-transparent hover:border-blue-500"
              />
              {/* Position the icon absolutely within the button */}
              <div
                className="absolute flex items-center justify-center"
                style={{ zIndex: 0 }}
              >
                <p className="text-neutral-600 text-sm md:text-md font-semibold">
                  {option.name}
                </p>
                <option.Icon className="h-6 w-6 ml-2" />
              </div>
              {/* Optionally, place label text for additional clarity */}
            </div>
          ))}
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={handleLogout}
            className="w-full bg-neutral-100 text-neutral-800 font-semibold py-2 rounded-md hover:bg-neutral-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginButtons;
