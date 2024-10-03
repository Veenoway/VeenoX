import { useGeneralContext } from "@/context";
import { FuturesAssetProps } from "@/models";
import { cn } from "@/utils/cn";
import { usePositionStream, useWS } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  ChartingLibraryWidgetOptions,
  HistoryMetadata,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LanguageCode,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem,
  Timezone,
} from "../../../../../../public/static/charting_library/charting_library";
import { DISABLED_FEATURES, ENABLED_FEATURES } from "./constant";
import { Datafeed } from "./datafeed";
import { widgetOptionsDefault } from "./helper";
import { overrides } from "./theme";

interface TradingViewChartProps {
  asset: FuturesAssetProps;
  mobile?: boolean;
  custom_css_url?: string;
  className?: string;
  params: any;
  orders: API.Order[];
  refresh: import("swr/_internal").KeyedMutator<any[]>;
}

interface ChartElement {
  id: string;
  name: string;
  [key: string]: any;
}

interface ChartState {
  drawings: ChartElement[];
  studies: ChartElement[];
  symbol: string;
  interval: string;
}

interface IChartWidgetApi {
  onDataLoaded(): ISubscription;
  onSymbolChanged(): ISubscription;
  onIntervalChanged(): ISubscription;
}

interface ISubscription {
  unsubscribeAll(obj?: object): void;
}
interface CustomDatafeed extends IBasicDataFeed {
  onReady: (
    callback: (configuration: {
      supported_resolutions: ResolutionString[];
    }) => void
  ) => void;
  resolveSymbol: (
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (reason: string) => void
  ) => void;
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: { from: number; to: number; firstDataRequest: boolean },
    onResult: (bars: Bar[], meta: HistoryMetadata) => void,
    onError: (reason: string) => void
  ) => void;
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (result: SearchSymbolResultItem[]) => void
  ) => void;
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => void;
  unsubscribeBars: (subscriberUID: string) => void;
}

interface WidgetOptions extends ChartingLibraryWidgetOptions {
  symbol: string;
  interval: ResolutionString;
  datafeed: CustomDatafeed;
  locale: LanguageCode;
  enabled_features: string[];
  disabled_features: string[];
  fullscreen: boolean;
  autosize: boolean;
  theme: "Light" | "Dark";
  loading_screen: { backgroundColor: string };
  timezone: "exchange" | Timezone;
}

