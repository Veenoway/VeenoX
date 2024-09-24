import { useGeneralContext } from "@/context";
import { FuturesAssetProps } from "@/models";
import { getFormattedAmount, getTokenPercentage } from "@/utils/misc";
import {
  useMarginRatio,
  useOrderStream,
  usePositionStream,
} from "@orderly.network/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { RenderCells } from "./components/render-cells";
import { thead } from "./constants";

type PositionProps = {
  asset: FuturesAssetProps;
};

enum Sections {
  POSITION = 0,
  PENDING = 1,
  TP_SL = 2,
  FILLED = 3,
  ORDER_HISTORY = 4,
}

export const Position = ({ asset }: PositionProps) => {
  const [activeSection, setActiveSection] = useState(Sections.POSITION);
  const sections = ["Positions", "Pending", "TP/SL", "Filled", "Order History"];
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { setOrderPositions, orderPositions, shouldRefresh, TPSLOpenOrder } =
    useGeneralContext();
  const [underlineStyle, setUnderlineStyle] = useState<{
    width: string;
    left: string;
  }>({ width: "20%", left: "0%" });
  const [data, _info, { refresh: refreshPosition }] = usePositionStream(
    undefined,
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      refreshWhenOffline: true,
      revalidateIfStale: true,
    }
  );
  const [orders, { cancelOrder, refresh }] = useOrderStream(
    {
      symbol: asset.symbol,
    },
    { keeplive: true, stopOnUnmount: false }
  );
  const { currentLeverage } = useMarginRatio();

  const triggerRefresh = async () => {
    await Promise.all([refresh(), refreshPosition()]);
  };

  useEffect(() => {
    triggerRefresh();
  }, [data?.rows?.length, orders?.[0], shouldRefresh]);

  useEffect(() => {
    if (!orderPositions?.length && (data?.rows?.length as number) > 0) {
      setOrderPositions(data?.rows as any);
    }
  }, [data?.rows]);

  useEffect(() => {
    const updateUnderline = () => {
      const button = buttonRefs.current[activeSection];
      if (button) {
        const { offsetWidth, offsetLeft } = button;
        setUnderlineStyle({
          width: `${offsetWidth}px`,
          left: `${offsetLeft}px`,
        });
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeSection]);

  const closePendingOrder = async (id: number) => {
    const idToast = toast.loading("Closing Order");
    try {
      await cancelOrder(id, asset?.symbol);
      toast.update(idToast, {
        render: "Order closed",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      refreshPosition();
      refresh();
    } catch (error: any) {
      toast.update(idToast, {
        render: error?.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const filterSide = (entry: any) => {
    if (activeSection === Sections.PENDING) {
      return (
        (entry.total_executed_quantity < entry.quantity &&
          entry.type === "LIMIT" &&
          (entry.status === "REPLACED" || entry.status === "NEW")) ||
        ((entry.algo_status === "REPLACED" || entry.algo_status === "NEW") &&
          entry.trigger_price)
      );
    } else if (activeSection === Sections.TP_SL) {
      if (entry.algo_order_id) {
        const tp = entry?.child_orders?.[0];
        const sl = entry?.child_orders?.[1];
        if (tp?.algo_status === "FILLED" || sl?.algo_status === "FILLED") {
          return true;
        }
        return false;
      }
      return false;
    } else if (activeSection === Sections.FILLED) {
      const tp = entry?.child_orders?.[0];
      const sl = entry?.child_orders?.[1];
      if (
        entry.status === "FILLED" ||
        tp?.algo_status === "FILLED" ||
        sl?.algo_status === "FILLED"
      ) {
        return true;
      }
      return false;
    }

    return true;
  };

  const getPnLChange = () => {
    const arr =
      data?.rows?.map((row) => ({
        open_price: row.average_open_price,
        mark_price: row.mark_price,
      })) || [];

    const total = arr.reduce(
      (acc, curr) => {
        acc.open_price += curr.open_price;
        acc.mark_price += curr.mark_price;
        return acc;
      },
      { open_price: 0, mark_price: 0 }
    );

    const totalPnL = total.mark_price - total.open_price;
    const pnlPercentage = (totalPnL / total.open_price) * 100;

    return Math.abs(pnlPercentage);
  };

  const pnl_change = getPnLChange();

  const getEmptyMessageFromActiveSection = () => {
    switch (activeSection) {
      case Sections.POSITION:
        return "No open order";
      case Sections.FILLED:
        return "No filled position";
      case Sections.ORDER_HISTORY:
        return "No history";
      case Sections.PENDING:
        return "No pending order";
      case Sections.TP_SL:
        return "No TP/SL order";
      default:
        return "No open order";
    }
  };

  const noOrderMessage = getEmptyMessageFromActiveSection();

  // const {
  //   data: fetchAlgoOrder,
  //   isLoading,
  //   error: ooo,
  // } = usePrivateQuery(
  //   `/v1/algo/order/${TPSLOpenOrder.algo_order?.algo_order_id}`
  // );
  // const tpPrice = (fetchAlgoOrder as API.AlgoOrderExt)?.child_orders?.[0]
  //   ?.trigger_price;
  // const PositionTpPrice =
  //   TPSLOpenOrder.algo_order?.child_orders?.[0]?.trigger_price;
  // const slPrice = (fetchAlgoOrder as API.AlgoOrderExt)?.child_orders?.[1]
  //   ?.trigger_price;
  // const positionSlPrice =
  //   TPSLOpenOrder.algo_order?.child_orders?.[1]?.trigger_price;
  // console.log(
  //   "tpPrice !== PositionTpPrice || slPrice !== positionSlPrice",
  //   tpPrice,
  //   PositionTpPrice,
  //   ":::",
  //   slPrice,
  //   positionSlPrice
  // );
  // useEffect(() => {
  //   // if ((fetchAlgoOrder as API.AlgoOrderExt)?.child_orders) {

  //   if (tpPrice !== PositionTpPrice || slPrice !== positionSlPrice) {
  //     console.log("fjriof");
  //     refreshPosition();
  //   }
  //   // }
  // }, [order, fetchAlgoOrder, TPSLOpenOrder, refreshPosition]);

  return (
    <div className="w-full min-h-[320px] h-[320px] max-h-[320px]">
      <div className="w-full flex justify-between items-center border-b border-borderColor-DARK">
        <div className="flex items-center relative">
          {sections.map((section, index) => (
            <button
              key={index}
              ref={(el) => (buttonRefs.current[index] = el) as any}
              className={`text-xs sm:text-[13px] p-2.5 ${
                activeSection === index ? "text-white" : "text-font-60"
              }`}
              onClick={() => setActiveSection(index)}
            >
              {section}
            </button>
          ))}
          <div
            className="h-[1px] w-[20%] absolute bottom-[-1px] bg-base_color transition-all duration-200 ease-in-out"
            style={{ width: underlineStyle.width, left: underlineStyle.left }}
          />
        </div>
      </div>
      {activeSection === Sections.POSITION ? (
        <div className="p-2.5 pt-3.5 flex items-center gap-5">
          <div>
            <p className="text-xs text-font-60 mb-[3px]">
              Unreal. PnL :{" "}
              <span
                className={` ${
                  data?.aggregated.unrealPnL < 0
                    ? "text-red"
                    : data?.aggregated.unrealPnL > 0
                    ? "text-green"
                    : "text-white"
                } font-medium`}
              >
                {getFormattedAmount(data?.aggregated.unrealPnL)} (
                {getTokenPercentage(pnl_change * currentLeverage)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-font-60 mb-[3px]">
              Notional :{" "}
              <span className="text-white font-medium">
                {getFormattedAmount(data?.aggregated.notional)}
              </span>
            </p>
          </div>
        </div>
      ) : null}
      <div className="overflow-x-scroll min-h-[200px] max-h-[250px] overflow-y-scroll w-full no-scrollbar">
        <table className="w-full ">
          <thead>
            <tr>
              {thead[activeSection].map((title: string, i: number) => {
                const isFirst = i === 0;
                const isLast = i === thead[activeSection].length - 1;
                return (
                  <th
                    key={i}
                    className={`text-xs ${isFirst ? "pl-5" : ""} ${
                      isLast ? "pr-5 text-end" : "text-start"
                    } px-2.5 py-2 text-font-60 whitespace-nowrap ${
                      activeSection === Sections.POSITION
                        ? "border-y"
                        : "border-b"
                    } font-normal border-borderColor-DARK`}
                  >
                    {title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="text-white relative">
            {(activeSection === 0
              ? (data?.rows?.length as number) > 0
                ? data.rows
                : Array.from({ length: 1 })
              : orders
                  ?.filter(filterSide)
                  ?.sort((a, b) => b.updated_time - a.updated_time)
                  ?.filter((_, i) => i < 40)
            )?.map((order, i) => {
              if (
                (activeSection === 0 && !data?.rows?.length) ||
                (activeSection > 0 && !orders?.length)
              ) {
                return (
                  <tr
                    key={i}
                    className="flex flex-col justify-center text-xs text-white items-center absolute h-[80px] left-1/2"
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <p className="mt-2">{noOrderMessage}</p>{" "}
                    </div>
                  </tr>
                );
              }
              return (
                <tr key={i}>
                  <RenderCells
                    order={order}
                    activeSection={activeSection}
                    closePendingOrder={closePendingOrder}
                    rows={data?.rows}
                    refreshPosition={refreshPosition}
                    refresh={refresh}
                  />
                </tr>
              );
            })}
            {!orders?.length && activeSection !== Sections.POSITION ? (
              <tr className="flex flex-col justify-center text-xs text-white items-center absolute h-[80px] left-1/2">
                <div className="flex flex-col justify-center items-center">
                  <p className="mt-2">{noOrderMessage}</p>{" "}
                </div>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
