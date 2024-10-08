import { useGeneralContext } from "@/context";
import { Drawer, DrawerContent } from "@/lib/shadcn/drawer";
import { Switch } from "@/lib/shadcn/switch";
import { FuturesAssetProps, PositionStreamType } from "@/models";
import { API } from "@orderly.network/types";
import { useEffect, useRef, useState } from "react";
import { OpenTrade } from "../../desktop/open-trade";
import { Orderbook } from "../../desktop/orderbook";
import { TriggerMobileTradeCreator } from "./trigger";

type MobileOpenTradeProps = {
  asset: FuturesAssetProps;
  holding?: number;
  refresh: import("swr/_internal").KeyedMutator<any[]>;
  ordersLength: number;
  refreshPosition: import("swr/_internal").KeyedMutator<API.PositionInfo>;
  positions: PositionStreamType;
};

export const MobileOpenTrade = ({
  asset,
  holding,
  refresh,
  ordersLength,
  positions,
  refreshPosition,
}: MobileOpenTradeProps) => {
  const {
    showMobileTradeCreator,
    showActiveMobileOrders,
    setShowMobileTradeCreator,
  } = useGeneralContext();
  const tradeCreatorRef = useRef<HTMLDivElement>(null);
  const { tradeInfo } = useGeneralContext();
  const [position, setPosition] = useState("100%");

  useEffect(() => {
    if (showMobileTradeCreator) {
      const clientHeight = tradeCreatorRef?.current?.clientHeight || 0;
      setPosition(`calc(100vh - ${clientHeight}px)`);
    }
  }, [showMobileTradeCreator, tradeInfo.type, tradeInfo.tp_sl]);

  const [showOrderbook, setShowOrderbook] = useState(true);

  return (
    <>
      <Drawer open={showMobileTradeCreator}>
        <DrawerContent close={() => setShowMobileTradeCreator(false)}>
          <>
            <div
              ref={tradeCreatorRef}
              className={` h-fit w-full md:w-[350px] pb-4 z-[100] left-0  transition-all duration-200 ease-in-out bg-secondary border-t border-borderColor shadow-2xl flex flex-col`}
            >
              <div className="flex items-center justify-end w-full pr-2.5 pt-1.5">
                <Switch
                  checked={showOrderbook}
                  onCheckedChange={() => setShowOrderbook((prev) => !prev)}
                />
                <p className="text-white text-xs ml-2.5">
                  {showOrderbook ? "Hide" : "Show"} orderbook
                </p>
              </div>
              <div className="flex w-full h-full">
                <OpenTrade
                  asset={asset}
                  isMobile
                  holding={holding}
                  refresh={refresh}
                  positions={positions}
                  refreshPosition={refreshPosition}
                />
                {showOrderbook ? (
                  <Orderbook asset={asset} isMobileOpenTrade isMobile />
                ) : null}{" "}
              </div>
            </div>
          </>
        </DrawerContent>
      </Drawer>
      <div
        onClick={() => setShowMobileTradeCreator(false)}
        className={`fixed top-0 h-screen w-full z-[100] left-0 ${
          showMobileTradeCreator
            ? "opacity-20"
            : "opacity-0 pointer-events-none"
        } transition-all duration-200 ease-in-out bg-secondary z-30`}
      />

      {showMobileTradeCreator || showActiveMobileOrders ? null : (
        <TriggerMobileTradeCreator ordersLength={ordersLength} />
      )}
    </>
  );
};
