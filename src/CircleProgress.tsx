import type { Component } from "solid-js";

const r = 30;
const cx = 40;
const cy = 40;
const circumference = 2 * Math.PI * r;

const CircleProgress: Component<{
  value: number;
  target: number;
  max?: number;
  label: string;
  unit?: string;
  isLimit?: boolean;
}> = (props) => {
  const ceiling = () => props.max ?? props.target;
  const ratio = () => props.value / (ceiling() || 1);
  const offset = () => circumference * (1 - Math.min(ratio(), 1));

  const arcColor = () => {
    if (props.isLimit && props.value > props.target) return "#dc2626";
    if (props.max !== undefined && props.value > props.max) return "#dc2626";
    if (props.value >= props.target) return "#16a34a";
    return "#ca8a04";
  };

  return (
    <div class="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          stroke-width="6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arcColor()}
          stroke-width="6"
          stroke-dasharray={`${circumference} ${circumference}`}
          stroke-dashoffset={offset()}
          stroke-linecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          text-anchor="middle"
          dominant-baseline="central"
          font-size="16"
          fill="currentColor"
        >
          {Math.round(props.value)}
          {props.unit}
        </text>
      </svg>
      <p class="text-xs uppercase text-slate-500 mt-0.5">{props.label}</p>
    </div>
  );
};

export default CircleProgress;
