"use client";

import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget, WidgetSkeleton } from "@lifi/widget";
import { useConnectWallet } from "@web3-onboard/react";
import Web3OnBoardProvider from "../web3onBoard/provider";
import { ClientOnly } from "./clientOnly";

export function Widget() {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const config = {
    variant: "wide",
    subvariant: "default",
    appearance: "dark",
    // hiddenUI: ["walletMenu"],
    fromChain: 137,
    toChain: 10,
    fromToken: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    toToken: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    theme: {
      palette: {
        primary: {
          main: "#7f5cff",
        },
        secondary: {
          main: "#FFFFF",
        },
        background: {
          default: "#1b1d22",
          paper: "#1f2226",
        },
        success: {
          main: "#0ecb81",
        },
        warning: {
          main: "#d8a600",
        },
        info: {
          main: "#836EF9",
        },
        error: {
          main: "#ec3943",
        },
      },
      typography: {
        fontFamily: "Inter, sans-serif",
      },
      container: {
        boxShadow: "0 0 0 1px #836EF9, 1px 2px 13px 3px #836ef969",
        borderRadius: "16px",
        borderColor: "#FFF",
      },
      shape: {
        borderRadius: 8,
        borderRadiusSecondary: 8,
        borderBottom: "#FFF",
      },
    },
    walletConfig: {
      async onConnect() {
        await connectWallet();
      },
    },
  } as Partial<WidgetConfig>;

  return (
    <main className="">
      <Web3OnBoardProvider>
        <ClientOnly fallback={<WidgetSkeleton config={config} />}>
          <LiFiWidget config={config} integrator="VeenoX" />
        </ClientOnly>{" "}
      </Web3OnBoardProvider>
    </main>
  );
}
