import { useGeneralContext } from "@/context";
import { Drawer, DrawerContent } from "@/lib/shadcn/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/shadcn/tooltip";
import { triggerAlert } from "@/lib/toaster";
import { Leverage } from "@/modals/leverage";
import { getFormattedAmount } from "@/utils/misc";
import {
  useAccount,
  useAccountInstance,
  useCollateral,
  usePositionStream,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useConnectWallet } from "@web3-onboard/react";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdRefresh } from "react-icons/md";
import { Oval } from "react-loader-spinner";

type MobileOpenTradeProps = {
  orders: API.PositionTPSLExt[];
  refresh: import("swr/_internal").KeyedMutator<API.PositionInfo>;
};

export const MobileOrdersDrawer = ({
  orders,
  refresh,
}: MobileOpenTradeProps) => {
  const { setShowAccountMobile, showAccountMobile } = useGeneralContext();
  const accountInstance = useAccountInstance();
  const [isSettleLoading, setIsSettleLoading] = useState(false);
  const { state } = useAccount();
  const [_, connectWallet] = useConnectWallet();
  const {
    isDeposit,
    setIsDeposit,
    openWithdraw,
    setOpenWithdraw,
    setDepositAmount,
    setIsEnableTradingModalOpen,
    depositAmount,
  } = useGeneralContext();
  const [data, _info, { refresh: refreshPosition, loading }] =
    usePositionStream(undefined, {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      refreshWhenHidden: true,
      refreshWhenOffline: true,
      revalidateIfStale: true,
      dedupingInterval: 0,
    });

  const { totalValue, unsettledPnL, accountInfo } = useCollateral({
    dp: 2,
  });

  return (
    <>
      <Drawer open={showAccountMobile}>
        <DrawerContent close={() => setShowAccountMobile(false)}>
          <div
            className={` h-fit w-full md:w-[350px] border-t border-borderColor max-h-[50vh] overflow-y-scroll no-scrollbar bg-secondary p-5 
              z-[100] text-white left-0 transition-all duration-200 ease-in-out shadow-2xl`}
          >
            <p className="mb-5 text-base text-center">VeenoX account</p>
            <div className="flex-col ">
              <div
                className={`overflow-hidden h-full transition-all duration-200 ease-in-out`}
              >
                <div className="flex items-center justify-between pb-3">
                  <div className="flex flex-col">
                    <p className="text-xs text-font-60 mb-[3px]">Total Value</p>
                    <div
                      className={`text-base flex items-center font-medium ${
                        depositAmount
                          ? "animate-pulse text-base_color"
                          : " text-white"
                      } transition-opacity duration-1000 ease-in-out`}
                    >
                      {depositAmount ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-base_color text-sm mr-2" />
                      ) : null}
                      {totalValue} {data.aggregated.unrealizedPnl}{" "}
                      <span className="text-font-60 ml-1">USDC</span>
                    </div>{" "}
                  </div>
                  <Leverage />
                </div>
                <div className="flex items-center justify-between ">
                  <div className="flex flex-col w-fit">
                    <p className="text-xs text-font-60 mb-[3px]">Unreal PnL</p>
                    <p
                      className={`text-sm font-medium ${
                        data?.aggregated.unrealPnL > 0
                          ? "text-green"
                          : data?.aggregated.unrealPnL < 0
                          ? "text-red"
                          : "text-white"
                      }`}
                    >
                      {data?.aggregated.unrealPnL
                        ? (data?.aggregated.unrealPnL).toFixed(2)
                        : data?.aggregated.unrealPnL}{" "}
                      ({data?.aggregated.unrealPnlROI.toFixed(2)}
                      %)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-font-60 mb-[3px]">
                      Unsettled PnL
                    </p>
                    <div
                      className={`text-sm font-medium text-end flex items-center justify-end `}
                    >
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                if (unsettledPnL !== 0 && accountInstance) {
                                  setIsSettleLoading(true);
                                  accountInstance
                                    ?.settle()
                                    .then((e) => {
                                      setIsSettleLoading(false);
                                      triggerAlert(
                                        "Success",
                                        "Settlement completed."
                                      );
                                    })
                                    .catch((e) => {
                                      setIsSettleLoading(false);
                                      triggerAlert(
                                        "Error",
                                        "Settlement has failed."
                                      );
                                    });
                                }
                              }}
                              className={`${
                                unsettledPnL !== 0
                                  ? ""
                                  : "opacity-40 pointer-events-none"
                              } flex items-center text-sm text-white transition-all duration-100 ease-in-out`}
                            >
                              {isSettleLoading ? (
                                <Oval
                                  visible={true}
                                  height="13"
                                  width="13"
                                  color="#FFF"
                                  secondaryColor="rgba(255,255,255,0.6)"
                                  ariaLabel="oval-loading"
                                  strokeWidth={6}
                                  strokeWidthSecondary={6}
                                  wrapperStyle={{
                                    marginRight: "5px",
                                  }}
                                  wrapperClass=""
                                />
                              ) : (
                                <MdRefresh className="text-base mr-[5px]" />
                              )}
                              <span
                                className={`${
                                  unsettledPnL > 0
                                    ? "text-green"
                                    : unsettledPnL < 0
                                    ? "text-red"
                                    : "text-white"
                                }`}
                              >
                                {getFormattedAmount(unsettledPnL)}{" "}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="h-fit overflow-clip text-white max-w-[150px] w-full text-start p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
                          >
                            Settlement will take up to 1 minute before you can
                            withdraw your available balance.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>{" "}
              </div>
              <div className="flex items-center w-full mt-5">
                <button
                  className="border border-base_color rounded-md px-3 mr-1.5 h-[35px] w-1/2 text-white text-sm"
                  onClick={async () => {
                    if (state.status >= 5) {
                      setOpenWithdraw(true);
                      setIsDeposit(false);
                    } else if (state.status >= 2)
                      setIsEnableTradingModalOpen(true);
                    else await connectWallet();
                  }}
                >
                  Withdraw
                </button>
                <button
                  className="bg-base_color border border-borderColor rounded-md w-1/2 px-3 ml-1.5 h-[35px] text-white text-sm"
                  onClick={async () => {
                    if (state.status >= 5) {
                      setOpenWithdraw(true);
                      setIsDeposit(true);
                    } else if (state.status >= 2)
                      setIsEnableTradingModalOpen(true);
                    else await connectWallet();
                  }}
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
