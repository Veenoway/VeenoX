import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/shadcn/tooltip";
import { getFormattedAmount } from "@/utils/misc";
import { useAccount } from "@orderly.network/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TradingReward {
  est_trading_volume: number;
  est_avg_stake: number;
  est_stake_boost: number;
  est_r_wallet: number;
  rows: BrokerReward[];
}

interface BrokerReward {
  broker_id: string;
  est_r_account: number;
}

export const OrderlyRewards = () => {
  const { account } = useAccount();
  const [rewards, setRewards] = useState<TradingReward | null>(null);

  async function fetchTradingRewards() {
    if (!account?.address) return;
    const url = `https://api-evm.orderly.org/v1/public/trading_rewards/current_epoch_estimate?address=${account.address}`;
    const options: RequestInit = { method: "GET" };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRewards(data?.data);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    fetchTradingRewards();
  }, [account]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild className="h-full min-w-fit mr-5">
          <Link
            href="https://app.orderly.network/tradingRewards"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="h-[35px] w-fit flex items-center">
              <img
                height={25}
                width={25}
                alt="Order logo"
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/32809.png"
              />
              <div className="ml-2 flex-col items-start text-xs">
                <p className="text-[10px] text-font-60">Est. reward:</p>
                <p className="text-start text-white font-medium">
                  {getFormattedAmount(rewards?.est_r_wallet) || 0}
                </p>{" "}
              </div>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={12}
          className="flex flex-col w-[220px] p-2.5 z-[102] whitespace-nowrap shadow-lg shadow-secondary bg-secondary border border-borderColor"
        >
          <div className="flex items-center justify-between w-full pb-2">
            <p className="text-font-60 text-xs">Est. Avg. Stake</p>
            <p className="text-white text-xs">
              {getFormattedAmount(rewards?.est_avg_stake) || 0}
            </p>
          </div>
          <div className="flex items-center justify-between w-full pb-2">
            <p className="text-font-60 text-xs">Est. Stake boost</p>
            <p className="text-white text-xs">
              x{getFormattedAmount(rewards?.est_stake_boost) || 0}
            </p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-font-60 text-xs">Est. trading volume</p>
            <p className="text-white text-xs">
              ${getFormattedAmount(rewards?.est_trading_volume) || 0}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
