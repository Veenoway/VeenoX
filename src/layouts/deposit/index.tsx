import { useGeneralContext } from "@/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/shadcn/dialog";
import { triggerAlert } from "@/lib/toaster";
import {
  parseChainId,
  supportedChainIds,
  supportedChains,
} from "@/utils/network";
import {
  useChains,
  useDeposit,
  useHoldingStream,
  useAccount as useOrderlyAccount,
  useWithdraw,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FixedNumber } from "ethers";
import { useMemo, useState } from "react";
import { FaArrowDownLong } from "react-icons/fa6";
import { Oval } from "react-loader-spinner";
import { TemplateDisplay } from "./components/template-display";

export const Deposit = () => {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();
  const { state } = useOrderlyAccount();
  const [amount, setAmount] = useState<FixedNumber>();
  const [newWalletBalance, setNewWalletBalance] = useState<FixedNumber>();
  const [newOrderlyBalance, setNewOrderlyBalance] = useState<FixedNumber>();
  const [isApprovalDepositLoading, setIsApprovalDepositLoading] =
    useState<boolean>(false);
  const [isDepositSuccess, setIsDepositSuccess] = useState(false);
  const [isWithdrawSuccess, setIsWithdrawSuccess] = useState(false);
  const {
    isDeposit,
    setIsDeposit,
    openWithdraw,
    setOpenWithdraw,
    setDepositAmount,
    setIsEnableTradingModalOpen,
  } = useGeneralContext();
  const chainId = parseChainId(connectedChain?.id as string);
  const isSupportedChain = supportedChains.find(
    ({ id }) => id === connectedChain?.id
  )?.id;

  const [chains] = useChains("mainnet", {
    filter: (item: API.Chain) =>
      supportedChainIds.includes(item.network_infos?.chain_id),
  });

  const token = useMemo(() => {
    return Array.isArray(chains)
      ? chains
          .find((chain) => chain.network_infos.chain_id === chainId)
          ?.token_infos.find((t) => t.symbol === "USDC")
      : undefined;
  }, [chains, connectedChain]);

  const { withdraw, availableWithdraw, unsettledPnL } = useWithdraw();
  const { balance, allowance, approve, deposit, depositFee, setQuantity } =
    useDeposit({
      address: token?.address,
      decimals: token?.decimals,
      srcToken: token?.symbol,
      srcChainId: chainId as number,
    });
  const { usdc } = useHoldingStream();

  const handleClick = async () => {
    if (isSupportedChain) {
      if (isDeposit) {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          triggerAlert("Error", "Invalid amount.");
          return;
        }
        if (parseFloat(amount as never) > parseFloat(balance)) {
          triggerAlert("Error", "Amount exceed your holdings");
          return;
        }
        const amountNumber = Number(amount);
        const allowanceNumber = Number(allowance);

        if (allowanceNumber < amountNumber) {
          try {
            setIsApprovalDepositLoading(true);
            await approve(amount.toString());
            setIsApprovalDepositLoading(false);
          } catch (err) {
            setIsApprovalDepositLoading(false);
          }
        } else {
          setIsApprovalDepositLoading(true);
          try {
            await deposit();

            setIsDepositSuccess(true);
            setIsApprovalDepositLoading(false);
            // @ts-ignore
            setDepositAmount(usdc?.holding);
            setAmount(undefined);
            setNewWalletBalance(undefined);
            setNewOrderlyBalance(undefined);
            setOpenWithdraw(false);
            triggerAlert("Success", "Deposit executed.");
          } catch (err) {
            triggerAlert("Error", "Deposit failed.");
            setIsApprovalDepositLoading(false);
          }
        }
      } else {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          triggerAlert("Error", "Invalid amount.");
          return;
        }
        try {
          if (parseFloat(amount.toString()) <= availableWithdraw) {
            await withdraw({
              chainId: chainId as number,
              amount: amount.toString(),
              token: "USDC",
              allowCrossChainWithdraw: true,
            });
            setIsWithdrawSuccess(true);
            setAmount(undefined);
            setNewWalletBalance(undefined);
            setNewOrderlyBalance(undefined);
            setOpenWithdraw(false);
            triggerAlert("Success", "Withdraw executed.");
          }
        } catch (err: any) {
          console.log("Withdraw error: ", err);
          if (err?.message?.include("settle") || err?.message?.include("pnl"))
            triggerAlert("Error", "Settle PnL First");
          else triggerAlert("Error", "Withdraw failed.");
        }
      }
    } else {
      setChain({ chainId: "0xa4b1" });
    }
  };

  const getButtonState = (): string => {
    if (isSupportedChain) {
      if (isDeposit) {
        if (amount != null && Number(allowance) < Number(amount))
          return "Approve";
        return "Deposit";
      }
      return "Withdraw";
    }
    return "Switch Network";
  };

  const buttonState = getButtonState();

  return (
    <>
      <Dialog open={openWithdraw}>
        <DialogTrigger
          onClick={async () => {
            if (state.status >= 5) setOpenWithdraw(true);
            else if (state.status >= 2) setIsEnableTradingModalOpen(true);
            else await connectWallet();
          }}
        >
          <button
            className="text-white bg-secondary border border-base_color text-bold font-poppins text-xs
            h-[30px] sm:h-[35px] px-2.5 rounded sm:rounded-md mr-2.5 flex items-center
        "
          >
            Deposit
          </button>
        </DialogTrigger>
        <DialogContent
          close={() => setOpenWithdraw(false)}
          className="w-full max-w-[435px] bg-secondary h-auto max-h-auto flex flex-col gap-0"
        >
          <DialogHeader>
            <DialogTitle className="">
              <div className="w-full mb-5">
                <div className="flex items-center w-full h-[34px] relative">
                  <button
                    className={`${
                      isDeposit ? "text-white" : "text-font-60"
                    } w-1/2 h-fit pb-4 text-base font-medium transition-all duration-200 ease-in-out`}
                    onClick={() => setIsDeposit(true)}
                  >
                    Deposit
                  </button>
                  <button
                    className={`${
                      !isDeposit ? "text-white" : "text-font-60"
                    } w-1/2 h-fit pb-4 text-base font-medium transition-all duration-200 ease-in-out`}
                    onClick={() => setIsDeposit(false)}
                  >
                    Withdraw
                  </button>
                </div>
                <div className="bg-terciary h-[1px] w-full relative">
                  <div
                    className={`h-[1px] w-1/2 bottom-0 transition-all duration-200 ease-in-out bg-font-80 absolute ${
                      isDeposit ? "left-0" : "left-1/2"
                    } `}
                  />
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <TemplateDisplay
            balance={isDeposit ? balance : availableWithdraw.toString()}
            amount={amount}
            setAmount={setAmount}
            setQuantity={setQuantity}
            depositFee={depositFee}
            unsettledPnL={unsettledPnL}
          >
            <div className="h-[20px] w-full flex items-center justify-center my-5">
              <div className="h-0.5 w-full bg-borderColor-DARK" />
              <FaArrowDownLong className="text-white text-2xl mx-2" />
              <div className="h-0.5 w-full bg-borderColor-DARK" />
            </div>
          </TemplateDisplay>
          <button
            onClick={handleClick}
            className={`bg-base_color
            } w-full h-[40px] rounded px-2.5 text-white text-sm flex items-center justify-center transition-all duration-200 ease-in-out`}
          >
            {isApprovalDepositLoading ? (
              <Oval
                visible={true}
                height="18"
                width="18"
                color="#FFF"
                secondaryColor="rgba(255,255,255,0.6)"
                ariaLabel="oval-loading"
                strokeWidth={6}
                strokeWidthSecondary={6}
                wrapperStyle={{
                  marginRight: "8px",
                }}
                wrapperClass=""
              />
            ) : null}
            {buttonState}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};
