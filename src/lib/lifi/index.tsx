import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget } from "@lifi/widget";

export default function PagesWidget() {
  const config = {
    appearance: "light",
    theme: {
      container: {
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
        borderRadius: "16px",
      },
    },
  } as Partial<WidgetConfig>;
  console.log("NEXT_PUBLIC_INTEGRATOR", process.env.NEXT_PUBLIC_INTEGRATOR);
  return (
    <LiFiWidget
      config={config}
      integrator={process.env.NEXT_PUBLIC_INTEGRATOR as string}
    />
  );
}
