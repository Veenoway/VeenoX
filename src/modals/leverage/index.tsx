"use client";
import { useGeneralContext } from "@/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/shadcn/dialog";
import { useLeverage, useMarginRatio } from "@orderly.network/hooks";
import { useConnectWallet } from "@web3-onboard/react";
import { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { LeverageContent } from "./leverage";

export const Leverage = () => {
  const [{ wallet }, connectWallet] = useConnectWallet();
  const { currentLeverage } = useMarginRatio();
  const [showPopup, setShowPopup] = useState(false);
  const [maxLeverage] = useLeverage();
  const { setShowAccountMobile } = useGeneralContext();

  return (
    <Dialog open={showPopup}>
      <DialogTrigger
        onClick={async () => {
          if (wallet) {
            setShowPopup(true);
          } else {
            setShowAccountMobile(false);
            await connectWallet();
          }
        }}
      >
        <div className="text-white flex flex-col justify-center items-end">
          <p className="text-font-60 text-xs mb-[3px]">Account Leverage</p>
          <div className="flex items-center text-sm text-white hover:text-base_color transition-color duration-150 ease-in-out">
            <p className="sm:block hidden">{currentLeverage.toFixed(2)}x/ </p>
            <p>{maxLeverage}x</p> <FaRegEdit className="ml-2" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className="max-w-[400px] pb-2 w-[90%] flex flex-col gap-0 overflow-auto no-scrollbar"
        close={() => {
          setShowPopup(false);
        }}
      >
        <DialogHeader className="text-xl">
          <DialogTitle className="">Edit Max Leverage</DialogTitle>
        </DialogHeader>
        <LeverageContent />
      </DialogContent>
    </Dialog>
  );
};
