"use client";
import { useGeneralContext } from "@/context";
import { useCopyToClipboard } from "@/hook/useCopy";
import { LeverageContent } from "@/modals/leverage/leverage";
import { cn } from "@/utils/cn";
import {
  addressSlicer,
  getFormattedAmount,
  getFormattedDate,
} from "@/utils/misc";
import { chainsImage } from "@/utils/network";
import {
  useCollateral,
  useDaily,
  useHoldingStream,
  useAccount as useOrderlyAccount,
  usePrivateQuery,
  useWithdraw,
} from "@orderly.network/hooks";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineContentCopy } from "react-icons/md";
import { TimeSeriesChart } from "./components/chart";

const thStyle =
  "text-sm text-font-60 font-normal py-1.5 border-b border-borderColor-DARK text-end";
const tdStyle =
  "text-sm text-white font-normal py-3.5 border-b border-borderColor-DARK text-end";

type DepositWithdrawTx = {
  id: string;
  tx_id: `0x${string}`;
  side: "WITHDRAW" | "DEPOSIT";
  token: string;
  amount: number;
  fee: number;
  trans_status: string;
  created_time: number;
  updated_time: number;
  chain_id: string;
};

type QueryResult<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (...args: any[]) => Promise<T | undefined>;
};

type TransactionHistoryQueryResult = QueryResult<DepositWithdrawTx[]>;

