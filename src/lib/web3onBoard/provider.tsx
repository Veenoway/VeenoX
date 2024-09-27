"use client";
import { supportedChains } from "@/utils/network";
import injectedModule from "@web3-onboard/injected-wallets";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import React, { PropsWithChildren } from "react";

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: "https://veenox.xyz",
});

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: supportedChains.map(({ id, token, label, rpcUrl }) => ({
    id,
    token,
    label,
    rpcUrl,
  })),
  theme: {
    "--w3o-background-color": "#1B1D22",
    "--w3o-foreground-color": "#2b2f36e6",
    "--w3o-text-color": "#FFF",
    "--w3o-border-color": "rgba(140, 140, 140, 0.1)",
    "--w3o-action-color": "#836EF9",
    "--w3o-border-radius": "8px",
  },
  appMetadata: {
    name: "VeenoX",
    description: "VeenoX powered by Monad & Orderly Network",
    icon: "/veenox/v-icon.png",
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false },
  },
  connect: {
    autoConnectLastWallet: true,
  },
});

const Web3OnBoardProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  );
};

export default Web3OnBoardProvider;
