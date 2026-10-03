"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

  return (
    <header className="sticky top-0 z-30 grid h-15 grid-cols-[auto_1fr_auto] items-stretch border-b border-border/40 bg-background/55 backdrop-blur-md backdrop-saturate-150">
      {/* Logo tab: a dark block plus an S-curved shoulder that flows into the top edge */}
      <Link href="/" className="flex h-15 items-stretch">
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
        <Link
          href="/contact"
          className={`${linkStyle} hidden underline decoration-foreground/40 underline-offset-[6px] hover:decoration-foreground md:inline`}
        >
          Start a project
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          className={`${linkStyle} md:hidden`}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav className="absolute inset-x-3 top-full mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-surface p-3 shadow-xl md:hidden">
          {[...navLinks, { label: "Start a project", href: "/contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`${linkStyle} rounded-xl px-4 py-3 hover:bg-surface-raised`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