export const Dashboard = () => {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const { state } = useOrderlyAccount();
  const { data: daily } = useDaily();
  const [activeSection, setActiveSection] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { setIsDeposit, setOpenWithdraw } = useGeneralContext();
  const [underlineStyle, setUnderlineStyle] = useState<{
    width: string;
    left: string;
  }>({ width: "20%", left: "0%" });
  const {
    totalCollateral,
    freeCollateral,
    totalValue,
    availableBalance,
    unsettledPnL,
  } = useCollateral({
    dp: 2,
  });

  const { copyToClipboard, isCopied, error: copyError } = useCopyToClipboard();
  const { usdc } = useHoldingStream();
  const {
    withdraw,
    isLoading: isWithdrawLoading,
    availableWithdraw,
  } = useWithdraw();

  const {
    data: history,
    isLoading,
    error,
  } = usePrivateQuery<TransactionHistoryQueryResult>("/v1/asset/history");

  useEffect(() => {
    const updateUnderline = () => {
      const button = buttonRefs.current[activeSection];
      if (button) {
        const { offsetWidth, offsetLeft } = button;
        setUnderlineStyle({
          width: `${offsetWidth}px`,
          left: `${offsetLeft}px`,
        });
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeSection]);

  return (
    <div className="w-full flex flex-col items-center text-white pt-[50px] pb-[100px] min-h-[90vh]">
      <div className="max-w-[1350px] w-[90%] ">
        <div className="flex items-center justify-between mb-5 ">
          <h1 className="text-2xl text-white font-semibold">Dashboard</h1>
          <div className="flex items-center w-fit justify-start">
            <button
              className="mr-4 h-[40px] px-2.5 rounded-full mx-auto text-base_color text-lg cursor-pointer border border-base_color"
              onClick={async () => {
                if (!wallet) await connectWallet();
                else {
                  setIsDeposit(false);
                  setOpenWithdraw(true);
                }
              }}
            >
              <div className="flex items-center justify-center w-full text-base h-full px-4 py-2">
                Withdraw
              </div>
            </button>
            <button
              onClick={async () => {
                if (!wallet) await connectWallet();
                else {
                  setIsDeposit(true);
                  setOpenWithdraw(true);
                }
              }}
              className="h-[40px] px-2.5 rounded-full mx-auto text-white text-lg mr-auto cursor-pointer bg-base_color"
            >
              <div className="flex items-center justify-center w-full text-base h-full px-4 py-2">
                Deposit
              </div>
            </button>
          </div>
        </div>
        <div className="flex gap-[2%]">
          <div className="w-[54%]">
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex flex-col ">
                  <p className="text-base mb-0.5 text-font-80">Total Value:</p>
                  <p className="text-2xl">{totalValue || 0}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="">
                    {wallet
                      ? addressSlicer(wallet?.accounts?.[0]?.address)
                      : "0x00..0000"}
                  </p>
                  <div
                    className="flex items-center cursor-pointer text-font-80"
                    onClick={() =>
                      copyToClipboard((state?.userId as string) || "")
                    }
                  >
                    <p>UID: {state.userId || "N/A"}</p>
                    {isCopied === state.userId ? (
                      <FaCheck className="ml-2 text-green" />
                    ) : (
                      <MdOutlineContentCopy className="ml-2" />
                    )}
                  </div>
                </div>{" "}
              </div>
              <div className="flex items-center justify-between gap-2.5 mt-5">
                <div className="flex h-[100px] w-full flex-col items-center px-2 py-2 justify-center rounded-xl bg-[#2b2f3649] border border-borderColor-DARK">
                  <p className="text-xs text-font-60 text-center">Coin</p>
                  <p className="text-lg text-center">{usdc?.token || "--"}</p>
                </div>
                <div className="flex h-[100px]  w-full flex-col items-center px-2 py-2 justify-center rounded-xl bg-[#2b2f3649] border border-borderColor-DARK">
                  <p className="text-xs text-font-60 text-center">Holding</p>
                  <p className="text-lg text-center">
                    {getFormattedAmount(usdc?.holding.toFixed(2)) || "--"}
                  </p>
                </div>
                <div className="flex h-[100px]  w-full flex-col items-center px-2 py-2 justify-center rounded-xl bg-[#2b2f3649] border border-borderColor-DARK">
                  <p className="text-xs text-font-60 text-center">
                    Avbl. Withdraw
                  </p>
                  <p className="text-lg text-center">
                    {availableWithdraw > 0
                      ? getFormattedAmount(availableWithdraw?.toFixed(2)) ||
                        "--"
                      : "0.00"}
                  </p>
                </div>
                <div className="flex h-[100px] w-full flex-col items-center px-2 py-2 justify-center rounded-xl bg-[#2b2f3649] border border-borderColor-DARK">
                  <p className="text-xs text-font-60 text-center">
                    Unsettled PnL
                  </p>
                  <p
                    className={`text-lg text-center ${
                      unsettledPnL > 0
                        ? "text-green"
                        : unsettledPnL < 0
                        ? "text-red"
                        : "text-white"
                    }`}
                  >
                    ${getFormattedAmount(unsettledPnL?.toFixed(2)) || "--"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary mt-7 shadow-[rgba(0,0,0,0.2)] shadow-xl ">
              <div className="w-full flex flex-col border-b border-borderColor-DARK">
                <div className="flex items-center relative  border-b border-borderColor-DARK">
                  {["Deposit", "Withdraw"].map((section, index) => (
                    <button
                      key={index}
                      ref={(el) => (buttonRefs.current[index] = el) as any}
                      className={`text-lg p-2.5 ${
                        activeSection === index ? "text-white" : "text-font-60"
                      }`}
                      onClick={() => setActiveSection(index)}
                    >
                      {section}
                    </button>
                  ))}
                  <div
                    className="h-[1px] w-[20%] absolute bottom-[-1px] bg-base_color transition-all duration-200 ease-in-out"
                    style={{
                      width: underlineStyle.width,
                      left: underlineStyle.left,
                    }}
                  />
                </div>
                <div className="max-h-[500px] min-h-[500px] relative w-full overflow-y-scroll no-scrollbar">
                  <table className="mt-2.5 w-full">
                    <thead>
                      <tr>
                        <th className={cn(thStyle, "pl-2.5 text-start")}>
                          Asset
                        </th>
                        <th className={thStyle}>Amount</th>
                        <th className={thStyle}>Tx ID</th>
                        <th className={thStyle}>Time</th>
                        <th className={thStyle}>Fee</th>
                        <th className={cn(thStyle, "pr-2.5")}>Status</th>
                      </tr>
                    </thead>
                    {(history as unknown as DepositWithdrawTx[])?.length > 0 ? (
                      <tbody>
                        {(history as unknown as DepositWithdrawTx[])
                          ?.filter(
                            (entry) =>
                              entry.side ===
                              (activeSection === 0 ? "DEPOSIT" : "WITHDRAW")
                          )
                          ?.map((item) => (
                            <tr key={item.id}>
                              <td className={cn(tdStyle, "pl-2.5 text-start")}>
                                <div className="flex items-center w-full h-full font-medium">
                                  <div className="relative mr-4">
                                    <img
                                      src={chainsImage[Number(item.chain_id)]}
                                      className="h-4 w-4 border border-borderColor shadow-sm shadow-[rgba(0,0,0,0.3)] z-10 rounded-full absolute -right-1 -bottom-0"
                                    />
                                    <img
                                      src="/assets/usdc.png"
                                      className="h-7 w-7 rounded-full z-0"
                                    />
                                  </div>
                                  {item.token}
                                </div>
                              </td>
                              <td className={tdStyle}>
                                {item.amount.toFixed(2)}
                              </td>
                              <td className={tdStyle}>
                                <div
                                  className="flex items-center justify-end"
                                  onClick={() =>
                                    copyToClipboard(
                                      (item?.tx_id as string) || ""
                                    )
                                  }
                                >
                                  {addressSlicer(item.tx_id)}
                                  {isCopied === item.tx_id ? (
                                    <FaCheck className="ml-2 text-green" />
                                  ) : (
                                    <MdOutlineContentCopy className="ml-2" />
                                  )}{" "}
                                </div>
                              </td>
                              <td className={tdStyle}>
                                {getFormattedDate(item.created_time)}
                              </td>
                              <td className={cn(tdStyle, "pl-4")}>
                                ${item.fee}
                              </td>
                              <td className={cn(tdStyle, "pr-2.5")}>
                                {item.trans_status}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    ) : (
                      <div className="absolute left-0 flex flex-col items-center justify-center h-full w-full">
                        <img
                          src="/empty/no-result.svg"
                          className="h-[100px] w-auto"
                        />
                        <p className="text-sm text-font-80 mt-2">
                          No {activeSection === 0 ? "Deposit" : "Withdraw"}{" "}
                          history
                        </p>
                      </div>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[44%]">
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-xl mb-4">Volume history</p>
              </div>
              <TimeSeriesChart />
            </div>
            <div className="rounded-2xl p-5  mt-7 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
              <p className="text-xl">Edit Leverage</p>
              <div className="flex items-center justify-between w-full ">
                <LeverageContent className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
