"use client";
import { usePathname } from "next/navigation";
import { Footer } from "../footer";
import { LandingFooter } from "../landing-footer";

export const DynamicFooter = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return isHomePage ? <LandingFooter /> : <Footer />;
};
