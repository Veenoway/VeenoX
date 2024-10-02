import Link from "next/link";

export const LandingFooter = () => {
  return (
    <div className="w-full bg-secondary border-t border-borderColor pt-[40px] sm:pt-[60px] pb-[60px] sm:pb-[100px]">
      <img
        src="/veenox/veenox-text.png"
        height={45}
        width={130}
        alt="VeenoX logo"
        className="h-[45px] w-[110px] sm:h-[50px] sm:w-[130px] mb-10 md:hidden flex mx-auto"
      />
      <div className="flex justify-between sm:max-w-sm md:max-w-5xl mx-auto w-[90%]">
        <div className="md:block hidden">
          <img
            src="/veenox/veenox-text.png"
            height={50}
            width={130}
            alt="VeenoX logo"
            className="h-[50px]"
          />
          <p className="text-font-60 text-sm mt-3 font-light">
            Unleash your <br />
            trading experience
          </p>{" "}
        </div>
        <div className="flex w-[90%] mx-auto md:mx-0 md:w-[50%] justify-between gap-5">
          <div>
            <p className="text-white text-base md:text-xl mb-4">Services</p>
            <ul className="text-font-60 text-sm md:text-base font-light">
              <li>
                <Link href="/perp/PERP_BTC_USDC">Trade</Link>
              </li>
              <li className="my-2">
                <Link href="/bridge">Swap</Link>
              </li>
              <li>
                <Link href="/portfolio">Portfolio</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white text-base md:text-xl mb-4">Community</p>
            <ul className="text-font-60 text-sm md:text-base font-light">
              <li>
                <Link
                  href="https://discord.gg/wPTSZXzUcN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </Link>
              </li>
              <li className="my-2">
                <Link
                  href="https://x.com/veenox_xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://t.me/veenox_xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white text-base md:text-xl mb-4">Others</p>
            <ul className="text-font-60 text-sm md:text-base font-light">
              <li>
                <Link
                  href="https://veenox.gitbook.io/veenox/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Doc
                </Link>
              </li>
              <li className="my-2">
                <Link href="#faq">FAQ</Link>
              </li>
              <li>Galxe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
