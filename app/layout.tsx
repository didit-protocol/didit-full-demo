import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import Navbar from "./components/navbar/Navbar";
import ToasterProvider from "./providers/ToasterProvider";
import getCurrentUser from "./actions/getCurrentUser";
import DiditProviderComponent from "./components/auth";
import { UserProvider } from "./contexts/UserContext";
import { NextAuthProvider } from "./contexts/SessionContext";
import SignInModal from "./components/modals/SignInModal";
import PaymentModal from "./components/modals/PaymentModal";
import VerificationModal from "./components/modals/VerificationModal";
import { AugmentedUser } from "./types";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Didit Demo App",
  description:
    "Didit Demo App that integrates Didit Auth and Didit Verification on Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={nunito.className}>
        <NextAuthProvider>
          <DiditProviderComponent>
            <UserProvider>
              <Navbar currentUser={currentUser} />
              <SignInModal />
              <PaymentModal currentUser={currentUser} />
              <VerificationModal currentUser={currentUser as AugmentedUser} />
              <ToasterProvider />
              <div className="pt-20 md:pt-28 pb-20">{children}</div>
            </UserProvider>
          </DiditProviderComponent>
        </NextAuthProvider>
      </body>
    </html>
  );
}
