import { Loader } from "@/components/loader";
import { Dialog, DialogContent, DialogTrigger } from "@/lib/shadcn/dialog";
import {
  formatSymbol,
  getFormattedAmount,
  getFormattedDate,
} from "@/utils/misc";
import { useMarginRatio } from "@orderly.network/hooks";
import { useEffect, useRef, useState } from "react";
import { FaShareAlt } from "react-icons/fa";

const images = [
  "1.webp",
  "2.webp",
  "4.webp",
  "6.webp",
  "7.webp",
  "8.webp",
  "16.avif",
  "17.avif",
  "21.avif",
];

export const PosterModal = ({ order }: any) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState("/poster/4.webp");
  const [showAmount, setShowAmount] = useState(false);
  const displays = ["ROI & PnL", "ROI", "PnL"];
  const positions = ["Open price", "Opened at", "Mark price", "Quantity"];
  const [pnlDisplay, setPnlDisplay] = useState("ROI");
  const [positionsDisplay, setPositionsDisplay] = useState(positions);
  const data = {
    side: order.position_qty > 0 ? "LONG" : "SHORT",
    symbol: formatSymbol(order.symbol),
    leverage: 47,
    price: order.average_open_price,
    markPrice: order.mark_price,
    time: getFormattedDate(order.timestamp),
    amount: order.position_qty,
    unrealized_pnl: order.unrealized_pnl,
  };

  const { currentLeverage } = useMarginRatio();
  const canvasRef = useRef(null);

  const calculateLeverage = (position: { imr: number; notional: number }) => {
    if (!position || position.imr === 0) return 0;
    const result = position.notional / (position.notional * position.imr);
    return Math.round(result);
  };

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 675;

    const drawPoster = async () => {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "rgb(20,20,20)");
      gradient.addColorStop(1, "#1B1D22");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#836EF930";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 200) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 200) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      ctx.font = "48px Poppins";
      ctx.fillStyle =
        data.side === "LONG" ? "rgb(14 203 129)" : "rgb(234 57 67)";
      ctx.textAlign = "left";
      ctx.fillText(data.side, 50, 100);

      const sideWidth = ctx.measureText(data.side).width;

      ctx.fillStyle = "rgb(255,255,255,0.4)";
      const pipeY = 100;
      ctx.fillText(" | ", 50 + sideWidth, pipeY);

      const pipeWidth1 = ctx.measureText(" | ").width;

      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillText(data.symbol, 50 + sideWidth + pipeWidth1, 100);

      const symbolWidth = ctx.measureText(data.symbol).width;

      ctx.fillStyle = "rgb(255,255,255,0.4)";
      ctx.fillText(" | ", 50 + sideWidth + pipeWidth1 + symbolWidth, pipeY);

      const pipeWidth2 = ctx.measureText(" | ").width;

      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillText(
        `${calculateLeverage(order)}X`,
        50 + sideWidth + pipeWidth1 + symbolWidth + pipeWidth2,
        100
      );

      const baseX = 50;
      const baseY = 225;

      const pnlPercentage = (
        ((data.markPrice - data.price) / data.price) *
        100 *
        (data.side === "LONG" ? 1 : -1)
      ).toFixed(2);
      const pnl = getFormattedAmount(data.unrealized_pnl);

      if (
        pnlDisplay === "ROI & PnL" ||
        pnlDisplay === "ROI" ||
        pnlDisplay === "PnL"
      ) {
        ctx.font = "bold 90px Poppins";
        ctx.fillStyle =
          Number(pnlPercentage) > 0 ? "rgb(14 203 129)" : "rgb(234 57 67)";

        ctx.fillText(
          `${Number(pnlPercentage) > 0 ? "+" : ""}${
            pnlDisplay === "PnL"
              ? `${pnl}$`
              : `${(Number(pnlPercentage) * (currentLeverage || 1)).toFixed(
                  2
                )}%`
          }`,
          baseX,
          baseY
        );
      }
      const pnlPercentageWidth = ctx.measureText(
        `${Number(pnlPercentage) > 0 ? "+" : ""}${pnlPercentage}%`
      ).width;

      if (pnlDisplay === "ROI & PnL") {
        ctx.font = "50px Poppins";
        ctx.fillStyle = "rgb(255,255,255)";

        const amountText = `( $${pnl} )`;
        const amountWidth = ctx.measureText(amountText).width;

        const amountX = baseX + pnlPercentageWidth + 20;

        ctx.fillText(amountText, amountX, 214);
      }

      const drawBicolorText = (
        label1?: string,
        value1?: string,
        label2?: string,
        value2?: string,
        x1?: number,
        x2?: number,
        y?: number
      ) => {
        ctx.font = "24px Poppins";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        if (label1) ctx.fillText(label1, x1, y);
        if (label2) ctx.fillText(label2, x2, y);

        ctx.font = "26px Poppins";
        ctx.fillStyle = "rgb(255,255,255)";
        if (label1) ctx.fillText(value1, x1, (y as number) + 42);
        if (label2) ctx.fillText(value2, x2, (y as number) + 42);
      };

      const x1 = 50;
      const x2 = 280;

      const ySpacing = 55;

      const includeOpenPrice = positionsDisplay.includes("Open price");
      const includeOpenedAt = positionsDisplay.includes("Opened at");
      const includeMarkPrice = positionsDisplay.includes("Mark price");
      const includeQty = positionsDisplay.includes("Quantity");

      drawBicolorText(
        includeOpenPrice ? "Open price: " : undefined,
        includeOpenPrice ? data.price.toString() : undefined,
        includeOpenedAt ? "Opened at: " : undefined,
        includeOpenedAt ? (data.time as string) : undefined,
        x1,
        x2,
        300
      );

      drawBicolorText(
        includeMarkPrice ? "Mark price: " : undefined,
        includeMarkPrice ? data.markPrice.toString() : undefined,
        includeQty ? "Quantity: " : undefined,
        includeQty ? data.amount.toString() : undefined,
        x1,
        x2,
        !includeOpenPrice && !includeOpenedAt ? 300 : 350 + ySpacing
      );

      const newImg = new Image();
      newImg.onload = () => {
        // Dessiner le logo en bas à gauche du canvas
        const logoWidth = 200;
        const logoHeight = 70;
        const logoX = 50;
        const logoY = canvas.height - logoHeight - 50;
        ctx.drawImage(newImg, logoX, logoY, logoWidth, logoHeight);

        setImageUrl(canvas.toDataURL());
      };
      newImg.src = "/veenox/veenox-text.png";

      const text2 = "X.COM/VEENOX_XYZ";

      const text2Width = ctx.measureText(text2).width;

      const initialX = 280;
      const initialY = canvas.height - 75;

      ctx.fillText(text2, initialX + 20, initialY);

      const x = canvas.width - 220;
      const y = canvas.height - 82;
      const width = 160;
      const height = 40;
      const radius = 5;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, canvas.width - 650, 100, 650, 650);
        setImageUrl(canvas.toDataURL());
      };
      img.src = selectedImage;
    };

    drawPoster();
  }, [data, selectedImage, showAmount]);

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = "veenox_poster.png";
    link.href = imageUrl;
    link.click();
  };

  const message = {
    symbol: order.symbol,
    entryPrice: order.average_open_price,
    markPrice: order.mark_price,
    pnl: order.unrealized_pnl,
    imageUrl,
  };

  // const { mintToken, isMintLoading, isMintSuccess, mintError } =
  //   useTradePosterContract();
  // const { address } = useAccount();

  // const handleMint = async () => {
  //   if (!address) {
  //     alert("Please connect your wallet first.");
  //     return;
  //   }
  //   try {
  //     const imageData = canvasRef.current.toDataURL("image/png");
  //     const tradeData = {
  //       id: Date.now(),
  //       pair: "BTC/USD",
  //       profit: "5",
  //       date: new Date().toISOString().split("T")[0],
  //     };
  //     await mintToken(imageData, tradeData);
  //   } catch (error) {
  //     console.error("Error during minting:", error);
  //   }
  // };

  return (
    <Dialog>
      <DialogTrigger>
        <button>
          <FaShareAlt className="text-font-60 text-xs -mb-[1px]" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[1050px] w-[90%] h-auto max-h-[90vh] flex flex-col gap-0 overflow-auto no-scrollbar"
        close={() => {}}
      >
        <div className="flex flex-col">
          <div className="flex md:flex-row flex-col">
            <div className="border border-borderColor-DARK rounded-lg">
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated Trading Poster"
                  style={{ maxWidth: "760px", height: "auto" }}
                  className="rounded-lg max-w-full md:w-[760px] w-full"
                />
              ) : (
                <div className="max-w-full w-full md:max-w-[760px] md:w-[760px] min-h-[180px] md:h-[427px] bg-[#1B1D22] rounded-lg flex items-center justify-center">
                  <Loader className="w-[70px]" />
                </div>
              )}
            </div>
            <div className="flex flex-col mt-5 md:mt-0 md:ml-5">
              <p>PnL display:</p>
              <div className="flex items-center gap-3">
                {displays.map((type) => (
                  <button
                    key={type}
                    onClick={() => setPnlDisplay(type)}
                    className="flex items-center justify-between mb-2  mt-2"
                  >
                    <div
                      className={`w-[15px] p-0.5 h-[15px] rounded border ${
                        pnlDisplay === type
                          ? "border-base_color"
                          : "border-[rgba(255,255,255,0.3)]"
                      } transition-all duration-100 ease-in-out`}
                    >
                      <div
                        className={`w-full h-full rounded-[1px] bg-base_color ${
                          pnlDisplay === type ? "opacity-100" : "opacity-0"
                        } transition-all duration-100 ease-in-out`}
                      />
                    </div>
                    <p className="ml-2 text-[13px] text-font-80">{type}</p>
                  </button>
                ))}
              </div>
              <p>Position display:</p>
              <div className="flex items-center gap-3 flex-wrap  mb-2  mt-2">
                {positions.map((type: string) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (positionsDisplay.includes(type))
                        setPositionsDisplay((prev) =>
                          prev.filter((entry) => entry !== type)
                        );
                      else setPositionsDisplay((prev) => [...prev, type]);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div
                      className={`w-[15px] p-0.5 h-[15px] rounded border ${
                        positionsDisplay.includes(type)
                          ? "border-base_color"
                          : "border-[rgba(255,255,255,0.3)]"
                      } transition-all duration-100 ease-in-out`}
                    >
                      <div
                        className={`w-full h-full rounded-[1px] bg-base_color ${
                          positionsDisplay.includes(type)
                            ? "opacity-100"
                            : "opacity-0"
                        } transition-all duration-100 ease-in-out`}
                      />
                    </div>
                    <p className="ml-2 text-[13px] text-font-80">{type}</p>
                  </button>
                ))}
              </div>

              <p className="text-sm text-white font-medium mb-2 text-start mt-2.5">
                Overlay:
              </p>
              <div className="flex items-center flex-wrap gap-2 w-fit min-w-fit">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`border cursor-pointer ${
                      selectedImage === `/poster/${image}`
                        ? "border-base_color"
                        : "border-borderColor"
                    } rounded p-2`}
                    // 17
                    //
                    onClick={() => setSelectedImage(`/poster/${image}`)}
                  >
                    <img
                      className="h-[48px] w-[48px]"
                      src={`/poster/${image}`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={downloadImage}
                className="mt-4 px-4 py-2 text-sm bg-base_color text-white rounded hover:bg-base_color transition-colors"
              >
                Download
              </button>
              {/* <button className="" onClick={handleMint}> */}
              {/* MINT
              </button> */}
              {/* <TwitterShareButton message={message} /> */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
