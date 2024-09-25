"use client";
import { Widget } from "@/lib/lifi/comp";
import { useState } from "react";

export const Bridge = () => {
  const [activeBridge, setActiveBridge] = useState("Jumper");

  return (
    <div className="flex flex-col items-center h-screen pt-[100px] glowing-background">
      <Widget />
    </div>
  );
};
