import { useGeneralContext } from "@/context";
import { PositionStreamType } from "@/models";
import { getFormattedAmount, getTokenPercentage } from "@/utils/misc";
import { useMarginRatio } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Card } from "../../mobile/orders/components/card";
import { RenderCells } from "./components/render-cells";
import { thead } from "./constants";

type PositionProps = {
  positions: PositionStreamType;
  orders: API.Order[];
  refresh: import("swr/_internal").KeyedMutator<any[]>;
  cancelOrder: (orderId: number, symbol?: string) => Promise<any>;
  refreshPosition: import("swr/_internal").KeyedMutator<API.PositionInfo>;
};

enum Sections {
  POSITION = 0,
  PENDING = 1,
  TP_SL = 2,
  ORDER_HISTORY = 3,
}

export const Position = ({
  refresh,
  cancelOrder,
  orders,
  positions: data,
  refreshPosition,
}: PositionProps) => {
  const [activeSection, setActiveSection] = useState(Sections.POSITION);
  const sections = ["Positions", "Pending", "TP/SL", "Order History"];
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const prevLengthRef = useRef<number | null>(null);
  const isFirstCallRef = useRef(true);
  const { currentLeverage } = useMarginRatio();
  const { setOrderPositions, orderPositions } = useGeneralContext();
  const [underlineStyle, setUnderlineStyle] = useState<{
    width: string;
    left: string;
  }>({ width: "20%", left: "0%" });

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

  const closePendingOrder = async (id: number, symbol: string) => {
    const idToast = toast.loading("Closing Order");
    try {
      await cancelOrder(id, symbol);
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
    } else if (activeSection === Sections.ORDER_HISTORY) {
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

  useEffect(() => {
    if (data?.rows) {
      const currentLength = data.rows.length;

      if (isFirstCallRef.current) {
        prevLengthRef.current = currentLength;
        isFirstCallRef.current = false;
      } else {
        if (
          prevLengthRef.current !== null &&
          currentLength !== prevLengthRef.current
        ) {
          setShouldRefresh(true);
        }
        prevLengthRef.current = currentLength;
      }
    }
  }, [data?.rows]);

  useEffect(() => {
    if (shouldRefresh) {
      refresh();
      setShouldRefresh(false);
      console.log("refreshed");
    }
  }, [shouldRefresh]);

  return (
    <div className="w-full md:min-h-[320px] md:h-[320px] md:max-h-[320px]">
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
      <div className="min-h-[200px] max-h-[250px] overflow-scroll w-full no-scrollbar hidden md:block">
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
                  ?.sort((a, b) => (b.updated_time as never) - a.updated_time)
                  ?.filter((_, i) => i < 40)
            )?.map(
              (order: (API.PositionTPSLExt | API.Order) | any, i: number) => {
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
                  <tr key={order?.order_id || i}>
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
              }
            )}
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
      <div
        className={`block md:hidden ${
          activeSection === Sections.POSITION ? "" : "mt-2.5"
        } w-full px-2.5 max-h-[600px] min-h-[400px] overflow-y-scroll no-scrollbar`}
      >
        {(activeSection === Sections.POSITION
          ? data?.rows
          : orders
              ?.filter(filterSide)
              ?.sort((a, b) => (b.updated_time as never) - a.updated_time)
              ?.filter((_, i) => i < 40)
        )?.map((order: (API.PositionTPSLExt | API.Order) | any, i) => {
          const initialMargin =
            Math.abs(order.position_qty) *
            order.mark_price *
            order.IMR_withdraw_orders;
          const totalMargin = initialMargin + order.unrealized_pnl;
          return (
            <Card
              key={i}
              order={order}
              totalMargin={totalMargin}
              refresh={refreshPosition}
              activeSection={activeSection}
              closePendingOrder={closePendingOrder}
            />
          );
        })}
        {activeSection === Sections.POSITION && !data?.rows?.length ? (
          <p className="text-sm text-font-80 mx-auto text-center my-5">
            No open positions
          </p>
        ) : null}
        {activeSection !== Sections.POSITION &&
        !orders
          ?.filter(filterSide)
          ?.sort((a, b) => (b.updated_time as never) - a.updated_time)
          ?.filter((_, i) => i < 40)?.length ? (
          <p className="text-sm text-font-80 mx-auto text-center my-5">
            {activeSection === Sections.PENDING
              ? "No pending positions"
              : "No history"}
          </p>
        ) : null}
      </div>
    </div>
  );
};
