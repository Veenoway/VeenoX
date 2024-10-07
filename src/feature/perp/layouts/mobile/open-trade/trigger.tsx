import { useGeneralContext } from "@/context";

export const TriggerMobileTradeCreator = ({
  ordersLength,
}: {
  ordersLength: number;
}) => {
  const { setShowMobileTradeCreator, setTradeInfo, setShowAccountMobile } =
    useGeneralContext();

  const handleClick = (isBuy: boolean) => {
    if (isBuy) setTradeInfo((prev) => ({ ...prev, side: "Buy" }));
    else setTradeInfo((prev) => ({ ...prev, side: "Sell" }));
    setShowMobileTradeCreator(true);
  };
  return (
    <div className="fixed left-0 w-full p-2 bottom-0 z-[50] md:hidden bg-secondary border-t border-borderColor flex items-center justify-center">
      <button
        className="border border-borderColor-DARK rounded h-[35px] w-1/2 px-2 text-white bg-terciary text-xs mr-2"
        onClick={() => {
          setShowAccountMobile(true);
        }}
      >
        Account
      </button>

      <button
        className="border border-borderColor-DARK rounded h-[35px] w-1/2 px-2 text-white bg-base_color text-xs"
        onClick={() => handleClick(false)}
      >
        Long / Short
      </button>
    </div>
  );
};
