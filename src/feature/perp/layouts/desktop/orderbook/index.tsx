import { Loader } from "@/components/loader";
import { useGeneralContext } from "@/context";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { FuturesAssetProps, TradeExtension } from "@/models";
import { cn } from "@/utils/cn";
import {
  formatSymbol,
  getFormattedAmount,
  getStyleFromDevice,
} from "@/utils/misc";
import {
  useMarketTradeStream,
  useOrderbookStream,
} from "@orderly.network/hooks";
import { useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { TradeSection } from "./trade-section";
1;
enum OrderbookSection {
  ORDERBOOK,
  TRADE_HISTORY,
}

type OrderbookProps = {
  asset: FuturesAssetProps;
  isMobile?: boolean;
  isMobileOpenTrade?: boolean;
};

type AsksBidsType = "asks" | "bids";

export const Orderbook = ({
  asset,
  isMobile = false,
  isMobileOpenTrade = false,
}: OrderbookProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { mobileActiveSection, setMobileActiveSection } = useGeneralContext();
  const [isQtyUSDC, setIsQtyUSDC] = useState(false);
  const [activeSection, setActiveSection] = useState(
    OrderbookSection.ORDERBOOK
  );

  const exepectedOrderbookLength =
    isMobileOpenTrade || isMobile
      ? 8
      : (sectionRef?.current?.clientHeight as number) > 950
      ? 18
      : (sectionRef?.current?.clientHeight as number) > 900
      ? 16
      : (sectionRef?.current?.clientHeight as number) > 800
      ? 14
      : 12;

  const [data, { onDepthChange, depth, allDepths }] = useOrderbookStream(
    asset?.symbol,
    undefined,
    {
      level: exepectedOrderbookLength,
      padding: false,
    }
  );

  function calculateSpread(data: any): {
    spread: number | undefined;
    spreadRatio: number | undefined;
  } {
    if (!data || data.bids.length === 0 || data.asks.length === 0) {
      return { spread: undefined, spreadRatio: undefined };
    }

    const bestBid = data.bids[0][0];
    const bestAsk = data.asks[0][0];

    if (bestBid === undefined || bestAsk === undefined) {
      return { spread: undefined, spreadRatio: undefined };
    }

    const spread = bestAsk - bestBid;
    const spreadPercentage = (spread / bestBid) * 100;
    const spreadRatio = spread / bestBid;

    return { spread: spreadPercentage, spreadRatio: spreadRatio };
  }

  const { spreadRatio } = calculateSpread(data);
  const spread = spreadRatio !== undefined ? spreadRatio.toFixed(4) : undefined;

  const getWidthFromVolume = (type: AsksBidsType): number[] => {
    const is_asks = type === "asks";
    const typeData = data[type];
    if (typeData) {
      const arr = [];
      const maxValue = typeData?.[is_asks ? 0 : typeData.length - 1]?.[3];
      for (let i = 0; i < typeData.length; i++) {
        const [, , , totalUSDC] = typeData[i];
        const widthPercentage = (totalUSDC / maxValue) * 100;
        arr.push(widthPercentage);
      }
      return arr;
    }
    return [];
  };
  const asksWidth = getWidthFromVolume("asks");
  const bidsWidth = getWidthFromVolume("bids");

  const { data: trades, isLoading: isTradesLoading } = useMarketTradeStream(
    asset?.symbol
  );

  function padOrderbook(
    orderbook: Array<[number | string, number | string, number | string]>,
    expectedLength: number
  ): Array<[string, string, string]> {
    const paddedOrderbook = [...orderbook];
    while (paddedOrderbook.length < expectedLength) {
      paddedOrderbook.push(["--", "--", "--"]);
    }
    return paddedOrderbook.map(
      (row) => row.map(String) as [string, string, string]
    );
  }

  function formatOrderbook(
    type: "bids" | "asks",
    affichageEnUSDC: boolean = false
  ) {
    const formattedData: [string | number, string | number, string | number][] =
      data?.[type]?.map(([price, sizeBTC, totalBTC, totalUSDC]) => {
        if (affichageEnUSDC) {
          const sizeUSDC = sizeBTC * price;
          return [
            price,
            getFormattedAmount(sizeUSDC) as string,
            getFormattedAmount(totalUSDC) as string,
          ];
        } else {
          return [
            price,
            getFormattedAmount(sizeBTC) as string,
            getFormattedAmount(totalBTC) as string,
          ];
        }
      }) || [];

    return padOrderbook(formattedData, exepectedOrderbookLength);
  }

  return (
    <section
      ref={sectionRef}
      className={`w-full md:max-h-full ${
        isMobileOpenTrade ? "h-auto max-h-full" : "h-[450px] max-h-[450px]"
      } md:h-full  overflow-y-hidden md:min-w-[230px]`}
    >
      {isMobileOpenTrade || isMobile ? null : (
        <>
          <div className="flex items-center w-full h-[44px] relative">
            <button
              className="w-1/2 h-full text-white text-[13px]"
              onClick={() => setActiveSection(OrderbookSection.ORDERBOOK)}
            >
              Orderbook
            </button>
            <button
              className="w-1/2 h-full text-white text-[13px]"
              onClick={() => setActiveSection(OrderbookSection.TRADE_HISTORY)}
            >
              Trade History
            </button>
          </div>
          <div className="bg-terciary h-[1px] w-full relative">
            <div
              className={`h-[1px] w-1/2 bottom-0 transition-all duration-200 ease-in-out bg-font-80 absolute ${
                !activeSection ? "left-0" : "left-1/2"
              }`}
            />
          </div>
        </>
      )}
      {activeSection === OrderbookSection.TRADE_HISTORY ? null : (
        <div className="flex items-center justify-between py-1.5">
          <Popover>
            <PopoverTrigger className="h-full min-w-fit">
              <button
                className="rounded text-[12px] flex items-center
             justify-center min-w-[50px] pl-1 text-white font-medium h-[24px] ml-1 w-fit"
              >
                {depth}
                <IoChevronDown className="text-white text-xs min-w-[18px] ml-[1px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={0}
              className="flex flex-col p-1.5 z-[102] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-xl"
            >
              {allDepths?.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (onDepthChange) onDepthChange(entry);
                  }}
                  className={`h-[22px] ${
                    depth === entry ? "text-base_color font-bold" : "text-white"
                  } w-fit px-1 text-xs`}
                >
                  {entry}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="h-full min-w-fit">
              <button
                className="rounded text-[12px] flex items-center
             justify-center min-w-[50px] pl-1 text-white font-medium h-[24px] ml-1 w-fit"
              >
                {isQtyUSDC ? "USDC" : formatSymbol(asset?.symbol, true)}
                <IoChevronDown className="text-white text-xs min-w-[18px] ml-[1px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={0}
              className="flex flex-col p-1.5 z-[102] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-xl"
            >
              {["USDC", formatSymbol(asset?.symbol, true)]?.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (entry === "USDC") setIsQtyUSDC(true);
                    else setIsQtyUSDC(false);
                  }}
                  className={`h-[22px] ${
                    (isQtyUSDC && entry === "USDC") ||
                    (!isQtyUSDC && entry !== "USDC")
                      ? "text-base_color font-bold"
                      : "text-white"
                  } w-fit px-1 text-xs`}
                >
                  {entry}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      )}
      {(activeSection === OrderbookSection.ORDERBOOK &&
        (mobileActiveSection === "Orderbook" || !mobileActiveSection)) ||
      isMobileOpenTrade ? (
        <div
          // max-h-[670px]  overflow-y-scroll
          className={`relative h-full md:h-calc-full-button ${
            isMobileOpenTrade ? "min-w-[140px] w-full" : "w-auto"
          }  sm:w-auto`}
        >
          {!data?.asks?.length && !data?.bids?.length ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <table className="w-full h-calc-full-market">
              <thead>
                <tr className="text-font-60 text-xs">
                  <th className="pl-2.5 text-start py-1 font-normal">Price</th>
                  {isMobileOpenTrade ? null : (
                    <th className="text-end font-normal pr-2.5">
                      Qty{" "}
                      {isQtyUSDC ? "USDC" : formatSymbol(asset?.symbol, true)}
                    </th>
                  )}
                  <th className="text-end font-normal pr-2.5">
                    Total{" "}
                    {isQtyUSDC ? "USDC" : formatSymbol(asset?.symbol, true)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(formatOrderbook("asks", isQtyUSDC) || [])?.map((ask, i) => {
                  return (
                    <tr
                      key={i}
                      className="text-font-80 text-xs relative my-0.5 h-fit"
                    >
                      {Array.from({ length: 3 }).map((_, j) => {
                        const className = getStyleFromDevice(j, "");
                        const value =
                          j === 0
                            ? ask[j]
                            : typeof ask[j] === "number"
                            ? getFormattedAmount(ask[j])
                            : ask[j];
                        if (isMobileOpenTrade && (j === 0 || j === 2))
                          return (
                            <td
                              key={j + className}
                              className={cn(
                                className,
                                `${j === 0 ? "text-red" : ""} relative`
                              )}
                            >
                              {value}
                            </td>
                          );
                        if (!isMobileOpenTrade)
                          return (
                            <td
                              key={j + className}
                              className={cn(
                                className,
                                `${j === 0 ? "text-red" : ""} relative ${
                                  j === 1 ? "pr-2.5" : ""
                                } relative`
                              )}
                            >
                              {j === 0 ? (
                                <div
                                  className="absolute left-0 flex md:hidden top-0 bg-red-opacity-10 z-0 rounded-r transition-all duration-150 ease-linear"
                                  style={{ width: `${bidsWidth[i]}%` }}
                                />
                              ) : null}
                              {value}
                            </td>
                          );
                      })}
                      <td
                        className="absolute rounded-r left-0 md:flex hidden md:h-[90%] top-[5%] bg-red-opacity-10 z-0 transition-all duration-150 ease-linear"
                        style={{ width: `${asksWidth[i]}%` }}
                      />
                    </tr>
                  );
                })}
                <tr>
                  <td
                    colSpan={4}
                    className="px-2.5 border-y border-borderColor-DARK bg-terciary"
                  >
                    <div className="whitespace-nowrap flex justify-between items-center">
                      <p className="text-sm text-white font-bold">
                        {getFormattedAmount(data?.middlePrice as any, true) ||
                          0}
                      </p>
                      <div className="flex items-center">
                        <span className="text-[13px] mr-2.5 text-white hidden sm:flex">
                          Spread
                        </span>
                        <span className="text-xs sm:text-[13px] text-white">
                          {spread}%
                        </span>{" "}
                      </div>
                    </div>
                  </td>
                </tr>
                {(formatOrderbook("bids", isQtyUSDC) || []).map((bid, i) => {
                  return (
                    <tr key={i} className="text-font-80 text-xs relative">
                      {Array.from({ length: 3 }).map((_, j) => {
                        const className = getStyleFromDevice(j, "");
                        const value =
                          j === 0
                            ? bid[j]
                            : typeof bid[j] === "number"
                            ? getFormattedAmount(bid[j])
                            : bid[j];
                        if (isMobileOpenTrade && (j === 0 || j === 2))
                          return (
                            <td
                              key={j + className}
                              className={cn(
                                className,
                                `${j === 0 ? "text-green" : ""} relative`
                              )}
                            >
                              {value}
                            </td>
                          );
                        if (!isMobileOpenTrade)
                          return (
                            <td
                              key={j + className}
                              className={cn(
                                className,
                                `${j === 0 ? "text-green" : ""} relative ${
                                  j === 1 ? "pr-2.5" : ""
                                } relative`
                              )}
                            >
                              {j === 0 ? (
                                <div
                                  className="absolute left-0 flex md:hidden top-0 bg-green-opacity-10 z-0 rounded-r transition-all duration-150 ease-linear"
                                  style={{ width: `${bidsWidth[i]}%` }}
                                />
                              ) : null}
                              {value}
                            </td>
                          );
                      })}
                      <div
                        className="absolute rounded-r left-0 h-[90%] hidden md:flex top-[5%] bg-green-opacity-10 z-0 transition-all duration-150 ease-linear"
                        style={{ width: `${bidsWidth[i]}%` }}
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <TradeSection
          asset={asset}
          trades={
            trades?.filter((e, i) =>
              (sectionRef?.current?.clientHeight as number) > 800
                ? i < 32
                : i < 28
            ) as TradeExtension[]
          }
          isLoading={isTradesLoading}
        />
      )}
    </section>
  );
};
