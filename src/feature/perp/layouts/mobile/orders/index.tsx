import { useGeneralContext } from "@/context";
import { Drawer, DrawerContent } from "@/lib/shadcn/drawer";
import { FuturesAssetProps } from "@/models";
import { useEffect, useRef, useState } from "react";

type MobileOpenTradeProps = {
  asset: FuturesAssetProps;
  holding?: number;
  refresh: import("swr/_internal").KeyedMutator<any[]>;
};

export const MobileOrdersDrawer = ({
  asset,
  holding,
  refresh,
}: MobileOpenTradeProps) => {
  const { setShowActiveMobileOrders, showActiveMobileOrders } =
    useGeneralContext();
  const tradeCreatorRef = useRef<HTMLDivElement>(null);
  const { tradeInfo } = useGeneralContext();
  const [position, setPosition] = useState("100%");

  useEffect(() => {
    if (showActiveMobileOrders) {
      const clientHeight = tradeCreatorRef?.current?.clientHeight || 0;
      setPosition(`calc(100vh - ${clientHeight}px)`);
    }
  }, [showActiveMobileOrders, tradeInfo.type, tradeInfo.tp_sl]);
  return (
    <>
      <Drawer open={showActiveMobileOrders}>
        <DrawerContent close={() => setShowActiveMobileOrders(false)}>
          <div
            ref={tradeCreatorRef}
            className={` h-fit w-full md:w-[350px] z-[100] left-0  transition-all duration-200 ease-in-out bg-secondary border-t border-borderColor shadow-2xl flex`}
          ></div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
