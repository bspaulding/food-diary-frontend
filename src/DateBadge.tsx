import type { Component } from "solid-js";

type Props = {
  class?: string;
  date: Date;
};

const DateBadge: Component<Props> = ({ class: klass, date }) => (
  <div class={`${klass || ""} text-center text-xl`}>
    <p class="text-4xl">{dayOfMonth.format(date)}</p>
    <p class="uppercase">{month.format(date)}</p>
  </div>
);

export default DateBadge;

const dayOfMonth = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const month = new Intl.DateTimeFormat("en-US", { month: "short" });
