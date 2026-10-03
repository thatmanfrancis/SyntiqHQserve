// Small label above a section heading. The pencil is a nod to everything being hand-built.
export default function Eyebrow({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="flex size-6 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
          <path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z" strokeLinejoin="round" />
          <path d="M9.5 4l2.5 2.5" />
        </svg>
      </span>
      {label}
    </p>
  );
}
