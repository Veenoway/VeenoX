import { DynamicFooter } from "@/layouts/dynamic-footer";
import { DynamicHeader } from "@/layouts/dynamic-header";
import Web3OnBoardProvider from "@/lib/web3onBoard/provider";
import { Providers } from "@/provider/wrapper";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "dotenv/config";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const OrderlyProvider = dynamic(() => import("../lib/orderly/"), {
  ssr: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VeenoX | Decentralized crypto exchange",
  description:
    "VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology. We offer traders the lowest fees in the market without compromising on essential features. Our unique 'Learn Trading & Earn' program empowers users to enhance their trading skills while earning rewards, creating an educational and profitable experience. At VeenoX, we're committed to revolutionizing decentralized finance by providing a secure, efficient, and user-friendly platform for both novice and experienced traders. Join us in shaping the future of DeFi trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VeenoX - Decentralized Exchange</title>
        <meta
          name="description"
          content="VeenoX is a cutting-edge perpetual decentralized exchange (DEX) built on the Orderly Network and powered by Monad technology."
        />
        <link rel="icon" href="/pwa/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/pwa/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/pwa/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/pwa/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="theme-color" content="#1B1D22" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="VeenoX" />

        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14_Pro.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14_Pro_Max.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_11__iPhone_XR.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/10.2__iPad.png"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/10.5__iPad_Air.png"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/10.9__iPad_Air.png"
          media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/11__iPad_Pro__iPad_Air.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/12.9__iPad_Pro.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/8.3__iPad_Mini.png"
          media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>

      <body className={inter.className}>
        <Web3OnBoardProvider>
          <OrderlyProvider>
            <Providers>
              <NextTopLoader
                color="#836EF9"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={false}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                template='<div class="bar" role="bar"><div class="peg"></div></div> 
               <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
                zIndex={1600}
                showAtBottom={false}
              />
              <DynamicHeader />
              {children}
              <Analytics />
              <SpeedInsights />
              <DynamicFooter />
            </Providers>{" "}
          </OrderlyProvider>
        </Web3OnBoardProvider>
      </body>
    </html>
  );
}
