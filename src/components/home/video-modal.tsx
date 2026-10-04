"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoModal({ videoUrl }: { videoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-border bg-white py-1.5 pl-1.5 pr-6 text-base font-medium text-[#1c1c21] transition hover:border-[#2563eb]/40"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="ml-0.5 size-3">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        </span>
        Play video
      </button>

      {/* Only mounted while open, so closing it also stops the video */}
      {open && (
        <dialog
          ref={dialogRef}
          aria-label="SyntiqHQ studio video"
          onClose={() => setOpen(false)}
          // A click on the dark backdrop lands on the dialog itself, not its content
          onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
          // Also capped by screen height, so the 16:9 video plus the close button always fit on short screens
          className="m-auto w-[min(64rem,calc(100%-2rem),calc((100svh-7rem)*16/9))] max-w-none bg-transparent p-0 transition-[opacity,scale] duration-300 backdrop:bg-black/75 backdrop:backdrop-blur-sm starting:open:scale-95 starting:open:opacity-0"
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-base font-medium text-[#1c1c21] transition hover:bg-[#dbeafe]"
            >
              Close
              <span className="flex size-7 items-center justify-center rounded-full bg-[#1c1c21] text-white">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>

          <div className="dark aspect-video overflow-hidden rounded-3xl bg-background">
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay playsInline className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-4 text-center text-foreground">
                <span className="flex size-16 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="ml-1 size-5">
                    <path d="M4 2.5v11l9-5.5z" />
                  </svg>
                </span>
                <p className="font-syne text-2xl font-semibold">Studio video coming soon</p>
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
