type FeeTierType = {
  tier: number;
  volume_30d: string;
  maker: string;
  taker: string;
  maker_fee: number;
  taker_fee: number;
};

export const feeTiers: FeeTierType[] = [
  {
    tier: 1,
    volume_30d: "0 - 500K",
    maker: "0.025%",
    taker: "0.055%",
    maker_fee: 2.5,
    taker_fee: 5.5,
  },
  {
    tier: 2,
    volume_30d: "500K - 2.5M",
    maker: "0.022%",
    taker: "0.052%",
    maker_fee: 2.3,
    taker_fee: 5.3,
  },
  {
    tier: 3,
    volume_30d: "2.5M - 10M",
    maker: "0.017%",
    taker: "0.047%",
    maker_fee: 2.1,
    taker_fee: 5.1,
  },
  {
    tier: 4,
    volume_30d: "10M - 100M",
    maker: "0.011%",
    taker: "0.041%",
    maker_fee: 1.8,
    taker_fee: 4.8,
  },
  {
    tier: 5,
    volume_30d: "100M - 250M",
    maker: "0.005%",
    taker: "0.035%",
    maker_fee: 1.2,
    taker_fee: 4.2,
  },
  {
    tier: 6,
    volume_30d: "> 250M",
    maker: "0%",
    taker: "0.03%",
    maker_fee: 0.6,
    taker_fee: 3.6,
  },
];
