import React from "react";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 md:px-6 lg:px-8 max-w-6xl ${className}`}
    >
      {children}
    </div>
  );
}
