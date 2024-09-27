import { useGeneralContext } from "@/context";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { triggerAlert } from "@/lib/toaster";
import { addressSlicer, getFormattedAmount } from "@/utils/misc";
import {
  ChainsImageType,
  getImageFromChainId,
  parseChainId,
  supportedChains,
} from "@/utils/network";
import { utils } from "@orderly.network/core";
import {
  useAccount as useOrderlyAccount,
  useSettleSubscription,
} from "@orderly.network/hooks";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FixedNumber } from "ethers";
import Image from "next/image";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";
import { filterAllowedCharacters } from "../../utils";

type TemplateDisplayProps = {
  balance: string;
  amount: FixedNumber | undefined;
  setAmount: Dispatch<SetStateAction<FixedNumber | undefined>>;
  setQuantity: Dispatch<SetStateAction<string>>;
  children: ReactNode;
  depositFee: BigInt;
  unsettledPnL: number;
};

const InputQuantity = () => {
  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain, chains }, setChain] = useSetChain();
  const { account } = useOrderlyAccount();

  const selectChain = (chainId: string) => () => {
    setChain({
      chainId,
    });
  };

  const handleChainSelect = useCallback(
    (id: string) => {
      return async () => {
        const chainSelectFunction = selectChain(id);
        chainSelectFunction();
        account.switchChainId(id);
      };
    },
    [selectChain, account]
  );

  const chainLogo =
    supportedChains.find(({ id }) => id === (connectedChain?.id as string))
      ?.icon ||
    getImageFromChainId(connectedChain?.id as unknown as ChainsImageType);

  const chainName = supportedChains.find(
    ({ id }) => id === (connectedChain?.id as string)
  )?.label;

  return (
    <div className="w-full flex items-center mb-2">
      <div className="bg-terciary h-[35px]  border rounded w-full border-borderColor-DARK mr-2">
        <input
          type="text"
          readOnly
          placeholder={addressSlicer(wallet?.accounts?.[0]?.address)}
          className="h-full px-2.5 w-full text-xs"
        />
      </div>
      <div className="bg-terciary h-[35px] border rounded border-borderColor-DARK">
        <Popover>
          <PopoverTrigger className="h-full min-w-fit">
            <button className="h-full whitespace-nowrap text-sm px-2.5 text-white w-full flex-nowrap flex items-center justify-center">
              <Image
                src={chainLogo || "/assets/ETH.png"}
                width={18}
                height={18}
                className="ml-2 object-cover rounded-full mr-2"
                alt="Chain logo"
              />
              {chainName || "Ethereum"}
              <IoChevronDown className="min-w-[18px] text-xs ml-[1px] mr-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            sideOffset={9}
            align="end"
            className="flex flex-col py-0.5 px-0 rounded z-[102] w-fit whitespace-nowrap bg-primary shadow-xl shadow-secondary border border-borderColor-DARK"
          >
            {supportedChains
              ?.filter((item) => item.network !== "testnet")
              .map(({ id, label, icon }) => (
                <button
                  key={id}
                  className="flex items-center py-1.5 px-2 flex-nowrap hover:bg-terciary"
                  onClick={handleChainSelect(id)}
                >
                  <Image
                    src={icon}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-cover rounded-full mr-2.5"
                    alt="Chain logo"
                  />
                  <p
                    className={`w-full text-start text-[13px] ${
                      id === connectedChain?.id ? "text-white" : "text-font-60"
                    } transition-all duration-150 ease-in-out`}
                  >
                    {
                      supportedChains.find(({ id: chainId }) => chainId === id)
                        ?.label
                    }
                  </p>
                </button>
              ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

type PageContentType = {
  title_top: string;
  image_top: string;
  title_bot: string;
  image_bot: string;
};

enum SettleStatus {
  INITIAL = 0,
  LOADING = 1,
  VALIDATE = 2,
}

export const TemplateDisplay = ({
  balance,
  amount,
  setAmount,
  setQuantity,
  children,
  depositFee,
  unsettledPnL,
}: TemplateDisplayProps) => {
  const { account } = useOrderlyAccount();
  const { isDeposit } = useGeneralContext();
  const [{ connectedChain }, setChain] = useSetChain();
  const [{ wallet }] = useConnectWallet();
  const [settleStatus, setSettleStatus] = useState(SettleStatus.INITIAL);

  const getPageContent = (): PageContentType => {
    if (isDeposit)
      return {
        title_top: "Your Wallet",
        image_top: wallet?.icon || "/veenox/veenox-logo.png",
        title_bot: "Your VeenoX account",
        image_bot: "/veenox/veenox-logo.png",
      };
    return {
      title_top: "Your VeenoX account ",
      image_top: "/veenox/veenox-logo.png",
      title_bot: "Your Wallet",
      image_bot: wallet?.icon || "/veenox/veenox-logo.png",
    };
  };

  const pageContent = getPageContent();
  const formattedDepositFee = utils.formatByUnits(
    depositFee as never,
    18 // TODO
  );

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;
      switch (status) {
        case "COMPLETED":
          triggerAlert("Success", "Settlement has been completed.");
          break;
        case "FAILED":
          triggerAlert("Error", "Settlement has failed.");
          break;
        default:
          break;
      }
    },
  });

  return (
    <>
      <div className="flex items-center w-full justify-between mb-3">
        <p>{pageContent.title_top}</p>
        <Image
          src={pageContent.image_top}
          height={20}
          width={20}
          alt="Veeno logo"
          className="rounded-full"
        />
      </div>
      {isDeposit ? <InputQuantity /> : null}
      <div className="bg-terciary pb-2.5 px-2.5 py-1 border mt-0 rounded w-full border-borderColor-DARK">
        <div className="w-full flex items-center justify-between">
          <input
            type="number"
            placeholder={"Quantity"}
            value={amount?.toString()}
            className="h-[30px] pr-2.5 w-full max-w-[240px] text-sm placeholder:text-white"
            onChange={(e) => {
              const newValue = filterAllowedCharacters(e.target.value);
              setAmount(newValue as any);
              setQuantity(newValue.toString());
            }}
          />
          <div className="flex items-center">
            <button
              className="text-sm font-medium text-base_color uppercase"
              onClick={() => {
                setAmount(balance as never);
                setQuantity(balance);
              }}
            >
              MAX
            </button>
            <div className="flex items-center ml-5">
              <Image
                src="/assets/usdc.png"
                width={17}
                height={17}
                className="object-cover rounded-full mr-1.5 -mt-0.5"
                alt="USDC logo"
              />
              <p className="text-white text-sm ">USDC</p>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-between mt-1.5">
          <p className="text-font-60 text-xs ">${amount?.toString()}</p>
          <div className="flex items-center">
            <div className="flex items-center ml-5">
              <p className="text-font-60 text-xs">
                Available:{" "}
                {parseFloat(balance) > 0 ? getFormattedAmount(balance) : 0} USDC
              </p>
            </div>
          </div>
        </div>
      </div>
      {isDeposit ? null : (
        <div className="w-full flex items-center text-xs justify-between mt-2">
          <p className="text-font-60">
            Unsettled:{" "}
            <span
              className={`font-medium ${
                unsettledPnL > 0
                  ? "text-green"
                  : unsettledPnL < 0
                  ? "text-red"
                  : "text-white"
              }`}
            >
              {(unsettledPnL || 0).toFixed(2)}
            </span>{" "}
            USDC
          </p>
          <button
            onClick={async () => {
              if (unsettledPnL !== 0 && account) {
                const connectedChainID = parseChainId(
                  connectedChain?.id as string
                );
                if (connectedChainID === account.chainId) {
                  setSettleStatus(SettleStatus.LOADING);
                  try {
                    await account.settle();
                    setSettleStatus(SettleStatus.VALIDATE);
                    setTimeout(() => {
                      setSettleStatus(SettleStatus.INITIAL);
                    }, 2000);
                  } catch (e) {
                    setSettleStatus(SettleStatus.INITIAL);
                  }
                }
              }
            }}
            className={`${
              unsettledPnL !== 0 ? "" : "opacity-40 pointer-events-none"
            } flex items-center bg-terciary border border-borderColor-DARK rounded px-2 py-1 text-xs text-white`}
          >
            {settleStatus === SettleStatus.VALIDATE ? (
              <FaCheck className="text-green text-xs  mr-2" />
            ) : null}
            {settleStatus === SettleStatus.LOADING ? (
              <AiOutlineLoading3Quarters className="animate-spin text-white text-xs mr-2" />
            ) : null}
            <span>Settle PnL</span>
          </button>
        </div>
      )}
      {children}
      <div className="flex flex-col w-full">
        <div
          className={`flex items-center w-full justify-between ${
            isDeposit ? "mb-0" : "mb-3"
          }`}
        >
          <p>{pageContent.title_bot}</p>
          <Image
            src={pageContent.image_bot}
            height={20}
            width={20}
            alt="VeenoX logo"
            className="rounded-full"
          />
        </div>
        {isDeposit ? null : <InputQuantity />}
        <div
          className={`bg-terciary ${
            isDeposit ? "mt-3" : "mt-0"
          } h-[35px] border rounded w-full border-borderColor-DARK mr-2`}
        >
          <input
            type="text"
            readOnly
            placeholder={
              amount ? `${amount?.toString() as string} USDC` : "Quantity"
            }
            className="h-full px-2.5 w-full text-xs placeholder:opacity-100 placeholder:text-white"
          />
        </div>
        <div className="flex text-xs text-white items-center justify-between my-4 ">
          <p className="text-font-60 mr-2">
            {isDeposit ? "Deposit" : "Withdraw"} Fees:
          </p>
          <p>{isDeposit ? getFormattedAmount(formattedDepositFee) : "1.00"}$</p>
        </div>
      </div>
    </>
  );
};
