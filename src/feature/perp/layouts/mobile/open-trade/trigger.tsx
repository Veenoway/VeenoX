import { useGeneralContext } from "@/context";
import { triggerAlert } from "@/lib/toaster";

export const TriggerMobileTradeCreator = ({
  ordersLength,
}: {
  ordersLength: number;
}) => {
  const { setShowMobileTradeCreator, setTradeInfo, setShowActiveMobileOrders } =
    useGeneralContext();

  const handleClick = (isBuy: boolean) => {
    if (isBuy) setTradeInfo((prev) => ({ ...prev, side: "Buy" }));
    else setTradeInfo((prev) => ({ ...prev, side: "Sell" }));
    setShowMobileTradeCreator(true);
  };
  return (
    <div className="fixed left-0 w-full p-2 bottom-0 z-[100] md:hidden bg-secondary border-t border-borderColor flex items-center justify-center">
      <button
        className="border border-borderColor-DARK rounded h-[35px] w-1/3 px-2 text-white bg-terciary text-xs mr-2"
        onClick={() => {
          if (ordersLength > 0) setShowActiveMobileOrders(true);
          else triggerAlert("Error", "No orders detected.");
        }}
      >
        Orders ({ordersLength})
      </button>
      <button
        className="border border-borderColor-DARK rounded h-[35px] w-1/3 px-2 text-white bg-green text-xs"
        onClick={() => handleClick(true)}
      >
        Long
      </button>
      <button
        className="border border-borderColor-DARK rounded h-[35px] w-1/3 px-2 text-white bg-red text-xs ml-2"
        onClick={() => handleClick(false)}
      >
        Short
      </button>
    </div>
  );
};
