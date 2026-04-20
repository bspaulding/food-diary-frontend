import type { Component } from "solid-js";

const r = 24;
const cx = 32;
const cy = 32;
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

  // For isLimit: green track, red arc fills in as value grows toward the limit.
  // This makes the circle green at zero (good) and red when the limit is exceeded.
  const trackColor = () => (props.isLimit ? "#22c55e" : "#e2e8f0");

  const arcColor = () => {
    if (props.isLimit) return "#ef4444";
    if (props.max !== undefined && props.value > props.max) return "#ef4444";
    if (props.value >= props.target) return "#22c55e";
    return "#eab308";
  };

  return (
    <div class="flex flex-col items-center">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor()}
          stroke-width="4"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arcColor()}
          stroke-width="4"
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
