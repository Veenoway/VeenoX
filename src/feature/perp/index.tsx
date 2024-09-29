"use client";
import { useGeneralContext } from "@/context";
import { useResizer } from "@/hook/useResizer";
import { EnableTrading } from "@/layouts/enable-trading";
import { MaintenanceStatusModal } from "@/modals/maintenance";
import { FavoriteProps, FuturesAssetProps } from "@/models";
import {
  useHoldingStream,
  useMarkets,
  useOrderStream,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { Favorites } from "./layouts/favorites";
import { MobileOpenTrade } from "./layouts/mobile-open-trade";
import { MobilePnL } from "./layouts/mobile-pnl";
import { MobileSectionSelector } from "./layouts/mobile-section-selector";
import { OpenTrade } from "./layouts/open-trade";
import { Orderbook } from "./layouts/orderbook";
import { Position } from "./layouts/position";
import { TokenInfo } from "./layouts/token-info";

const TradingViewChart = dynamic(() => import("./layouts/chart"), {
  ssr: false,
});

type PerpProps = {
  asset: FuturesAssetProps;
};
enum MarketsType {
  FAVORITES = 0,
  RECENT = 1,
  ALL = 2,
}

export const Perp = ({ asset }: PerpProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { mobileActiveSection } = useGeneralContext();
  const rowUpRef = useRef<HTMLDivElement>(null);
  const { usdc } = useHoldingStream();
  const orderbookRef = useRef<HTMLDivElement>(null);
  const useParam = useParams();
  const [orders, { cancelOrder, refresh, updateOrder }] = useOrderStream(
    {},
    {
      keeplive: true,
    }
  );

  const [
    data,
    {
      addToHistory,
      favoriteTabs,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
    },
  ]: any = useMarkets(MarketsType.ALL);

  const {
    colWidths,
    topHeightPx,
    widths,
    resizerRef,
    handleMouseDown,
    handleMouse,
    handleLastBoxResize,
  } = useResizer({
    initialColWidths: [8, 2],
    initialTopHeight: Math.round(window.innerHeight * 0.7),
    containerRef,
    chartRef,
  });

  const params = {
    addToHistory,
    data,
    favoriteTabs,
    updateFavoriteTabs,
    updateSymbolFavoriteState,
  };

  return (
    <div ref={containerRef} className="container w-full max-w-full pb-[35px]">
      <EnableTrading />
      <div className="w-full flex h-full">
        <div
          style={{
            width: window.innerWidth > 1168 ? `${widths[0]}%` : "100%",
          }}
        >
          <div
            ref={rowUpRef}
            className="relative w-full  border-b border-borderColor topPane md:flex-grow "
            style={{
              height: `${
                window.innerWidth < 1168 ? "auto" : `${topHeightPx}px`
              }`,
              minHeight: `${window.innerWidth < 1168 ? "auto" : "20vh"}`,
              zIndex: 1,
            }}
          >
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: colWidths.map((w) => `${w}fr`).join(" "),
              }}
            >
              <div
                className="border-r border-borderColor no-scrollbar md:min-w-[400px] lg:min-w-[700px]"
                ref={chartRef}
              >
                {!mobileActiveSection ? (
                  <>
                    <Favorites props={params as FavoriteProps as never} />
                    <div
                      className="overflow-x-hidden w-full no-scrollbar"
                      style={{
                        height: "calc(100% - 41px)",
                      }}
                    >
                      <TokenInfo params={params} asset={asset} />
                      <MobilePnL />
                      <MobileSectionSelector />
                      <TradingViewChart
                        params={useParam}
                        asset={asset}
                        className={""}
                        refresh={refresh}
                        orders={orders as API.Order[]}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <TokenInfo params={params} asset={asset} />
                    <MobilePnL />
                    <MobileSectionSelector />
                    <div
                      className={`${
                        mobileActiveSection === "Chart" || !mobileActiveSection
                          ? "block"
                          : "hidden"
                      } bg-green`}
                    >
                      <TradingViewChart
                        params={useParam}
                        asset={asset}
                        className={""}
                        refresh={refresh}
                        orders={orders as API.Order[]}
                      />
                    </div>
                    <div
                      className={`${
                        mobileActiveSection !== "Chart" ? "block" : "hidden"
                      }`}
                    >
                      <Orderbook asset={asset} isMobile />
                    </div>
                  </>
                )}
              </div>
              <div
                className="hidden md:block h-full relative border-r border-borderColor"
                ref={orderbookRef}
              >
                <Orderbook asset={asset} />{" "}
                {window.innerWidth >= 1268 &&
                  colWidths.slice(0, -1).map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 w-[10px] resizer z-10"
                      style={{
                        left: "0%",
                      }}
                      onMouseDown={(e) => handleMouseDown(index, e)}
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className="border-r border-borderColor">
            <div
              className="resizerY hidden md:flex"
              onMouseDown={handleMouse}
            />
            <div className=" w-full min-h-[350px] h-[350px] ">
              <div className="no-scrollbar">
                <Position
                  asset={asset}
                  orders={orders as API.Order[]}
                  refresh={refresh}
                  cancelOrder={cancelOrder}
                  updateOrder={updateOrder}
                />
              </div>
            </div>{" "}
          </div>
        </div>

        <div
          style={{ width: `${widths[1]}%` }}
          className="hidden md:block h-full min-w-[300px] max-w-[500px] relative min-h-screen "
        >
          {window.innerWidth >= 1268 && (
            <div
              className="resizer hidden md:flex"
              style={{ left: 0 }}
              ref={resizerRef}
              onMouseDown={(e) => handleLastBoxResize(e)}
            />
          )}
          <OpenTrade asset={asset} holding={usdc?.holding} refresh={refresh} />
        </div>
      </div>
      <div className="flex items-center justify-center lg:hidden h-screen w-screen fixed top-0 bg-[rgba(0,0,0,0.4)] z-[120]">
        <div className="bg-secondary border border-borderColor rounded p-2.5 px-4">
          <p className="text-white font-bold text-base text-center">
            Mobile version isn&apos;t ready yet. <br />
            Come back later!
          </p>{" "}
        </div>
      </div>
      <MaintenanceStatusModal />
      <MobileOpenTrade asset={asset} holding={usdc?.holding} />
    </div>
  );
};
