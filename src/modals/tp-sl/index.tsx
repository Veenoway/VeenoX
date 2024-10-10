import { useGeneralContext } from "@/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/shadcn/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { Slider } from "@/lib/shadcn/slider";
import { formatSymbol } from "@/utils/misc";
import {
  useMarkPrice,
  useOrderStream,
  useSymbolsInfo,
  useTPSLOrder,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";

type TPSLModalType = {
  refreshPosition: import("swr/_internal").KeyedMutator<API.PositionInfo>;
};

export const TPSLModal = ({ refreshPosition }: TPSLModalType) => {
  const [activePnlOrOffset, setActivePnlOrOffset] = useState("$");
  const [error, setError] = useState([""]);
  const [loading, setLoading] = useState(false);
  const { TPSLOpenOrder, setTPSLOpenOrder } = useGeneralContext();
  const { data: markPrice } = useMarkPrice(TPSLOpenOrder?.symbol);
  const { setOrderPositions } = useGeneralContext();
  const [showCustomQty, setShowCustomQty] = useState(false);
  const [activeQuantity, setActiveQuantity] = useState({
    percentage: TPSLOpenOrder?.algo_order?.quantity
      ? Math.round(
          (TPSLOpenOrder.algo_order.quantity / TPSLOpenOrder.position_qty) * 100
        )
      : 100,
    quantity: TPSLOpenOrder?.algo_order?.quantity || TPSLOpenOrder.position_qty,
  });
  const [algoOrder, { setValue, submit, errors }] = useTPSLOrder(
    TPSLOpenOrder,
    {
      defaultOrder: TPSLOpenOrder.algo_order,
    }
  );

  const position = {
    symbol: TPSLOpenOrder.symbol,
    average_open_price: TPSLOpenOrder.average_open_price,
    position_qty: TPSLOpenOrder.position_qty,
    tp_trigger_price: TPSLOpenOrder.tp_trigger_price,
    sl_trigger_price: TPSLOpenOrder.sl_trigger_price,
    quantity: String(
      Math.abs(
        TPSLOpenOrder?.algo_order?.quantity || TPSLOpenOrder.position_qty
      )
    ),
  };

  const [_, { cancelTPSLChildOrder, cancelAllTPSLOrders }] = useOrderStream(
    position,
    {
      stopOnUnmount: false,
    }
  );

  const symbolInfo = useSymbolsInfo();
  const symbols = Object.values(symbolInfo)
    .filter((cur) => typeof cur !== "boolean")
    .map((cur) => {
      if (typeof cur === "boolean") return;
      const symbol = cur();
      return symbol;
    });

  const currentAsset = symbols?.find(
    (cur) => cur.symbol === TPSLOpenOrder?.symbol
  );

  const handleSubmit = async () => {
    setLoading(true);
    if (errors) {
      for (let i = 0; i < Object.entries(errors)?.length; i++) {
        setError((prev) => [
          ...prev,
          Object.entries(errors)?.[i]?.[1]?.message,
        ]);
      }
      setLoading(false);
      return;
    } else setError([""]);

    const idToast = toast.loading("Setting TP/SL");

    try {
      const res = await submit();
      setTPSLOpenOrder(null);
      setOrderPositions([]);
      setLoading(false);
      console.log(res);
      toast.update(idToast, {
        render: "TP/SL set successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      await refreshPosition();
    } catch (error) {
      console.log(error);
      toast.update(idToast, {
        render: (error as any)?.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });

      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const closeTPSL = async (type: string) => {
    const activeChild = TPSLOpenOrder?.algo_order?.child_orders?.find(
      (algo: { algo_type: string }) => algo.algo_type === type
    );

    const childs = TPSLOpenOrder?.algo_order?.child_orders;
    const tpSlFormated = activeChild?.algo_type === "TAKE_PROFIT" ? "TP" : "SL";
    const idToast = toast.loading(`Canceling ${tpSlFormated}`);
    const shouldResetOnlyOne =
      childs?.[0]?.trigger_price && childs?.[1]?.trigger_price;

    try {
      if (shouldResetOnlyOne)
        await cancelTPSLChildOrder(
          activeChild.algo_order_id,
          activeChild.root_algo_order_id
        );
      else {
        await cancelAllTPSLOrders();
      }

      setTPSLOpenOrder(null);
      toast.update(idToast, {
        render: `${tpSlFormated} canceled.`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      await refreshPosition();
    } catch (e) {
      console.log("err", e);
      toast.update(idToast, {
        render: `Error while closing ${tpSlFormated}.`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleChange = (field: string, value: string): void => {
    if (error) setError([""]);

    setValue(field, value);
  };

  const isOrderSlExist = TPSLOpenOrder?.algo_order?.child_orders?.find(
    (entry: { algo_type: string; trigger_price: number }) =>
      entry.algo_type === "STOP_LOSS" && entry.trigger_price
  )?.trigger_price;

  const isOrderTpExist = TPSLOpenOrder?.algo_order?.child_orders?.find(
    (entry: { algo_type: string; trigger_price: number }) =>
      entry.algo_type === "TAKE_PROFIT" && entry.trigger_price
  )?.trigger_price;

  function calculateQuantity(percentage: number): string {
    const rawQuantity = TPSLOpenOrder.position_qty * (percentage / 100);
    const tick = currentAsset?.base_tick || 0;

    if (tick === 0) return rawQuantity.toString();

    const tickPrecision = Math.log10(1 / tick);
    const adjustedQuantity = Math.floor(rawQuantity / tick) * tick;
    const value = Math.abs(Number(adjustedQuantity.toFixed(tickPrecision)));

    return value.toString();
  }

  const getButtonQuantityPosition = (percentage: number) => {
    switch (percentage) {
      case 1:
        return "0%";
      case 25:
        return "20%";
      case 50:
        return "45%";
      case 75:
        return "70%";
      case 100:
        return "90%";
      default:
        return "0%";
    }
  };

  return (
    <Dialog open={TPSLOpenOrder}>
      <DialogContent
        close={() => setTPSLOpenOrder(null)}
        className="max-w-[400px] w-[90%] h-auto max-h-auto flex flex-col gap-0 select-none"
      >
        <DialogHeader>
          <DialogTitle className="pb-5">Position TP/SL</DialogTitle>

          <DialogDescription>
            <div className="flex items-center justify-between">
              <p className="text-font-80 text-sm">Asset</p>

              <div className="flex items-center text-sm">
                <img
                  className="w-[16px] h-[16px] bg-gray-500 mr-2 rounded-full"
                  src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
                    TPSLOpenOrder?.symbol,

                    true
                  )}.png`}
                />

                <p className="font-medium">
                  {formatSymbol(TPSLOpenOrder?.symbol, true)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-sm">
              <p className="text-font-80">Position qty</p>

              <p
                className={`font-bold ${
                  TPSLOpenOrder?.position_qty > 0 ? "text-green" : "text-red"
                }`}
              >
                {TPSLOpenOrder?.position_qty}
              </p>
            </div>

            <div className="flex items-center justify-between my-2 text-sm">
              <p className="text-font-80">Avg. Open Price</p>

              <p>{TPSLOpenOrder?.average_open_price}</p>
            </div>

            <div className="flex items-center justify-between my-2 text-sm">
              <p className="text-font-80">Mark Price</p>

              <p className="font-bold">{markPrice}</p>
            </div>

            <div className="flex items-center justify-between mb-5 text-sm">
              <p className="text-font-80">TP/SL Quantity</p>

              <p className="font-bold">{activeQuantity.quantity}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center jusity-start mb-2">
          {isOrderTpExist ? (
            <button
              onClick={() => closeTPSL("TAKE_PROFIT")}
              className="w-fit text-white flex items-center"
            >
              <p className="text-xs font-medium text-white">Reset TP</p>
            </button>
          ) : null}

          {isOrderTpExist && isOrderSlExist ? (
            <div className="mx-2.5 h-3.5 bg-font-40 w-0.5 rounded" />
          ) : null}

          {isOrderSlExist ? (
            <button
              onClick={() => closeTPSL("STOP_LOSS")}
              className="w-fit text-white flex items-center"
            >
              <p className="text-xs font-medium text-white">Reset SL</p>
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex px-2.5 w-full items-center bg-terciary border border-borderColor-DARK rounded h-[35px] text-sm">
            <p className="text-sm text-font-60 mr-2.5 font-medium">TP</p>

            <input
              type="number"
              className="h-full w-full select-none"
              placeholder="TP Price"
              value={algoOrder.tp_trigger_price}
              onChange={(e) => handleChange("tp_trigger_price", e.target.value)}
            />
          </div>

          <div className="flex pl-2.5 items-center bg-terciary border border-borderColor-DARK rounded h-[35px] text-sm">
            <input
              type="number"
              className={`h-full w-full select-none ${
                Number(algoOrder.tp_pnl) > 0
                  ? "text-green"
                  : Number(algoOrder.tp_pnl) < 0
                  ? "text-red"
                  : "text-font-80"
              }`}
              placeholder="Gain"
              readOnly={true}
              value={
                activePnlOrOffset === "$"
                  ? algoOrder.tp_pnl
                  : (Number(algoOrder.tp_offset_percentage) * 100).toFixed(2)
              }
              onChange={(e) => {
                if (e.target.value)
                  handleChange(
                    activePnlOrOffset === "$"
                      ? "tp_pnl"
                      : "tp_offset_percentage",

                    e.target.value
                  );
              }}
            />

            <Popover>
              <PopoverTrigger className="h-full min-w-fit">
                <div className="w-fit px-2.5 h-full flex items-center justify-center ">
                  <p>{activePnlOrOffset}</p>

                  <IoChevronDown className="ml-1" />
                </div>
              </PopoverTrigger>

              <PopoverContent
                sideOffset={0}
                className="md:transform-x-[10px] flex flex-col w-fit p-2.5 bg-secondary border border-borderColor-DARK shadow-2xl "
              >
                <button
                  onClick={() => setActivePnlOrOffset("$")}
                  className="text-sm text-white mb-1"
                >
                  $
                </button>

                <button
                  onClick={() => setActivePnlOrOffset("%")}
                  className="text-sm text-white"
                >
                  %
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {error && error.find((entry) => entry.includes("TP")) ? (
          <p className="text-xs text-red mt-2">
            {error.find((entry) => entry.includes("TP"))}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 mt-2.5 ">
          <div className="flex px-2.5 w-full items-center bg-terciary border border-borderColor-DARK rounded h-[35px] text-sm">
            <p className="text-sm text-font-60 mr-2.5 font-medium">SL</p>

            <input
              type="number"
              className="h-full w-full"
              placeholder="SL Price"
              value={algoOrder.sl_trigger_price}
              onChange={(e) => handleChange("sl_trigger_price", e.target.value)}
            />
          </div>

          <div className="flex pl-2.5 items-center bg-terciary border border-borderColor-DARK rounded h-[35px] text-sm">
            <input
              type="number"
              className={`h-full w-full ${
                Number(algoOrder.sl_pnl) > 0
                  ? "text-green"
                  : Number(algoOrder.sl_pnl) < 0
                  ? "text-red"
                  : "text-font-80"
              }`}
              placeholder="Loss"
              value={
                activePnlOrOffset === "$"
                  ? algoOrder.sl_pnl
                  : (Number(algoOrder.sl_offset_percentage) * 100).toFixed(2)
              }
              onChange={(e) =>
                handleChange(
                  activePnlOrOffset === "$" ? "sl_pnl" : "sl_offset_percentage",

                  e.target.value
                )
              }
            />

            <Popover>
              <PopoverTrigger className="h-full min-w-fit">
                <div className="w-fit px-2.5 h-full flex items-center justify-center ">
                  <p>{activePnlOrOffset}</p>

                  <IoChevronDown className="ml-1" />
                </div>
              </PopoverTrigger>

              <PopoverContent
                sideOffset={0}
                className="md:transform-x-[10px] flex flex-col w-fit p-2.5 bg-secondary border border-borderColor-DARK shadow-2xl "
              >
                <button
                  onClick={() => setActivePnlOrOffset("$")}
                  className="text-sm text-white mb-1"
                >
                  $
                </button>
                <button
                  onClick={() => setActivePnlOrOffset("%")}
                  className="text-sm text-white"
                >
                  %
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {error && error.find((entry) => entry.includes("SL")) ? (
          <p className="text-xs text-red mt-2">
            {error.find((entry) => entry.includes("SL"))}
          </p>
        ) : null}

        <div
          className={`flex flex-col h-full overflow-hidden mt-4 ${
            showCustomQty ? "max-h-[200px]" : "max-h-[20px]"
          } transition-all duration-150 ease-in-out`}
        >
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowCustomQty((prev) => !prev)}
          >
            <p className="text-font-80 text-sm"> Custom quantity</p>
            <div
              className={`w-[15px] p-0.5 h-[15px] rounded border ${
                showCustomQty
                  ? "border-base_color"
                  : "border-[rgba(255,255,255,0.3)]"
              } transition-all duration-100 ease-in-out`}
            >
              <div
                className={`w-full h-full rounded-[1px] bg-base_color ${
                  showCustomQty ? "opacity-100" : "opacity-0"
                } transition-all duration-100 ease-in-out`}
              />
            </div>
          </button>
          <div className="w-full mt-1.5 mx-auto flex items-center pb-6">
            <div className="relative w-full">
              <Slider
                value={[activeQuantity.percentage]}
                max={100}
                onValueChange={(value) => {
                  const qty =
                    value[0] === 100
                      ? TPSLOpenOrder.position_qty
                      : calculateQuantity(value[0]);
                  setValue("quantity", qty.toString());
                  setActiveQuantity({
                    percentage: value[0],
                    quantity: qty,
                  });
                }}
                min={1}
                isTpSl
                isBuy={false}
              />

              {[1, 25, 50, 75, 100].map((percentage) => {
                const position = getButtonQuantityPosition(percentage);
                return (
                  <button
                    key={percentage}
                    onClick={() => {
                      const qty =
                        percentage === 100
                          ? Math.abs(TPSLOpenOrder.position_qty).toString()
                          : calculateQuantity(percentage);
                      setValue("quantity", qty.toString());
                      setActiveQuantity({
                        percentage,
                        quantity: qty,
                      });
                    }}
                    className={`absolute top-[15px] left-0 text-[13px] ${
                      activeQuantity.percentage === percentage
                        ? "text-white"
                        : "text-font-60"
                    } transition-all duration-150 ease-in-out`}
                    style={{
                      left: position,
                    }}
                  >
                    {percentage}%
                  </button>
                );
              })}
            </div>

            <div className="ml-5 h-[25px] w-[50px] rounded bg-terciary border border-borderColor-DARK flex items-center">
              <input
                className="h-full pl-1.5 w-[40px] text-xs"
                value={activeQuantity.percentage.toString()}
                type="number"
                min={1}
                max={100}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const qty =
                    value === 100
                      ? TPSLOpenOrder.position_qty
                      : calculateQuantity(value);
                  setValue("quantity", qty);
                  setActiveQuantity({
                    percentage: value,
                    quantity: qty,
                  });
                }}
              />

              <p className="pr-1.5 text-white text-xs">%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center w-full gap-2.5 mt-5">
          <button
            className="bg-base_color w-full rounded flex items-center justify-center h-[40px] text-sm text-white"
            onClick={handleSubmit}
          >
            {loading && (
              <Oval
                visible={true}
                height="18"
                width="18"
                color="#FFF"
                secondaryColor="rgba(255,255,255,0.6)"
                ariaLabel="oval-loading"
                strokeWidth={6}
                strokeWidthSecondary={6}
                wrapperStyle={{
                  marginRight: "8px",
                }}
                wrapperClass=""
              />
            )}
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
