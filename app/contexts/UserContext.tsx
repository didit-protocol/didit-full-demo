"use client";

// contexts/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useDiditAuth } from "didit-sdk";
import { getSessionDecision } from "../services/session";
import { useSession } from "next-auth/react";

interface UserContextType {
  userData: any | null;
  resetUserData: () => void; // Add a function signature for resetting user data
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<any | null>(null);
  const { isAuthenticated, accessToken } = useDiditAuth();
  const { data: session } = useSession();

  const resetUserData = () => {
    setUserData(null); // Implement the reset functionality
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const response = await axios.get<any>(`/api/user`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUserData(response.data);

          if (response.data.isVerified || !response.data.lastVerification) {
            return;
          } else {
            // fetch user verification decision
            const decision = await getSessionDecision(
              response.data.lastVerification.id
            );

            // if decision is approved, update user data isVerified and verificationStatus
            if (decision.status === "Approved") {
              setUserData((prev: any) => ({
                ...(prev as any),
                isVerified: true,
                verificationStatus: "Approved",
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, accessToken]);

  return (
    <UserContext.Provider value={{ userData, resetUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Using the custom hook to access userData and resetUserData in a component

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }

  return context; // This now includes `resetUserData`
};
