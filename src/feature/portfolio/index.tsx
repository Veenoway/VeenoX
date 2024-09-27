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
  useAccountInfo,
  useCollateral,
  useHoldingStream,
  useAccount as useOrderlyAccount,
  usePrivateQuery,
  useWithdraw,
} from "@orderly.network/hooks";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdContentCopy, MdOutlineContentCopy } from "react-icons/md";
import { TimeSeriesChart } from "./components/chart";
import { feeTiers } from "./constant";

type TradingAPI = {
  accountID: string | undefined;
  orderlySecret: string | undefined;
  orderlyKey: string | undefined;
};

interface ContentInterface {
  title: string;
  content: string | undefined;
}

type VolumeStats = {
  days_since_registration: number;
  fees_paid_last_30_days: number;
  perp_fees_paid_last_30_days: number;
  perp_trading_volume_last_7_days: number;
  perp_trading_volume_last_24_hours: number;
  perp_trading_volume_last_30_days: number;
  perp_trading_volume_ltd: number;
  perp_trading_volume_ytd: number;
  trading_volume_last_24_hours: number;
  trading_volume_last_30_days: number;
  trading_volume_ytd: number;
};

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

const thStyle =
  "text-sm text-font-60 font-normal py-1.5 border-b border-borderColor-DARK text-end";
const tdStyle =
  "text-sm text-white font-normal py-3.5 border-b border-borderColor-DARK text-end";

