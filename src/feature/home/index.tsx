"use client";
import { Card, Carousel } from "@/components/caroussel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/shadcn/accordion";
import { chainsImage, chainsName } from "@/utils/network";
import { useDaily } from "@orderly.network/hooks";
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { IoAddOutline } from "react-icons/io5";
import { Row } from "./components/row";
// @ts-ignore
import { gridContent, rowsContent } from "./constant.ts";

type BoxProps = {
  children: React.ReactNode;
  className?: string;
  isOdd?: boolean;
};

const Box: React.FC<BoxProps> = ({ children, className, isOdd = false }) => (
  <div
    className={`bg-terciary p-4 h-[350px] rounded-[40px] border border-borderColor shadow-lg shadow-[rgba(0,0,0,0.2)] ${className}`}
    style={{
      backgroundImage: isOdd
        ? "linear-gradient(45deg, rgba(43,47,54,1) 27%, #1B1D22 100%)"
        : "linear-gradient(135deg, #1B1D22 27%, rgba(43,47,54,1) 100%)",
    }}
  >
    {children}
  </div>
);

export const Home = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  const mainControls = useAnimation();
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView]);

  const springConfig = { stiffness: 100, damping: 10, bounce: 0 };
  const cardRef = useRef(null);

  const { scrollYProgress: scrollYFirst } = useScroll({
    target: cardRef,
    offset: ["0 1", "0.5 1"],
  });
  const { scrollYProgress: scrollYSec } = useScroll({
    target: cardRef,
    offset: ["0.1 1", "0.6 1"],
  });
  const { scrollYProgress: scrollYThird } = useScroll({
    target: cardRef,
    offset: ["0.25 1", "0.75 1"],
  });

  const translateYFirst = useTransform(scrollYFirst, [0, 1], [150, 0]);
  const translateYSec = useTransform(scrollYSec, [0, 1], [150, 0]);
  const translateYThird = useTransform(scrollYThird, [0, 1], [150, 0]);

  const translateXFirst = useTransform(scrollYFirst, [0, 1], [150, 0]);
  const translateXSec = useTransform(scrollYSec, [0, 1], [150, 0]);
  const translateXThird = useTransform(scrollYThird, [0, 1], [150, 0]);

  const getAnimationStyle = (i: number) => {
    if (i === 0)
      return {
        position: "translateY",
        translate: translateYFirst,
        delay: 0,
        scrollYProgress: scrollYFirst,
      };
    else if (i === 1)
      return {
        position: "translateY",
        translate: translateYSec,
        delay: 0.5,
        scrollYProgress: scrollYSec,
      };
    else if (i === 2)
      return {
        position: "translateY",
        translate: translateYThird,
        delay: 1,
        scrollYProgress: scrollYThird,
      };
    else if (i === 3)
      return {
        position: "translateY",
        translate: translateXFirst,
        delay: 1.5,
        scrollYProgress: scrollYFirst,
      };
    else if (i === 4)
      return {
        position: "translateY",
        translate: translateYSec,
        delay: 2,
        scrollYProgress: scrollYSec,
      };
    return {
      position: "translateY",
      translate: translateXThird,
      delay: 2.5,
      scrollYProgress: scrollYThird,
    };
  };

  const carousselContent = [
    {
      src: "/veenox/trade.png",
      title: "Unified Orderbook & Liquidity",
      category: "PERP",
      content: <p className="text-white">{gridContent[0].description}</p>,
      description: gridContent[0].description,
    },
    {
      src: "/veenox/trade-2.png",
      title: "Most Competitive Fees",
      category: "PERP",
      content: <p className="text-white">{gridContent[1].description}</p>,
      description: gridContent[1].description,
    },
    {
      src: "/veenox/trade-3.png",
      title: "Ready-to-use Liquidity",
      category: "PERP",
      content: <p className="text-white">{gridContent[2].description}</p>,
      description: gridContent[2].description,
    },
    {
      src: "/veenox/trade-4.png",
      title: "One-Click Trading Experience",
      category: "PERP",
      content: <p className="text-white">{gridContent[3].description}</p>,
      description: gridContent[3].description,
    },
    {
      src: "/veenox/trading-platform.png",
      title: "CEX-Level Performance",
      category: "PERP",
      content: <p className="text-white">{gridContent[4].description}</p>,
      description: gridContent[4].description,
    },
  ];

  const cards = carousselContent.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));
  const { data } = useDaily();
  return (
    <div className="flex flex-col " ref={ref}>
      <div className="w-full flex items-center justify-center py-[50px] lg:py-[150px] pt-[150px] lg:pt-[250px] bg-[#15171b]">
        {/* <div className="sparkles" /> */}
        <div className="w-[90%] max-w-[1200px] flex flex-col md:flex-row items-center justify-between">
          <motion.div className="flex flex-col  ">
            <div
              className="overflow-hidden block relative md:whitespace-nowrap
               text-4xl lg:text-6xl font-extrabold w-auto text-white uppercase text-start lg:leading-[60px]"
            >
              Unleash limitless
              <br />
              trading with the <br />
              <span className="text-base_color"> lowest fees</span>
            </div>
            <motion.div
              className="flex w-full jusitfy-start"
              initial="visible"
              whileHover="hovered"
              variants={{
                initial: {
                  opacity: 0,
                  y: 10,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              animate={mainControls}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <p className="text-sm lg:text-lg text-font-80 font-normal text-start mt-3 lg:mt-7 max-w-[450px] lg:max-w-[600px]">
                Experience a new era of trading with VeenoX, the pioneering
                decentralized exchange on{" "}
                <span className="text-white font-bold">Monad</span>. Enjoy an
                intuitive user interface and benefit from the{" "}
                <span className="text-white font-bold">lowest fees</span> in the
                market coupled with{" "}
                <span className="text-white font-bold">low-slippage & lightning-fast 
                settlement</span> powered by Orderly Network, for seamless and
                cost-effective trading.
              </p>
            </motion.div>
            <div className="flex items-center w-fit justify-start">
              <motion.button
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 10,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                initial="visible"
                animate={mainControls}
                transition={{
                  duration: 0.3,
                  delay: 0.9,
                }}
                className="mt-7 lg:mt-[50px] h-[40px] lg:h-[50px] px-2 lg:px-3 rounded-full mx-auto text-white text-lg mr-auto cursor-pointer bg-base_color"
              >
                <Link href="/perp/PERP_BTC_USDC" className="w-full h-full">
                  <div className="flex items-center justify-center w-full text-sm lg:text-lg h-full px-3 lg:px-4 py-1.5 lg:py-2">
                    Get Started
                  </div>
                </Link>
              </motion.button>
              {/* <motion.button
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 10,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                initial="visible"
                animate={mainControls}
                transition={{
                  duration: 0.3,
                  delay: 0.9,
                }}
                className="mt-7 lg:mt-[50px] h-[40px] lg:h-[50px] px-2 lg:px-3 ml-4 lg:ml-5 rounded-full mx-auto text-base_color text-lg mr-auto cursor-pointer border border-base_color"
              >
                <Link href="/perp/PERP_BTC_USDC" className="w-full h-full">
                  <div className="flex items-center justify-center w-full text-sm lg:text-lg h-full px-3 lg:px-4 py-1.5 lg:py-2">
                    Learn More
                  </div>
                </Link>
              </motion.button> */}
            </div>
          </motion.div>
          <div className="md:flex flex-col mt-10 hidden  z-0">
            <img
              src="/logo/veeno-purple.png"
              className="h-[450px] md:h-[400px] lg:h-[550px] object-cover rotate-[15deg]"
            />
          </div>
        </div>
      </div>

      <div className="w-full py-[50px] lg:py-[100px] shadowY border-t border-borderColor-DARK z-[10] ">
        <div
          className="w-[90%] max-w-[1200px] mx-auto flex flex-col items-center justify-center"
          ref={cardRef}
        >
          <h2
            className="overflow-hidden block relative lg:whitespace-nowrap
              text-4xl lg:text-5xl font-bold w-fit opacity-100 mr-auto text-white"
          >
            <span className="text-base_color">Level up </span> your trading
            experience
          </h2>
          <Carousel items={cards} />
        </div>{" "}
      </div>
      {/* <HeroParallax /> */}
      <div className="w-full relative border-t border-borderColor-DARK bg-[#15171B]">
        <div className="w-[90%] max-w-[1200px] mx-auto relative flex flex-col justify-center py-[50px] lg:py-[150px]">
          <h2
            className="overflow-hidden block relative lg:whitespace-nowrap
           text-4xl lg:text-5xl font-bold mb-5 lg:mb-10 w-auto  text-white"
          >
            <span className="text-base_color">Powerful</span> trading tools
          </h2>
          {rowsContent.map((content, i) => (
            <Row key={i} isEven={i % 2 === 0} content={content} />
          ))}
        </div>
      </div>

      <div className="w-full h-fit flex flex-col items-center bg-secondary shadowY border-y border-borderColor-DARK py-[50px] lg:py-[100px]">
        <div className="w-[90%] max-w-[1200px]">
          <div className="flex lg:items-center lg:flex-row flex-col lg:gap-20 lg:justify-between w-full ">
            <div className="flex w-fit mb-5 lg:mb-10 mr-[5%]">
              <div className="flex flex-col items-start">
                <h2
                  className="overflow-hidden  relative lg:whitespace-nowrap
                  text-4xl lg:block hidden lg:text-5xl font-bold  mb-2 w-auto  text-white"
                >
                  Seamlessly swap assets <br />
                  on <span className=" text-base_color">Monad </span> and beyond
                </h2>
                <h2
                  className="overflow-hidden block relative lg:whitespace-nowrap
                  text-4xl lg:hidden  lg:text-5xl font-bold  mb-2 w-auto  text-white"
                >
                  Seamlessly swap assets on{" "}
                  <span className=" text-base_color">Monad </span> and beyond
                </h2>
                <p className="text-sm lg:text-lg text-font-60 mt-2 lg:mt-5 max-w-[600px]">
                  Users will be able to effortlessly swap any assets
                  available on the <span className="text-white">Monad</span>{" "}
                  chain. This functionality extends beyond Monad, allowing for
                  cross-chain swaps through{" "}
                  <span className="text-white">Wormhole</span> messages. This
                  ensures flexibility and convenience, enabling users to
                  exchange a wide variety of digital assets across different
                  blockchains.
                </p>
                <button className="mt-[30px] lg:mt-[40px] opacity-50 cursor-not-allowed h-[40px] lg:h-[50px] px-3 rounded-full text-white text-sm lg:text-lg mr-auto border border-base_color">
                  {/* <Link href="/perp/PERP_BTC_USDC" className="w-full h-full"> */}
                  <div className="flex items-center justify-center w-full font-semibold text-base text-base_color h-full px-4 py-2">
                    Swap now
                  </div>
                  {/* </Link> */}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 w-full lg:w-[380px] mt-5 lg:mt-0">
              {Object.entries(chainsImage)
                .filter(
                  ([chainId, _]: any, i) =>
                    chainsName[chainId] !== "Kroma" &&
                    chainsName[chainId] !== "Scroll" &&
                    chainsName[chainId] !== "Mode" &&
                    chainsName[chainId] !== "Linea" &&
                    chainsName[chainId] !== "Avalanche"
                )
                .map(([chainId, image]: any, i) => (
                  <div
                    key={i}
                    className="bg-[#15171B] border border-borderColor-DARK flex flex-col items-center 
                    justify-center p-2 lg:p-5 w-[60px] lg:w-[120px] h-[60px] lg:h-[120px] rounded-xl"
                  >
                    <Image
                      src={image}
                      alt={`${chainsName[chainId]} logo`}
                      width={50}
                      height={50}
                      className="rounded-full border border-borderColor"
                    />
                    <p className="text-font-80 text-sm mt-2 lg:flex hidden">
                      {chainsName[chainId]}
                    </p>
                  </div>
                ))}
              <div
                className="bg-[#15171B] border border-borderColor-DARK flex items-center 
              justify-center p-2 lg:p-5 text-white text-xl lg:text-3xl w-[60px] lg:w-[120px] h-[60px] lg:h-[120px] rounded-xl"
              >
                <IoAddOutline className="-ml-2 text-lg lg:text-2xl" />
                <p>11</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-fit flex flex-col items-center bg-[#15171B] py-[50px] lg:py-[150px]">
        <div className="w-[90%] max-w-[1200px]">
          <h2
            className="overflow-hidden block relative lg:whitespace-nowrap
           text-4xl lg:text-5xl font-bold mb-5 lg:mb-10 w-auto text-white"
          >
            Frequently <span className="text-base_color">Asked</span>
          </h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is VeenoX?</AccordionTrigger>
              <AccordionContent>
                VeenoX is a decentralized exchange that focuses on
                orderbook-based perpetuals trading, offering secure cryptocurrency trades
                through the use of Orderly Network's technology. It enables
                real-time matching of buy and sell orders, promoting transparent
                trading without centralized intermediaries, empowering
                users in the decentralized finance (DeFi) space. VeenoX now also offers
                cross-chain cryptocurrency swapping across all major blockchains at 
                unmatched prices, powered by the leading bridge aggregator LI.FI.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                VeenoX & Orderly Network&apos;s Partnership
              </AccordionTrigger>
              <AccordionContent>
                VeenoX closely partners with Orderly Network, leveraging its
                technology and core contracts, especially for trade settlements.
                This collaboration ensures not only the technological
                infrastructure behind VeenoX but also its liquidity foundation.
                While VeenoX provides the platform for trading and transaction
                coordination, Orderly Network acts as the settlement layer and a
                key source of liquidity. This dual role of Orderly Network
                supports VeenoX in maintaining high levels of security and
                efficiency in trade settlements and is instrumental in supplying
                the liquidity necessary for smooth and continuous trading
                operations on the VeenoX platform.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                TradingView-powered Charts on VeenoX
              </AccordionTrigger>
              <AccordionContent>
                TradingView is a global analytics platform for traders and investors. 
                VeenoX utilizes TradingView’s advanced charting technology,
                offering users real-time market data and analytics. This
                integration ensures precise and informed trading decisions on
                the VeenoX platform. Visit the TradingView website to discover their full 
                analytics tool suite.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>VeenoX Business Model</AccordionTrigger>
              <AccordionContent>
                VeenoX generates revenue through transaction fees, calculated as
                a percentage of the trade volume. This model aligns
                VeenoX&apos;s success with that of its users, avoiding practices
                like countertrading or imposing hidden fees.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Why Choose VeenoX?</AccordionTrigger>
              <AccordionContent>
                VeenoX distinguishes itself with its security, lowest
                transaction fees across Orderly perp dex, global access,
                advanced UI, community engagement, and commitment to continuous
                innovation, providing a superior trading experience in the
                decentralized finance landscape.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};
