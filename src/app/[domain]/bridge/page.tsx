import { Bridge } from "@/feature/bridge";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge | VeenoX",
  description:
    "VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology. We offer traders the lowest fees in the market without compromising on essential features. Our unique 'Learn Trading & Earn' program empowers users to enhance their trading skills while earning rewards, creating an educational and profitable experience. At VeenoX, we're committed to revolutionizing decentralized finance by providing a secure, efficient, and user-friendly platform for both novice and experienced traders. Join us in shaping the future of DeFi trading.",
};

export default function PagesExample() {
  return <Bridge />;
}