export const Portfolio = () => {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const { state, account } = useOrderlyAccount();
  const [activeSection, setActiveSection] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { setIsDeposit, setOpenWithdraw } = useGeneralContext();
  const [showKeys, setShowKeys] = useState<string[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState<{
    width: string;
    left: string;
  }>({ width: "20%", left: "0%" });
  const { totalValue, unsettledPnL } = useCollateral({
    dp: 2,
  });
  const { usdc } = useHoldingStream();
  const { availableWithdraw } = useWithdraw();

  const { data: history } =
    usePrivateQuery<TransactionHistoryQueryResult>("/v1/asset/history");
  const { data: volume } = usePrivateQuery<VolumeStats>(
    "/v1/client/statistics"
  );
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

  const fetchAPITrading = async (): Promise<TradingAPI> => {
    const orderlyKey =
      (await account?.keyStore
        ?.getOrderlyKey(wallet?.accounts?.[0]?.address)
        ?.getPublicKey()) || "No Orderly API Key found.";

    const orderlySecret =
      account?.keyStore?.getOrderlyKey(wallet?.accounts?.[0]?.address)
        ?.secretKey || "No Orderly Secret Key found.";

    const accountID =
      account?.keyStore?.getAccountId(
        wallet?.accounts?.[0]?.address as string
      ) || "No account ID found.";

    return { accountID, orderlySecret, orderlyKey };
  };

  const [content, setContent] = useState<ContentInterface[]>([
    {
      title: "Account ID",
      content: "No account ID found.",
    },
    {
      title: "Orderly API Key",
      content: "No Orderly API Key found.",
    },
    {
      title: "Orderly Secret Key",
      content: "No Orderly Secret Key found.",
    },
  ] as ContentInterface[]);

  useEffect(() => {
    if (wallet && account) {
      fetchAPITrading().then((r) => {
        const { accountID, orderlySecret, orderlyKey } = r;
        setContent([
          {
            title: "Account ID",
            content: accountID,
          },
          {
            title: "Orderly API Key",
            content: orderlyKey,
          },
          {
            title: "Orderly Secret Key",
            content: orderlySecret,
          },
        ]);
      });
    }
  }, [account, wallet]);

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { data: accountInfo } = useAccountInfo();

  return (
    <div className="w-full flex flex-col items-center text-white pt-[30px] pb-[100px] min-h-[90vh]">
      <div className="max-w-[1350px] w-[90%] ">
        <div className="flex items-center justify-between mb-5 ">
          <h1 className="text-2xl text-white font-semibold">Portfolio</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="col-span-3">
            <div className="flex w-full">
              <div className="rounded-2xl p-5 border w-full border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col ">
                    <p className="text-base mb-0.5 text-font-80">
                      Total Value:
                    </p>
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
                <div className="flex items-center justify-between gap-2.5 mt-2.5">
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
            </div>
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary mt-2.5 shadow-[rgba(0,0,0,0.2)] shadow-xl ">
              <p className="text-xl mb-2">Withdraw / Deposit history</p>
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
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary mt-2.5 shadow-[rgba(0,0,0,0.2)] shadow-xl ">
              <p className="text-xl mb-2">Fee tier</p>
              <table className="mt-2.5 w-full">
                <thead>
                  <tr>
                    <th className={cn(thStyle, "pl-2.5 text-start")}>Tier</th>
                    <th className={thStyle}>30d Volume</th>
                    <th className={thStyle}>Maker Fee</th>
                    <th className={cn(thStyle, "pr-2.5")}>Taker Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {feeTiers?.map((item) => {
                    const isActiveFeeTier =
                      item.taker_fee === accountInfo?.futures_taker_fee_rate;
                    return (
                      <tr
                        key={item.tier}
                        className={`${isActiveFeeTier ? "bg-[#2b2f3649]" : ""}`}
                      >
                        <td
                          className={cn(
                            tdStyle,
                            `pl-2.5 text-start ${
                              isActiveFeeTier ? "text-base_color font-bold" : ""
                            }`
                          )}
                        >
                          {item.tier}
                        </td>
                        <td
                          className={cn(
                            tdStyle,
                            `${
                              isActiveFeeTier ? "text-base_color font-bold" : ""
                            }`
                          )}
                        >
                          {item.volume_30d}
                        </td>
                        <td
                          className={cn(
                            tdStyle,
                            `${
                              isActiveFeeTier ? "text-base_color font-bold" : ""
                            }`
                          )}
                        >
                          {item.maker}
                        </td>
                        <td
                          className={cn(
                            tdStyle,
                            `pr-2.5 ${
                              isActiveFeeTier ? "text-base_color font-bold" : ""
                            }`
                          )}
                        >
                          {item.taker}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* RIGHT PART */}
          <div className="col-span-2">
            <div className="rounded-2xl p-5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-xl mb-4">Volume history</p>
              </div>
              <TimeSeriesChart />
            </div>
            <div className="flex">
              <div className="rounded-2xl w-full p-5 mt-2.5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
                <p className="text-xl">Edit Leverage</p>
                <div className="flex items-center justify-between w-full">
                  <LeverageContent className="w-full mr-0 mt-0 h-full" />
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="rounded-2xl w-[60%] p-5 mt-2.5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
                <p className="text-xl mb-2.5">Volume</p>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">24h Vol.</p>
                  <p className="text-base">
                    $
                    {getFormattedAmount(
                      volume?.perp_trading_volume_last_24_hours
                    ) || "--"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">7d Vol.</p>
                  <p className="text-base">
                    $
                    {getFormattedAmount(
                      volume?.perp_trading_volume_last_7_days
                    ) || "--"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">30d Vol.</p>
                  <p className="text-base">
                    $
                    {getFormattedAmount(
                      volume?.perp_trading_volume_last_30_days
                    ) || "--"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">Total Vol.</p>
                  <p className="text-base">
                    $
                    {getFormattedAmount(volume?.perp_trading_volume_ytd) ||
                      "--"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl ml-2.5 w-[40%] p-5 mt-2.5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
                <p className="text-xl mb-2.5">Trading Fee</p>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">Maker fee</p>
                  <p className="text-base">
                    {`${
                      (accountInfo?.futures_maker_fee_rate as number) / 100 +
                      "%"
                    }` || "0.025%"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base text-font-60 mb-0.5">Taker fee</p>
                  <p className="text-base">
                    {`${
                      (accountInfo?.futures_taker_fee_rate as number) / 100 +
                      "%"
                    }` || "0.050%"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl w-full p-5 min-w-[300px] mt-2.5 border border-borderColor-DARK bg-secondary shadow-[rgba(0,0,0,0.2)] shadow-xl">
              <p className="text-xl mb-5">API Trading</p>
              {content.map((key, i) => {
                const isEven: boolean = i % 2 === 0;
                return (
                  <div
                    className={`flex items-center justify-between ${
                      isEven ? "my-6" : ""
                    }`}
                    key={i}
                  >
                    <div>
                      <p className="text-base text-start text-font-60 mb-0.5">
                        {key.title}
                      </p>
                      <p
                        className={`text-base text-start break-all ${
                          !showKeys.includes(key.content as string) && i !== 0
                            ? "blur-[3px]"
                            : ""
                        } transition-all duration-150 ease-in-out`}
                      >
                        {key.content}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {i !== 0 ? (
                        <button
                          className="min-w-fit text-end pl-8"
                          onClick={() => {
                            if (showKeys.includes(key.content as string))
                              setShowKeys((prev) =>
                                prev.filter((entry) => entry !== key.content)
                              );
                            else
                              setShowKeys((prev) => [
                                ...prev,
                                key.content as string,
                              ]);
                          }}
                        >
                          {showKeys.includes(key.content as string) ? (
                            <IoEyeOutline className="text-white text-lg" />
                          ) : (
                            <IoEyeOffOutline className="text-white text-lg" />
                          )}
                        </button>
                      ) : null}
                      <button
                        className={`min-w-fit text-end ${
                          i === 0 ? "pl-[55px]" : "pl-2.5"
                        }`}
                        onClick={() => copyToClipboard(key.content as string)}
                      >
                        {isCopied === key.content ? (
                          <FaCheck className="text-green" />
                        ) : (
                          <MdContentCopy className="text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
