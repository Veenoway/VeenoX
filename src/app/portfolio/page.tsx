import { Portfolio } from "@/feature/portfolio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Veenox",
  description:
    "VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology. We offer traders the lowest fees in the market without compromising on essential features. Our unique 'Learn Trading & Earn' program empowers users to enhance their trading skills while earning rewards, creating an educational and profitable experience. At VeenoX, we're committed to revolutionizing decentralized finance by providing a secure, efficient, and user-friendly platform for both novice and experienced traders. Join us in shaping the future of DeFi trading.",
};

function DashboardPage() {
  const title = "Portfolio | VeenoX";
  const description =
    "VeenoX Portfolio: Your Command Center for DeFi Trading. Access real-time market data, manage your portfolio, and execute trades with ease on our cutting-edge DEX. Monitor your positions, track your P&L, and analyze market trends all in one place. Benefit from the lowest fees in the market while leveraging Orderly Network and Monad technology for lightning-fast transactions. Enhance your trading strategy with personalized insights and participate in our 'Learn Trading & Earn' program directly from your dashboard. Experience the future of decentralized finance with VeenoX - where security, efficiency, and user-friendliness converge.";
  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <Portfolio />{" "}
    </>
  );
}

export default DashboardPage;
