import { Perp } from "@/feature/perp";
import { formatSymbol, getFormattedAmount } from "@/utils/misc";
import { Metadata } from "next";

// export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Perp | Veenox",
  description:
    "VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology. We offer traders the lowest fees in the market without compromising on essential features. Our unique 'Learn Trading & Earn' program empowers users to enhance their trading skills while earning rewards, creating an educational and profitable experience. At VeenoX, we're committed to revolutionizing decentralized finance by providing a secure, efficient, and user-friendly platform for both novice and experienced traders. Join us in shaping the future of DeFi trading.",
};

type ParamsProps = {
  params: {
    perp: string[];
  };
};

async function fetchAssetData({ params }: ParamsProps) {
  const options = { method: "GET" };

  const fetching = await fetch(
    `https://api-evm.orderly.org/v1/public/futures/${params.perp[0]}`,
    options
  ).then((response) => response.json());
  if (fetching.error) throw new Error(fetching.error);
  return fetching;
}

async function AssetPage({ params }: ParamsProps) {
  const { data } = await fetchAssetData({ params });

  const title = `${getFormattedAmount(data?.mark_price)} | ${formatSymbol(
    data?.symbol
  )} | VeenoX`;

  const description = `Trade ${formatSymbol(
    data?.symbol,
    true
  )} on VeenoX - Current Price: $${
    data?.mark_price
  }. Experience low-fee perpetual trading on our cutting-edge DEX powered by Orderly Network and Monad. Get real-time market data, advanced charting tools, and seamless order execution. Enhance your trading skills with our 'Learn & Earn' program while enjoying industry-leading security. Start trading ${formatSymbol(
    data?.symbol,
    true
  )} now and be part of the DeFi revolution with VeenoX.`;

  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <Perp asset={data} />
    </>
  );
}

export default AssetPage;
