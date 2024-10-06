import { useGeneralContext } from "@/context";
import { EditModal } from "@/feature/perp/layouts/desktop/position/components/edit-modal";
import { PosterModal } from "@/modals/poster";
import { Inputs } from "@/models";
import {
  formatSymbol,
  getFormattedAmount,
  getFormattedDate,
} from "@/utils/misc";
import { useOrderEntry } from "@orderly.network/hooks";
import { API, OrderType } from "@orderly.network/types";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

enum Sections {
  POSITION = 0,
  PENDING = 1,
  TP_SL = 2,
  ORDER_HISTORY = 3,
}

type CardType = {
  order: API.PositionTPSLExt | API.AlgoOrderExt | API.OrderExt;
  totalMargin: number | null;
  refresh: import("swr/_internal").KeyedMutator<API.PositionInfo>;
  activeSection: Sections;
  closePendingOrder: any;
};

export const Card = ({
  order,
  totalMargin,
  refresh,
  activeSection,
  closePendingOrder,
}: CardType) => {
  const { setOrderPositions, setShowActiveMobileOrders, setTPSLOpenOrder } =
    useGeneralContext();
  const { onSubmit } = useOrderEntry(
    {
      symbol: order.symbol,
      side: (order as API.PositionTPSLExt)?.algo_order?.side
        ? (order as API.PositionTPSLExt)?.algo_order?.side
        : ((order as API.PositionTPSLExt)?.position_qty as number) >= 0
        ? "SELL"
        : ("BUY" as any),
      order_type: OrderType.MARKET,
      order_quantity: (order as API.PositionTPSLExt)?.position_qty,
    },
    { watchOrderbook: true }
  );

  const renderCardContent = () => {
    switch (activeSection) {
      case Sections.POSITION:
        return renderPositionData(
          order as API.PositionTPSLExt,
          totalMargin,
          setTPSLOpenOrder,
          onSubmit,
          refresh,
          setShowActiveMobileOrders,
          setOrderPositions
        );
      case Sections.TP_SL:
        return renderTPSLData(order as API.AlgoOrderExt);
      case Sections.PENDING:
        return renderPendingData(
          order as API.OrderExt,
          setOrderPositions,
          closePendingOrder,
          refresh
        );
      case Sections.ORDER_HISTORY:
        return renderFilledData(order as API.OrderExt);
      default:
        return null;
    }
  };

  return (
    <div className="bg-dark_terciary p-5 rounded-lg mb-2.5 text-white">
      {renderCardContent()}
    </div>
  );
};

