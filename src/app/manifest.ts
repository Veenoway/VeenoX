import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VeenoX",
    short_name: "VeenoX",
    description:
      "VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology. We offer traders the lowest fees in the market without compromising on essential features. Our unique 'Learn Trading & Earn' program empowers users to enhance their trading skills while earning rewards, creating an educational and profitable experience. At VeenoX, we're committed to revolutionizing decentralized finance by providing a secure, efficient, and user-friendly platform for both novice and experienced traders. Join us in shaping the future of DeFi trading. ",
    start_url: "/perp/PERP_BTC_USDC",
    display: "standalone",
    background_color: "#1B1D22",
    theme_color: "#836EF9",
    icons: [
      {
        src: "/pwa/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
