import { FavoriteProps, MarketTickerProps } from "@/models";
import { formatSymbol, getTokenPercentage } from "@/utils/misc";
import { useLocalStorage } from "@orderly.network/hooks";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

export const Favorites = ({ props }: FavoriteProps) => {
  const { data } = props;
  const [values, _] = useLocalStorage("FAVORITES", [
    "PERP_BTC_USDC",
    "PERP_ORDER_USDC",
  ]);
  const favorites = data.filter((entry) => values.includes(entry.symbol));

  const get24hChange = (closePrice: number, openPrice: number) => {
    return ((closePrice - openPrice) / openPrice) * 100;
  };

  return (
    <div className="flex items-center justify-between w-full md:min-h-[38px] min-h-[30px] relative py-1 border-b border-borderColor overflow-x-scroll no-scrollbar">
      <div className="flex items-center px-3 ">
        <FaStar className="text-yellow text-sm mr-1" />
        <div className="h-full flex items-center whitespace-nowrap">
          {favorites.map((item: MarketTickerProps, index: number) => {
            const change = get24hChange(item["24h_close"], item["24h_open"]);
            return (
              <button
                key={index}
                className="text-xs text-white h-[28px] sm:h-[32px] flex items-center rounded px-3 hover:bg-terciary"
              >
                <Link
                  className="flex items-center justify-center"
                  href={`/perp/${item.symbol}`}
                >
                  <span>{formatSymbol(item.symbol)}</span>
                  <span
                    className={`${change > 0 ? "text-green" : "text-red"} ml-2`}
                  >
                    {getTokenPercentage(change)}%
                  </span>
                </Link>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
