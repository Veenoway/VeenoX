"use client";
import { supportedChains } from "@/utils/network";
import injectedModule from "@web3-onboard/injected-wallets";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import React, { PropsWithChildren } from "react";

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: "5f4e967f02cf92c8db957c56e877e149",
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: "https://orderly-dex.pages.dev",
});

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: supportedChains.map(({ id, token, label, rpcUrl }) => ({
    id,
    token,
    label,
    rpcUrl,
  })),
  appMetadata: {
    name: "Orderly DEX",
    description: "Fully fledged example DEX using Orderly Network",
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
