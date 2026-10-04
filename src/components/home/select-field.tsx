"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type Option = { value: string; label: string };

// A styled dropdown that still submits with the form through a hidden input
export default function SelectField({
  name,
  label,
  options,
  defaultValue = "",
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find((option) => option.value === value);

  // Clicking anywhere else closes the list
  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function choose(option: Option) {
    setValue(option.value);
    setOpen(false);
  }

  function openList() {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((activeIndex + step + options.length) % options.length);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${activeIndex}` : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`relative h-12 w-full cursor-pointer rounded-xl border bg-white pl-4 pr-11 pt-5 text-left font-syne text-base text-[#1c1c21] outline-none transition ${open ? "border-[#2563eb]" : "border-border focus-visible:border-[#2563eb]"}`}
      >
        <span
          className={`pointer-events-none absolute left-4 font-manrope transition-all ${selected || open ? "top-1.5 text-xs" : "top-3 text-base"} ${open ? "text-[#2563eb]" : "text-muted"}`}
        >
          {label}
        </span>
        <span className="block truncate">{selected?.label}</span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(28,28,33,0.25)]"
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(option)}
                onPointerEnter={() => setActiveIndex(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-syne text-base transition-colors ${i === activeIndex ? "bg-[#eef3fc]" : ""} ${isSelected ? "text-[#2563eb]" : "text-[#1c1c21]"}`}
              >
                {option.label}
                {isSelected && (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
                    <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
