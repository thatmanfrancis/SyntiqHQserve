"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Container from "../container";
import Eyebrow from "./eyebrow";
import Notch from "./notch";

const services = [
  {
    title: "Business Websites",
    description:
      "Make a strong first impression and give customers a clear reason to choose you. Clean design, fast loading, easy to read on any phone.",
    tag: "Responsive",
    image: "/images/services/business-websites.jpg",
    imageAlt: "A small business owner smiling at her laptop beside packed orders",
  },
  {
    title: "Online Booking",
    description:
      "Booking calendars, consultation forms and customer portals. Practical tools that save your team hours of calls and emails every week.",
    tag: "Instant booking",
    image: "/images/services/online-booking.jpg",
    imageAlt: "A clinic receptionist with a tablet welcoming a patient",
  },
  {
    title: "Website Redesigns",
    description:
      "Outgrown your current site? We rebuild it into a clean, modern presence that builds trust from the very first visit.",
    tag: "Modern refresh",
    image: "/images/services/website-redesigns.jpg",
    imageAlt: "Website wireframes sketched in a notebook next to a phone",
  },
  {
    title: "Web & Mobile Apps",
    description:
      "Custom web and mobile apps, scoped around what you actually need and built by the same senior team you talk to.",
    tag: "Custom built",
    image: "/images/services/web-mobile-apps.jpg",
    imageAlt: "Hands holding a phone with a screen full of apps",
  },
  {
    title: "Monthly Care",
    description:
      "Keep your site fast, safe and up to date, with direct access to the team that built it whenever you need a change.",
    tag: "Always looked after",
    image: "/images/services/monthly-care.jpg",
    imageAlt: "A developer in Nairobi working on code across two screens",
  },
];

export default function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container className="grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal max-w-lg">
          <Eyebrow label="What we build" />
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
            What You Need. Beautifully Built.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            From a fresh, modern website to a simple booking flow that brings in new clients.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
          >
            View all services
            <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>

        <ul>
          {services.map((service, i) => {
            const isOpen = openIndex === i;

            return (
              <li
                key={service.title}
                className={`reveal ${isOpen ? "border-b-2 border-[#2563eb]" : "border-b border-border"}`}
              >
                {/* The whole row toggles; the title is the real button so keyboard users can open it too */}
                <div
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex cursor-pointer items-start gap-4 py-6"
                >
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      className={`text-left font-syne text-3xl transition-colors sm:text-4xl ${isOpen ? "text-[#2563eb]" : "text-[#1c1c21]"}`}
                    >
                      {service.title}
                    </button>

                    {/* Animating grid rows from 0fr to 1fr lets the text open to its natural height */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xs pt-5 text-base font-semibold leading-relaxed text-muted">
                          {service.description}
                        </p>
                        {/* On phones the image sits under the text instead of beside the title */}
                        <ServiceImage service={service} className="mt-5 w-full sm:hidden" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`hidden shrink-0 overflow-hidden transition-all duration-300 ease-out sm:block ${isOpen ? "w-48 opacity-100" : "h-0 w-0 opacity-0"}`}
                  >
                    <ServiceImage service={service} className="w-48" />
                  </div>

                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={`mt-3 size-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2563eb]" : "-rotate-90 text-[#1c1c21]"}`}
                  >
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

function ServiceImage({ service, className }: { service: (typeof services)[number]; className: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={service.image}
        alt={service.imageAlt}
        width={1200}
        height={800}
        sizes="(min-width: 640px) 12rem, 100vw"
        className="aspect-4/3 w-full rounded-3xl object-cover"
      />
      <Notch color="var(--surface)" className="pl-2 pt-2">
        <span className="block whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm text-[#1c1c21]">
          {service.tag}
        </span>
      </Notch>
    </div>
  );
}
