"use client";
import { triggerAlert } from "@/lib/toaster";
import { usePositionStream } from "@orderly.network/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

export const useTradingDataRefresh = () => {
  const lastActiveTimestamp = useRef(Date.now());
  const [isActive, setIsActive] = useState(true);

  const [positions, _info, { refresh: refreshPosition, error, loading }] =
    usePositionStream(undefined, {
      revalidateOnFocus: true,
      refreshWhenOffline: true,
      revalidateIfStale: true,
      dedupingInterval: 1000,
    });

  const forceRefresh = useCallback(() => {
    refreshPosition()
      .then(() => {
        triggerAlert(
          "Success",
          "Données mises à jour après une période d'inactivité"
        );
      })
      .catch((err) => {
        console.error("Error refreshing data:", err);
        triggerAlert("Error", "Erreur lors de la mise à jour des données");
      });
  }, [refreshPosition]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (!isActive) {
        setIsActive(true);
        forceRefresh();
      }
      lastActiveTimestamp.current = Date.now();
      inactivityTimer = setTimeout(() => setIsActive(false), 200000);
    };

    const handleActivity = () => {
      resetTimer();
    };

    const visibilityChangeHandler = () => {
      if (!document.hidden) {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActiveTimestamp.current;
        console.log("Inactive time:", inactiveTime);
        if (inactiveTime > 200000) {
          console.log("Refreshing after long inactivity");
          forceRefresh();
          resetTimer();
        } else {
          resetTimer();
        }
      }
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) =>
      document.addEventListener(event, handleActivity, true)
    );

    document.addEventListener("visibilitychange", visibilityChangeHandler);

    resetTimer();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity, true)
      );
      document.removeEventListener("visibilitychange", visibilityChangeHandler);
      clearTimeout(inactivityTimer);
    };
  }, [forceRefresh]);

  return { positions, isActive, error, loading, refreshPosition };
};
