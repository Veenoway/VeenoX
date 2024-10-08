import Link from "next/link";
import { AiOutlineSwap } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa";
import { IoClose, IoDocumentAttachOutline } from "react-icons/io5";
import { LuBarChart3 } from "react-icons/lu";

type MobileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileModal = ({ isOpen, onClose }: MobileModalProps) => {
  return (
    <>
      {/* <div
        onClick={onClose}
        className={`fixed top-0 h-screen w-full z-[100] p-5 left-0 ${
          isOpen ? "opacity-20" : "opacity-0 pointer-events-none"
        } transition-all duration-200 ease-in-out bg-secondary z-30`}
      /> */}
      <div
        className={`fixed top-0 h-screen w-full sm:w-[350px] z-[90] p-5 left-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-200 ease-in-out bg-secondary sm:border-r sm:border-borderColor shadow-2xl`}
      >
        <div className="flex items-center">
          <Link href="/" onClick={onClose}>
            <img
              src="/veenox/veenox-text.png"
              alt="Veeno Logo"
              className="h-[35px] max-h-[35px]"
            />
          </Link>

          <button className="text-white ml-auto text-2xl" onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <nav className="h-full mt-10">
          <ul className="text-white text-medium text-base gap-5 h-full">
            <li onClick={onClose}>
              <Link href="/perp/PERP_BTC_USDC">
                <span className="flex items-center">
                  <LuBarChart3 className="mr-3 text-xl" />
                  Trade
                </span>
              </Link>
            </li>
            <li onClick={onClose} className="my-5">
              <Link href="/portfolio">
                <span className="flex items-center">
                  <FaRegUser className="mr-3 text-xl" />
                  Portfolio
                </span>
              </Link>
            </li>
            <li onClick={onClose} className="my-5">
              <Link href="/bridge">
                <span className="flex items-center">
                  <AiOutlineSwap className="mr-3 text-xl" />
                  Swap
                </span>
              </Link>
            </li>
            <li onClick={onClose}>
              <Link
                href="https://veenox.gitbook.io/veenox/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center">
                  <IoDocumentAttachOutline className="mr-3 text-xl" />
                  Docs
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
