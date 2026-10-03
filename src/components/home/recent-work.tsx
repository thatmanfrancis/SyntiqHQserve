import Link from "next/link";
import Container from "../container";
import Eyebrow from "./eyebrow";
import PhotoPlaceholder from "./photo-placeholder";

// Concept designs are labelled as concepts so nothing reads as a client project it isn't
const projects = [
  {
    name: "Hausevo",
    status: "Live platform",
    title: "A simpler, faster way for people to find homes.",
    href: "https://hausevo.com.ng",
  },
  {
    name: "Calm Clinic Booking",
    status: "Concept design",
    title: "Appointments made easy for patients and staff.",
    href: "/work",
  },
  {
    name: "Clear Advice Legal",
    status: "Concept design",
    title: "A law firm website that explains expertise in plain language.",
    href: "/work",
  },
];

export default function RecentWork() {
  const [hausevo, ...otherProjects] = projects;

  return (
    <section className="dark bg-background py-20 text-foreground lg:py-28">
      <Container className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="flex flex-col gap-12">
          <div className="reveal">
            <Eyebrow label="Selected work" />
            <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Take A Look At Our Recent Work
            </h2>
          </div>

          <ProjectCard project={hausevo} />

          <div className="hidden md:block">
            <ClosingNote />
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {otherProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}

          <div className="md:hidden">
            <ClosingNote />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const isExternal = project.href.startsWith("http");

  return (
    <Link
      href={project.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="reveal group block"
    >
      <div className="overflow-hidden rounded-3xl">
        <PhotoPlaceholder
          dark
          label={`${project.name} preview`}
          className="aspect-6/5 w-full transition duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-5 flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-foreground" />
          {project.name}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-foreground" />
          {project.status}
        </span>
      </p>
      <h3 className="mt-2 text-xl leading-snug sm:text-2xl">{project.title}</h3>
    </Link>
  );
}

function ClosingNote() {
  return (
    <div className="reveal max-w-sm">
      <p className="text-base leading-relaxed text-muted">
        Custom built for each client. You own 100% of your code and design.
      </p>
      <Link
        href="/work"
        className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
      >
        More projects
        <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
