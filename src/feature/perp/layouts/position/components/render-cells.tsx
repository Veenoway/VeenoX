import { useGeneralContext } from "@/context";
import { PosterModal } from "@/modals/poster";
import { cn } from "@/utils/cn";
import {
  formatSymbol,
  getFormattedAmount,
  getFormattedDate,
} from "@/utils/misc";
import { useMarginRatio, useOrderEntry } from "@orderly.network/hooks";
import { OrderEntity } from "@orderly.network/types";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { EditModal } from "./edit-modal";
import { TPSLModal } from "./tp-sl-modal";

const tdStyle = `text-xs px-2.5 pt-3 pb-0 text-white whitespace-nowrap font-normal text-start`;
enum Sections {
  POSITION = 0,
  PENDING = 1,
  TP_SL = 2,
  FILLED = 3,
  ORDER_HISTORY = 4,
}

export const RenderCells = ({
  order,
  activeSection,
  closePendingOrder,
  rows,
  refreshPosition,
  refresh,
}: any) => {
  const {
    TPSLOpenOrder,
    setTPSLOpenOrder,
    setOrderPositions,
    editPendingPositionOpen,
    setEditPendingPositionOpen,
  } = useGeneralContext();

  const { currentLeverage } = useMarginRatio();

  const { onSubmit } = useOrderEntry(
    {
      symbol: order.symbol,
      side: order?.side
        ? order.side
        : order?.algo_order?.side
        ? order?.algo_order?.side
        : (order.position_qty as number) >= 0
        ? "SELL"
        : ("BUY" as any),
      order_type: order.type || "MARKET",
      order_quantity: order?.position_qty,
    },
    { watchOrderbook: true }
  );
  return (
    <>
      {renderCommonCells(order)}
      {renderAdditionalCells(
        order,
        activeSection,
        closePendingOrder,
        setTPSLOpenOrder,
        setOrderPositions,
        onSubmit,
        setEditPendingPositionOpen,
        currentLeverage,
        refreshPosition
      )}

      {TPSLOpenOrder ? (
        <TPSLModal refreshPosition={refreshPosition} order={order} />
      ) : null}
    </>
  );
};

