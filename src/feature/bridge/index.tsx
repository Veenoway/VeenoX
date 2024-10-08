"use client";
import Web3OnBoardProvider from "@/lib/web3onBoard/provider";
import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget } from "@lifi/widget";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useRef, useState } from "react";

export const Bridge = () => {
  const [{ wallet }, connectWallet, disconnectWallet] = useConnectWallet();
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
    fee: 0.005,
    hiddenUI: ["walletMenu", "poweredBy"],
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
        boxShadow: "0 0 0 1px rgba(200, 200, 200, 0.15)",
        borderRadius: "8px",
        minWidth: "304px",
        zIndex: 0,
      },
      shape: {
        borderRadius: 4,
        borderRadiusSecondary: 4,
      },
    },
    walletConfig: {
      async onConnect() {
        await connectWallet();
      },
    },
  } as Partial<WidgetConfig>;

  return (
    <main className="bg-[url('/layer/d.jpg')] bg-cover bg-no-repeat">
      <div className="flex flex-col items-center h-[95vh] pt-[40px] sm:pt-[50px] relative">
        <Web3OnBoardProvider>
          {/* <div className="flex items-center w-full h-[64px] relative max-w-[300px] mx-auto">
          <button
            className={`w-1/2 h-full text-xl ${
              activeBridge === "LiFi" ? "text-white" : "text-font-60"
            }`}
            onClick={() => setActiveBridge("LiFi")}
          >
            LiFi
          </button>
          <button
            className={`w-1/2 h-full text-xl ${
              activeBridge === "Hyperlane" ? "text-white" : "text-font-60"
            }`}
            onClick={() => setActiveBridge("Hyperlane")}
          >
            Hyperlane
          </button>
        </div> 
          <div className="bg-terciary h-[2px] rounded w-full relative max-w-[300px] mx-auto">
          <div
            className={`h-[1px] w-1/2 bottom-0 transition-all duration-200 ease-in-out bg-font-80 absolute ${
              activeBridge === "LiFi" ? "left-0" : "left-1/2"
            }`}
          />
        </div>
        */}
          {/* <div className="flex items-center justify-center gap-3">
            {
              activeBridge === "LiFi" ? (
                <>
                  <h1 className="text-white text-2xl mt-[20px]">Powered by </h1>
                  <img
                    src="/assets/lifi.png"
                    alt="lifi logo"
                    className="h-[35px] mt-[20px]"
                    height={35}
                    width={85}
                  />
                </>
              ) : null
              // <Image
              //   src="/assets/hyperlane.svg"
              //   alt="lifi logo"
              //   className="h-[80px] mt-[30px]"
              //   height={100}
              //   width={150}
              // />
            }
          </div> */}

          <div className="relative w-[90%] mx-auto sm:min-w-[404px] sm:mx-0 sm:w-full max-w-[420px] h-[606px] md:mt-[40px] z-0">
            <div
              className={`absolute inset-0 transition-opacity max-w-[420px] duration-300 ${
                activeBridge === "LiFi" ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <LiFiWidget
                config={config}
                integrator={process.env.NEXT_PUBLIC_INTEGRATOR as string}
              />
            </div>
            {/* <div
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
              className="w-full h-full rounded-[8px] md:rounded-[8px] shadow-lg"
              onLoad={handleIframeLoad}
              style={{
                display: isHyperlaneLoading ? "none" : "block",
                boxShadow: "0 0 0 1px rgba(200, 200, 200, 0.15)",
              }}
            />
          </div> */}
          </div>
        </Web3OnBoardProvider>
      </div>
    </main>
  );
};
