import { useGeneralContext } from "@/context";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/shadcn/popover";
import { triggerAlert } from "@/lib/toaster";
import { Inputs } from "@/models";
import { formatQuantity } from "@/utils/misc";
import {
  useOrderEntry,
  useOrderStream,
  useSymbolPriceRange,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { OrderEntity, OrderSide } from "@orderly.network/types";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Oval } from "react-loader-spinner";

type EditModalType = {
  order: OrderEntity | any;
  refresh: any;
};

export const EditModal = ({ order, refresh }: EditModalType) => {
  const [activePnlOrOffset, setActivePnlOrOffset] = useState("$");
  const [error, setError] = useState([""]);
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const {
    editPendingPositionOpen,
    setEditPendingPositionOpen,
    setOrderPositions,
  } = useGeneralContext();
  const [values, setValues] = useState<Inputs>({
    direction: order.side,
    type: order.type,
    triggerPrice: undefined,
    price: order.price,
    quantity: order.quantity,
    reduce_only: order.reduce_only,
    tp_trigger_price: undefined,
    sl_trigger_price: undefined,
  });

  const {
    helper: { calculate, validator },
  } = useOrderEntry(
    {
      symbol: order.symbol,
      side: values.direction as OrderSide,
      order_type: values.type as any,
      order_quantity: values.quantity,
    },
    { watchOrderbook: true }
  );

  const symbolInfo = useSymbolsInfo();
  const symbols = Object.values(symbolInfo)
    .filter((cur) => typeof cur !== "boolean")
    .map((cur) => {
      if (typeof cur === "boolean") return;
      const symbol = cur();
      return symbol;
    });

  const currentAsset = symbols?.find((cur) => cur.symbol === order?.symbol);

  const [_, { updateOrder }] = useOrderStream({
    symbol: order?.symbol,
  });

  const rangeInfo = useSymbolPriceRange(order.symbol, order.side, undefined);

  const onEdit = async () => {
    setLoading(true);

    const value = getInput(values, order.symbol, currentAsset.base_tick);
    const finalData = calculate(value, "order_quantity", value.order_quantity);
    if (rangeInfo?.max && Number(values?.price) > rangeInfo?.max) {
      triggerAlert("Error", `Price should be bellow ${rangeInfo?.max}`);
      return;
    }
    if (rangeInfo?.min && Number(values?.price) < rangeInfo?.min) {
      triggerAlert("Error", `Price should be greater than ${rangeInfo?.min}`);
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
    try {
      if (order.price !== values.price) {
        await updateOrder(order.order_id, finalData as OrderEntity);
        setLoading(false);
        triggerAlert("Success", `Position updated`);
        refresh();
        setEditPendingPositionOpen(null);
        setOrderPositions([]);
      } else {
        setEditPendingPositionOpen(null);
        setLoading(false);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log("e", e);
      triggerAlert("Error", "Error while updating order");
    }
  };
  return (
    <Popover
      open={
        editPendingPositionOpen &&
        editPendingPositionOpen?.order_id === order?.order_id
      }
    >
      <PopoverTrigger
        className="h-full min-w-fit"
        onClick={() => {
          if (
            !editPendingPositionOpen &&
            editPendingPositionOpen?.order_id !== order?.order_id
          ) {
            setEditPendingPositionOpen(order);
            setOrderPositions([]);
          } else {
            setEditPendingPositionOpen(null);
          }
        }}
      >
        <div
          className="text-white bg-terciary border border-base_color text-bold font-poppins text-xs
              h-[25px] px-2 rounded flex items-center
          "
        >
          Edit
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={4}
        align={window.innerWidth > 768 ? "center" : "start"}
        onInteractOutside={() => {
          if (window.innerWidth > 768) setEditPendingPositionOpen(null);
        }}
        className="flex flex-col p-2.5 z-[102] w-[200px] whitespace-nowrap bg-secondary border border-borderColor shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex px-1.5 w-full items-center bg-terciary border border-borderColor rounded h-[30px] text-sm">
            <input
              type="number"
              className="h-full w-full text-white"
              placeholder="Price"
              value={(values.price as any).toString()}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, price: e.target.value }));
              }}
            />
          </div>
        </div>
        <div className="flex items-center w-full gap-2.5 mt-2.5">
          <button
            className="border-base_color border w-full rounded flex items-center justify-center h-[30px] text-xs text-white"
            onClick={() => onEdit()}
          >
            {loading && (
              <Oval
                visible={true}
                height="16"
                width="16"
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
            Edit
          </button>
          <button
            className="border-base_color border w-full rounded flex items-center justify-center h-[30px] text-xs text-white"
            onClick={() => setEditPendingPositionOpen(null)}
          >
            Cancel
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

async function getValidationErrors(
  data: Inputs,
  symbol: string,
  validator: ReturnType<typeof useOrderEntry>["helper"]["validator"],
  base_tick: number
): Promise<
  ReturnType<ReturnType<typeof useOrderEntry>["helper"]["validator"]>
> {
  return validator(getInput(data, symbol, base_tick));
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
    order_price: isNaN(Number(data.price)) ? undefined : Number(data.price),
    order_quantity: formatQuantity(Number(data.quantity), base_tick),
    trigger_price: data.triggerPrice,
    reduce_only: data.reduce_only,
  };
}
