"use client";

import "didit-sdk/styles.css";
import {
  DiditAuthMethod,
  DiditAuthProvider,
  getDefaultWallets,
} from "didit-sdk";

import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon, zora } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "",
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "cutsom id",
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const DiditProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <WagmiConfig
      config={wagmiConfig} // The one that was configured before for Wagmi
    >
      <DiditAuthProvider
        authBaseUrl={process.env.NEXT_PUBLIC_DIDIT_AUTH_BASE_URL || ""}
        authMethods={[
          DiditAuthMethod.GOOGLE,
          DiditAuthMethod.APPLE,
          DiditAuthMethod.WALLET,
        ]}
        clientId={process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID || ""}
        scope={process.env.NEXT_PUBLIC_DIDIT_SCOPE}
        claims={process.env.NEXT_PUBLIC_DIDIT_CLAIMS}
        redirectUri={process.env.NEXT_PUBLIC_DIDIT_REDIRECT_URI || ""}
        chains={chains}
        walletAuthBaseUrl="/api"
        tokenAuthorizationPath="/token"
        walletAuthorizationPath="/wallet-authorization"
      >
        {children}
      </DiditAuthProvider>
    </WagmiConfig>
  );
};

export default DiditProviderComponent;
