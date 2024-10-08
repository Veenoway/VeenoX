import { triggerAlert } from "@/lib/toaster";
import { useCallback, useEffect, useRef } from "react";

export interface Position {
  symbol: string;
  average_open_price: number;
  position_qty: number;
  tp_trigger_price?: number;
  sl_trigger_price?: number;
  algo_order: {
    algo_order_id: string;
  };
}

export interface PendingOrder {
  order_id: string;
  price: number;
  quantity: number;
}

export interface Asset {
  symbol: string;
}

const useUpdatePositions = (
  chart: any | null,
  relevantPositions: Position[],
  pendingPosition: PendingOrder[],
  asset: Asset | null,
  timeframe: string
) => {
  const linesRef = useRef<{ [key: string]: any }>({});
  const prevTimeframeRef = useRef<string>(timeframe);
  const timeframeChanged = prevTimeframeRef.current !== timeframe;

  const createOrUpdateLine = useCallback(
    (lineId: string, config: any) => {
      if (chart) {
        if (linesRef?.current && linesRef.current[lineId]) {
          Object.entries(config).forEach(([key, value]) => {
            if (typeof linesRef.current[lineId][key] === "function") {
              linesRef.current[lineId][key](value);
            }
          });
        } else {
          const line = chart.createOrderLine();
          if (line) {
            Object.entries(config).forEach(([key, value]) => {
              if (typeof line[key] === "function") {
                line[key](value);
              }
            });
            linesRef.current[lineId] = line;
          }
        }
      }
    },
    [chart, timeframe]
  );

  const updatePositions = useCallback(() => {
    if (!chart || !relevantPositions) {
      triggerAlert(
        "Error",
        "Chart or relevant positions not available. Skipping update."
      );
      return;
    }

    const currentLines = new Set<string>();

    relevantPositions.forEach((position) => {
      if (position.symbol !== asset?.symbol) return;

      const openLineId = `open_${position.algo_order?.algo_order_id}`;
      createOrUpdateLine(openLineId, {
        setText: "Open Price",
        setPrice: position.average_open_price,
        setQuantity: position.position_qty.toString(),
        setLineWidth: 1,
        setBodyTextColor: "#000000",
        setBodyBackgroundColor: "#836EF9",
        setBodyBorderColor: "#836EF9",
        setLineColor: "#836EF9",
        setQuantityBackgroundColor: "#836EF9",
        setQuantityBorderColor: "#836EF9",
      });
      currentLines.add(openLineId);

      if (position.tp_trigger_price) {
        const tpLineId = `tp_${position.algo_order?.algo_order_id}`;
        createOrUpdateLine(tpLineId, {
          setText: "Take Profit",
          setPrice: position.tp_trigger_price,
          setLineWidth: 1,
          setBodyTextColor: "#000000",
          setBodyBackgroundColor: "#427af4",
          setBodyBorderColor: "#427af4",
          setLineColor: "#427af4",
        });
        currentLines.add(tpLineId);
      }

      if (position.sl_trigger_price) {
        const slLineId = `sl_${position.algo_order?.algo_order_id}`;
        createOrUpdateLine(slLineId, {
          setText: "Stop Loss",
          setPrice: position.sl_trigger_price,
          setLineWidth: 1,
          setBodyTextColor: "#000000",
          setBodyBackgroundColor: "#F5921A",
          setBodyBorderColor: "#F5921A",
          setLineColor: "#F5921A",
          setLineStyle: 2,
        });
        currentLines.add(slLineId);
      }
    });

    pendingPosition.forEach((entry) => {
      const pendingLineId = `pending_${entry.order_id}`;
      createOrUpdateLine(pendingLineId, {
        setText: "Limit order",
        setPrice: entry.price,
        setQuantity: entry.quantity.toString(),
        setLineWidth: 1,
        setBodyTextColor: "#000000",
        setBodyBackgroundColor: "#1c5e57",
        setBodyBorderColor: "#1c5e57",
        setLineColor: "#1c5e57",
        setLineStyle: 1,
      });
      currentLines.add(pendingLineId);
    });

    prevTimeframeRef.current = timeframe;

    Object.keys(linesRef.current).forEach((lineId) => {
      if (!currentLines.has(lineId)) {
        linesRef.current[lineId].remove();
        delete linesRef.current[lineId];
      }
    });
  }, [
    chart,
    relevantPositions,
    pendingPosition,
    asset,
    timeframe,
    createOrUpdateLine,
  ]);

  useEffect(() => {
    updatePositions();
  }, [updatePositions, timeframe]);

  return updatePositions;
};

export default useUpdatePositions;
