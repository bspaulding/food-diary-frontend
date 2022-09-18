import type { Component } from "solid-js";
import { Link } from "@solidjs/router";

type Props = {
  children: string;
  href: string;
};

const ButtonLink: Component<Props> = ({ children, href }) => (
  <Link
    class="bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md"
    href={href}
  >
    {children}
  </Link>
);

export default ButtonLink;
