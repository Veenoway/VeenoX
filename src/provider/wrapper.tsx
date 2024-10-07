"use client";
import { GeneralProvider } from "@/context";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";
import { ToastContainer } from "react-toastify";

type ProviderType = {
  children: ReactNode;
};

const CloseButton = ({ closeToast }: any) => (
  <IoClose className="text-base text-white" onClick={closeToast} />
);

export const Providers = ({ children }: ProviderType) => {
  return (
    <>
      <ToastContainer
        toastClassName="bg-secondary text-white px-3 py-1 rounded-xl text-sm w-fit shadow-md border border-borderColor relative"
        bodyClassName="bg-secondary text-white w-fit text-sm"
        closeButton={CloseButton}
        position="top-center"
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        autoClose={3000}
        stacked
        draggable={false}
      />
      <GeneralProvider>{children}</GeneralProvider>
    </>
  );
};
