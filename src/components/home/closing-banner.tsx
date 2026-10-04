import Image from "next/image";
import SectionLink from "@/components/section-link";
import Container from "../container";
import Notch from "./notch";
import VideoModal from "./video-modal";

// Add a direct video file link (e.g. .mp4) once the studio video is ready. Until then the modal says it's coming soon.
const videoUrl: string | null = null;

export default function ClosingBanner() {
  return (
    <section className="relative pb-20 lg:pb-28">
      {/* The dark of the section above carries on behind the top of the photo */}
      <div
        aria-hidden
        className="dark absolute inset-x-0 top-0 h-[60%] bg-background"
      />

      <Container className="relative">
        <div className="reveal relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl sm:aspect-video lg:aspect-19/10">
            <Image
              src="/images/closing-banner.jpg"
              alt="A team on a video call with a remote colleague"
              width={2000}
              height={1333}
              sizes="(min-width: 1280px) 80rem, 100vw"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent sm:bg-linear-to-l sm:via-black/10" />

            <div className="absolute inset-x-6 top-7 text-white sm:inset-x-auto sm:right-10 sm:top-12 sm:w-[44%] lg:right-14 lg:top-16 lg:w-1/2">
              <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl xl:text-[2.5rem]">
                We Make Creative Solutions For Real Problems
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Fast, search-friendly websites and simple booking systems,
                designed and built by hand around how your business actually
                works.
              </p>
            </div>
          </div>

          {/* Outside the rounded clip so it fully covers the photo's edge */}
          <Notch
            color="var(--background)"
            corner="left"
            className="hidden gap-3 pr-3 pt-3 md:flex"
          >
            <Actions />
          </Notch>
        </div>

        {/* On phones the buttons sit under the photo, since the corner cut-out is too small there */}
        <div className="mt-5 flex flex-wrap gap-3 md:hidden">
          <Actions />
        </div>
      </Container>
    </section>
  );
}

function Actions() {
  return (
    <>
      <VideoModal videoUrl={videoUrl} />

      <SectionLink
        id="contact"
        className="inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
      >
        Start a project
        <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-3"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </SectionLink>
    </>
  );
}
