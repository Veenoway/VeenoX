import Chart from "chart.js/auto";
import { useEffect, useMemo, useRef } from "react";
import { UserHistory } from "../../model";

interface TimeSeriesChartType {
  data: UserHistory[];
  type: "PnL" | "Volume" | "Cumulative PnL";
}

export const TimeSeriesChart = ({ data, type }: TimeSeriesChartType) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const labels = useMemo(
    () => data?.map((entry) => new Date(entry.date).toLocaleDateString()) || [],
    [data]
  );

  useEffect(() => {
    if (chartInstance.current) {
      (chartInstance.current as any).destroy();
    }

    const ctx = (chartRef.current as any).getContext("2d");

    const nowPlugin = {
      id: "nowLabel",
      afterDraw: (chart: any) => {
        const {
          ctx,
          scales: { x, y },
        } = chart;
        const lastDataPoint =
          chart.getDatasetMeta(0).data[chart.getDatasetMeta(0).data.length - 1];

        if (lastDataPoint) {
          ctx.save();
          ctx.fillStyle = "#FFFFFF60";
          ctx.font = "10px Arial";
          ctx.textAlign = "right";
          ctx.textBaseline = "top";
          ctx.fillText("now", lastDataPoint.x, y.bottom + 13);
          ctx.restore();
        }
      },
    };
    (chartInstance.current as any) = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: type,
            data:
              data?.map((entry: { pnl: number; perp_volume: number }) => {
                switch (type) {
                  case "PnL":
                    return entry.pnl;
                  case "Cumulative PnL":
                    return entry.pnl;
                  case "Volume":
                    return entry.perp_volume;
                  default:
                    return entry.pnl;
                }
              }) || [],
            borderColor: "#836EF9",
            borderWidth: 2,
            backgroundColor: "rgba(131, 110, 249, 0.1)",
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#836EF9",
            pointHoverBorderColor: "#FFFFFF60",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(30, 30, 30, 0.8)",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            borderColor: "#836EF9",
            borderWidth: 1,
            displayColors: false,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": $";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US").format(
                    context.parsed.y
                  );
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#FFFFFF60",
              font: {
                size: 10,
              },
              padding: 5,
              maxRotation: 0,
              minRotation: 0,
              callback: function (value, index, ticks) {
                if (index === 0) return labels[0];
                return "";
              },
            },
            border: {
              display: false,
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.03)",
            },
            ticks: {
              color: "#FFFFFF60",
              font: {
                size: 10,
              },
            },
            border: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
      plugins: [nowPlugin],
    });

    return () => {
      if (chartInstance.current) {
        (chartInstance.current as any).destroy();
      }
    };
  }, [data, labels]);

  return (
    <div className="relative h-[177px]">
      <canvas ref={chartRef} />
    </div>
  );
};
