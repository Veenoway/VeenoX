"use client";
import { Loader } from "@/components/loader";
import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget } from "@lifi/widget";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useRef, useState } from "react";
import Web3OnBoardProvider from "../../lib/web3onBoard/provider";

export const Bridge = () => {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const [activeBridge, setActiveBridge] = useState("LiFi");
  const [isHyperlaneLoading, setIsHyperlaneLoading] = useState(true);
  const iframeRef = useRef(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (activeBridge === "Hyperlane" && !hasLoaded.current) {
      setIsHyperlaneLoading(true);
    }
  }, [activeBridge]);

  const handleIframeLoad = () => {
    setIsHyperlaneLoading(false);
    hasLoaded.current = true;
  };

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
        borderRadius: "30px",
        borderColor: "#FFF",
        minWidth: "404px",
        padding: "8px",
      },
      shape: {
        borderRadius: 12,
        borderRadiusSecondary: 12,
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
      <div className="flex flex-col items-center h-[95vh] pt-[100px] glowing-background relative">
        <Web3OnBoardProvider>
          <div className="flex items-center w-full h-[64px] relative max-w-[400px] mx-auto">
            <button
              className={`w-1/2 h-full text-2xl ${
                activeBridge === "LiFi" ? "text-white" : "text-font-60"
              }`}
              onClick={() => setActiveBridge("LiFi")}
            >
              LiFi
            </button>
            <button
              className={`w-1/2 h-full text-2xl ${
                activeBridge === "Hyperlane" ? "text-white" : "text-font-60"
              }`}
              onClick={() => setActiveBridge("Hyperlane")}
            >
              Hyperlane
            </button>
          </div>
          <div className="bg-terciary h-[2px] rounded w-full relative max-w-[400px] mx-auto">
            <div
              className={`h-[1px] w-1/2 bottom-0 transition-all duration-200 ease-in-out bg-font-80 absolute ${
                activeBridge === "LiFi" ? "left-0" : "left-1/2"
              }`}
            />
          </div>
          <div className="relative w-full max-w-[420px] h-[606px] mt-[50px]">
            <div
              className={`absolute inset-0 transition-opacity max-w-[420px] duration-300 ${
                activeBridge === "LiFi" ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <LiFiWidget config={config} integrator="VeenoX" />
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                activeBridge === "Hyperlane"
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
              }`}
            >
              {isHyperlaneLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary border border-borderColor rounded-[24px] md:rounded-[32px] shadow-lg">
                  <Loader />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src="https://9c48238032ba950c.demos.rollbridge.app/"
                title="Hyperlane"
                className="w-full h-full rounded-[24px] md:rounded-[32px] shadow-lg"
                onLoad={handleIframeLoad}
                style={{ display: isHyperlaneLoading ? "none" : "block" }}
              />
            </div>
          </div>
          {/* <div className="flex items-center justify-center ">
            {activeBridge === "LiFi" ? (
              <>
                <h1 className="text-white text-2xl mr-5 mt-[30px]">
                  Powered by{" "}
                </h1>
                <Image
                  src="/assets/lifi.png"
                  alt="lifi logo"
                  className="h-[35px] mt-[30px]"
                  height={35}
                  width={85}
                />
              </>
            ) : (
              <Image
                src="/assets/hyperlane.svg"
                alt="lifi logo"
                className="h-[80px] mt-[30px]"
                height={100}
                width={150}
              />
            )}
          </div> */}
        </Web3OnBoardProvider>
      </div>
    </main>
  );
};
