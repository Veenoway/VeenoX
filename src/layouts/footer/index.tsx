"use client";
import { MaintenanceType } from "@/models";
import { useQuery } from "@orderly.network/hooks";
import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { RiWifiLine, RiWifiOffLine } from "react-icons/ri";

export const Footer = () => {
  const { data: maintenance } = useQuery<MaintenanceType>(
    "https://api-evm.orderly.org/v1/public/system_info"
  );

  return (
    <footer className="h-[35px] bg-secondary border-t text-sm z-10 text-white w-full border-borderColor flex items-center fixed bottom-0 left-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center px-2.5">
          {maintenance?.status === 0 ? (
            <RiWifiLine className="text-green text-sm mr-2 font-bold" />
          ) : (
            <RiWifiOffLine className="text-yellow text-sm mr-2 font-bold" />
          )}
          <p
            className={`${
              maintenance?.status === 0 ? "text-green" : "text-yellow"
            } text-xs sm:text-sm font-bold`}
          >
            {maintenance?.status === 0 ? "Operational" : "Under maintenance"}
          </p>
          <div className="h-[30px] w-[1px] bg-borderColor mx-5 sm:block hidden" />
          <div className="flex items-center gap-2.5 text-white">
            <p className="text-font-60 text-xs hidden sm:block">
              Join our community
            </p>
            <Link
              href="https://discord.gg/bM4t5AdMQF"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="text-lg hover:text-base_color transition-all duration-150 ease-in-out">
                <FaDiscord />
              </p>
            </Link>
            <Link
              href="https://t.me/@veenox_xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="text-base hover:text-base_color transition-all duration-150 ease-in-out">
                <FaTelegramPlane />
              </p>
            </Link>
            <Link
              href="https://x.com/veenox_xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="text-base hover:text-base_color transition-all duration-150 ease-in-out">
                <FaXTwitter />
              </p>
            </Link>
          </div>
        </div>
        <div className="flex items-center px-2.5">
          <p className="text-font-60 text-xs whitespace-nowrap">Powered by</p>
          <img
            className="ml-2"
            src="/logo/orderly-powered.svg"
            alt="Orderly network logo"
          />
        </div>
        {/* <div className="flex items-center px-2.5">
          <p className="text-font-60 text-xs">
            © VeenoX - 2024 - All rights reserved{" "}
          </p>
        </div> */}
      </div>
    </footer>
  );
};
