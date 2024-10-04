import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/shadcn/tooltip";
import { FuturesAssetProps } from "@/models";
import {
  get24hChange,
  getFormattedAmount,
  getRemainingTime,
  getTokenPercentage,
} from "@/utils/misc";
import { useTickerStream } from "@orderly.network/hooks";

import { useEffect, useState } from "react";

export const TokenInfoMobile = ({ asset }: { asset: FuturesAssetProps }) => {
  const marketInfo = useTickerStream(asset?.symbol);

  const [lastPriceInfo, setLastPriceInfo] = useState({
    last_price: asset?.mark_price,
    price_color: "text-white",
  });

  const handleLastPriceUpdate = () => {
    if (marketInfo.mark_price > lastPriceInfo.last_price) {
      setLastPriceInfo((prev) => ({
        ...prev,
        price_color: "text-green",
      }));
      setTimeout(
        () =>
          setLastPriceInfo((prev) => ({
            ...prev,
            price_color: "text-white",
          })),
        1000
      );
    } else if (marketInfo.mark_price < lastPriceInfo.last_price) {
      setLastPriceInfo((prev) => ({
        ...prev,
        price_color: "text-red",
      }));
      setTimeout(
        () =>
          setLastPriceInfo((prev) => ({
            ...prev,
            price_color: "text-white",
          })),
        1000
      );
    }
  };

  useEffect(() => {
    if (!marketInfo?.mark_price) return;
    handleLastPriceUpdate();
    if (marketInfo?.mark_price !== lastPriceInfo.last_price) {
      setLastPriceInfo((prev) => ({
        ...prev,
        last_price: marketInfo?.mark_price,
      }));
    }
  }, [marketInfo]);

  const priceChange = get24hChange(
    marketInfo?.["24h_open"],
    marketInfo?.["24h_close"]
  );
  const fundingChange = get24hChange(
    marketInfo?.est_funding_rate,
    marketInfo?.last_funding_rate
  );

  const pred_funding_rate =
    ((marketInfo?.last_funding_rate + marketInfo?.est_funding_rate) / 2) *
      100 || 0;

  const getColorFromChangePercentage = (
    percentage: string,
    isTest: boolean
  ) => {
    if (percentage > "0") return "text-green";
    else if (percentage < "0") {
      return "text-red";
    } else "text-white";
  };
  const colorPriceChange = getColorFromChangePercentage(
    priceChange.formatPercentage,
    false
  );
  const colorFundingChange = getColorFromChangePercentage(
    JSON.stringify(pred_funding_rate),
    true
  );

  const [showMoreMobileInfo, setShowMoreMobileInfo] = useState(false);

  return (
    <div className={`flex md:hidden flex-col py-2.5 px-4`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-font-60">24h Change </p>
        <span className="text-xs flex items-center mt-1 text-font-60 font-medium">
          <p className={`${colorPriceChange} `}>
            {getFormattedAmount(priceChange.difference) || "0.00"}
          </p>
          <p className="mx-0.5">/</p>

          <p className={`${colorPriceChange}`}>
            {priceChange.formatPercentage || "0.00"}%
          </p>
        </span>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-font-60">
                <p className="underline">Mark price</p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="h-fit overflow-clip max-w-[220px] w-full p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
            >
              Used for margining, computing unrealized PnL, liquidations, and
              triggering TP/SL orders.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-xs mt-1 text-white font-medium">
          {marketInfo?.mark_price}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs text-font-60">Index price</p>
        <p className="text-xs mt-1 text-white font-medium">
          {marketInfo?.index_price}
        </p>
      </div>
      <div className="flex items-center justify-between mt-2.5 relative">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-font-60">
                <p className="underline">24h Volume</p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="h-fit overflow-clip w-[180px] p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
            >
              24 hour total trading volume on the Orderly Network.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="flex items-center mt-1">
          <img
            className="h-[13px] w-[13px] mr-1.5"
            src="/logo/orderly.svg"
            alt="Orderly Network logo"
          />
          <p className="text-xs  text-white font-medium">
            {getFormattedAmount(marketInfo?.["24h_amount"])}
          </p>
        </span>
      </div>
      <div className="flex items-center justify-between my-2.5">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-font-60">
                <p className="underline">Pred. funding rate</p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="h-fit overflow-clip max-w-[220px] w-full p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
            >
              The funding rate is the rate at which long positions pay short
              positions, or vice versa, to maintain balance between supply and
              demand in the derivatives market.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs box-border h-fit flex items-center mt-1 font-medium">
          <p className={colorFundingChange}>
            {getTokenPercentage(pred_funding_rate) || "0.00"}%
          </p>
          <p className="mx-0.5 text-font-60">/</p>
          <p className="text-white">
            {getRemainingTime(marketInfo?.next_funding_time) || "00:00:00"}
          </p>
        </span>
      </div>
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-font-60">
                <p className="underline">Open interest </p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="h-fit overflow-clip max-w-[220px] w-full p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
            >
              The total outstanding position of all users on this contract
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-xs mt-1 text-white">
          {getFormattedAmount(marketInfo?.open_interest)}
        </p>
      </div>
    </div>
  );
};
