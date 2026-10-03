// Stands in for a real photo until one is ready. Swap it for a next/image <Image> with the same className.
export default function PhotoPlaceholder({
  label,
  className,
  dark = false,
}: {
  label: string;
  className?: string;
  dark?: boolean;
}) {
  const colors = dark
    ? "from-[#2d2d34] to-[#24242a] text-[#5c5c68]"
    : "from-[#e4e8ef] to-[#cfd6e2] text-[#8a93a3]";

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center overflow-hidden bg-linear-to-br ${colors} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-9 9" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
