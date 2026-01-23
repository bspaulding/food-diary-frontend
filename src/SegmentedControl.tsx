import type { Component } from "solid-js";
import { createSignal, Index } from "solid-js";

type Props = {
  segments: string[];
  children: (segment: string) => any;
};

const SegmentedControl: Component<Props> = ({ segments, children }) => {
  const [currentSegment, setCurrentSegment] = createSignal<string>(segments[0]);
  return (
    <div>
      <ul class="flex flex-row justify-center mb-2">
        <Index each={segments}>
          {(segment, i) => (
            <li
              class={`px-3 py-1 bg-slate-200 border border-slate-500 ${
                i === 0 && "rounded-l-full"
              } 
              ${i === segments.length - 1 && "rounded-r-full"}
              ${
                currentSegment() === segment() &&
                "bg-slate-500 text-slate-50 shadow-inner cursor-default"
              }
              ${currentSegment() !== segment() && "cursor-pointer"}`}
              onClick={setCurrentSegment.bind(null, segment)}
            >
              {segment()}
            </li>
          )}
        </Index>
      </ul>
      <div>{children(currentSegment())}</div>
    </div>
  );
};

export default SegmentedControl;
