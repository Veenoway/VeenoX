import { Slider, styled } from "@mui/material";
import { useLeverage } from "@orderly.network/hooks";
import { FC } from "react";
import { marks } from "./constant";

interface LeverageEditorProps {
  onSave?: (value: { leverage: number }) => Promise<void>;
}

const LeverageSlider: any = styled(Slider)({
  color: "#836ef9",
  height: 7,
  "& .MuiSlider-rail": {
    backgroundColor: "#836ef979",
    opacity: 1,
  },
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "#836ef9",
    opacity: 1,
  },
  "& .MuiSlider-thumb": {
    height: 16,
    width: 16,
    backgroundColor: "currentColor",
    border: "2px solid #FFFFFF60",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-mark": {
    backgroundColor: "transparent",
    height: 4,
    width: 2,
    borderRadius: "10px",
    top: "17px",
    color: "#FFF",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      height: "100%",
      backgroundColor: "#836ef9",
    },
    "&.MuiSlider-markActive": {
      opacity: 1,
      backgroundColor: "transparent",
      "&::before": {
        backgroundColor: "#836ef9",
      },
    },
  },
  "& .MuiSlider-markLabel": {
    color: "#FFFFFF70",
    fontSize: 12,
  },
  "& .MuiSlider-markLabel:hover": {
    color: "#FFFFFF",
    fontSize: 12,
  },

  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#836ef9",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&::before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});

export const LeverageEditor: FC<LeverageEditorProps> = ({ onSave }) => {
  const [maxLeverage] = useLeverage();
  return (
    <div className="w-full mx-auto text-white">
      <LeverageSlider
        defaultValue={maxLeverage}
        step={null}
        max={50}
        aria-label="Default"
        valueLabelDisplay="auto"
        marks={marks.map((mark) => ({
          ...mark,
          label: (
            <span
              style={{
                color: mark.value === maxLeverage ? "#836ef9" : "#FFFFFF90",
              }}
            >
              {mark.label}
            </span>
          ),
        }))}
        onChangeCommitted={(_: any, value: number) => {
          try {
            onSave?.({ leverage: value });
          } catch (err) {}
        }}
      />
    </div>
  );
};
