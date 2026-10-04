"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "../container";
import Eyebrow from "./eyebrow";
import Notch from "./notch";

const sectionColor = "#eef3fc";

const steps = [
  {
    label: "Step 01 · Week 1",
    title: "The Strategic Scope",
    description:
      "A focused conversation about your business, your customers and your goals, then a written brief and an agreed scope before any work starts.",
    image: "/images/process/strategic-scope.jpg",
    imageAlt: "Two professionals planning a project together on their laptops",
  },
  {
    label: "Step 02 · Weeks 2–3",
    title: "Thoughtful Creation",
    description:
      "We handle the design, structure and writing. You review clear previews and short updates on your own schedule.",
    image: "/images/process/thoughtful-creation.jpg",
    imageAlt: "A designer working on visuals at her desktop computer",
  },
  {
    label: "Step 03 · Launch",
    title: "Seamless Launch",
    description:
      "We test every button, connect your calendar and email, and launch with zero downtime. Then you get a full handover.",
    image: "/images/process/seamless-launch.jpg",
    imageAlt: "A team in Lagos celebrating with a high five",
  },
];

// The steps are repeated three times so there is always a slide on either side.
// We stay in the middle copy and quietly jump back into it after sliding past its edges.
const slides = [...steps, ...steps, ...steps];

export default function ProcessCarousel() {
  const [index, setIndex] = useState(steps.length);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  const current = steps[index % steps.length];

  // Kept inside the repeated slides so very fast clicking can't run off the end
  const goTo = (offset: number) =>
    setIndex((i) => Math.min(Math.max(i + offset, 0), slides.length - 1));

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => goTo(1), 5000);
    return () => clearTimeout(timer);
  }, [index, paused]);

  // Once a slide past the middle copy has finished sliding (700ms), jump back into the middle copy
  useEffect(() => {
    if (index >= steps.length && index < steps.length * 2) return;
    const timer = setTimeout(() => {
      setAnimate(false);
      setIndex(steps.length + (index % steps.length));
    }, 700);
    return () => clearTimeout(timer);
  }, [index]);

  // After a silent jump, turn the sliding animation back on once the browser has painted
  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const easing = animate ? "duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" : "duration-0";

  return (
    <section style={{ background: sectionColor }} className="overflow-hidden py-20 lg:py-28">
      <Container className="reveal grid items-end gap-8 md:grid-cols-2 md:gap-16">
        <div>
          <Eyebrow label="Simple process" />
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
            A Structured, Tranquil Process From Day One.
          </h2>
        </div>
        <div className="max-w-md">
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            No endless discovery calls. No surprise scope changes. Just clear milestones, async
            updates and a launch date agreed before work starts.
          </p>
          <Link
            href="/approach"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
          >
            How we work
            <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </Container>

      {/* --slide is the width of one slide, --gap the space between slides */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="reveal relative mt-14 flex h-80 items-center [--gap:1rem] [--slide:min(52rem,82vw)] sm:h-96 md:h-112 md:[--gap:1.5rem]"
      >
        <div
          style={{
            transform: `translateX(calc(-1 * (${index} * (var(--slide) + var(--gap)) + var(--slide) / 2)))`,
          }}
          className={`ml-[50%] flex h-full shrink-0 items-center gap-(--gap) transition-transform ${easing}`}
        >
          {slides.map((step, i) => {
            const isActive = i === index;

            return (
              <div
                key={i}
                aria-hidden={!isActive}
                className={`relative w-(--slide) shrink-0 transition-[height] ${easing} ${isActive ? "h-full" : "h-[80%]"}`}
              >
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={1600}
                    height={1067}
                    sizes="(min-width: 640px) 52rem, 82vw"
                    className="size-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white sm:bottom-8 sm:left-8">
                      <p className="text-sm text-white/80">{step.label}</p>
                      <h3 className="mt-1 text-2xl font-semibold sm:text-3xl">{step.title}</h3>
                    </div>
                  </div>
                </div>
                {/* Outside the rounded clip so it fully covers the photo's edge */}
                <Notch
                  color={sectionColor}
                  className={`hidden w-[44%] pl-5 pt-5 transition-opacity duration-500 md:block ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                  <p className="text-base leading-relaxed text-muted">{step.description}</p>
                </Notch>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goTo(-1)}
          aria-label="Previous step"
          className="absolute left-[calc(50%-var(--slide)/2)] top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1c1c21] shadow-md transition hover:scale-105 md:size-14"
        >
          <ChevronIcon className="size-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => goTo(1)}
          aria-label="Next step"
          className="absolute left-[calc(50%+var(--slide)/2)] top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-md transition hover:scale-105 md:size-14"
        >
          <ChevronIcon className="size-5" />
        </button>
      </div>

      {/* On phones the description goes under the slide, since the corner cut-out is too small there */}
      <Container className="md:hidden">
        <p key={current.title} className="mt-6 animate-fade-in text-base leading-relaxed text-muted">
          {current.description}
        </p>
      </Container>
    </section>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
