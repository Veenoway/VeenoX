import { Bridge } from "@/feature/bridge";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function PagesExample() {
  return (
    <main>
      <Bridge />
    </main>
  );
}
