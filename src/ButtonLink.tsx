import type { Component } from "solid-js";
import { Link } from "@solidjs/router";

type Props = {
  children: string;
  class?: string;
  href: string;
};

const ButtonLink: Component<Props> = (props) => (
  <Link
    class={`bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md ${props["class"]}`}
    href={props.href}
  >
    {props.children}
  </Link>
);

export default ButtonLink;
