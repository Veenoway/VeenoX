import { useMemo } from "react";

interface UserHistory {
  date: string;
  pnl: number;
}

const calculateCumulativePnl = (history: UserHistory[]): UserHistory[] => {
  let cumulativePnl = 0;
  return history.map((entry) => {
    cumulativePnl += entry.pnl;
    return {
      ...entry,
      pnl: Number(cumulativePnl.toFixed(2)),
    };
  });
};

const useCumulativePnl = (pnlHistory: UserHistory[] | null) => {
  const reversedPnlHistory = useMemo(() => {
    return pnlHistory ? [...pnlHistory].reverse() : [];
  }, [pnlHistory]);

  const cumulativePnlHistory = useMemo(() => {
    if (!reversedPnlHistory.length) return [];

    const sortedHistory = [...reversedPnlHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const result = calculateCumulativePnl(sortedHistory);

    console.log("Sorted PNL History:", sortedHistory);
    console.log("Cumulative PNL History:", result);

    return result;
  }, [reversedPnlHistory]);

  return cumulativePnlHistory;
};

export default useCumulativePnl;
