"use client";
import Link from "next/link";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { Chains } from "../chains";
import { Deposit } from "../deposit";
import { EnableTrading } from "../enable-trading";
import { ConnectWallet } from "../wallet-connect";
import { MobileModal } from "./mobile";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex relative w-fit h-fit">
          <Deposit />
          <Chains />
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
