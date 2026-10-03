import type { ReactNode } from "react";

// A cut-out in a bottom corner of an image. `color` must match whatever sits behind the image,
// and the two small pieces curve the image's edges into the cut-out.
// It overhangs the image by 2px so no sliver of the image shows along the rounded edges.
export default function Notch({
  color,
  corner = "right",
  className,
  children,
}: {
  color: string;
  corner?: "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  const isLeft = corner === "left";
  const curve = {
    background: `radial-gradient(circle at ${isLeft ? "top right" : "top left"}, transparent 19.5px, ${color} 20px)`,
  };

  return (
    <div
      style={{ background: color }}
      className={`absolute -bottom-0.5 ${isLeft ? "-left-0.5 rounded-tr-[20px]" : "-right-0.5 rounded-tl-[20px]"} ${className}`}
    >
      <span aria-hidden style={curve} className={`absolute -top-5 size-5 ${isLeft ? "left-0" : "right-0"}`} />
      <span aria-hidden style={curve} className={`absolute bottom-0 size-5 ${isLeft ? "-right-5" : "-left-5"}`} />
      {children}
    </div>
  );
}
