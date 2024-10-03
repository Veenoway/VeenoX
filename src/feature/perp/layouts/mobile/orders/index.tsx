import { useGeneralContext } from "@/context";
import { Drawer, DrawerContent } from "@/lib/shadcn/drawer";
import { API } from "@orderly.network/types";
import { Card } from "./components/card";

type MobileOpenTradeProps = {
  orders: API.PositionTPSLExt[];
  refresh: import("swr/_internal").KeyedMutator<API.PositionInfo>;
};

export const MobileOrdersDrawer = ({
  orders,
  refresh,
}: MobileOpenTradeProps) => {
  const { setShowActiveMobileOrders, showActiveMobileOrders } =
    useGeneralContext();

  return (
    <>
      <Drawer open={showActiveMobileOrders}>
        <DrawerContent close={() => setShowActiveMobileOrders(false)}>
          <div
            className={` h-fit w-full md:w-[350px] max-h-[650px] overflow-y-scroll no-scrollbar p-2.5 z-[100] text-white left-0 transition-all duration-200 ease-in-out shadow-2xl`}
          >
            {orders?.map((order: API.PositionTPSLExt, i: number) => {
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
                  refresh={refresh}
                />
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