const renderCommonCells = (trade: any) => (
  <>
    <td className={cn(tdStyle, "text-start pl-5")}>
      <div className="h-full w-full flex items-center">
        <img
          className="w-4 h-4 rounded-full mr-2"
          height={16}
          width={16}
          alt={`${trade?.symbol} logo`}
          src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
            trade?.symbol ? trade?.symbol : "PERP_TEST_TECJ",
            true
          )}.png`}
        />
        {trade?.symbol ? formatSymbol(trade.symbol) : "TEST"}
      </div>
    </td>
  </>
);

const renderAdditionalCells = (
  trade: OrderEntity | any,
  section: Sections,
  closePendingOrder: Function,
  setTPSLOpenOrder: Dispatch<SetStateAction<boolean>>,
  setOrderPositions: any,
  onSubmit: any,
  setEditPendingPositionOpen: Dispatch<SetStateAction<boolean>>,
  currentLeverage: number | null,
  refreshPosition: any
) => {
  if (section === Sections.FILLED) {
    let filledOrder =
      trade.child_orders?.length > 0
        ? trade.child_orders?.[0]?.algo_status === "FILLED"
          ? trade.child_orders[0]
          : trade.child_orders[1]
        : trade;
    return (
      <>
        <td className={tdStyle}>{filledOrder.type}</td>
        <td
          className={cn(
            tdStyle,
            `${filledOrder.side === "SELL" ? "text-red" : "text-green"}`
          )}
        >
          {filledOrder.side}
        </td>
        <td className={tdStyle}>{filledOrder.total_executed_quantity}</td>
        <td className={tdStyle}>
          {getFormattedAmount(filledOrder.trigger_price)}
        </td>
        <td className={tdStyle}>{filledOrder.trigger_price || "--"}</td>
        <td
          className={cn(
            tdStyle,
            `${
              filledOrder.realized_pnl > 0
                ? "text-green"
                : filledOrder.realized_pnl < 0
                ? "text-red"
                : "text-white"
            }`
          )}
        >
          {filledOrder.realized_pnl || "--"}
        </td>

        <td className={tdStyle}>{getFormattedAmount(filledOrder.total_fee)}</td>
        <td className={tdStyle}>
          {filledOrder.status || filledOrder?.algo_status}
        </td>
        <td className={tdStyle}>{trade.reduce_only ? "Yes" : "No"}</td>
        <td className={cn(tdStyle, "pr-5 text-end")}>
          {getFormattedDate(trade.created_time)}
        </td>
      </>
    );
  } else if (section === Sections.PENDING) {
    const toPercentage = (): number => {
      if (trade?.quantity === 0) return 0;
      return (trade?.total_executed_quantity / trade?.quantity) * 100;
    };
    const percentageFilled = toPercentage();
    return (
      <>
        <td className={tdStyle}>{trade?.type}</td>
        <td
          className={cn(
            tdStyle,
            `${trade?.side === "SELL" ? "text-red" : "text-green"}`
          )}
        >
          {trade?.side}
        </td>
        <td className={tdStyle}>--</td>
        <td className={tdStyle}>
          <div className="w-full h-full flex flex-col items-start">
            <div className="h-[5px] w-[100px] rounded bg-terciary">
              <div
                className={`h-full bg-base_color rounded`}
                style={{
                  width: `${percentageFilled}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between w-[100px] mt-1.5">
              <p className="text-white text-[11px]">
                {trade?.total_executed_quantity || 0} / {trade?.quantity || 0}
              </p>
              <p className="text-white text-[11px]">{percentageFilled || 0}%</p>
            </div>
          </div>
        </td>
        <td className={tdStyle}>{trade?.price}</td>
        <td className={tdStyle}>--</td>
        <td className={tdStyle}>
          {getFormattedAmount(trade?.quantity * trade?.price)}$
        </td>
        <td className={tdStyle}>No</td>
        <td className={tdStyle}>{trade?.reduce_only ? "Yes" : "No"}</td>
        <td className={cn(tdStyle, "pr-5")}>
          {getFormattedDate(trade?.created_time)}
        </td>
        <td className={cn(tdStyle, "pr-5")}>
          <div className="flex items-center justify-end w-full h-full">
            <EditModal order={trade} />
            <button
              onClick={() => {
                closePendingOrder(trade.order_id);
                setOrderPositions([]);
              }}
              className="h-[25px] w-fit px-2 text-xs ml-2.5 text-white bg-base_color border-borderColor-DARK rounded"
            >
              Close
            </button>{" "}
          </div>
        </td>
      </>
    );
  } else if (section === Sections.POSITION) {
    const initialMargin =
      Math.abs(trade.position_qty) *
      trade.mark_price *
      trade.IMR_withdraw_orders;
    const totalMargin = initialMargin + trade.unrealized_pnl;
    const maintenanceMargin =
      Math.abs(trade.position_qty) * trade.mark_price * trade.MMR_with_orders;

    return (
      <>
        <td
          className={cn(
            tdStyle,
            `${
              trade?.position_qty > 0
                ? "text-green"
                : trade?.position_qty < 0
                ? "text-red"
                : "text-white"
            } font-medium`
          )}
        >
          {trade.position_qty} {formatSymbol(trade.symbol, true)}
        </td>
        <td className={tdStyle}>
          {getFormattedAmount(trade.average_open_price)}
        </td>
        <td className={tdStyle}>{getFormattedAmount(trade.mark_price)}</td>

        <td
          className={cn(
            tdStyle,
            `${
              trade.unrealized_pnl > 0
                ? "text-green"
                : trade.unrealized_pnl < 0
                ? "text-red"
                : "text-white"
            }`
          )}
        >
          <div className="flex items-center justify-start w-full h-full font-medium">
            <p className="mr-2">
              {`${
                trade.unrealized_pnl > 0
                  ? `+$${Math.abs(trade.unrealized_pnl).toFixed(2)} (${Number(
                      trade.unrealized_pnl_ROI
                    ).toFixed(2)})`
                  : `-$${Math.abs(trade.unrealized_pnl).toFixed(2)} (${Number(
                      trade.unrealized_pnl_ROI
                    ).toFixed(2)}%)`
              }`}{" "}
            </p>
            <PosterModal order={trade} />
          </div>
        </td>
        <td className={tdStyle}>
          <div className="flex items-center justify-start w-full font-medium h-full text-font-80">
            <p
              className={`${
                trade.tp_trigger_price ? "text-green" : "text-white"
              }`}
            >
              {trade.tp_trigger_price || "--"}
            </p>
            <p className="mx-1"> / </p>
            <p
              className={`${
                trade.sl_trigger_price ? "text-red" : "text-white"
              }`}
            >
              {trade.sl_trigger_price || "--"}
            </p>
          </div>
        </td>
        <td className={cn(tdStyle, "text-orange-300")}>
          {getFormattedAmount(trade.est_liq_price)}
        </td>
        <td className={tdStyle}>{getFormattedAmount(trade.cost_position)}</td>
        <td className={tdStyle}>
          ${isNaN(totalMargin.toFixed(2)) ? "N/A" : totalMargin.toFixed(2)}
        </td>
        <td className={cn(tdStyle, "")}>
          {getFormattedAmount(trade.notional)}
        </td>
        <td className={cn(tdStyle, "pr-5")}>
          <div className="w-full h-full justify-end items-center flex">
            <button
              onClick={() => setTPSLOpenOrder(trade)}
              className="text-white bg-terciary border border-base_color text-bold font-poppins text-xs
            h-[25px] px-2 rounded flex items-center
        "
            >
              TP/SL
            </button>
            <button
              onClick={async () => {
                const qty = trade.position_qty as number;
                const side = qty >= 0 ? "SELL" : "BUY";

                const cancelOrder: any = {
                  symbol: trade.symbol,
                  side: side as any,
                  order_type: "MARKET" as any,
                  order_price: undefined,
                  order_quantity: Math.abs(qty as number),
                  trigger_price: undefined,
                  reduce_only: true,
                };
                const idToast = toast.loading("Closing Order");

                try {
                  await onSubmit(cancelOrder);
                  toast.update(idToast, {
                    render: "Order closed",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  refreshPosition();
                  setOrderPositions(["closed"]);
                } catch (e) {
                  toast.update(idToast, {
                    render:
                      "Unable to close position. Pending orders interfere with the position amount.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                }
              }}
              className="h-[25px] w-fit px-2 text-xs ml-2.5 text-white bg-base_color border-borderColor-DARK rounded"
            >
              Close
            </button>
          </div>
        </td>
      </>
    );
  } else if (section === Sections.ORDER_HISTORY) {
    let filledOrder =
      trade.child_orders?.length > 0
        ? trade?.child_orders?.[0]?.algo_status === "FILLED"
          ? trade?.child_orders?.[0]
          : trade?.child_orders?.[1]
        : trade;
    return (
      <>
        <td className={tdStyle}>{filledOrder.type || filledOrder.algo_type}</td>
        <td
          className={cn(
            tdStyle,
            `${filledOrder?.side === "SELL" ? "text-red" : "text-green"}`
          )}
        >
          {filledOrder?.side}
        </td>
        <td className={tdStyle}>
          {filledOrder?.total_executed_quantity
            ? filledOrder?.total_executed_quantity
            : filledOrder?.total_executed_quantity}
        </td>
        <td className={tdStyle}>
          {filledOrder?.average_executed_price
            ? getFormattedAmount(filledOrder?.average_executed_price)
            : "--"}
        </td>

        <td className={tdStyle}>{filledOrder?.trigger_price_type || "--"}</td>
        <td
          className={cn(
            tdStyle,
            `${
              filledOrder?.realized_pnl > 0
                ? "text-green"
                : filledOrder?.realized_pnl < 0
                ? "text-red"
                : "text-white"
            }`
          )}
        >
          {getFormattedAmount(filledOrder?.realized_pnl) || "--"}
        </td>
        <td className={tdStyle}>
          {getFormattedAmount(
            filledOrder?.total_executed_quantity *
              filledOrder?.average_executed_price
          )}
        </td>
        <td className={tdStyle}>
          {filledOrder?.total_fee
            ? getFormattedAmount(filledOrder?.total_fee)
            : "--"}
        </td>
        <td className={tdStyle}>
          {filledOrder?.status ? filledOrder?.status : filledOrder?.algo_status}
        </td>
        <td className={tdStyle}>{filledOrder.reduce_only ? "Yes" : "No"}</td>
        <td className={cn(tdStyle, "pr-5 text-end")}>
          {getFormattedDate(filledOrder.created_time)}
        </td>
      </>
    );
  } else if (section === Sections.TP_SL) {
    let filledOrder =
      trade.child_orders?.[0]?.algo_status === "FILLED"
        ? trade?.child_orders?.[0]
        : trade?.child_orders?.[1];
    return (
      <>
        <td
          className={cn(
            tdStyle,
            `${trade?.side === "SELL" ? "text-red" : "text-green"}`
          )}
        >
          {trade?.side}
        </td>
        <td className={tdStyle}>{filledOrder?.total_executed_quantity}</td>
        <td className={tdStyle}>
          {filledOrder?.algo_type?.split("_").join(" ")}
        </td>
        <td className={tdStyle}>{filledOrder?.trigger_trade_price}</td>
        <td className={tdStyle}>{filledOrder?.trigger_price}</td>

        <td
          className={cn(
            tdStyle,
            `${
              filledOrder?.realized_pnl > 0
                ? "text-green"
                : filledOrder?.realized_pnl < 0
                ? "text-red"
                : "text-white"
            }`
          )}
        >
          ${filledOrder?.realized_pnl}
        </td>
        <td className={tdStyle}>${filledOrder?.total_fee.toFixed(2)}</td>
        <td className={cn(tdStyle, "pr-5 text-end")}>
          {getFormattedDate(filledOrder?.trigger_time)}
        </td>
      </>
    );
  }
  return null;
};
