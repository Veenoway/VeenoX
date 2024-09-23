"use client";

import { useCopyToClipboard } from "@/hook/useCopy";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { addressSlicer } from "@/utils/misc";
import { useAccount } from "@orderly.network/hooks";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoChevronDown, IoPowerSharp } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";

export enum AccountStatusEnum {
  NotConnected = 0,
  Connected = 1,
  NotSignedIn = 2,
  SignedIn = 3,
  DisabledTrading = 4,
  EnableTrading = 5,
}

export const ConnectWallet = () => {
  const { account } = useAccount();
  const [{ wallet }, connectWallet, disconnectWallet] = useConnectWallet();
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    if (!wallet) return;

    account.setAddress(wallet.accounts[0].address, {
      provider: wallet.provider,

      chain: {
        id: wallet.chains[0].id,
      },
    });
  }, [wallet, account]);

  return (
    <div className="w-fit h-fit relative">
      <Popover open={isDisconnectOpen}>
        <PopoverTrigger
          className="h-full min-w-fit"
          onClick={async () => {
            if (wallet) setIsDisconnectOpen((prev) => !prev);
            else await connectWallet();
          }}
        >
          <div
            className="text-white bg-base_color border border-borderColor-DARK text-bold font-poppins text-xs
              h-[30px] sm:h-[35px] px-2 sm:px-2.5 flex items-center justify-center rounded sm:rounded-md "
          >
            {!wallet ? (
              "Connect"
            ) : (
              <span className="flex items-center w-full h-full">
                <p>{addressSlicer(wallet?.accounts[0].address)}</p>

                <IoChevronDown
                  className={`ml-1 ${
                    isDisconnectOpen ? "rotate-180" : ""
                  } transition-all duration-150 ease-in-out`}
                />
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={12}
          className="flex flex-col px-3 py-2 rounded z-[102] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-secondary shadow-xl"
        >
          <div
            className="flex items-center cursor-pointer text-white text-xs"
            onClick={() => copyToClipboard(wallet?.accounts[0].address || "")}
          >
            <p className="mr-2">{addressSlicer(wallet?.accounts[0].address)}</p>
            {isCopied ? (
              <FaCheck className="text-green" />
            ) : (
              <MdContentCopy className="text-white" />
            )}
          </div>
          <div className="h-[1px] mb-1.5 mt-2.5 bg-borderColor w-full rounded" />
          <button
            className="text-font-80 flex items-center justify-center hover:text-white transition-all duration-100 ease-in-out text-bold font-poppins text-sm"
            onClick={() => {
              setIsDisconnectOpen(false);
              disconnectWallet({ label: wallet?.label as string });
              account.disconnect();
            }}
          >
            <IoPowerSharp className="text-white mr-2" />
            Disconnect
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
