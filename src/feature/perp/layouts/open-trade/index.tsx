import { Tooltip } from "@/components/tooltip";
import { useGeneralContext } from "@/context";
import { Slider } from "@/lib/shadcn/slider";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/shadcn/tooltip";
import { triggerAlert } from "@/lib/toaster";
import { Leverage } from "@/modals/leverage";
import { FuturesAssetProps } from "@/models";
import { getFormattedAmount, truncatePrice } from "@/utils/misc";
import {
  useAccountInstance,
  useCollateral,
  useHoldingStream,
  useLeverage,
  useMarginRatio,
  useMaxQty,
  useOrderEntry,
  useAccount as useOrderlyAccount,
  useOrderStream,
  usePositionStream,
  useSymbolPriceRange,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { OrderEntity, OrderSide } from "@orderly.network/types";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoChevronDown } from "react-icons/io5";
import { MdRefresh } from "react-icons/md";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";
import "rsuite/Slider/styles/index.css";
import { useAccount } from "wagmi";

type OpenTradeProps = {
  isMobile?: boolean;
  holding?: number;
  asset: FuturesAssetProps;
};
const marketType = ["Market", "Limit"];

type Inputs = {
  direction: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOPLIMIT";
  triggerPrice?: string;
  price?: string;
  quantity?: string;
  reduce_only: boolean;
  tp_trigger_price?: string;
  sl_trigger_price?: string;
};

type ButtonStatusType = {
  title: string;
  color: string;
};

const defaultValues: Inputs = {
  direction: "BUY",
  type: "MARKET",
  triggerPrice: undefined,
  price: undefined,
  quantity: undefined,
  reduce_only: false,
  tp_trigger_price: undefined,
  sl_trigger_price: undefined,
};