const renderPositionData = (
  order: API.PositionTPSLExt,
  totalMargin: number | null,
  setTPSLOpenOrder: Dispatch<SetStateAction<any>>,
  onSubmit: any,
  refresh: import("swr/_internal").KeyedMutator<API.PositionInfo>,
  setShowActiveMobileOrders: Dispatch<SetStateAction<boolean>>,
  setOrderPositions: any
) => {
  return (
    <>
      <div className="flex items-center flex-wrap w-full gap-7 gap-y-4">
        <div>
          <p className="text-font-60 text-xs mb-1">Symbol</p>
          <Link href={`/perp/${order?.symbol}`}>
            <div className="h-full w-full flex items-center">
              <img
                className="w-3.5 h-3.5 rounded-full mr-2"
                height={14}
                width={14}
                alt={`${order?.symbol} logo`}
                src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
                  order?.symbol ? order?.symbol : "PERP_BTC_USDC",
                  true
                )}.png`}
              />
              <p className="text-white hover:underline text-xs font-medium">
                {order?.symbol ? formatSymbol(order.symbol) : "--"}
              </p>
            </div>
          </Link>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Quantity</p>
          <div
            className={`${
              order?.position_qty > 0
                ? "text-green"
                : order?.position_qty < 0
                ? "text-red"
                : "text-white"
            } font-medium text-xs`}
          >
            {order?.position_qty} {formatSymbol(order?.symbol, true)}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Entry price</p>
          <div className="text-xs">
            {getFormattedAmount(order?.average_open_price)}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Mark price</p>
          <div className="text-xs">{getFormattedAmount(order?.mark_price)}</div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">PnL</p>
          <div
            className={`${
              order?.unrealized_pnl > 0
                ? "text-green"
                : order?.unrealized_pnl < 0
                ? "text-red"
                : "text-white"
            } text-xs`}
          >
            <div className="flex items-center justify-start w-full h-full font-medium">
              <p className="mr-2">
                {`${
                  order?.unrealized_pnl > 0
                    ? `+$${Math.abs(order.unrealized_pnl).toFixed(2)} (${Number(
                        order.unrealized_pnl_ROI
                      ).toFixed(2)})`
                    : `-$${Math.abs(order?.unrealized_pnl).toFixed(
                        2
                      )} (${Number(order?.unrealized_pnl_ROI).toFixed(2)}%)`
                }`}{" "}
              </p>
              <PosterModal order={order} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">TP/SL</p>
          <div className="flex items-center justify-start text-xs font-medium text-font-80">
            <p
              className={`${
                order?.tp_trigger_price ? "text-green" : "text-white"
              }`}
            >
              {order?.tp_trigger_price || "--"}
            </p>
            <p className="mx-1"> / </p>
            <p
              className={`${
                order?.sl_trigger_price ? "text-red" : "text-white"
              }`}
            >
              {order?.sl_trigger_price || "--"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Liq. price</p>
          <div className="text-orange-300 text-xs">
            {getFormattedAmount(order?.est_liq_price as number)}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Est. total</p>
          <div className="text-xs">
            {getFormattedAmount(order?.cost_position)}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Margin</p>
          <div className="text-xs">
            $
            {isNaN((totalMargin as any)?.toFixed(2))
              ? "N/A"
              : (totalMargin as number).toFixed(2)}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Notional</p>
          <div className="text-xs"> {getFormattedAmount(order?.notional)}</div>
        </div>
      </div>
      <div className="items-center w-full flex mt-5">
        <button
          onClick={() => setTPSLOpenOrder(order)}
          className="text-white border border-base_color text-bold font-poppins text-xs h-[25px] px-2 rounded flex items-center"
        >
          TP/SL
        </button>
        <button
          onClick={async () => {
            const qty = order.position_qty as number;
            const side = qty >= 0 ? "SELL" : "BUY";

            const cancelOrder: any = {
              symbol: order.symbol,
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
              await refresh();
              setShowActiveMobileOrders(false);
              setOrderPositions(["closed" as unknown as Inputs]);
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
    </>
  );
};

type ExtendedAlgoOrder = API.AlgoOrder & {
  trigger_trade_price: number;
  realized_pnl: number;
  trigger_time: number;
};

const renderTPSLData = (order: API.AlgoOrder) => {
  const filledOrder: ExtendedAlgoOrder | any =
    order.child_orders?.[0]?.algo_status === "FILLED"
      ? order?.child_orders?.[0]
      : order?.child_orders?.[1];
  return (
    <>
      <div className="flex items-center flex-wrap w-full gap-7 gap-y-4">
        <div>
          <p className="text-font-60 text-xs mb-1">Symbol</p>
          <Link href={`/perp/${order?.symbol}`}>
            <div className="h-full w-full flex items-center">
              <img
                className="w-3.5 h-3.5 rounded-full mr-2"
                height={14}
                width={14}
                alt={`${order?.symbol} logo`}
                src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
                  order?.symbol ? order?.symbol : "PERP_BTC_USDC",
                  true
                )}.png`}
              />
              <p className="text-white hover:underline text-xs font-medium">
                {order?.symbol ? formatSymbol(order.symbol) : "--"}
              </p>
            </div>
          </Link>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Side</p>
          <div
            className={`${
              order?.side === "SELL" ? "text-red" : "text-green"
            } text-xs`}
          >
            {order?.side}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Quantity</p>
          <p className="text-white text-[11px]">
            {filledOrder?.total_executed_quantity}
          </p>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Trigger Type</p>
          <div className="flex items-center justify-start text-xs font-medium">
            {filledOrder?.algo_type?.split("_").join(" ")}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Trigger Price</p>
          <div className={`text-xs`}>{filledOrder?.trigger_trade_price}</div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Price</p>
          <div className="text-xs">{filledOrder?.trigger_price}</div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">PnL</p>
          <div
            className={`${
              filledOrder?.realized_pnl > 0
                ? "text-green"
                : filledOrder?.realized_pnl < 0
                ? "text-red"
                : "text-white"
            } text-xs`}
          >
            {" "}
            ${filledOrder?.realized_pnl}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Fee</p>$
          {filledOrder?.total_fee.toFixed(2)}
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Time</p>
          {getFormattedDate(filledOrder?.trigger_time)}
        </div>
      </div>
    </>
  );
};

