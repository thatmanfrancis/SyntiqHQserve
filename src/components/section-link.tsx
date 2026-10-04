"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

// Links to a section of the homepage, e.g. <SectionLink id="contact">.
// Pass a service (e.g. "BOOKING") to preselect "What do you need?" in the contact form.
// Next ignores a link to the URL you're already on, so once the address is /#contact
// a plain link stops scrolling. On the homepage we scroll to the section ourselves.
export default function SectionLink({
  id,
  service,
  onClick,
  ...props
}: { id: string; service?: string } & Omit<ComponentProps<"a">, "href">) {
  const pathname = usePathname();
  const href = service ? `/?service=${service}#${id}` : `/#${id}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (pathname !== "/") return;

    event.preventDefault();
    document.getElementById(id)?.scrollIntoView();
    // Without a service, keep any ?service= already in the address so the form keeps its choice
    window.history.replaceState(null, "", service ? href : `/${window.location.search}#${id}`);
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
