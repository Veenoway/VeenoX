"use client";

import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget } from "@lifi/widget";
import { useConnectWallet } from "@web3-onboard/react";
import Image from "next/image";
import Web3OnBoardProvider from "../web3onBoard/provider";

export function Widget() {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const config = {
    variant: "wide",
    subvariant: "default",
    appearance: "dark",
    hiddenUI: ["walletMenu", "poweredBy"],
    fromChain: 137,
    toChain: 10,
    fee: 0.03,
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
        boxShadow:
          "0 0 0 1px rgba(200, 200, 200, 0.2), 1px 2px 12px 3px #453a847e",
        borderRadius: "15px",
        borderColor: "#FFF",
        minWidth: "440px",
        padding: "8px",
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
        {/* <ClientOnly fallback={<WidgetSkeleton config={config} />}> */}
        <div className="flex items-center justify-center mb-[50px]">
          <h1 className="text-white text-2xl mr-5">Powered by </h1>
          <Image
            src="/assets/lifi.png"
            alt="lifi logo"
            className="h-[35px]"
            height={35}
            width={85}
          />
        </div>
        <LiFiWidget config={config} integrator="VeenoX" />
        {/* </ClientOnly>{" "} */}
      </Web3OnBoardProvider>
    </main>
  );
}
