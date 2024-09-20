"use client";
import { useGeneralContext } from "@/context";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import {
  ChainsImageType,
  getImageFromChainId,
  supportedChains,
} from "@/utils/network";
import {
  useAccountInstance,
  useChains,
  useAccount as useOrderlyAccount,
} from "@orderly.network/hooks";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { Deposit } from "../deposit";
import { EnableTrading } from "../enable-trading";
import { ConnectWallet } from "../wallet-connect";
import { MobileModal } from "./mobile";

export enum AccountStatusEnum {
  NotConnected = 0,
  Connected = 1,
  NotSignedIn = 2,
  SignedIn = 3,
  DisabledTrading = 4,
  EnableTrading = 5,
}

export const Header = () => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { account, state } = useOrderlyAccount();
  const { address, isDisconnected, isConnecting, chain, chainId, isConnected } =
    useAccount();
  const [isHoverChain, setIsHoverChain] = useState<string | null>(null);
  const { connect, connectors } = useConnect();
  const { isEnableTradingModalOpen, setIsEnableTradingModalOpen } =
    useGeneralContext();
  // useEffect(() => {
  //   if (isConnected && address) {
  //     account.setAddress(address, {
  //       provider: window.ethereum,
  //       chain: {
  //         id: "0x1",
  //       },
  //       wallet: {
  //         name: "Web3Modal",
  //       },
  //     });
  //   }
  // }, [isConnected, address, account]);

  // const provider = useProvider();
  // const { chain } = useNetwork();

  // async function connectWallet() {
  //   try {
  //     await connect({ connector: connectors[0] }); // assuming MetaMask connector
  //     const walletProvider = provider.provider;
  //     const chainInfo = {
  //       id: `0x${chain.id.toString(16)}`,
  //     };
  //     const walletInfo = {
  //       name: "MetaMask", // or any other wallet
  //     };

  //     const nextState = await account.setAddress(address, {
  //       provider: walletProvider,
  //       chain: chainInfo,
  //       wallet: walletInfo,
  //     });

  //     console.log("Next State:", nextState);
  //   } catch (error) {
  //     console.error("Failed to connect wallet:", error);
  //   }
  // }

  // const handleAccountCreation = async () => {
  //   const nextState = await account.setAddress("<address>", {
  //     provider: "provider", // EIP1193Provider, usually window.ethereum
  //     chain: {
  //       id: "0x1", // chain id, e.g. 0x1 for Ethereum Mainnet, it's a hex string
  //     },
  //     wallet: {
  //       name: "", // Wallet app name, e.g. MetaMask
  //     },
  //   });
  // };

  // const handleDisconnect = () => {
  //   disconnect();
  // };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { switchChain } = useSwitchChain();
  const { isDeposit } = useGeneralContext();
  const accountInstance = useAccountInstance();
  const chainLogo =
    supportedChains.find((entry) => entry.label === (chain?.name as string))
      ?.icon || getImageFromChainId(chainId as ChainsImageType);
  const [chains, { findByChainId }] = useChains();
  console.log(chains);
  return (
    <header className="flex items-center justify-between h-[60px] px-2.5 border-b border-borderColor">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img
              src="/veenox/veenox-text.png"
              alt="Veeno Logo"
              className="h-[30px] w-auto max-w-auto max-h-[25px] sm:max-w-auto sm:max-h-[30px]"
            />
          </Link>
          <nav className="ml-5 h-full hidden lg:flex">
            <ul className="text-white text-medium text-sm flex items-center gap-5 h-full">
              <li>
                <Link href="/perp/PERP_BTC_USDC">Trade</Link>
              </li>
              <li>
                {" "}
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li className="text-font-40 cursor-not-allowed">Portfolio</li>
              <li className="text-font-40 cursor-not-allowed">Swap</li>
              <li className="text-font-40 cursor-not-allowed">Bridge</li>
              <li className="text-font-40 cursor-not-allowed">
                Learn Trading & Earn
              </li>
            </ul>
          </nav>
        </div>{" "}
      </div>
      <div className="flex items-center gap-5">
        <div className="flex relative w-fit h-fit">
          <Deposit />
          <Popover>
            <PopoverTrigger className="h-full min-w-fit">
              <button
                className="text-white bg-secondary border border-base_color text-bold font-poppins text-xs
            h-[30px] sm:h-[35px] px-2 rounded sm:rounded-md mr-2.5 flex items-center
        "
              >
                <Image
                  src={chainLogo || "/assets/ARB.png"}
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
              className="flex flex-col px-5 py-4 rounded z-[102] max-w-[205px] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-xl"
            >
              <div className="flex items-center flex-wrap gap-2.5">
                {supportedChains
                  ?.filter((item) => item.network !== "testnet")
                  .map((supportedChain, i) => (
                    <button
                      key={i}
                      className="flex flex-col justify-center items-center py-1 flex-nowrap"
                      onMouseEnter={() => {
                        if (supportedChain?.id) {
                          setIsHoverChain(supportedChain.id);
                        }
                      }}
                      onMouseLeave={() => setIsHoverChain(null)}
                      onClick={() => {
                        accountInstance.switchChainId(supportedChain.chainId);
                        switchChain({
                          chainId: supportedChain.chainId,
                        });
                      }}
                    >
                      <div
                        className={`h-10 w-10 p-2 rounded bg-terciary ${
                          parseInt(supportedChain.id, 16) === chainId
                            ? "border-base_color"
                            : "border-borderColor"
                        } border transition-all duration-100 ease-in-out`}
                      >
                        <Image
                          src={supportedChain.icon}
                          width={18}
                          height={18}
                          className={`h-full w-full object-cover rounded-full mr-2 ${
                            parseInt(supportedChain.id, 16) === chainId ||
                            isHoverChain === supportedChain.id
                              ? ""
                              : "grayscale"
                          } transition-all duration-100 ease-in-out`}
                          alt="Chain logo"
                        />{" "}
                      </div>
                      <p
                        className={`text-center mt-2 text-xs ${
                          parseInt(supportedChain.id, 16) === chainId ||
                          isHoverChain === supportedChain.id
                            ? "text-white"
                            : "text-font-60"
                        } transition-all duration-100 ease-in-out`}
                      >
                        {supportedChain.label === "OP Mainnet"
                          ? "Optimism"
                          : supportedChain.label === "Arbitrum One"
                          ? "Arbitrum"
                          : supportedChain.label}
                      </p>
                    </button>
                  ))}{" "}
              </div>
            </PopoverContent>
          </Popover>
          <ConnectWallet />
          <button
            className="lg:hidden flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <RxHamburgerMenu className="text-white ml-3 text-xl" />
          </button>
        </div>
      </div>
      <MobileModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen((prev) => !prev)}
      />
      <EnableTrading />
    </header>
  );
};
