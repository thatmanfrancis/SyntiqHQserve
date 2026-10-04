"use client";

import Image from "next/image";
import Link from "next/link";
import SectionLink from "@/components/section-link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Add a link here and it shows up in both the desktop nav and the mobile menu.
// Dropdowns for Services / Industries come later.
const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
];

const linkStyle =
  "text-sm font-semibold uppercase tracking-[0.12em] text-foreground/80 transition hover:text-foreground";

// Same dark as the footer background
const tabColor = "#1c1c21";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // While the menu is open: the page behind can't scroll, and Escape closes it
  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 grid h-15 grid-cols-[auto_1fr_auto] items-stretch border-b border-border/40 bg-background/55 backdrop-blur-md backdrop-saturate-150">
        {/* Logo tab: a dark block plus an S-curved shoulder that flows into the top edge */}
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex h-15 items-stretch">
          <span
            style={{ background: tabColor }}
            className="flex items-center pl-5 pr-2 sm:pl-8 sm:pr-4"
          >
            <Image
              src="/syntiqhqlogo.png"
              alt="SyntiqHQ"
              width={879}
              height={178}
              priority
              className="h-auto w-28 sm:w-36 lg:w-40"
            />
          </span>
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-15 w-16 sm:w-24"
          >
            <path d="M0 0 H100 C40 0 60 100 0 100 Z" fill={tabColor} />
          </svg>
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex lg:gap-10">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkStyle}>
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="md:hidden" />

        <div className="flex items-center pr-5 sm:pr-8 lg:pr-10">
          <SectionLink
            id="contact"
            className={`${linkStyle} hidden underline decoration-foreground/40 underline-offset-[6px] hover:decoration-foreground md:inline`}
          >
            Start a project
          </SectionLink>

          {/* Three lines that fold into an X */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={`relative flex size-10 items-center justify-center rounded-full border transition-colors duration-300 md:hidden ${menuOpen ? "border-[#1c1c21] bg-[#1c1c21] text-white" : "border-border text-foreground"}`}
          >
            <span
              className={`absolute h-0.5 w-4.5 rounded-full bg-current transition duration-300 ${menuOpen ? "rotate-45" : "-translate-y-1.5"}`}
            />
            <span
              className={`absolute h-0.5 w-4.5 rounded-full bg-current transition duration-300 ${menuOpen ? "scale-x-0 opacity-0" : ""}`}
            />
            <span
              className={`absolute h-0.5 w-4.5 rounded-full bg-current transition duration-300 ${menuOpen ? "-rotate-45" : "translate-y-1.5"}`}
            />
          </button>
        </div>
      </header>

      {/* Outside the header, because its backdrop blur would trap a fixed panel inside it.
          The panel grows as a circle out of the menu button. */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        style={{
          clipPath: menuOpen
            ? "circle(150% at calc(100% - 2.5rem) 0)"
            : "circle(0% at calc(100% - 2.5rem) 0)",
        }}
        className="dark fixed inset-x-0 bottom-0 top-15 z-20 flex flex-col overflow-y-auto bg-background px-5 pb-8 pt-6 text-foreground transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] md:hidden"
      >
        <nav className="flex flex-col">
          {navLinks.map((link, i) => {
            const isCurrent = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${200 + i * 70}ms` : "0ms" }}
                className={`group flex items-center gap-4 border-b border-border py-5 transition duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              >
                <span className="w-7 text-sm text-muted">0{i + 1}</span>
                <span className="font-syne text-4xl font-semibold tracking-tight">{link.label}</span>
                {isCurrent && <span className="size-2.5 rounded-full bg-[#c6f432]" />}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="ml-auto size-5 text-muted transition group-hover:translate-x-1 group-hover:text-foreground group-active:translate-x-1"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            );
          })}
        </nav>

        <div
          style={{ transitionDelay: menuOpen ? `${200 + navLinks.length * 70}ms` : "0ms" }}
          className={`mt-auto pt-10 transition duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <SectionLink
            id="contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-3 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
          >
            Start a project
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#1c1c21]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
                <path d="M3 13 13 3M5 3h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </SectionLink>
          <a
            href="mailto:contact@syntiqhq.com"
            className="mt-6 block text-center text-base text-muted transition hover:text-foreground"
          >
            contact@syntiqhq.com
          </a>
          <p className="mt-1 text-center text-sm text-subtle">Working with clients worldwide.</p>
        </div>
      </div>
    </>
  );
}
