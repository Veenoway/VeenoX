import type { Chain } from "@web3-onboard/common";
import { ConnectedChain } from "@web3-onboard/core";

export function isTestnet(chain: ConnectedChain | null): boolean {
  if (!chain) return false;
  return !["0xa4b1", "0xa"].includes(chain.id);
}

type SupportedChain = Chain & {
  network: "mainnet" | "testnet";
  icon: string;
  chainId: number;
} & { id: string };

export const supportedChains: SupportedChain[] = [
  {
    network: "mainnet",
    icon: "/assets/ARB.png",
    id: "0xa4b1",
    token: "ETH",
    label: "Arbitrum One",
    rpcUrl: "https://arbitrum-one.publicnode.com",
    chainId: 42161,
  },
  {
    network: "mainnet",
    icon: "/assets/OP.png",
    id: "0xa",
    token: "ETH",
    label: "OP Mainnet",
    rpcUrl: "https://mainnet.optimism.io",
    chainId: 10,
  },
  {
    network: "mainnet",
    icon: "/assets/BASE_LOGO.png",
    id: "0x2105",
    token: "ETH",
    label: "Base",
    rpcUrl: "https://base-rpc.publicnode.com",
    chainId: 8453,
  },
  // {
  //   network: "mainnet",
  //   icon: "/assets/MATIC.png",
  //   id: "0x89",
  //   token: "POL",
  //   label: "Polygon",
  //   rpcUrl: "https://polygon-bor-rpc.publicnode.com",
  //   chainId: 137,
  // },
  // {
  //   network: "mainnet",
  //   icon: "/assets/ETH.png",
  //   id: "0x1",
  //   token: "ETH",
  //   label: "Ethereum",
  //   rpcUrl: "https://ethereum-rpc.publicnode.com",
  //   chainId: 1,
  // },
  {
    network: "testnet",
    icon: "/assets/arbitrum_sepolia.svg",
    id: "0x66eee",
    token: "ETH",
    label: "Arbitrum Sepolia",
    rpcUrl: "https://arbitrum-sepolia.publicnode.com",
    chainId: 421614,
  },
  {
    network: "testnet",
    icon: "/assets/optimism_sepolia.svg",
    id: "0xaa37dc",
    token: "ETH",
    label: "OP Sepolia",
    rpcUrl: "https://optimism-sepolia.publicnode.com",
    chainId: 11155111,
  },
  {
    network: "testnet",
    icon: "/assets/base_sepolia.svg",
    id: "0x14a34",
    token: "ETH",
    label: "Base Sepolia",
    rpcUrl: "https://base-sepolia-rpc.publicnode.com",
    chainId: 84532,
  },
];

export const supportedChainIds = supportedChains.map(({ id }) => Number(id));

export type ChainsImageType =
  | 1
  | 56
  | 324
  | 137
  | 534352
  | 59144
  | 42161
  | 100
  | 255
  | 43114
  | 34443;

export const chainsImage: { [key: number]: string } = {
  1: "/assets/ETH.png",
  56: "/assets/BSC.png",
  324: "/assets/ZK.png",
  137: "/assets/MATIC.png",
  100: "/assets/MONAD.png",
  534352: "/assets/SCROLL.png",
  59144: "/assets/LINEA.png",
  255: "/assets/KROMA.jpg",
  43114: "/assets/AVAX.png",
  34443: "/assets/MODE.png",
  42161: "/assets/ARB.png",
  10: "/assets/OP.png",
  8453: "/assets/BASE_LOGO.png",
};

export const chainsName: { [key: number]: string } = {
  1: "Ethereum",
  42161: "Arbitrum",
  56: "BSC",
  324: "ZkSync",
  137: "Polygon",
  100: "Monad",
  534352: "Scroll",
  59144: "Linea",
  255: "Kroma",
  43114: "Avalanche",
  34443: "Mode",
};

export const getImageFromChainId = (id: ChainsImageType): string => {
  return chainsImage[id];
};

export const parseChainId = (
  chainId: string | undefined
): number | string | undefined => {
  if (!chainId) return chainId;
  if (chainId.startsWith("0x")) {
    return parseInt(chainId, 16);
  } else {
    return parseInt(chainId, 10);
  }
};