const renderPendingData = (
  order: API.OrderExt,
  setOrderPositions: any,
  closePendingOrder: any,
  refresh: import("swr/_internal").KeyedMutator<API.PositionInfo>
) => {
  return (
    <>
      <div className="flex items-center flex-wrap w-full gap-7 gap-y-4">
        <div>
          <p className="text-font-60 text-xs mb-1">Symbol</p>
          <Link href={`/perp/${order?.symbol}`}>
            <div className="h-full w-full flex items-center">
              <img
                className="w-3.5 h-3.5 rounded-full mr-2"
                height={14}
                width={14}
                alt={`${order?.symbol} logo`}
                src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
                  order?.symbol ? order?.symbol : "PERP_BTC_USDC",
                  true
                )}.png`}
              />
              <p className="text-white hover:underline text-xs font-medium">
                {order?.symbol ? formatSymbol(order.symbol) : "--"}
              </p>
            </div>
          </Link>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Type</p>
          <div className={`font-medium text-xs`}>
            {order?.type === "LIMIT" && order?.trigger_price
              ? "STOP LIMIT"
              : order?.type}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Side</p>
          <div
            className={`${
              order?.side === "SELL" ? "text-red" : "text-green"
            } text-xs`}
          >
            {order?.side}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Filled / Quantity</p>
          <p className="text-white text-[11px]">
            {order?.total_executed_quantity || 0} / {order?.quantity || 0}
          </p>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Price</p>
          <div className={`text-xs`}>{order?.price}</div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Trigger</p>
          <div className="flex items-center justify-start text-xs font-medium text-font-80">
            {order?.trigger_price || "--"}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Est. total</p>
          <div className="text-xs">
            {getFormattedAmount(order?.quantity * (order?.price as number))}$
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Reduce</p>
          <div className="text-xs">{order?.reduce_only ? "Yes" : "No"}</div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Order time</p>
          {getFormattedDate(order?.created_time)}
        </div>
      </div>
      <div className="items-center w-full flex mt-5">
        <EditModal order={order} refresh={refresh} />
        <button
          key={order?.order_id}
          onClick={() => {
            closePendingOrder(order?.order_id, order?.symbol);
            setOrderPositions([]);
          }}
          className="h-[25px] w-fit px-2 text-xs ml-2.5 text-white bg-base_color border-borderColor-DARK rounded"
        >
          Close
        </button>
      </div>
    </>
  );
};

const renderFilledData = (order: any) => {
  const filledOrder =
    order?.child_orders?.length > 0
      ? order?.child_orders?.[0]?.algo_status === "FILLED"
        ? order?.child_orders?.[0]
        : order?.child_orders?.[1]
      : order;
  return (
    <>
      <div className="flex items-center flex-wrap w-full gap-7 gap-y-4">
        <div>
          <p className="text-font-60 text-xs mb-1">Symbol</p>
          <Link href={`/perp/${order?.symbol}`}>
            <div className="h-full w-full flex items-center">
              <img
                className="w-3.5 h-3.5 rounded-full mr-2"
                height={14}
                width={14}
                alt={`${order?.symbol} logo`}
                src={`https://oss.orderly.network/static/symbol_logo/${formatSymbol(
                  order?.symbol ? order?.symbol : "PERP_BTC_USDC",
                  true
                )}.png`}
              />
              <p className="text-white hover:underline text-xs font-medium">
                {order?.symbol ? formatSymbol(order.symbol) : "--"}
              </p>
            </div>
          </Link>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Side</p>
          <div
            className={`${
              order?.side === "SELL" ? "text-red" : "text-green"
            } text-xs`}
          >
            {order?.side}
          </div>
        </div>
        <div>
          <p className="text-font-60 text-xs mb-1">Quantity</p>
          <p className="text-white text-[11px]">
            {filledOrder?.total_executed_quantity}
          </p>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Trigger Price</p>
          <div className={`text-xs`}>
            {filledOrder?.trigger_trade_price
              ? filledOrder?.trigger_trade_price
              : "--"}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">Price</p>
          <div className="text-xs">
            {filledOrder?.trigger_price
              ? getFormattedAmount(filledOrder?.trigger_price)
              : "--"}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 text-xs mb-1">PnL</p>
          <div
            className={`${
              filledOrder?.realized_pnl > 0
                ? "text-green"
                : filledOrder?.realized_pnl < 0
                ? "text-red"
                : "text-white"
            } text-xs`}
          >
            {" "}
            ${filledOrder?.realized_pnl || "--"}
          </div>
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Fee</p>$
          {getFormattedAmount(filledOrder.total_fee)}
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Status</p>
          {filledOrder?.status || filledOrder?.algo_status}
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Reduce</p>
          {order?.reduce_only ? "Yes" : "No"}
        </div>
        <div className="text-xs">
          <p className="text-font-60 mb-1">Time</p>
          {filledOrder?.created_time
            ? getFormattedDate(filledOrder?.created_time)
            : "--/--/--"}
        </div>
      </div>
    </>
  );
};