type WidgetInstance = IChartingLibraryWidget;

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  asset,
  mobile = false,
  custom_css_url = "../themed.css",
  className = "",
  params,
  refresh,
  orders: ordersData,
}) => {
  const { isChartLoading, setIsChartLoading } = useGeneralContext();
  const ref = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget | null>(null);
  const ws = useWS();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [chartLines, setChartLines] = useState<{ [key: string]: any }>({});
  const [orders, _info, { refresh: refreshPosition }] = usePositionStream();
  const [isChartReady, setIsChartReady] = useState(false);
  const chartRef = useRef<any>(null);
  const prevPositionsRef = useRef("");
  const prevPendingPriceRef = useRef("");
  const prevPendingRef = useRef("");
  const [currentInterval, setCurrentInterval] = useState<string>("");
  const order = orders?.rows?.find((entry) => entry.symbol === asset?.symbol);

  const pendingPosition = useMemo(() => {
    return (
      ordersData?.filter((entry) => {
        return (
          entry.symbol === asset?.symbol &&
          entry.total_executed_quantity < entry.quantity &&
          entry.type === "LIMIT" &&
          (entry.status === "REPLACED" || entry.status === "NEW")
        );
      }) || []
    );
  }, [ordersData, orders]);

  const relevantPositions = useMemo(() => {
    return (
      orders?.rows?.filter(
        (position: any) => position.symbol === asset?.symbol
      ) || []
    );
  }, [orders, params?.perp]);

  const saveChartState = useCallback(
    (chart: any) => {
      const currentState: ChartState = {
        drawings: chart.getAllShapes(),
        studies: chart.getAllStudies(),
        symbol: chart.symbol(),
        interval: chart.resolution(),
      };
      const savedStateString = localStorage.getItem("chartState");
      const savedState: ChartState = savedStateString
        ? JSON.parse(savedStateString)
        : { drawings: [], studies: [], symbol: "", interval: "" };
      const updateElements = (
        currentElements: ChartElement[],
        savedElements: ChartElement[]
      ) => {
        return currentElements.filter((curr) => {
          if (curr.name === "Volume") return false;
          const existingElement = savedElements.find(
            (saved) => saved.name === curr.name
          );
          if (existingElement) {
            return false;
          }
          return true;
        });
      };
      const updatedState: ChartState = {
        drawings: updateElements(currentState.drawings, savedState.drawings),
        studies: updateElements(currentState.studies, savedState.studies),
        symbol: currentState.symbol,
        interval: currentState.interval,
      };
      // updatedState.drawings = [
      //   ...currentState.drawings,
      //   ...savedState.drawings.filter(
      //     (s) => !currentState.drawings.some((c) => c.name === s.name)
      //   ),
      // ];
      updatedState.studies = [
        ...updatedState.studies,
        ...savedState.studies.filter((s) =>
          currentState.studies.some((c) => c.name === s.name)
        ),
      ];

      // const arr = [];
      // updatedState.drawings?.forEach((drawing) => {
      //   const drawingProperties = chart
      //     .getShapeById(drawing.id)
      //     .getProperties();
      //   console.log("prorp", drawingProperties);
      //   arr.push(drawingProperties);
      // });
      // console.log("arr", arr);
      // updatedState.drawings = [...updatedState.drawings, ...arr];
      localStorage.setItem("chartState", JSON.stringify(updatedState));
    },
    [isInitialLoadComplete]
  );

  const loadSavedState = async (chart: any) => {
    return new Promise<void>((resolve) => {
      const savedState = localStorage.getItem("chartState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        if (typeof chart.setSymbol === "function") {
          try {
            chart.setSymbol(parsedState.symbol, parsedState.interval);
          } catch (error) {
            console.error("Error setting symbol:", error);
          }
        } else {
        }

        const promises: Promise<void>[] = [];

        parsedState.studies.forEach((study: any) => {
          if (study.name !== "Volume") {
            try {
              promises.push(
                chart.createStudy(
                  study.name,
                  study.forceOverlay,
                  study.lock,
                  study.inputs,
                  study.overrides,
                  study.options
                )
              );
            } catch (error) {
              console.error("Error creating study:", error);
            }
          }
        });

        Promise.all(promises)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.error("Error loading saved items:", error);
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const setupChangeListeners = useCallback(
    (widget: IChartingLibraryWidget) => {
      const chart = widget.activeChart();
      const saveState = () => {
        saveChartState(chart);
      };

      try {
        chart.onDataLoaded().subscribe(null, saveState);
        chart.onSymbolChanged().subscribe(null, saveState);
        chart.onIntervalChanged().subscribe(null, () => {
          setTimeout(() => {
            setTimeframe(chart.resolution());
            updatePositions();
          }, 1000);
          saveState();
          setCurrentInterval(chart.resolution());
        });
      } catch (error) {
        console.error("Error setting up chart listeners:", error);
      }

      const observer = new MutationObserver((mutations) => {
        saveState();
      });

      const config = { attributes: true, childList: true, subtree: true };
      observer.observe(ref.current!, config);

      return () => {
        try {
          chart.onDataLoaded().unsubscribeAll(saveState);
          chart.onSymbolChanged().unsubscribeAll(saveState);
          chart.onIntervalChanged().unsubscribeAll(saveState);
        } catch (error) {
          console.error("Error removing chart listeners:", error);
        }
        try {
          observer.disconnect();
        } catch (e) {}
      };
    },
    [saveChartState]
  );

  const initChart = useCallback(() => {
    if (!asset || !ref.current) {
      console.warn(
        "Asset or ref is not available. Skipping chart initialization."
      );
      return;
    }

    import(
      "../../../../../../public/static/charting_library/charting_library"
    ).then(({ widget: Widget }) => {
      const widgetOptions: WidgetOptions = {
        symbol: asset?.symbol,
        datafeed: Datafeed(asset, ws) as never,
        container: ref.current as never,
        container_id: ref.current?.id as never,
        locale: "en",
        disabled_features: DISABLED_FEATURES,
        enabled_features: ENABLED_FEATURES,
        fullscreen: false,
        autosize: true,
        theme: "Dark",
        custom_css_url: "/static/pro.css",
        loading_screen: { backgroundColor: "#1B1D22" },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
        ...widgetOptionsDefault,
        studies_overrides: {
          "volume.volume.color.0": "#ea4339",
          "volume.volume.color.1": "#0ECB81",
          "volume.volume.transparency": 50,
        },
        overrides: {
          volumePaneSize: "medium",
        },
      };

      const widgetInstance = new Widget(widgetOptions);

      widgetInstance.onChartReady(async () => {
        widgetInstance.activeChart().getTimeScale().setRightOffset(30);

        widgetInstance.applyOverrides(overrides as any);
        setTvWidget(widgetInstance);
        setIsChartReady(true);

        const chart = widgetInstance.activeChart();

        try {
          await loadSavedState(chart);
        } catch (error) {
          console.error("Error loading saved state:", error);
        }

        const chartChangedHandler = () => {
          saveChartState(chart);
        };

        widgetInstance.subscribe("onAutoSaveNeeded", chartChangedHandler);

        const cleanup = setupChangeListeners(widgetInstance);

        updatePositions();

        return () => {
          cleanup();
          widgetInstance.unsubscribe("onAutoSaveNeeded", chartChangedHandler);
        };
      });
    });
  }, [asset, mobile, ws, setupChangeListeners]);

  const prevTimeframe = useRef("");
  const [timeframe, setTimeframe] = useState("15");

  const updatePositions = useCallback(() => {
    console.log("I CAME HERE");
    if (!tvWidget || !relevantPositions) {
      console.warn(
        "Chart or relevant positions not available. Skipping update."
      );
      return;
    }
    let hasChanges = false;
    try {
      const hasPositionChanged = (prev: any, current: any) => {
        return (
          prev.average_open_price !== current.average_open_price ||
          prev.tp_trigger_price !== current.tp_trigger_price ||
          prev.sl_trigger_price !== current.sl_trigger_price ||
          prev.position_qty !== current.position_qty
        );
      };
      const newPrices: number[] = [];

      pendingPosition?.forEach((entry) => {
        newPrices.push(entry.price as number);
      });

      if (
        newPrices[0] !==
          ((prevPendingPriceRef as any)?.current?.[0] as number) ||
        newPrices[1] !== ((prevPendingPriceRef as any)?.current?.[1] as number)
      ) {
        hasChanges = true;
      }

      if (
        relevantPositions.length !== prevPositionsRef.current.length ||
        pendingPosition?.length !== Number(prevPendingRef.current) ||
        prevTimeframe.current !== timeframe
      ) {
        hasChanges = true;
      } else {
        for (let i = 0; i < relevantPositions.length; i++) {
          if (
            hasPositionChanged(
              prevPositionsRef.current[i],
              relevantPositions[i]
            ) ||
            prevTimeframe.current !== timeframe
          ) {
            hasChanges = true;
            break;
          }
        }
      }

      if (hasChanges) {
        Object.values(chartLines).forEach((line: any) => {
          if (line && typeof line.remove === "function") {
            line.remove();
          }
        });

        const newChartLines: { [key: string]: any } = {};

        const createLine = (lineConfig: any) => {
          try {
            const line = tvWidget.activeChart().createOrderLine();
            if (line) {
              Object.entries(lineConfig).forEach(([key, value]) => {
                if (typeof (line as any)[key] === "function") {
                  (line as any)[key](value);
                }
              });
              return line;
            }
          } catch (error) {}
          return null;
        };

        relevantPositions?.forEach((position: any) => {
          if (position.symbol !== asset?.symbol) return;
          const openPriceLineId = `open_${position?.algo_order?.algo_order_id}`;
          const openPriceLine = createLine({
            setText: "Open Price",
            setPrice: position?.average_open_price || 150,
            setLineWidth: 1,
            setQuantity: position?.position_qty,
            setBodyTextColor: "#FFF",
            setBodyBackgroundColor: "#1B1D22",
            setBodyBorderColor: "#836EF9",
            setLineColor: "#836EF9",
            setQuantityBackgroundColor: "#836EF9",
            setQuantityBorderColor: "#836EF9",
            setLineStyle: 1,
          });
          if (openPriceLine) newChartLines[openPriceLineId] = openPriceLine;

          if (position.tp_trigger_price) {
            const tpLineId = `tp_${position?.algo_order?.algo_order_id}`;
            const tpLine = createLine({
              setText: "Take Profit",
              setPrice: position.tp_trigger_price || 150,
              setLineWidth: 1,
              setQuantity: "",
              setBodyTextColor: "#FFF",
              setBodyBackgroundColor: "#1B1D22",
              setBodyBorderColor: "#21A179",
              setLineColor: "#21A179",
              setLineStyle: 1,
            });
            if (tpLine) newChartLines[tpLineId] = tpLine;
          }

          if (position.sl_trigger_price) {
            const slLineId = `sl_${position?.algo_order?.algo_order_id}`;
            const slLine = createLine({
              setText: "Stop Loss",
              setPrice: position?.sl_trigger_price || 150,
              setLineWidth: 1,
              setQuantity: "",
              setBodyTextColor: "#FFF",
              setBodyBackgroundColor: "#1B1D22",
              setBodyBorderColor: "#D63230",
              setLineColor: "#D63230",
              setQuantityBackgroundColor: "#D63230",
              setQuantityBorderColor: "#D63230",
              setLineStyle: 1,
            });
            if (slLine) newChartLines[slLineId] = slLine;
          }
        });

        pendingPosition?.forEach((entry) => {
          const pendingLineId = `pending_${entry.order_id}`;
          const pendingLine = createLine({
            setText: "Limit order",
            setPrice: entry.price,
            setQuantity: entry.side === "BUY" ? "LONG" : "SHORT",
            setLineWidth: 1,
            setBodyTextColor: "#FFF",
            setBodyBackgroundColor: "#1B1D22",
            setBodyBorderColor: entry.side === "BUY" ? "#21A179" : "#D63230",
            setLineColor: entry.side === "BUY" ? "#21A179" : "#D63230",
            setQuantityBackgroundColor:
              entry.side === "BUY" ? "#21A179" : "#D63230",
            setQuantityBorderColor:
              entry.side === "BUY" ? "#21A179" : "#D63230",
            setLineStyle: 2,
          });
          if (pendingLine) newChartLines[pendingLineId] = pendingLine;
        });

        setIsChartLoading(false);
        setChartLines(newChartLines);
        const prices: number[] = [];
        pendingPosition?.forEach((entry) => prices.push(entry.price as number));

        (prevPositionsRef as any).current = relevantPositions;
        (prevPendingPriceRef as any).current = prices;
        (prevPendingRef as any).current = pendingPosition?.length;
        refresh();
      } else updatePositions();
      prevTimeframe.current = timeframe;
    } catch (e) {}
  }, [
    tvWidget,
    asset?.symbol,
    chartLines,
    relevantPositions,
    setIsChartLoading,
    pendingPosition,
  ]);

  useEffect(() => {
    if (tvWidget && isChartReady) {
      setTimeout(() => {
        updatePositions();
      }, 400);
    }
  }, [
    order?.sl_trigger_price,
    order?.tp_trigger_price,
    order?.average_open_price,
    params?.perp,
    orders?.rows?.length,
    asset?.symbol,
    isChartReady,
    relevantPositions,
    updatePositions,
    pendingPosition,
    timeframe,
  ]);

  useEffect(() => {
    (window as any).tvWidget = null;
    initChart();
    return () => {
      if ((window as any).tvWidget !== null) {
        (window as any).tvWidget?.remove();
        (window as any).tvWidget = null;
      }
    };
  }, [asset?.symbol, custom_css_url, mobile]);

  return (
    <div className="relative w-full chart">
      {/* <div
        className={cn(
          `absolute z-10 bg-secondary w-full transition-all duration-200 ease-in-out h-full`,
          isChartLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      </div> */}
      <div className={cn(`w-full h-full`, className)} ref={ref} />
    </div>
  );
};

export default TradingViewChart;
