import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { supportedChains } from "@/utils/network";
import { useAccount } from "@orderly.network/hooks";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import Image from "next/image";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

export const Chains: React.FC = () => {
  const { account } = useAccount();
  const [isHoverChain, setIsHoverChain] = useState<string | null>(null);
  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();
  const chainIcon = supportedChains?.find(
    ({ id }) => id === connectedChain?.id
  )?.icon;
  const selectChain = (chainId: string) => () => {
    setChain({
      chainId,
    });
  };

  return (
    <Popover>
      <PopoverTrigger className="h-full min-w-fit">
        <button
          className="text-white bg-secondary border border-base_color text-bold font-poppins text-xs
        h-[30px] sm:h-[35px] px-2 rounded sm:rounded-md mr-2.5 flex items-center
    "
        >
          <Image
            src={chainIcon || "/assets/ARB.png"}
            width={20}
            height={20}
            className="object-cover rounded-full"
            alt="Chain logo"
          />
          <IoChevronDown className="ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={12}
        className={`flex flex-col px-5 py-4 rounded z-[102] max-w-[205px] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-xl ${
          wallet ? "flex" : "hidden"
        }`}
      >
        <div className="flex items-center flex-wrap gap-2.5">
          {supportedChains
            ?.filter((item) => item.network !== "testnet")
            .map(({ id, icon, label }) => {
              return (
                <button
                  key={icon}
                  className="flex flex-col justify-center items-center py-1 flex-nowrap"
                  onMouseEnter={() => setIsHoverChain(id)}
                  onMouseLeave={() => setIsHoverChain(null)}
                  onClick={selectChain(id)}
                >
                  <div
                    className={`h-10 w-10 p-2 rounded bg-terciary ${
                      connectedChain?.id === id
                        ? "border-base_color"
                        : "border-borderColor"
                    } border transition-all duration-100 ease-in-out`}
                  >
                    <Image
                      src={icon}
                      width={18}
                      height={18}
                      className={`h-full w-full object-cover rounded-full mr-2 ${
                        connectedChain?.id === id || isHoverChain === id
                          ? ""
                          : "grayscale"
                      } transition-all duration-100 ease-in-out`}
                      alt="Chain logo"
                    />{" "}
                  </div>
                  <p
                    className={`text-center mt-2 text-xs ${
                      connectedChain?.id === id || isHoverChain === id
                        ? "text-white"
                        : "text-font-60"
                    } transition-all duration-100 ease-in-out`}
                  >
                    {label === "OP Mainnet"
                      ? "Optimism"
                      : label === "Arbitrum One"
                      ? "Arbitrum"
                      : label}
                  </p>
                </button>
              );
            })}{" "}
        </div>
      </PopoverContent>
    </Popover>
  );
};