export const OpenTrade = ({
  isMobile = false,
  asset,
  holding,
}: OpenTradeProps) => {
  const { setTradeInfo } = useGeneralContext();
  const accountInstance = useAccountInstance();
  const [isTooltipMarketTypeOpen, setIsTooltipMarketTypeOpen] = useState(false);
  const { state, account } = useOrderlyAccount();
  const { address } = useAccount();
  const [activeHoldings, setActiveHoldings] = useState(0);
  const [isSettleLoading, setIsSettleLoading] = useState(false);
  const {
    setIsEnableTradingModalOpen,
    setIsWalletConnectorOpen,
    setOrderPositions,
    setDepositAmount,
    depositAmount,
  } = useGeneralContext();

  const {
    totalCollateral,
    freeCollateral: freeCollat,
    totalValue,
    availableBalance,
    unsettledPnL,
    positions,
    accountInfo,
  } = useCollateral({
    dp: 2,
  });
  const { usdc } = useHoldingStream();

  useEffect(() => {
    if (usdc && usdc.holding !== activeHoldings) {
      setActiveHoldings(usdc.holding);
      setDepositAmount(null);
    }
  }, [usdc]);

  const [isTokenQuantity, setIsTokenQuantity] = useState(true);
  const [values, setValues] = useState(defaultValues);
  const [inputErrors, setInputErrors] = useState({
    input_quantity: false,
    input_price_max: false,
    input_price_min: false,
    limit_max: false,
    limit_min: false,
  });
  const {
    freeCollateral,
    markPrice,
    maxQty,
    estLiqPrice,
    estLeverage,
    onSubmit,

    helper: { calculate, validator },
  } = useOrderEntry(
    {
      symbol: asset.symbol,
      side: values.direction as OrderSide,
      order_type: values.type as any,
      order_quantity: values.quantity,
    },
    { watchOrderbook: true }
  );

  const [_, { refresh }] = useOrderStream({
    symbol: asset.symbol,
  });

  const newMaxQty = useMaxQty(asset?.symbol, values.direction as OrderSide);
  // const isAlgoOrder = values?.algo_order_id !== undefined;

  const rangeInfo = useSymbolPriceRange(
    asset.symbol,
    values.direction,
    undefined
  );

  const symbolInfo = useSymbolsInfo();

  const symbols = Object.values(symbolInfo)
    .filter((cur) => typeof cur !== "boolean")
    .map((cur) => {
      if (typeof cur === "boolean") return;
      const symbol = cur();
      return symbol;
    });
  const currentAsset = symbols?.find((cur) => cur.symbol === asset?.symbol);

  const submitForm = async () => {
    if (rangeInfo?.max && Number(values?.price) > rangeInfo?.max) return;
    if (rangeInfo?.min && Number(values?.price) < rangeInfo?.min) return;
    if (values.type === "LIMIT") {
      if (values.direction === "BUY") {
        if (parseFloat(values.price as string) > markPrice) {
          triggerAlert(
            "Error",
            "A limit buy order cannot be placed above the current market price."
          );
          return;
        }
      } else {
        if (parseFloat(values.price as string) < markPrice) {
          triggerAlert(
            "Error",
            "A limit sell order cannot be placed under the current market price."
          );
          return;
        }
      }
    }

    const errors = await getValidationErrors(
      values,
      asset.symbol,
      validator,
      calculate,
      currentAsset?.base_tick
    );
    if (errors && Object.keys(errors)?.length > 0) {
      if (errors?.total?.message) {
        triggerAlert("Error", errors?.total?.message);
        return;
      }
      if (errors?.order_quantity?.message) {
        triggerAlert("Error", errors?.order_quantity?.message);
      }
      return;
    }

    if (Number(values.quantity || 0) >= currentAsset?.base_max) {
      triggerAlert(
        "Error",
        `Invalid quantity. Max quantity ${currentAsset?.base_max} ${currentAsset?.symbol}`
      );
      return;
    }

    if (Number(values.quantity || 0) <= currentAsset?.base_min) {
      triggerAlert(
        "Error",
        `Invalid quantity. Min quantity ${currentAsset?.base_min} ${currentAsset?.symbol}`
      );
      return;
    }
    const id = toast.loading("Executing Order");
    const val = calculate(
      getInput(values, asset.symbol, currentAsset?.base_tick),
      "order_quantity",
      values?.quantity
    );
    try {
      await onSubmit(val as OrderEntity);
      toast.update(id, {
        render: "Order executed",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err: any) {
      toast.update(id, {
        render: err?.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      refresh();
      refreshPosition();
      setOrderPositions(val as any);
      setValues({
        ...defaultValues,
        quantity: newMaxQty.toString(),
        direction: values.direction,
      });
      setSliderValue(100);
    }
  };

  const getStyleFromType = () => {
    return values.direction === "BUY"
      ? "left-[3px] bg-green"
      : "left-calc-slide-long bg-red";
  };
  const style = getStyleFromType();

  const getSectionBarPosition = () => {
    if (values.type === "MARKET") return "left-0";
    else if (values.type === "LIMIT") return "left-1/3";
    else return "left-2/3";
  };
  const barPosition = getSectionBarPosition();

  const handleButtonLongClick = async () => {
    if (state.status === 0) setIsWalletConnectorOpen(true);
    else if (state.status === 2 || state.status === 4)
      setIsEnableTradingModalOpen(true);
    else {
      if (values.type === "LIMIT") {
        if (Number(values.price) > (rangeInfo?.max as number)) {
          setInputErrors((prev) => ({
            ...prev,
            input_price_max: true,
          }));
          return;
        } else if (Number(values.price) < (rangeInfo?.min as number)) {
          setInputErrors((prev) => ({
            ...prev,
            input_price_min: true,
          }));
          return;
        }
      }
      submitForm();
    }
  };

  const getButtonStatus = (): ButtonStatusType => {
    if (state.status === 0)
      return {
        title: "Connect wallet",
        color: "bg-base_color",
      };
    else if (state.status === 2 || state.status === 4)
      return {
        title: "Enable trading",
        color: "bg-base_color",
      };
    else if (state.status > 4) {
      if (values.direction === "BUY")
        return {
          title: "Buy / Long",
          color: "bg-green",
        };
      return {
        title: "Sell / Short",
        color: "bg-red",
      };
    } else
      return {
        title: "Connect wallet",
        color: "bg-base_color",
      };
  };
  const buttonStatus = getButtonStatus();

  const [maxLeverage] = useLeverage();

  function percentageToValue(percentage: number | undefined) {
    return ((percentage as number) / 100) * newMaxQty;
  }
  function toPercentage(value: number | string) {
    let newValue: number;
    if (typeof value === "string") newValue = parseFloat(value);
    else newValue = value;
    const percentage = (newValue / newMaxQty) * 100;
    return Math.floor(percentage);
  }

  const getSymbolForPair = () => {
    const formatted = asset.symbol.split("_")[1];
    return formatted;
  };
  const handleValueChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "quantity") setSliderValue(toPercentage(value));
  };

  const [data, _info, { refresh: refreshPosition, loading }] =
    usePositionStream();

  const [sliderValue, setSliderValue] = useState(toPercentage(newMaxQty));

  const handleInputErrors = (boolean: boolean, name: string) => {
    setInputErrors((prev) => ({
      ...prev,
      [name]: boolean,
    }));
  };

  useEffect(() => {
    if (newMaxQty) {
      setValues((prev) => ({
        ...prev,
        quantity: newMaxQty.toString(),
      }));
      setSliderValue(100);
    }
  }, [newMaxQty !== 0, maxLeverage, values.direction]);

  const formatPercentage = (value: number) => {
    return (value / 100).toFixed(3) + "%";
  };

  const [positionPnL] = usePositionStream();
  const [isTooltipDepositOpen, setIsTooltipDepositOpen] = useState(false);

  useEffect(() => {
    if (!depositAmount) setIsTooltipDepositOpen(false);
  }, [depositAmount]);

  const [expendAccountInfo, setExpendAccountInfo] = useState(false);
  const { marginRatio } = useMarginRatio();

  const totalMarginRequired = data?.rows?.reduce(
    (sum, position) => sum + position.notional * position.imr,
    0
  );
  const totalMaintenanceMargin = data?.rows?.reduce(
    (sum, position) => sum + position.mm,
    0
  );

  const formatCurrency = (value: number) => {
    if (value == null) return "$0";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace("US", "");
  };

  const formatPercentages = (value: number) => {
    if (value == null) return "0%";
    return new Intl.NumberFormat("fr-FR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <section className="h-full w-full text-white">
      <div className="flex flex-col sm:px-4 px-2 border-b border-borderColor">
        <div
          className={`overflow-hidden h-full transition-all duration-200 ease-in-out`}
        >
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col">
              <p className="text-xs text-font-60 mb-[3px]">Total Value</p>
              <div
                className={`text-base flex items-center font-medium ${
                  depositAmount
                    ? "animate-pulse text-base_color"
                    : " text-white"
                } transition-opacity duration-1000 ease-in-out`}
              >
                {depositAmount ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-base_color text-sm mr-2" />
                ) : null}
                {totalValue} {positionPnL.aggregated.unrealizedPnl}{" "}
                <span className="text-font-60 ml-1">USDC</span>
              </div>{" "}
            </div>
            {isMobile ? null : <Leverage />}
          </div>
          <div className="border-t border-borderColor-DARK pt-2 pb-1.5" />
          <div className="flex items-center justify-between pb-3">
            <div className="flex flex-col w-fit">
              <p className="text-xs text-font-60 mb-[3px]">Unreal PnL</p>
              <p
                className={`text-sm font-medium ${
                  data?.aggregated.unrealPnL > 0
                    ? "text-green"
                    : data?.aggregated.unrealPnL < 0
                    ? "text-red"
                    : "text-white"
                }`}
              >
                {data?.aggregated.unrealPnL
                  ? (data?.aggregated.unrealPnL).toFixed(2)
                  : data?.aggregated.unrealPnL}{" "}
                ({data?.aggregated.unrealPnlROI.toFixed(2)}
                %)
              </p>
            </div>
            <div>
              <p className="text-xs text-font-60 mb-[3px]">Unsettled PnL</p>
              <div
                className={`text-sm font-medium text-end flex items-center justify-end `}
              >
                <TooltipProvider>
                  <ShadTooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (unsettledPnL !== 0 && accountInstance) {
                            setIsSettleLoading(true);
                            accountInstance
                              ?.settle()
                              .then((e) => {
                                setIsSettleLoading(false);
                                triggerAlert(
                                  "Success",
                                  "Settlement completed."
                                );
                              })
                              .catch((e) => {
                                setIsSettleLoading(false);
                                triggerAlert("Error", "Settlement has failed.");
                              });
                          }
                        }}
                        className={`${
                          unsettledPnL !== 0
                            ? ""
                            : "opacity-40 pointer-events-none"
                        } flex items-center text-sm text-white transition-all duration-100 ease-in-out`}
                      >
                        {isSettleLoading ? (
                          <Oval
                            visible={true}
                            height="13"
                            width="13"
                            color="#FFF"
                            secondaryColor="rgba(255,255,255,0.6)"
                            ariaLabel="oval-loading"
                            strokeWidth={6}
                            strokeWidthSecondary={6}
                            wrapperStyle={{
                              marginRight: "5px",
                            }}
                            wrapperClass=""
                          />
                        ) : (
                          <MdRefresh className="text-base mr-[5px]" />
                        )}
                        <span
                          className={`${
                            unsettledPnL > 0
                              ? "text-green"
                              : unsettledPnL < 0
                              ? "text-red"
                              : "text-white"
                          }`}
                        >
                          {getFormattedAmount(unsettledPnL)}{" "}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="h-fit overflow-clip text-white max-w-[150px] w-full text-start p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
                    >
                      Settlement will take up to 1 minute before you can
                      withdraw your available balance.
                    </TooltipContent>
                  </ShadTooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>{" "}
        </div>
        {/* <button
          className="w-full py-2 flex items-center justify-center"
          onClick={() => setExpendAccountInfo((prev) => !prev)}
        >
          <IoChevronDown
            className={`text-xl text-white ${
              expendAccountInfo ? "-rotate-180" : "rotate-0"
            } transition-all duration-200 ease-in-out`}
          />
        </button> */}
      </div>

      <div className="flex items-center w-full h-[36px] sm:h-[44px] relative">
        {marketType.map((type, i) => (
          <button
            key={i}
            className="w-1/3 h-full text-white text-xs font-medium"
            onClick={() => {
              if (values.price && values.type === "LIMIT")
                setValues((prev) => ({
                  ...prev,
                  price: undefined,
                }));
              handleValueChange("type", type.toUpperCase());
            }}
          >
            {type}
          </button>
        ))}
        <button
          className="w-1/3 h-full text-white text-xs opacity-50 cursor-not-allowed font-medium flex items-center justify-center"
          // onClick={() => setIsTooltipMarketTypeOpen((prev) => !prev)}
        >
          {values.type !== "MARKET" && values.type !== "LIMIT"
            ? values.type
            : "Pro"}
          <IoChevronDown
            className={`ml-1 mr-0 pr-0 ${
              isTooltipMarketTypeOpen ? "rotate-180" : ""
            } transition-transform duration-150 ease-in-out`}
          />
        </button>
        <Tooltip
          className="right-1 w-[100px] left-auto shadow-2xl border-borderColor-DARK translate-x-0 z-20 top-[90%] p-2.5 py-1"
          isOpen={isTooltipMarketTypeOpen}
        >
          <button
            className="w-full text-white text-xs pb-1 text-start"
            onClick={() => {
              handleValueChange("type", "StopLimit");
              setIsTooltipMarketTypeOpen(false);
            }}
          >
            Stop Limit
          </button>
          <button
            className="w-full text-white text-xs pt-1 text-start whitespace-nowrap"
            onClick={() => {
              handleValueChange("type", "StopMarket");
              setIsTooltipMarketTypeOpen(false);
            }}
          >
            Stop Market
          </button>
        </Tooltip>
      </div>
      <div className="bg-terciary h-[1px] w-full relative">
        <div
          className={`h-[1px] w-1/3 bottom-0 transition-all duration-200 ease-in-out bg-font-80 absolute ${barPosition}`}
        />
      </div>
      <div className="flex flex-col w-full p-2 sm:p-4 h-calc-leverage-height">
        <div className="pb-0">
          <div className="flex items-center w-full">
            <div className="flex items-center p-0.5 sm:p-[3px] relative w-full bg-terciary border border-borderColor-DARK rounded">
              <button
                className="w-1/2 h-[28px] sm:h-[34px] text-white rounded-l text-xs sm:text-[13px] z-10"
                onClick={() => handleValueChange("direction", "BUY")}
              >
                Buy
              </button>
              <button
                className="w-1/2 z-10 h-[28px] sm:h-[34px] text-white rounded-r text-xs sm:text-[13px]"
                onClick={() => handleValueChange("direction", "SELL")}
              >
                Sell
              </button>
              <div
                className={`${style} w-1/2 h-[28px] sm:h-[34px] absolute z-0 rounded-[3px] transition-all duration-300 ease-in-out`}
              />
            </div>
          </div>
          <div className="flex items-center w-full justify-between mt-4">
            <p className="text-xs text-font-60">Available to Trade</p>
            <p className="text-xs text-white font-medium">
              {getFormattedAmount(freeCollateral)} USDC
            </p>
          </div>

          {values.type === "STOPLIMIT" ? (
            <div className="flex items-center h-[35px] bg-terciary justify-between w-full border border-borderColor-DARK rounded mt-3">
              <input
                name="size"
                className="w-full pl-2 text-white text-sm h-full"
                placeholder="Stop Price"
                onChange={(e) =>
                  handleValueChange("triggerPrice", e.target.value)
                }
                type="number"
              />
              <p className="px-2 text-white text-sm">USD</p>
            </div>
          ) : null}
          {values.type !== "MARKET" ? (
            <>
              <div
                className={`flex items-center h-[35px] bg-terciary justify-between w-full border ${
                  inputErrors.input_price_max || inputErrors.input_price_min
                    ? "border border-red"
                    : "border-borderColor-DARK"
                } rounded mt-2 transition-all duration-100 ease-in-out`}
              >
                <input
                  name="size"
                  className="w-full pl-2 text-white text-sm h-full"
                  placeholder="Price"
                  type="number"
                  onChange={(e) => {
                    handleInputErrors(false, "input_price_max");
                    handleInputErrors(false, "input_price_min");
                    handleValueChange("price", e.target.value);
                  }}
                  value={values.price}
                />
                <button
                  onClick={() =>
                    handleValueChange("price", markPrice.toString())
                  }
                  className="text-sm text-base_color font-medium mr-1"
                >
                  Last
                </button>
                <p className="px-2 text-white text-sm">USD</p>
              </div>
              <p
                className={`text-red w-full text-xs mt-1 mb-1.5 pointer-events-none ${
                  inputErrors.input_price_max || inputErrors.input_price_min
                    ? "opacity-100 static"
                    : "opacity-0 absolute"
                } transition-all duration-100 ease-in-out`}
              >
                {(Number(values.price) as number) >
                (rangeInfo?.max as number) ? (
                  <>
                    Price can&apos;t exceed {getFormattedAmount(rangeInfo?.max)}
                  </>
                ) : (
                  <>
                    Price can&apos;t be lower than{" "}
                    {getFormattedAmount(rangeInfo?.min)}
                  </>
                )}
              </p>
            </>
          ) : null}
          <div
            className={`flex items-center h-[35px] bg-terciary justify-between ${
              inputErrors.input_quantity
                ? "border border-red"
                : "border-borderColor-DARK"
            } w-full border  rounded mt-2`}
          >
            <input
              name="quantity"
              className={`w-full pl-2 text-white text-sm h-full`}
              placeholder="Quantity"
              onChange={(e) => {
                if (e.target.value === "") {
                  handleInputErrors(false, "input_quantity");
                  handleValueChange("quantity", "");
                } else if (Number(e.target.value) > maxQty) {
                  handleValueChange("quantity", e.target.value);
                  handleInputErrors(true, "input_quantity");
                } else {
                  handleValueChange("quantity", e.target.value);
                  handleInputErrors(false, "input_quantity");
                }
              }}
              type="number"
              disabled={!freeCollateral || !address}
              value={truncatePrice(values.quantity as string)}
            />
            <button
              className="rounded text-[12px] flex items-center
             justify-center min-w-[50px] pl-1 text-white font-medium h-[24px] ml-1 w-fit pr-2"
            >
              <p className="px-2 text-white text-sm">{getSymbolForPair()}</p>
              <IoChevronDown className="text-white text-xs " />
            </button>
            {/* <Popover>
              <PopoverTrigger className="h-full min-w-fit">
              
              </PopoverTrigger>
              <PopoverContent
                sideOffset={0}
                className="flex flex-col p-1.5 z-[102] w-fit whitespace-nowrap bg-secondary border border-borderColor shadow-xl"
              >
                <button
                  onClick={() => setIsTokenQuantity((prev) => !prev)}
                  className={`h-[22px] ${
                    isTokenQuantity ? "text-base_color font-bold" : "text-white"
                  } w-fit px-1 text-xs`}
                >
                  {formatSymbol(asset?.symbol, true)}
                </button>
                <button
                  onClick={() => setIsTokenQuantity((prev) => !prev)}
                  className={`h-[22px] ${
                    !isTokenQuantity
                      ? "text-base_color font-bold"
                      : "text-white"
                  } w-fit px-1 text-xs`}
                >
                  USDC
                </button>
              </PopoverContent>
            </Popover> */}
          </div>
          <p
            className={`text-red w-full text-[11px] mt-1 mb-1.5 pointer-events-none ${
              inputErrors.input_quantity
                ? "opacity-100 static"
                : "opacity-0 absolute"
            }`}
          >
            Quantity can&apos;t exceed {getFormattedAmount(maxQty)}{" "}
            {getSymbolForPair()}
          </p>
          <div className={`mt-2 flex items-center text-white`}>
            <Slider
              value={[sliderValue]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setSliderValue(value[0]);
                handleInputErrors(false, "input_quantity");
                const newQuantity = percentageToValue(value[0]);
                handleValueChange("quantity", newQuantity.toString());
              }}
              isBuy={values.direction === "BUY"}
            />
            <div className="w-[57px] px-2 flex items-center justify-center ml-4 h-fit bg-terciary border border-borderColor-DARK rounded">
              <input
                name="quantity"
                className="w-[30px] text-white text-sm h-[25px]"
                type="number"
                min={0}
                max={100}
                disabled={!freeCollateral || !address}
                onChange={(e) => {
                  if (!e.target.value) {
                    setSliderValue(0);
                    const newQuantity = percentageToValue(undefined);
                    handleValueChange("quantity", newQuantity.toString());
                    return;
                  }
                  if (
                    parseFloat(e.target.value) >= 0 &&
                    parseFloat(e.target.value) <= 100
                  ) {
                    const newQuantity = percentageToValue(
                      parseInt(e.target.value)
                    );
                    handleValueChange("quantity", newQuantity.toString());
                    setSliderValue(Number(e.target.value));
                  }
                }}
                value={toPercentage(values.quantity as string) || "0"}
              />
              <p className="text-font-80 text-sm">%</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-font-60">Est. Liq. price</p>
            <p className="text-xs text-white font-medium">
              {getFormattedAmount(Number(estLiqPrice)) || "--"}{" "}
              <span className="text-font-60">USDC</span>
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 border-b border-borderColor pb-3">
            <p className="text-xs text-font-60">Account leverage</p>
            <p className="text-xs text-white font-medium">
              {estLeverage || "--"}x
            </p>
          </div>
          <button
            className="text-xs text-white mt-3 flex items-center justify-between w-full"
            onClick={() => {
              setValues((prev) => ({
                ...prev,
                reduce_only: !prev.reduce_only,
              }));
            }}
          >
            <div className="flex items-center justify-between w-full">
              <TooltipProvider>
                <ShadTooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <p className="underline w-fit text-white">Reduce only</p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="h-fit overflow-clip max-w-[200px] w-full p-2 bg-secondary border border-borderColor shadow-xl whitespace-pre-wrap"
                  >
                    This order allows you to only reduce or close an existing
                    position. It prevents opening new positions or increasing
                    current ones
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <div
                className={`w-[15px] p-0.5 h-[15px] rounded border ${
                  values.reduce_only
                    ? "border-base_color"
                    : "border-[rgba(255,255,255,0.3)]"
                } transition-all duration-100 ease-in-out`}
              >
                <div
                  className={`w-full h-full rounded-[1px] bg-base_color ${
                    values.reduce_only ? "opacity-100" : "opacity-0"
                  } transition-all duration-100 ease-in-out`}
                />
              </div>
            </div>
          </button>
          {/* <button
            onClick={() => handleBooleanChange("tp_sl")}
          >
            <p>Take profit / Stop loss</p>
            <div className="w-[15px] h-[15px] rounded border border-borderColor-DARK bg-terciary flex items-center jusitfy-center">
              {values.tp_sl ? (
                <IoCheckmarkOutline className="text-blue-400" />
              ) : null}
            </div>
          </button> */}
        </div>
        <div className={`${isMobile ? "hidden" : "flex"} h-[100px] w-full`} />
        <button
          onClick={handleButtonLongClick}
          className={`w-full mt-2.5 h-[32px] sm:h-[35px] ${buttonStatus?.color} 
          ${
            isMobile ? "mb-0" : "mb-4"
          } text-white rounded transition-all duration-200 ease-in-out text-xs sm:text-sm`}
        >
          {buttonStatus?.title}
        </button>
        <div className="flex items-center justify-between pt-4 border-t border-borderColor">
          <p className="text-xs text-font-60">Fees (Maker / Taker)</p>
          <p className="text-xs text-white font-medium">
            {accountInfo?.futures_maker_fee_rate
              ? formatPercentage(accountInfo?.futures_maker_fee_rate as number)
              : "0.025%"}{" "}
            /{" "}
            {accountInfo?.futures_taker_fee_rate
              ? formatPercentage(accountInfo?.futures_taker_fee_rate as number)
              : "0.05%"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-font-60">Cross Margin Ratio</p>
          <p className="text-xs text-white font-medium">
            {formatPercentages(marginRatio as number)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-font-60">Margin Required</p>
          <p className="text-xs text-white font-medium">
            {formatCurrency(totalMarginRequired as number)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 pb-4">
          <p className="text-xs text-font-60">Maintenance Margin</p>
          <p className="text-xs text-white font-medium">
            {formatCurrency(totalMaintenanceMargin as number)}
          </p>
        </div>
      </div>
    </section>
  );
};

async function getValidationErrors(
  data: Inputs,
  symbol: string,
  validator: ReturnType<typeof useOrderEntry>["helper"]["validator"],
  calculate: ReturnType<typeof useOrderEntry>["helper"]["calculate"],
  base_tick: number
): Promise<
  ReturnType<ReturnType<typeof useOrderEntry>["helper"]["validator"]>
> {
  return validator(
    getInput(
      calculate(data, "order_quantity", base_tick) as any,
      symbol,
      base_tick
    )
  );
}

function getInput(
  data: Inputs,
  symbol: string,
  base_tick: number
): OrderEntity {
  return {
    symbol,
    side: data.direction as OrderSide,
    order_type: data.type.toUpperCase() as any,
    order_price: data.price ? (data.price as any).toString() : undefined,
    order_quantity: data.quantity?.toString(),
    trigger_price: data.triggerPrice,
    reduce_only: data.reduce_only,
  };
}
