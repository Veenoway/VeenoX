import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizerProps {
  initialColWidths: number[];
  initialTopHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  chartRef: React.RefObject<HTMLDivElement>;
}

export const useResizer = ({
  initialColWidths,
  initialTopHeight,
  containerRef,
  chartRef,
}: UseResizerProps) => {
  const [colWidths, setColWidths] = useState(initialColWidths);
  const [topHeightPx, setTopHeightPx] = useState(initialTopHeight);
  const [widths, setWidths] = useState([90, 10]);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent<HTMLDivElement>) => {
      if (window.innerWidth < 1268) return;

      const startX = e.clientX;
      const startWidths = [...colWidths];
      const containerWidth =
        containerRef.current?.getBoundingClientRect().width || 0;

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const deltaFraction = (dx / containerWidth) * 10;
        const newWidths = [...startWidths];

        if (index === 0) {
          newWidths[0] = Math.max(startWidths[0] + deltaFraction, 1);
          newWidths[1] = Math.max(startWidths[1] - deltaFraction, 1);
        } else if (index === 1) {
          newWidths[1] = Math.max(startWidths[1] + deltaFraction, 1);
          newWidths[2] = Math.max(startWidths[2] - deltaFraction, 1);
        }
        setColWidths(newWidths);
      };

      const onMouseUp = () => {
        if (chartRef.current) chartRef.current.style.pointerEvents = "auto";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      if (chartRef.current) chartRef.current.style.pointerEvents = "none";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [colWidths, containerRef, chartRef]
  );

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.innerWidth < 1268) return;
      const startY = e.clientY;
      const startTopHeight = topHeightPx;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = e.clientY - startY;
        const newTopHeight = startTopHeight + deltaY;
        const containerHeight =
          containerRef.current?.clientHeight || window.innerHeight;

        const minHeight = Math.round(containerHeight * 0.55);
        const maxHeight = Math.round(containerHeight * 0.9);

        setTopHeightPx(Math.max(Math.min(newTopHeight, maxHeight), minHeight));
      };

      const handleMouseUp = () => {
        if (chartRef.current) chartRef.current.style.pointerEvents = "auto";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      if (chartRef.current) chartRef.current.style.pointerEvents = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [topHeightPx, containerRef, chartRef]
  );

  const handleLastBoxResize = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      document.addEventListener("mousemove", handleLastBoxMove);
      document.addEventListener("mouseup", handleLastBoxMouseUp);
    },
    []
  );

  const handleLastBoxMove = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;
      const resizer = resizerRef.current;
      if (!container || !resizer) return;

      const containerRect = container.getBoundingClientRect();

      const newWidth1 =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const newWidth2 = 100 - newWidth1;

      if (newWidth1 >= 10 && newWidth1 <= 90 && newWidth2 <= 25) {
        setWidths([newWidth1, newWidth2]);
      }
    },
    [containerRef]
  );

  const handleLastBoxMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleLastBoxMove);
    document.removeEventListener("mouseup", handleLastBoxMouseUp);
  }, [handleLastBoxMove]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setColWidths([1, 1]);
      } else if (window.innerWidth <= 1200) {
        setColWidths([3, 1]);
      } else {
        setColWidths([8, 2]);
      }
      setTopHeightPx((prevHeight) => {
        const minHeight = Math.round(window.innerHeight * 0.6);
        const maxHeight = Math.round(window.innerHeight * 0.9);
        return Math.min(Math.max(prevHeight, minHeight), maxHeight);
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    colWidths,
    topHeightPx,
    widths,
    resizerRef,
    handleMouseDown,
    handleMouse,
    handleLastBoxResize,
  };
};
