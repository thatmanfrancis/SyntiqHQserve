"use client";

import { useId, useState } from "react";

const visibleCount = 3;

export default function PlanFeatures({ features, dark }: { features: string[]; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const textColor = dark ? "text-white/90" : "text-[#1c1c21]";

  function renderFeature(feature: string) {
    return (
      <li key={feature} className="flex items-start gap-3 text-base leading-snug">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3">
            <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={textColor}>{feature}</span>
      </li>
    );
  }

  return (
    <div className="mt-6 border-t border-border pt-6">
      <ul className="space-y-3">{features.slice(0, visibleCount).map(renderFeature)}</ul>

      <div
        id={listId}
        className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <ul className={`space-y-3 overflow-hidden ${open ? "pt-3" : ""}`} inert={!open}>
          {features.slice(visibleCount).map(renderFeature)}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={listId}
        className={`mt-4 inline-flex cursor-pointer items-center gap-1.5 text-base font-semibold ${dark ? "text-[#c6f432]" : "text-[#2563eb]"}`}
      >
        {open ? "Show less" : `See ${features.length - visibleCount} more`}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
